import { string, z } from 'zod';
export const userValidation = z.object({
    email: z.string();
})