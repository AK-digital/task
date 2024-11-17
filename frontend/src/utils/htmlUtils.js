// utils/htmlUtils.js

export const htmlUtils = {
    /**
     * Nettoie le HTML des attributs potentiellement dangereux
     */
    sanitizeHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;

        // Supprime les scripts
        const scripts = div.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            scripts[i].remove();
        }

        // Supprime les événements inline
        const elements = div.getElementsByTagName('*');
        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            const attrs = element.attributes;
            for (let j = attrs.length - 1; j >= 0; j--) {
                const attr = attrs[j];
                if (attr.name.startsWith('on')) {
                    element.removeAttribute(attr.name);
                }
            }
        }

        return div.innerHTML;
    },

    /**
     * Extraie le texte d'un contenu HTML
     */
    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    },

    /**
     * Tronque le HTML à une longueur maximale tout en préservant les balises
     */
    truncateHtml(html, maxLength = 500) {
        if (!html) return '';

        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText;

        if (text.length <= maxLength) return html;

        let truncated = '';
        let currentLength = 0;
        let openTags = [];

        const chars = html.split('');

        for (let char of chars) {
            if (char === '<') {
                const tagContent = html.slice(html.indexOf(char));
                const endTag = tagContent.indexOf('>');
                const tag = tagContent.slice(0, endTag + 1);

                if (tag.startsWith('</')) {
                    openTags.pop();
                } else if (!tag.endsWith('/>')) {
                    const tagName = tag.match(/<([a-z0-9]+)/i)[1];
                    openTags.push(tagName);
                }

                truncated += tag;
                html = html.slice(endTag + 1);
                continue;
            }

            truncated += char;
            currentLength++;

            if (currentLength >= maxLength) {
                break;
            }
        }

        // Ferme les balises restantes
        openTags.reverse().forEach(tag => {
            truncated += `</${tag}>`;
        });

        return truncated + '...';
    }
};