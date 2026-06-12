import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .regex(/^\+?[0-9]{10,14}$/, "Invalid phone number format"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(2, "City is required"),
  streetAddress: z.string().min(5, "Street address is required"),
  landmark: z.string().optional(),
  deliveryNotes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;
