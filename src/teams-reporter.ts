import { formatResultsMessage, formatFlakyTestsMessage, formatAiSummaryForTest, } from './message-formatter';
import { sendTeamsMessage } from './teams-notify';
import { Options } from '../types/reporter';
import { CtrfReport } from '../types/ctrf';

export async function sendTestResultsToTeams(
    report: CtrfReport,
    options: Options = {},
    logs: boolean = false
): Promise<void> {
    if (options.token) {
        process.env.TEAMS_WEBHOOK_URL = options.token;
    }

    if (options.onFailOnly && report.results.summary.failed === 0) {
        logs && console.log('No failed tests. Message not sent.');
        return;
    }

    const message = formatResultsMessage(report);

    await sendTeamsMessage(message);
    logs && console.log('Test results message sent to Teams.');
}

export async function sendFlakyResultsToTeams(
    report: CtrfReport,
    options: Options = {},
    logs: boolean = false
): Promise<void> {
    if (options.token) {
        process.env.TEAMS_WEBHOOK_URL = options.token;
    }

    const message = formatFlakyTestsMessage(report);
    if (message) {
        await sendTeamsMessage(message);
        logs && console.log('Flaky tests message sent to Teams.');
    } else {
        logs && console.log('No flaky tests detected. No message sent.');
    }
}

export async function sendAISummaryToTeams(
    report: CtrfReport,
    options: Options = {},
    logs: boolean = false
): Promise<void> {
    if (options.token) {
        process.env.TEAMS_WEBHOOK_URL = options.token;
    }

    for (const test of report.results.tests) {
        if (test.status === "failed") {
            const message = formatAiSummaryForTest(test, report.results.environment || {});
            if (message) {
                await sendTeamsMessage(message);
                logs && console.log(`AI summary message sent to Teams for ${test.name}.`);
            }
        }
    }
}