export const usersApi = {
    async getUserByEmail(email) {
        const response = await fetch(`${API_URL}/api/users/by-email?email=${email}`);
        return response.json();
    },

    async updateUser(userId, userData) {
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    }
};