import ow from "ow";
import Axios from "axios";
import { log } from "./log";

export class SlackNotifier {
    private mentions: string;
    private projectName: string;
    private slackWebhookUrl: string;

    public constructor(params: { mentions: string; projectName: string; slackWebhookUrl: string }) {
        this.mentions = params.mentions;
        ow(this.mentions, ow.string.label("mentions"));

        this.projectName = params.projectName;
        ow(this.projectName, ow.string.label("projectName"));

        this.slackWebhookUrl = params.slackWebhookUrl;
        ow(this.slackWebhookUrl, ow.string.label("slackWebhookUrl"));
    }

    public async sendSlackNotification(msg: string) {
        const slackText = `${this.projectName} monitoring ${this.mentions}: ${msg}`;
        const slackMessage = { text: slackText };
        try {
            const response = await Axios.post(this.slackWebhookUrl + "", slackMessage);
        } catch (error) {
            log({
                error: error,
                severity: "error",
                msg: "Could not send slack notification",
                slackResponse: error.response
                    ? { data: error.response.data, status: error.response.status }
                    : "no response",
            });
        }
    }
}
