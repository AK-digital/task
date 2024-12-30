import { z } from 'zod';

export const userValidation = z.object({
    lastName: z.string().min(2).max(50),
    firstName: z.string().min(2).max(50),
    email: z.string().min(1).max(50).regex(/^ [a - zA - Z0 -9._ % -] + @[a - zA - Z0 - 9. -] +\.[a - zA - Z]{ 2, }$/),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
})