import * as fs from "fs";
import ow from "ow";
import { log } from "./log";
import { MochaTestRunner } from "./MochaTestRunner";

export class TimeSupressingNotificationBuilder {
    private databaseFilePath: string;
    private failureErrorTTLms: number;

    public constructor(props: { databaseFilePath: string; failureErrorTTLms: number }) {
        this.databaseFilePath = props.databaseFilePath;
        ow(this.databaseFilePath, ow.string.nonEmpty.label("databaseFilePath"));

        this.failureErrorTTLms = props.failureErrorTTLms;
        ow(this.failureErrorTTLms, ow.number.integer.greaterThan(0).label("failureErrorTTLms"));
    }

    public generateNotificationsAndUpdateSupresses(testResults: MochaTestRunner.SingleTestResult[]): string[] {
        const stillSupressedFailures: SupressedFailureTTL[] = this.loadSupressedFailureTTLs();
        const supressedTestTitles: string[] = stillSupressedFailures.map(failureTTLElem => failureTTLElem.test);
        const { newSupressedTestTitles, notifications } = this.processTests(testResults, supressedTestTitles);

        const newSupressedFailures: SupressedFailureTTL[] = newSupressedTestTitles.map(testTitle =>
            this.generateSupressionTTL(testTitle)
        );
        const supressedFailuresToSave = [...stillSupressedFailures, ...newSupressedFailures];
        this.saveSupresedFailureTTLs(supressedFailuresToSave);

        return notifications;
    }

    private processTests(
        testResults: MochaTestRunner.SingleTestResult[],
        supressedTestTitles: string[]
    ): { newSupressedTestTitles: string[]; notifications: string[] } {
        const notifications: string[] = [];
        const newSupressedTestTitles: string[] = [];
        function supress(testTitle: string) {
            newSupressedTestTitles.push(testTitle);
        }

        for (const singleTestResult of testResults) {
            const testPassed = singleTestResult.passed;
            const testSupressed = supressedTestTitles.indexOf(singleTestResult.name) >= 0;

            if (!testPassed && !testSupressed) {
                notifications.push(this.generateMonitorDownNotification(singleTestResult));
                supress(singleTestResult.name);
            } else if (testPassed && testSupressed) {
                notifications.push(this.generateMonitorUpNotification(singleTestResult));
            }
        }

        return {
            newSupressedTestTitles,
            notifications,
        };
    }

    private loadSupressedFailureTTLs(): SupressedFailureTTL[] {
        try {
            const loadedDB = this.readDatabaseFile();
            if (loadedDB) {
                const loadedFailureTTLS: SupressedFailureTTL[] = JSON.parse(loadedDB);
                this.validataDatabase(loadedFailureTTLS);
                return this.filterOutExpiredTTLEntries(loadedFailureTTLS);
            }
        } catch (error) {
            log({
                msg: "Could not load failures ttls",
                error: error,
                severity: "error",
            });
        }
        return [];
    }

    private saveSupresedFailureTTLs(failureTTLs: SupressedFailureTTL[]) {
        try {
            this.writeDatabaseFile(JSON.stringify(failureTTLs));
        } catch (error) {
            log({
                msg: "Could not save failures ttls",
                error: error,
                severity: "error",
            });
        }
    }

    private readDatabaseFile(): string | undefined {
        if (fs.existsSync(this.databaseFilePath)) {
            return fs.readFileSync(this.databaseFilePath, "UTF-8");
        }
    }

    private writeDatabaseFile(content: string): void {
        fs.writeFileSync(this.databaseFilePath, content, "UTF-8");
    }

    private validataDatabase(failureTTLs: SupressedFailureTTL[]) {
        ow(failureTTLs, ow.array.label("failureTTLs").ofType(ow.object.hasKeys("test", "until")));
    }

    private filterOutExpiredTTLEntries(failureTTLs: SupressedFailureTTL[]) {
        return failureTTLs.filter(ttl => ttl.until > Date.now());
    }

    private generateSupressionTTL(testTitle: string): SupressedFailureTTL {
        return {
            test: testTitle,
            until: Date.now() + this.failureErrorTTLms,
        };
    }

    private generateMonitorDownNotification(test: MochaTestRunner.SingleTestResult): string {
        return `DOWN: ${test.name}: ${test.msg}`;
    }

    private generateMonitorUpNotification(test: MochaTestRunner.SingleTestResult): string {
        return `UP: ${test.name}`;
    }
}

interface SupressedFailureTTL {
    test: string;
    until: number;
}

export namespace TimeSupressingNotificationBuilder {}
