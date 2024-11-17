export const tasksApi = {
    async notifyTaskAssignment(email, taskDetails) {
        const response = await fetch(`${API_URL}/api/notify-task-assignment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipientEmail: email, taskDetails })
        });
        return response.json();
    },

    async notifyMention(emails, taskDetails, type = 'description') {
        const endpoint = type === 'description'
            ? '/api/notify-description-mention'
            : '/api/notify-response-mention';

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mentionnedUsers: emails, taskDetails })
        });
        return response.json();
    }
};