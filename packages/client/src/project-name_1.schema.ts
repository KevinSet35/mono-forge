import { z } from "zod";

export const ProjectNameSchema1 = z
    .string()
    .min(1, "Project name is required")
    .regex(/^[a-z0-9-]+$/, {
        message: "Project name can only contain lowercase letters, numbers, and hyphens",
    })
    .refine((name) => !/[A-Z]/.test(name), {
        message: "Project name cannot contain uppercase letters",
    })
    .refine((name) => !/\s/.test(name), {
        message: "Project name cannot contain spaces",
    })
    .refine((name) => !name.startsWith("-") && !name.endsWith("-"), {
        message: "Project name cannot start or end with a hyphen",
    })
    .refine((name) => !name.includes("--"), {
        message: "Project name cannot contain consecutive hyphens",
    });

export type ProjectNameInput1 = z.infer<typeof ProjectNameSchema1>;
