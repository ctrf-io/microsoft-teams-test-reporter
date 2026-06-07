import type { CtrfReport } from "../types/ctrf";
import {
	formatAiSummaryForTest,
	formatFailedTestsMessage,
	formatFlakyTestsMessage,
	formatResultsAdaptiveCard,
	formatResultsMessage,
} from "../src/message-formatter";

const createReport = (): CtrfReport =>
	({
		results: {
			tool: {
				name: "vitest",
			},
			summary: {
				tests: 2,
				passed: 1,
				failed: 1,
				skipped: 0,
				pending: 0,
				other: 0,
				start: 0,
				stop: 1500,
			},
			environment: {
				appName: "API",
				buildName: "CI",
				buildNumber: "42",
				buildUrl: "https://example.test/build/42",
			},
			extra: {
				jiraIssue: "BUG-1",
				jiraIssueUrl: "https://jira.test/browse/BUG-1",
				jiraFlakyIssue: "BUG-2",
				jiraFlakyIssueUrl: "https://jira.test/browse/BUG-2",
			},
			tests: [
				{
					name: "passes",
					status: "passed",
					duration: 1,
				},
				{
					name: "fails",
					status: "failed",
					duration: 1,
					message: "expected true to be false",
					flaky: true,
					ai: "The assertion failed because the API returned false.",
				},
			],
		},
	}) as CtrfReport;

describe("message formatter", () => {
	it("formats Teams result message cards", () => {
		const message = formatResultsMessage(createReport()) as {
			summary: string;
			themeColor: string;
			sections: Array<{ facts?: Array<{ name: string; value?: string }> }>;
		};

		expect(message.summary).toBe("CTRF Test Results");
		expect(message.themeColor).toBe("FF0000");
		expect(message.sections[0].facts).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "Results", value: "1 failed tests" }),
				expect.objectContaining({
					name: "Jira Issue",
					value: "[BUG-1](https://jira.test/browse/BUG-1)",
				}),
			]),
		);
	});

	it("formats flaky and AI summary messages", () => {
		const report = createReport();
		const flaky = formatFlakyTestsMessage(report) as {
			sections: Array<{ facts?: Array<{ name: string; value?: string }> }>;
		};
		const ai = formatAiSummaryForTest(
			report.results.tests[1],
			report.results.environment ?? {},
		) as { summary: string };

		expect(flaky.sections[0].facts).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "Flaky Tests", value: "- fails" }),
				expect.objectContaining({
					name: "Jira Issue",
					value: "[BUG-2](https://jira.test/browse/BUG-2)",
				}),
			]),
		);
		expect(ai.summary).toBe("AI Test Summary");

		report.results.tests[1].flaky = false;
		expect(formatFlakyTestsMessage(report)).toBeNull();
	});

	it("formats failed test text and adaptive card output", () => {
		const report = createReport();
		const adaptive = formatResultsAdaptiveCard(report) as {
			type: string;
			attachments: Array<{ content: { speak: string } }>;
		};

		expect(formatFailedTestsMessage(report)).toContain(
			"Message: expected true to be false",
		);
		expect(adaptive.type).toBe("message");
		expect(adaptive.attachments[0].content.speak).toContain("API Test Results");
	});
});
