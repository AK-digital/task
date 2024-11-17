import { format, formatDistance, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dateUtils = {
    formatDate(date, formatStr = 'dd/MM/yyyy') {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr, { locale: fr });
    },

    formatRelative(date) {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatDistance(dateObj, new Date(), { addSuffix: true, locale: fr });
    },

    isOverdue(deadline) {
        if (!deadline) return false;
        const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
        return deadlineDate < new Date();
    }
};
