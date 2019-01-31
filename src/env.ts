import ow from "ow";

const slackWebhookUrl_ = process.env.SLACK_WEBHOOK_URL;
ow(slackWebhookUrl_, ow.string.nonEmpty.label("Env SLACK_WEBHOOK_URL"));
const slackWebhookUrl = slackWebhookUrl_ || "-missing-env-";

const environmentType_ = process.env.ENVIRONMENT_TYPE;
ow(environmentType_, ow.string.nonEmpty.label("Env ENVIRONMENT_TYPE"));
const environmentType = environmentType_ || "-missing-env-";

const projectName_ = process.env.PROJECT_NAME;
ow(projectName_, ow.string.nonEmpty.label("Env PROJECT_NAME"));
const projectName = projectName_ || "-missing-env-";

const mentions_ = process.env.SLACK_MENTIONS;
ow(mentions_, ow.string.label("Env SLACK_MENTIONS"));
const mentions = mentions_ || "-missing-env-";

const failureNotificationIntervalS_ =
  process.env.FAILURE_NOTIFICATION_INTERVAL_S;
ow(
  failureNotificationIntervalS_,
  ow.string.nonEmpty.label("Env FAILURE_NOTIFICATION_INTERVAL_S")
);
const failureNotificationIntervalS = failureNotificationIntervalS_ || "-missing-env-";

export const env = {
    slackWebhookUrl, environmentType, projectName, mentions, failureNotificationIntervalS
};