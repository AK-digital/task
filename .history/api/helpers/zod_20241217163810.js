import { string, z } from 'zod';

export const userValidation = z.object({
    lastName: z.string(),
    firstName: z.string(),
    email: z.string(),
    password: z.string(),
})