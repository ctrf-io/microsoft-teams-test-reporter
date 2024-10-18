import { CtrfReport, CtrfEnvironment, CtrfTest } from '../types/ctrf';

export const formatResultsMessage = (ctrf: CtrfReport): object => {
  const { summary, environment } = ctrf.results;
  const passedTests = summary.passed;
  const failedTests = summary.failed;
  const skippedTests = summary.skipped;
  const pendingTests = summary.pending;
  const otherTests = summary.other;

  let title = "CTRF Test Results";
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
  const resultText = failedTests > 0
    ? `${failedTests} failed tests`
    : `Passed`;

  const durationInSeconds = (summary.stop - summary.start) / 1000;
  const durationText = durationInSeconds < 1
    ? "*Duration:* <1s"
    : `*Duration:* ${new Date(durationInSeconds * 1000).toISOString().substr(11, 8)}`;

  const testSummary = `&#x2705; ${passedTests} | &#x274C; ${failedTests} | &#x23E9; ${skippedTests} | &#x23F3; ${pendingTests} | &#x2753; ${otherTests}`;

  const sections: any[] = [
    {
      activityTitle: title,
      facts: [
        { name: "Test Summary", value: testSummary },
        { name: "Results", value: resultText },
        { name: "Duration", value: durationText },
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
