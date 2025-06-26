// Re-export from types library for backward compatibility
export {
    IntegrationConfig,
    BASE_MODULES,
    getIntegrationConfig
} from '@mono-forge/types';

// For backward compatibility with the old INTEGRATION_CONFIGS usage
import { INTEGRATION_REGISTRY, IntegrationType, IntegrationConfig } from '@mono-forge/types';

// Create a mapping that matches the old structure for backward compatibility
export const INTEGRATION_CONFIGS: Record<IntegrationType, IntegrationConfig> = Object.keys(INTEGRATION_REGISTRY).reduce((acc, key) => {
    acc[key as IntegrationType] = INTEGRATION_REGISTRY[key].config;
    return acc;
}, {} as Record<IntegrationType, IntegrationConfig>);