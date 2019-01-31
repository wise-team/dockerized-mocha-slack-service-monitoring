import { env } from "./env";
import { log } from "./log";
import { SlackNotifier } from "./SlackNotifier";
import { MochaTestRunner } from "./MochaTestRunner";
import { TimeSupressingNotificationBuilder } from "./TimeSuppressingNotificationBuilder";

//
process.on("unhandledRejection", error => {
    log({
        msg: projectDescriptor + " monitoring failed with unhandled promise rejection",
        error: error,
        severity: "error",
    });
});

// config
const specDir = "/spec";
const failureErrorTTLms = parseInt(env.failureNotificationIntervalS || "3600") * 1000;
const databaseFilePath = "/data/failuresttl.json";
const projectDescriptor = env.projectName + ":" + env.environmentType;

const slackNotifier = new SlackNotifier({
    projectName: projectDescriptor,
    mentions: env.mentions,
    slackWebhookUrl: env.slackWebhookUrl,
});
const testRunner = new MochaTestRunner(MochaTestRunner.loadTestFilesFromDir(specDir));
const notificationBuilder = new TimeSupressingNotificationBuilder({ databaseFilePath, failureErrorTTLms });

(async () => {
    try {
        logMonitoringStart();
        const testResults = await testRunner.runTests();
        const notifications = notificationBuilder.generateNotificationsAndUpdateSupresses(testResults);

        if (notifications.length > 0) {
            await notify(notifications);
            logMonitoringFailed();
        }
        logMonitoringDone();
    } catch (error) {
        logMonitoringError(error);
    }
    process.exit(0);
})();

async function notify(notifications: string[]) {
    const notificationsWithMetadata = notifications.map(msg => `${projectDescriptor} ${msg}`);

    const slackMsg = notificationsWithMetadata.join("\n");
    await slackNotifier.sendSlackNotification(slackMsg);
}

function logMonitoringStart() {
    log({
        msg: projectDescriptor + " monitoring started",
        severity: "info",
        monitoring_started: {},
    });
}

function logMonitoringFailed() {
    log({
        msg: projectDescriptor + " monitoring failed, slack notification sent",
        severity: "info",
        monitoring_done: {
            finished: true,
            failed: true,
            error: false,
        },
    });
}

function logMonitoringError(error: Error) {
    log({
        msg: `${projectDescriptor} monitoring error: ${error}`,
        error: error,
        severity: "error",
        monitoring_done: {
            finished: true,
            failed: false,
            error: true,
        },
    });
}

function logMonitoringDone() {
    log({
        msg: projectDescriptor + " monitoring done",
        severity: "info",
        monitoring_done: {
            finished: true,
            failed: false,
            error: false,
        },
    });
}
