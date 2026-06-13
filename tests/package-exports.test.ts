import {
	sendAISummaryToTeams,
	sendFlakyResultsToTeams,
	sendTestResultsToTeams,
} from "teams-ctrf";

describe("package exports", () => {
	it("supports ESM imports from the package root", () => {
		expect(typeof sendTestResultsToTeams).toBe("function");
		expect(typeof sendFlakyResultsToTeams).toBe("function");
		expect(typeof sendAISummaryToTeams).toBe("function");
	});
});
