import { CtrfReport, CtrfEnvironment, CtrfTest } from '../types/ctrf';

const resultText = (failedTests: number): string => {
  return failedTests > 0 ? `${failedTests} failed tests` : `Passed`;
};

const duration = (start: number, stop: number): string => {
  const durationInSeconds = (stop - start) / 1000;
  return durationInSeconds < 1
    ? '<1s'
    : `${new Date(durationInSeconds * 1000).toISOString().substr(11, 8)}`;
};

export const formatResultsMessage = (ctrf: CtrfReport, failOnly: boolean = false): object => {
  const { summary, environment } = ctrf.results;
  const passedTests = summary.passed;
  const failedTests = summary.failed;
  const skippedTests = summary.skipped;
  const pendingTests = summary.pending;
  const otherTests = summary.other;

  let title = 'CTRF Test Results';
  let missingEnvProperties: string[] = [];

  let buildInfo = "No build information provided";
  if (environment) {
    const { buildName, buildNumber, buildUrl } = environment;

    if (buildName && buildNumber) {
      buildInfo = buildUrl ? `[${buildName} #${buildNumber}](${buildUrl})` : `${buildName} #${buildNumber}`;
    } else if (buildName || buildNumber) {
      buildInfo = `${buildName || ''} ${buildNumber || ''}`;
    }

    if (!buildName) {
      missingEnvProperties.push('buildName');
    }

    if (!buildNumber) {
      missingEnvProperties.push('buildNumber');
    }

    if (!buildUrl) {
      missingEnvProperties.push('buildUrl');
    }
  } else {
    missingEnvProperties = ['buildName', 'buildNumber', 'buildUrl'];
  }

  const color = failedTests > 0 ? 'FF0000' : '36a64f';

  const testSummary = `&#x2705; ${passedTests} | &#x274C; ${failedTests} | &#x23E9; ${skippedTests} | &#x23F3; ${pendingTests} | &#x2753; ${otherTests}`;

  const sections: any[] = [
    {
      activityTitle: title,
      facts: [
        { name: "Test Summary", value: testSummary },
        { name: "Results", value: resultText(failedTests) },
        { name: "Duration", value: `*Duration:* ${duration(summary.start, summary.stop)}` },
        { name: "Build", value: buildInfo }
      ],
      markdown: true
    }
  ];

  if (missingEnvProperties.length > 0) {
    sections.push({
      activitySubtitle: `&#x26A0; Missing environment properties: ${missingEnvProperties.join(', ')}. Add these to your CTRF report for a better experience.`,
      markdown: true
    });
  }

  sections.push({
    text: "[A CTRF plugin](https://github.com/ctrf-io/teams-ctrf)",
    markdown: true
  });

  return {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "summary": title,
    "themeColor": color,
    "sections": sections
  };
};

export const formatFlakyTestsMessage = (ctrf: CtrfReport): object | null => {
  const { environment, tests } = ctrf.results;
  const flakyTests = tests.filter(test => test.flaky);

  if (flakyTests.length === 0) {
    return null;
  }

  let title = "Flaky Test Report";
  let missingEnvProperties: string[] = [];

  let buildInfo = "No build information provided";
  if (environment) {
    const { buildName, buildNumber, buildUrl } = environment;

    if (buildName && buildNumber) {
      buildInfo = buildUrl ? `[${buildName} #${buildNumber}](${buildUrl})` : `${buildName} #${buildNumber}`;
    } else if (buildName || buildNumber) {
      buildInfo = `${buildName || ''} ${buildNumber || ''}`;
    }

    if (!buildName) {
      missingEnvProperties.push('buildName');
    }

    if (!buildNumber) {
      missingEnvProperties.push('buildNumber');
    }

    if (!buildUrl) {
      missingEnvProperties.push('buildUrl');
    }
  } else {
    missingEnvProperties = ['buildName', 'buildNumber', 'buildUrl'];
  }

  const flakyTestsText = flakyTests.map(test => `- ${test.name}`).join('\n');

  const sections: any[] = [
    {
      activityTitle: title,
      facts: [
        { name: "&#x1F342; Flaky Tests Detected" },
        { name: "Flaky Tests", value: flakyTestsText },
        { name: "Build", value: buildInfo }
      ],
      markdown: true
    }
  ];

  if (missingEnvProperties.length > 0) {
    sections.push({
      activitySubtitle: `&#x26A0; Missing environment properties: ${missingEnvProperties.join(', ')}. Add these to your CTRF report for a better experience.`,
      markdown: true
    });
  }

  sections.push({
    text: "[A CTRF plugin](https://github.com/ctrf-io/teams-ctrf)",
    markdown: true
  });

  return {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "summary": title,
    "themeColor": "#FFA500",
    "sections": sections
  };
};


export const formatAiSummaryForTest = (test: CtrfTest, environment: CtrfEnvironment): object | null => {
  let title = "AI Test Summary";
  let missingEnvProperties: string[] = [];

  if (!test.ai) {
    return null;
  }

  let buildInfo = "No build information provided";
  if (environment) {
    const { buildName, buildNumber, buildUrl } = environment;

    if (buildName && buildNumber) {
      buildInfo = buildUrl ? `[${buildName} #${buildNumber}](${buildUrl})` : `${buildName} #${buildNumber}`;
    } else if (buildName || buildNumber) {
      buildInfo = `${buildName || ''} ${buildNumber || ''}`;
    }

    if (!buildName) {
      missingEnvProperties.push('buildName');
    }

    if (!buildNumber) {
      missingEnvProperties.push('buildNumber');
    }

    if (!buildUrl) {
      missingEnvProperties.push('buildUrl');
    }
  } else {
    missingEnvProperties = ['buildName', 'buildNumber', 'buildUrl'];
  }

  const sections: any[] = [
    {
      activityTitle: title,
      facts: [
        { name: "Test Name", value: test.name },
        { name: "Status", value: "Failed" },
        { name: "&#x2728; AI Summary", value: test.ai || "No AI summary provided." },
        { name: "Build", value: buildInfo }
      ],
      markdown: true
    }
  ];

  if (missingEnvProperties.length > 0) {
    sections.push({
      activitySubtitle: `&#x26A0; Missing environment properties: ${missingEnvProperties.join(', ')}. Add these to your CTRF report for a better experience.`,
      markdown: true
    });
  }

  sections.push({
    text: "[A CTRF plugin](https://github.com/ctrf-io/teams-ctrf)",
    markdown: true
  });

  return {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "summary": title,
    "themeColor": "FF0000",
    "sections": sections
  };
};



export const formatFailedTestsMessage = (ctrf: CtrfReport): string => {
    const failedTests = ctrf.results.tests.filter(test => test.status === 'failed');
    if (failedTests.length === 0) return 'No failed tests.';

    const message = failedTests.map(test => `Test: ${test.name}\nMessage: ${test.message}\n`).join('\n');
    return `Failed Tests:\n${message}`;
};

export const formatResultsAdaptiveCard = (ctrf: CtrfReport): object => {
  const { summary, environment } = ctrf.results;
  const passedTests = summary.passed;
  const failedTests = summary.failed;
  const skippedTests = summary.skipped;
  const pendingTests = summary.pending;
  const otherTests = summary.other;

  let appTitle = "CTRF";
  let buildInfo = null;
  let buildTitle = "Build Info";
  if (environment) {
    const { appName, buildName, buildNumber, buildUrl } = environment;
    if (appName) {
      appTitle = appName;
    }
    if (buildName && buildNumber) {
      buildTitle = `${buildName} #${buildNumber}`;
    } else if (buildName || buildNumber) {
      buildTitle = `${buildName || ''}${buildNumber || ''}`;
    }
    if (buildUrl) {
      buildInfo = buildUrl;
    }
  }

  const testStatusMapping: Record<
    'passed' | 'failed' | 'skipped' | 'pending' | 'other',
    { emoji: string; chartColor: string; textColor: string }
  > = {
    passed: { emoji: `✅`, chartColor: 'good', textColor: 'good' },
    failed: { emoji: `❌`, chartColor: 'attention', textColor: 'attention' },
    skipped: { emoji: `⏩️`, chartColor: 'divergingCyan', textColor: 'accent'},
    pending: { emoji: `⌛`, chartColor: 'neutral', textColor: 'default' },
    other: { emoji: `❓️`, chartColor: 'warning', textColor: 'warning' }
  };

  let titleStatus: 'passed' | 'failed' | 'skipped' | 'pending' | 'other' =
    'passed';

  if (failedTests > 0) {
    titleStatus = 'failed';
  }

  return {
    "type": "message",
    "attachments": [
      {
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.5",
          "speak": `${appTitle} Test Results. ${resultText(failedTests)} in ${duration(summary.start, summary.stop)}`,
          "msteams": {  
            "width": "Full"  
          }, 
          "body": [
            {
              "type": "Container",
              "items": [
                {
                  "type": "TextBlock",
                  "size": "Large",
                  "weight": "Bolder",
                  "text": `${testStatusMapping[titleStatus].emoji}  ${appTitle} Test Results`,
                  "wrap": true
                }
              ],
              "style": testStatusMapping[titleStatus].textColor,
              "bleed": true
            },
            {
              "type": "ColumnSet",
              "columns": [
                {
                  "type": "Column",
                  "width": "100px",
                  "items": [
                    {
                      "title": "Summary",
                      "data": [
                        {
                          "legend": "Passed",
                          "color": testStatusMapping['passed'].chartColor,
                          "value": passedTests
                        },
                        {
                          "legend": "Failed",
                          "color": testStatusMapping['failed'].chartColor,
                          "value": failedTests
                        },
                        {
                          "legend": "Skipped",
                          "color": testStatusMapping['skipped'].chartColor,
                          "value": skippedTests
                        },
                        {
                          "legend": "Pending",
                          "color": testStatusMapping['pending'].chartColor,
                          "value": pendingTests
                        },
                        {
                          "legend": "Other",
                          "color": testStatusMapping['other'].chartColor,
                          "value": otherTests
                        }
                      ],
                      "type": "Chart.Donut"
                    }
                  ]
                },
                {
                  "type": "Column",
                  "width": "stretch",
                  "verticalContentAlignment": "center",
                  "items": [
                    {
                      "type": "ColumnSet",
                      "columns": [
                        {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                            {
                              "type": "TextBlock",
                              "text": `Summary:`,
                              "weight": "Bolder"
                            }
                          ]
                        },
                        {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                            {
                              "type": "TextBlock",
                              "text": `${
                                testStatusMapping['passed'].emoji
                              } ${String(passedTests)}`,
                              "color": testStatusMapping['passed'].textColor,
                              "weight": "Bolder",
                              "wrap": true
                            }
                          ]
                        },
                        {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                            {
                              "type": "TextBlock",
                              "text": `${
                                testStatusMapping['failed'].emoji
                              } ${String(failedTests)}`,
                              "color": testStatusMapping['failed'].textColor,
                              "weight": "Bolder",
                              "wrap": true
                            }
                          ]
                        },
                        {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                            {
                              "type": "TextBlock",
                              "text": `${
                                testStatusMapping['skipped'].emoji
                              } ${String(skippedTests)}`,
                              "color": testStatusMapping['skipped'].textColor,
                              "weight": "Bolder",
                              "wrap": true
                            }
                          ]
                        },
                        {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                            {
                              "type": "TextBlock",
                              "text": `${
                                testStatusMapping['pending'].emoji
                              } ${String(pendingTests)}`,
                              "color": testStatusMapping['pending'].textColor,
                              "weight": "Bolder",
                              "wrap": true
                            }
                          ]
                        },
                        {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                            {
                              "type": "TextBlock",
                              "text": `${
                                testStatusMapping['other'].emoji
                              } ${String(otherTests)}`,
                              "color": testStatusMapping['other'].textColor,
                              "weight": "Bolder",
                              "wrap": true
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "type": "ColumnSet",
                      "columns": [
                        {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                            {
                              "type": "TextBlock",
                              "text": "Results:",
                              "weight": "Bolder",
                              "wrap": true
                            }
                          ]
                        },
                        {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                            {
                              "type": "TextBlock",
                              "text": `${resultText(failedTests)}`,
                              "weight": "Bolder",
                              "wrap": true
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "type": "ColumnSet",
                      "columns": [
                        {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                            {
                              "type": "TextBlock",
                              "text": "Duration:",
                              "weight": "Bolder",
                              "wrap": true
                            }
                          ]
                        },
                        {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                            {
                              "type": "TextBlock",
                              "text": `${duration(summary.start, summary.stop)}`,
                              "weight": "Bolder",
                              "wrap": true
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ],
          "actions": buildInfo
            ? [
                {
                  "type": "Action.OpenUrl",
                  "title": buildTitle,
                  "url": buildInfo
                }
              ]
            : []
        }
      }
    ]
  };
};
