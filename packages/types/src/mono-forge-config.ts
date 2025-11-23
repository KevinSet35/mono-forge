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

// Integration configuration interface
export interface IntegrationConfig {
    modules: string[];
    dependencies?: string[];
    devDependencies?: string[];
    scripts?: Record<string, string>;
}

// Complete integration definition with metadata and config
export interface IntegrationDefinition {
    id: string;
    name: string;
    description: string;
    category: string;
    config: IntegrationConfig;
}

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

// Centralized integration registry - single source of truth
export const INTEGRATION_REGISTRY: Record<string, IntegrationDefinition> = {
    git: {
        id: 'git',
        name: 'Git',
        description: 'Initialize Git repository with proper configuration',
        category: 'version-control',
        config: {
            modules: ["integrations/git-setup.sh"],
            scripts: {
                "git:init": "git init && git add . && git commit -m 'Initial commit'"
            }
        }
    },
    supabase: {
        id: 'supabase',
        name: 'Supabase',
        description: 'Supabase backend-as-a-service integration',
        category: 'backend',
        config: {
            modules: ["integrations/supabase-setup.sh"],
            dependencies: ["@supabase/supabase-js"],
            devDependencies: ["supabase"]
        }
    },
    docker: {
        id: 'docker',
        name: 'Docker',
        description: 'Containerization with Docker and docker-compose',
        category: 'deployment',
        config: {
            modules: ["integrations/docker-setup.sh"]
        }
    },
    jest: {
        id: 'jest',
        name: 'Jest',
        description: 'Testing framework setup with Jest',
        category: 'testing',
        config: {
            modules: ["integrations/jest-setup.sh"],
            devDependencies: ["jest", "@types/jest", "ts-jest"]
        }
    },
    typescript: {
        id: 'typescript',
        name: 'Enhanced TypeScript',
        description: 'Strict TypeScript configuration with shared types',
        category: 'development',
        config: {
            modules: ["integrations/typescript-enhanced.sh"],
            devDependencies: ["typescript", "@types/node"]
        }
    },
    eslint: {
        id: 'eslint',
        name: 'ESLint',
        description: 'Code linting with ESLint',
        category: 'code-quality',
        config: {
            modules: ["integrations/eslint-setup.sh"],
            devDependencies: ["eslint", "@typescript-eslint/parser", "@typescript-eslint/eslint-plugin"]
        }
    },
    prettier: {
        id: 'prettier',
        name: 'Prettier',
        description: 'Code formatting with Prettier',
        category: 'code-quality',
        config: {
            modules: ["integrations/prettier-setup.sh"],
            devDependencies: ["prettier"]
        }
    },
    github_actions: {
        id: 'github_actions',
        name: 'GitHub Actions',
        description: 'CI/CD pipeline with GitHub Actions',
        category: 'ci-cd',
        config: {
            modules: ["integrations/github-actions-setup.sh"]
        }
    }
} as const;

// Extract integration IDs for schema validation
export const INTEGRATION_IDS = Object.keys(INTEGRATION_REGISTRY) as [string, ...string[]];

// Available integrations
export const IntegrationSchema = z.enum(INTEGRATION_IDS);

// Helper functions to work with the registry
export const getIntegrationConfig = (integration: IntegrationType): IntegrationConfig => {
    return INTEGRATION_REGISTRY[integration].config;
};

export const getIntegrationInfo = (integration: IntegrationType) => {
    const def = INTEGRATION_REGISTRY[integration];
    return {
        id: def.id,
        name: def.name,
        description: def.description,
        category: def.category
    };
};

export const getAllIntegrations = () => {
    return Object.values(INTEGRATION_REGISTRY).map(def => ({
        id: def.id,
        name: def.name,
        description: def.description,
        category: def.category
    }));
};

export const getAllCategories = (): string[] => {
    return [...new Set(Object.values(INTEGRATION_REGISTRY).map(def => def.category))];
};

// Package Manager Registry
export const PACKAGE_MANAGER_REGISTRY = {
    npm: {
        id: 'npm' as const,
        name: 'npm',
        description: 'Node Package Manager (default)',
        isDefault: true
    },
    yarn: {
        id: 'yarn' as const,
        name: 'Yarn',
        description: 'Fast, reliable, and secure dependency management',
        isDefault: false
    },
    pnpm: {
        id: 'pnpm' as const,
        name: 'pnpm',
        description: 'Fast, disk space efficient package manager',
        isDefault: false
    }
} as const;

// Node Version Registry
export const NODE_VERSION_REGISTRY = {
    '18.x': {
        id: '18.x' as const,
        name: 'Node.js 18.x LTS',
        description: 'Long Term Support version (recommended)',
        isDefault: true
    },
    '20.x': {
        id: '20.x' as const,
        name: 'Node.js 20.x LTS',
        description: 'Latest LTS version',
        isDefault: false
    },
    latest: {
        id: 'latest' as const,
        name: 'Latest',
        description: 'Latest stable version',
        isDefault: false
    }
} as const;

// Helper functions for package managers
export const getAllPackageManagers = () => {
    return Object.values(PACKAGE_MANAGER_REGISTRY);
};

export const getPackageManagerInfo = (packageManager: PackageManagerType) => {
    return PACKAGE_MANAGER_REGISTRY[packageManager];
};

// Helper functions for Node versions
export const getAllNodeVersions = () => {
    return Object.values(NODE_VERSION_REGISTRY);
};

export const getNodeVersionInfo = (nodeVersion: NodeVersionType) => {
    return NODE_VERSION_REGISTRY[nodeVersion];
};

export const BASE_MODULES = [
    "init/00-validate-args.sh",
    "init/01-create-root.sh",
    "init/02-init-workspaces.sh",
    "client/node-react.sh",
    "server/nestjs.sh",
    "post/install-deps.sh",
    "post/gitignore-and-prettier.sh",
    "post/readme.sh"
] as const;
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
    advancedConfig: AdvancedConfigSchema.optional(),
    useAI: z.boolean().default(false)
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