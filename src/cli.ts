#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { parseCtrfFile } from "./ctrf-parser";
import { formatFailedTestsMessage } from "./message-formatter";
import {
	sendTestResultsToTeams,
	sendFlakyResultsToTeams,
	sendAISummaryToTeams,
} from "./teams-reporter";
//import { sendTeamsMessage } from './teams-notify';

const argv = yargs(hideBin(process.argv))
	.command(
		"results <path>",
		"Send test results summary to Teams",
		(yargs) => {
			return yargs
				.positional("path", {
					describe: "Path to the CTRF file",
					type: "string",
					demandOption: true,
				})
				.option("onFailOnly", {
					alias: "f",
					type: "boolean",
					description: "Send message only if there are failed tests",
					default: false,
				})
				.option("useAdaptiveCard", {
					alias: "a",
					type: "boolean",
					description: "Send message as adaptive card",
					default: false,
				});
		},
		async (argv) => {
			try {
				const ctrfData = parseCtrfFile(argv.path as string);
				await sendTestResultsToTeams(ctrfData, argv, true);
			} catch (error: any) {
				console.error("Error:", error.message);
			}
		},
	)
	.command(
		"fail-details <path>",
		"Send failed test results to Teams",
		(yargs) => {
			return yargs.positional("path", {
				describe: "Path to the CTRF file",
				type: "string",
				demandOption: true,
			});
		},
		async (argv) => {
			try {
				const ctrfData = parseCtrfFile(argv.path as string);
				const message = formatFailedTestsMessage(ctrfData);
				// await sendTeamsMessage(message);
				console.log("Coming soon!");
			} catch (error: any) {
				console.error("Error:", error.message);
			}
		},
	)
	.command(
		"flaky <path>",
		"Send flaky test results to Teams",
		(yargs) => {
			return yargs.positional("path", {
				describe: "Path to the CTRF file",
				type: "string",
				demandOption: true,
			});
		},
		async (argv) => {
			try {
				const ctrfData = parseCtrfFile(argv.path as string);
				await sendFlakyResultsToTeams(ctrfData);
			} catch (error: any) {
				console.error("Error:", error.message);
			}
		},
	)
	.command(
		"ai <path>",
		"Send ai failure test summary to Teams",
		(yargs) => {
			return yargs.positional("path", {
				describe: "Path to the CTRF file",
				type: "string",
				demandOption: true,
			});
		},
		async (argv) => {
			try {
				const ctrfData = parseCtrfFile(argv.path as string);
				await sendAISummaryToTeams(ctrfData);
			} catch (error: any) {
				console.error("Error:", error.message);
			}
		},
	)
	.help().argv;
