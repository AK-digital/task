const API_URL = import.meta.env.VITE_API_URL;

export const projectsApi = {
    async inviteUserToProject(projectId, email, projectDetails) {
        const response = await fetch(`${API_URL}/api/notify-project-assignment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipientEmail: email, projectDetails })
        });
        return response.json();
    }
};