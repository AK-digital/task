import { string, z } from 'zod';

export const userValidation = z.object({
    lastName: z.string().min(2).max(50),
    firstName: z.string().min(2).max(50),
    email: z.string(),
    password: z.string(),
})