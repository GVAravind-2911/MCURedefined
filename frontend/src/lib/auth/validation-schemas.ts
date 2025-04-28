import { z } from "zod";

// Allow letters, optional dots, optional one space for two-part names
export const nameSchema = z.string()
  .regex(/^[A-Za-z]+(?:[.'-]?[A-Za-z]+)*(?: [A-Za-z]+(?:[.'-]?[A-Za-z]+)*)?$/, {
    message: "Invalid name format",
  })
  .min(2, { message: "Name must be at least 2 characters" })
  .max(50, { message: "Name must be less than 50 characters" });

// Email as per standard email format
export const emailSchema = z.string()
  .email({ message: "Invalid email address" });

// Username: alphanumeric + underscores, no spaces
export const usernameSchema = z.string()
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores",
  })
  .min(3, { message: "Username must be at least 3 characters" })
  .max(20, { message: "Username must be at most 20 characters" });

// Password: min 6 chars, one letter, one number
export const passwordSchema = z.string()
  .min(6, { message: "Password must be at least 6 characters" })
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: "Password must contain at least one letter and one number",
  });

// Reset password schema: ensures both passwords match and conform to password requirements
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Special reset password schema that supports password manager autofill fields
// Password managers typically look for "new-password" and sometimes "confirm-password"
export const resetPasswordFormSchema = resetPasswordSchema.or(
  z.object({
    "new-password": passwordSchema,
    "confirm-password": z.string()
  }).refine((data) => data["new-password"] === data["confirm-password"], {
    message: "Passwords don't match",
    path: ["confirm-password"],
  })
);