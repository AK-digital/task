import { z } from 'zod';

export const userValidation = z.object({
    lastName: z.string().min(2, "Le nom de famille doit contenir au moins 2 caractères").max(50, "Le nom de famille ne peut pas dépasser 50 caractères"),
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(50, "Le prénom ne peut pas dépasser 50 caractères"),
    email: z.string().min(1).max(50).regex(/^ [a - zA - Z0 -9._ % -] + @[a - zA - Z0 - 9. -] +\.[a - zA - Z]{ 2, }$/),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "hey"),
})