import { z } from "zod";

// Regex to detect links in text
const urlRegex = /(http?s?:\/\/[^\s]+)|(www\.[^\s]+)|(\w+\.[a-zA-Z]{2,})/g;

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .refine(
      (value) => !urlRegex.test(value),
      "Links are not allowed in the description"
    )
    .optional()
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;