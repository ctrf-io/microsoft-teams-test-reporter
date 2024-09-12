#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { parseCtrfFile } from './ctrf-parser';
import { formatResultsMessage, formatFailedTestsMessage, formatFlakyTestsMessage, formatAiSummaryForTest } from './message-formatter';
import { sendTeamsMessage } from './teams-notify';

const argv = yargs(hideBin(process.argv))
  .command(
    'results <path>',
    'Send test results summary to Teams',
    (yargs) => {
      return yargs
        .positional('path', {
          describe: 'Path to the CTRF file',
          type: 'string',
          demandOption: true,
        })
        .option('onFailOnly', {
          alias: 'f',
          type: 'boolean',
          description: 'Send message only if there are failed tests',
          default: false,
        });
    },
    async (argv) => {
      try {
        const ctrfData = parseCtrfFile(argv.path as string);
        if (argv.onFailOnly && ctrfData.results.summary.failed === 0) {
          console.log('No failed tests. Message not sent.');
          return;
        }
        const message = formatResultsMessage(ctrfData);
        await sendTeamsMessage(message);
        console.log('Results message sent to Teams.');
      } catch (error: any) {
        console.error('Error:', error.message);
      }
    }
  )
  .command(
    'fail-details <path>',
    'Send failed test results to Teams',
    (yargs) => {
      return yargs.positional('path', {
        describe: 'Path to the CTRF file',
        type: 'string',
        demandOption: true,
      });
    },
    async (argv) => {
      try {
        const ctrfData = parseCtrfFile(argv.path as string);
        const message = formatFailedTestsMessage(ctrfData);
        // await sendTeamsMessage(message);
        console.log('Coming soon!');
      } catch (error: any) {
        console.error('Error:', error.message);
      }
    }
  )
  .command(
    'flaky <path>',
    'Send flaky test results to Teams',
    (yargs) => {
      return yargs.positional('path', {
        describe: 'Path to the CTRF file',
        type: 'string',
        demandOption: true,
      });
    },
    async (argv) => {
      try {
        const ctrfData = parseCtrfFile(argv.path as string);
        const message = formatFlakyTestsMessage(ctrfData);
        if (message) {
          await sendTeamsMessage(message);
          console.log('Flaky tests message sent to Teams.');
        } else {
          console.log('No flaky tests detected. No message sent.');
        }
      } catch (error: any) {
        console.error('Error:', error.message);
      }
    }
  )
  .command(
    'ai <path>',
    'Send ai failure test summary to Teams',
    (yargs) => {
      return yargs.positional('path', {
        describe: 'Path to the CTRF file',
        type: 'string',
        demandOption: true,
      });
    },
    async (argv) => {
      try {
        const ctrfData = parseCtrfFile(argv.path as string);
        for (const test of ctrfData.results.tests) {
          if (test.status === "failed") {
            const message = formatAiSummaryForTest(test, ctrfData.results.environment || {});
            if (message) {
              await sendTeamsMessage(message);
              console.log(`AI summary message sent to Teams for ${test.name}.`);
            }
          }
        }
      } catch (error: any) {
        console.error('Error:', error.message);
      }
    }
  )
  .help()
  .argv;