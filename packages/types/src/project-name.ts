// import { z } from "zod";

// export const ProjectNameSchema = z
//     .string()
//     .min(1, "Project name is required")
//     .regex(/^[a-z0-9-]+$/, {
//         message: "Project name can only contain lowercase letters, numbers, and hyphens",
//     })
//     .refine((name) => !/[A-Z]/.test(name), {
//         message: "Project name cannot contain uppercase letters",
//     })
//     .refine((name) => !/\s/.test(name), {
//         message: "Project name cannot contain spaces",
//     })
//     .refine((name) => !name.startsWith("-") && !name.endsWith("-"), {
//         message: "Project name cannot start or end with a hyphen",
//     })
//     .refine((name) => !name.includes("--"), {
//         message: "Project name cannot contain consecutive hyphens",
//     });

// export type ProjectNameInput = z.infer<typeof ProjectNameSchema>;


import { z } from "zod";

// Original project name validation
export const ProjectNameSchema = z
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

// Available integrations
export const IntegrationSchema = z.enum([
    "git",
    "supabase",
    "docker",
    "jest",
    "typescript",
    "eslint",
    "prettier",
    "github_actions"
]);

// Package manager options
export const PackageManagerSchema = z.enum(["npm", "yarn", "pnpm"]);

// Node version options
export const NodeVersionSchema = z.enum(["18.x", "20.x", "latest"]);

// Advanced configuration schema
export const AdvancedConfigSchema = z.object({
    packageManager: PackageManagerSchema.default("npm"),
    nodeVersion: NodeVersionSchema.default("18.x")
});

// Complete script generator input schema
export const ScriptGeneratorSchema = z.object({
    projectName: ProjectNameSchema,
    integrations: z.array(IntegrationSchema).default(["typescript"]),
    advancedConfig: AdvancedConfigSchema.optional()
});

// Type definitions for TypeScript usage
export type ProjectNameInput = z.infer<typeof ProjectNameSchema>;
export type IntegrationType = z.infer<typeof IntegrationSchema>;
export type PackageManagerType = z.infer<typeof PackageManagerSchema>;
export type NodeVersionType = z.infer<typeof NodeVersionSchema>;
export type AdvancedConfigType = z.infer<typeof AdvancedConfigSchema>;
export type ScriptGeneratorInput = z.infer<typeof ScriptGeneratorSchema>;