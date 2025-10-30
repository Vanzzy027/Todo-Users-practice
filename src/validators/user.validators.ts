import { z } from "zod/v4";

export const UserRegistrationSchema = z.object({
    user_id: z.number().optional(),
    first_name: z.string()
        .min(3, "First name must be at least 3 characters")
        .max(20, "First name cannot exceed 20 characters")
        .trim(),
    last_name: z.string()
        .min(2, "Last name must be at least 2 characters")
        .max(20, "Last name cannot exceed 20 characters")
        .trim(),
    email: z.email("Please enter a valid email address")
        .toLowerCase()
        .trim(),
    phone_number: z.string()
        .min(10, "Phone number must be at least 10 characters")
        .max(15, "Phone number cannot exceed 15 characters")
        .trim(),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password cannot exceed 20 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")
        .trim(),
});


// Login schema
export const UserLoginSchema = z.object({
    email: z.string()
        .email("Please enter a valid email address")
        .trim()
        .toLowerCase(),
    password: z.string()
        .min(1, "Password is required")
        .trim(),
});