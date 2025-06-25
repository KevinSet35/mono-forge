import { IntegrationType } from '@mono-forge/types';

export interface IntegrationConfig {
    modules: string[];
    dependencies?: string[];
    devDependencies?: string[];
    scripts?: Record<string, string>;
}

export const INTEGRATION_CONFIGS: Record<IntegrationType, IntegrationConfig> = {
    git: {
        modules: ["integrations/git-setup.sh"],
        scripts: {
            "git:init": "git init && git add . && git commit -m 'Initial commit'"
        }
    },
    supabase: {
        modules: ["integrations/supabase-setup.sh"],
        dependencies: ["@supabase/supabase-js"],
        devDependencies: ["supabase"]
    },
    docker: {
        modules: ["integrations/docker-setup.sh"]
    },
    jest: {
        modules: ["integrations/jest-setup.sh"],
        devDependencies: ["jest", "@types/jest", "ts-jest"]
    },
    typescript: {
        modules: ["integrations/typescript-enhanced.sh"],
        devDependencies: ["typescript", "@types/node"]
    },
    eslint: {
        modules: ["integrations/eslint-setup.sh"],
        devDependencies: ["eslint", "@typescript-eslint/parser", "@typescript-eslint/eslint-plugin"]
    },
    prettier: {
        modules: ["integrations/prettier-setup.sh"],
        devDependencies: ["prettier"]
    },
    github_actions: {
        modules: ["integrations/github-actions-setup.sh"]
    }
} as const;

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
