// utils/mentionUtils.js

export const mentionUtils = {
    /**
     * Extrait les mentions (@user) d'un texte
     */
    extractMentions(content) {
        const mentionRegex = /@(\w+)/g;
        const matches = content.match(mentionRegex) || [];
        return matches.map(match => match.substring(1));
    },

    /**
     * Vérifie si un utilisateur est mentionné dans le contenu
     */
    isMentioned(content, username) {
        const mentions = this.extractMentions(content);
        return mentions.includes(username);
    },

    /**
     * Remplace les mentions par des liens HTML
     */
    replaceMentionsWithLinks(content, users) {
        return content.replace(/@(\w+)/g, (match, username) => {
            const user = users.find(u => u.name === username);
            if (user) {
                return `<a href="#" class="mention" data-user-id="${user.id}">@${username}</a>`;
            }
            return match;
        });
    },

    /**
     * Filtre les utilisateurs pour l'autocomplétion des mentions
     */
    filterUsersForMention(searchTerm, users) {
        const term = searchTerm.toLowerCase();
        return users.filter(user =>
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
    },

    /**
     * Insère une mention à la position du curseur dans un champ de texte
     */
    insertMention(inputElement, mention) {
        const start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;
        const text = inputElement.value;
        const beforeText = text.substring(0, start);
        const afterText = text.substring(end);

        // Trouve le début de la mention potentielle
        const lastAtSymbol = beforeText.lastIndexOf('@');
        const mentionStart = lastAtSymbol >= 0 ? lastAtSymbol : start;

        // Insère la mention
        const newText = `${text.substring(0, mentionStart)}@${mention}${afterText}`;
        inputElement.value = newText;

        // Place le curseur après la mention
        const newCursorPosition = mentionStart + mention.length + 1;
        inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
    }
};