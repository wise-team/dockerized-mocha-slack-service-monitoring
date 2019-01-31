import ow from "ow";
import * as fs from "fs";
import * as path from "path";
import * as Mocha from "mocha";

import { log } from "./log";

export class MochaTestRunner {
    private testFiles: string[];

    public constructor(testFiles: string[]) {
        ow(
            testFiles,
            ow.array.ofType(
                ow.string.is(testFilePath => fs.existsSync(testFilePath) || `${testFilePath} file does not exist`)
            )
        );
        this.testFiles = testFiles;
    }

    public runTests(): Promise<MochaTestRunner.SingleTestResult[]> {
        const result: MochaTestRunner.SingleTestResult[] = [];
        const mocha = new Mocha({
            require: ["ts-node/register"],
            reporter: function() {
                /* avoid logs */
            },
        } as any);

        this.testFiles.forEach(testFile => mocha.addFile(testFile));

        const runner = mocha.run(function(failures) {});

        runner.on("fail", (test, error) => {
            this.logTestFail(test, error);
            const singleTestResult: MochaTestRunner.SingleTestResult = {
                name: this.getTestTitle(test),
                passed: false,
                msg: error + "",
            };
            result.push(singleTestResult);
        });

        runner.on("pass", test => {
            const singleTestResult: MochaTestRunner.SingleTestResult = {
                name: this.getTestTitle(test),
                passed: false,
                msg: "",
            };
            result.push(singleTestResult);
        });

        return new Promise((resolve, reject) => {
            runner.on("end", () => {
                resolve(result);
            });
        });
    }

    private getTestTitle(test: Mocha.Test): string {
        return test.titlePath().join(" >> ");
    }

    private logTestFail(test: Mocha.Test, error: any) {
        const testTitle = this.getTestTitle(test);
        log({
            msg: "Monitoring test failed: " + testTitle,
            test: testTitle,
            error: error + "",
            severity: "error",
        });
    }
}

export namespace MochaTestRunner {
    export interface SingleTestResult {
        name: string;
        passed: boolean;
        msg: string;
    }

    export function loadTestFilesFromDir(dir: string) {
        return fs
            .readdirSync(dir)
            .filter(fName => fName.endsWith(".spec.ts") || fName.endsWith(".spec.js"))
            .map(fName => path.resolve(dir, fName));
    }
}

/* TODO remove this old code
 
 */
