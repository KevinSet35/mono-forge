import { z } from "zod";

// Response status enum (from your original base-response.ts)
export enum ResponseStatus {
    SUCCESS = "success",
    ERROR = "error",
}

// Error type (from your original base-response.ts)
export type Error = {
    code: number;
    message: string;
    details?: string;
};

// Original API response interface (from your original base-response.ts)
export interface ApiResponse<T = null> {
    status: ResponseStatus;
    data?: T; // Present only in success responses
    error?: {
        // Present only in error responses
        code: number;
        message: string;
        details?: string;
    };
    meta: {
        timestamp: string;
        path: string;
        method: string | undefined;
    };
}

// Project name validation
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

// Data schemas for controller responses (these are the 'data' part of ApiResponse)
export const ResponseMetadataSchema = z.object({
    generatedAt: z.string(),
    scriptLength: z.number(),
    integrationsCount: z.number()
});

export const ScriptGenerationDataSchema = z.object({
    script: z.string(),
    projectName: z.string(),
    integrations: z.array(IntegrationSchema),
    advancedConfig: AdvancedConfigSchema.optional(),
    metadata: ResponseMetadataSchema
});

// Integration info schemas for GET endpoints
export const IntegrationInfoSchema = z.object({
    id: IntegrationSchema,
    name: z.string(),
    description: z.string(),
    category: z.string()
});

export const IntegrationsListDataSchema = z.object({
    integrations: z.array(IntegrationInfoSchema),
    categories: z.array(z.string())
});

export const PackageManagerInfoSchema = z.object({
    id: PackageManagerSchema,
    name: z.string(),
    description: z.string(),
    isDefault: z.boolean().optional()
});

export const PackageManagersDataSchema = z.object({
    packageManagers: z.array(PackageManagerInfoSchema)
});

export const NodeVersionInfoSchema = z.object({
    id: NodeVersionSchema,
    name: z.string(),
    description: z.string(),
    isDefault: z.boolean().optional()
});

export const NodeVersionsDataSchema = z.object({
    nodeVersions: z.array(NodeVersionInfoSchema)
});

export const ValidationDataSchema = z.object({
    isValid: z.boolean(),
    validatedInput: ScriptGeneratorSchema.optional(),
    errors: z.array(z.object({
        message: z.string()
    })).optional()
});

// Wrapper ApiResponse schemas (for complete response validation if needed)
export const ApiResponseMetaSchema = z.object({
    timestamp: z.string(),
    path: z.string(),
    method: z.string().optional()
});

export const ApiResponseSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        status: z.literal(ResponseStatus.SUCCESS),
        data: dataSchema,
        meta: ApiResponseMetaSchema
    });

export const ApiResponseErrorSchema = z.object({
    status: z.literal(ResponseStatus.ERROR),
    error: z.object({
        code: z.number(),
        message: z.string(),
        details: z.string().optional()
    }),
    meta: ApiResponseMetaSchema
});

// Type definitions for TypeScript usage
export type ProjectNameInput = z.infer<typeof ProjectNameSchema>;
export type IntegrationType = z.infer<typeof IntegrationSchema>;
export type PackageManagerType = z.infer<typeof PackageManagerSchema>;
export type NodeVersionType = z.infer<typeof NodeVersionSchema>;
export type AdvancedConfigType = z.infer<typeof AdvancedConfigSchema>;
export type ScriptGeneratorInput = z.infer<typeof ScriptGeneratorSchema>;

// Data types for controller responses
export type ResponseMetadata = z.infer<typeof ResponseMetadataSchema>;
export type ScriptGenerationData = z.infer<typeof ScriptGenerationDataSchema>;
export type IntegrationInfo = z.infer<typeof IntegrationInfoSchema>;
export type IntegrationsListData = z.infer<typeof IntegrationsListDataSchema>;
export type PackageManagerInfo = z.infer<typeof PackageManagerInfoSchema>;
export type PackageManagersData = z.infer<typeof PackageManagersDataSchema>;
export type NodeVersionInfo = z.infer<typeof NodeVersionInfoSchema>;
export type NodeVersionsData = z.infer<typeof NodeVersionsDataSchema>;
export type ValidationData = z.infer<typeof ValidationDataSchema>;

// Integration categories for frontend use
export const INTEGRATION_CATEGORIES = {
    'version-control': { name: 'Version Control', color: '#2e7d32' },
    'backend': { name: 'Backend', color: '#0288d1' },
    'deployment': { name: 'Deployment', color: '#d32f2f' },
    'testing': { name: 'Testing', color: '#7b1fa2' },
    'development': { name: 'Development', color: '#f57c00' },
    'code-quality': { name: 'Code Quality', color: '#5d4037' },
    'ci-cd': { name: 'CI/CD', color: '#455a64' }
} as const;

export type IntegrationCategory = keyof typeof INTEGRATION_CATEGORIES;