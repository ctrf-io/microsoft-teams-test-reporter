import https from 'https';

export const sendTeamsMessage = (message: object): Promise<void> => {
    const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;

    if (!teamsWebhookUrl) {
        return Promise.reject(new Error('TEAMS_WEBHOOK_URL is not defined in the environment variables'));
    }

    return new Promise((resolve, reject) => {
        const url = new URL(teamsWebhookUrl);
        const data = JSON.stringify(message);

        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            },
        };

        const req = https.request(options, (res) => {
            let response = '';
            res.on('data', (chunk) => {
                response += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve();
                } else {
                    reject(new Error(`Failed to send message, status code: ${res.statusCode}, response: ${response}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};
