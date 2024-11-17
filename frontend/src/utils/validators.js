export const validators = {
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPassword(password) {
        return password.length >= 6;
    },

    isValidTaskTitle(title) {
        return title.trim().length >= 3;
    }
};