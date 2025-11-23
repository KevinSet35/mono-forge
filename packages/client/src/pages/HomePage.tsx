import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    IconButton,
    InputAdornment,
    Snackbar,
    Alert,
    Divider,
    Card,
    CardContent,
    CardHeader,
    Fade,
    LinearProgress,
    Tooltip,
    FormControlLabel,
    Checkbox,
    Chip,
    Grid,
    Switch,
    Radio,
    RadioGroup,
    Step,
    StepLabel,
    Stepper,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TerminalIcon from '@mui/icons-material/Terminal';
import GitHubIcon from '@mui/icons-material/GitHub';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BuildIcon from '@mui/icons-material/Build';
import ExtensionIcon from '@mui/icons-material/Extension';
import TuneIcon from '@mui/icons-material/Tune';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    ProjectNameSchema,
    IntegrationType,
    PackageManagerType,
    NodeVersionType,
    ScriptGeneratorSchema,
    ScriptGeneratorInput,
    ApiResponse,
    ResponseStatus,
    ScriptGenerationData,
    ResponseMetadata,
    IntegrationInfo,
    PackageManagerInfo,
    NodeVersionInfo,
    INTEGRATION_CATEGORIES,
    IntegrationCategory,
    getAllIntegrations,
    getAllPackageManagers,
    getAllNodeVersions,
} from '@mono-forge/types';
import { getEnvironmentConfig, EnvironmentConfig } from '../App';

// Enhanced integration info with icon
interface IntegrationWithIcon extends IntegrationInfo {
    icon: React.ReactElement;
}

// Configuration step interface
interface ConfigurationStep {
    label: string;
    icon: React.ReactElement;
    completed: boolean;
}

// Category with items interface
interface CategoryWithItems {
    id: string;
    name: string;
    color: string;
    items: IntegrationWithIcon[];
}

// Icon mapping for integrations
const getIntegrationIcon = (integrationId: IntegrationType): React.ReactElement => {
    const iconMap: Record<IntegrationType, React.ReactElement> = {
        git: <GitHubIcon />,
        supabase: <StorageIcon />,
        docker: <CodeIcon />,
        jest: <CheckCircleOutlineIcon />,
        typescript: <CodeIcon />,
        eslint: <SettingsIcon />,
        prettier: <SettingsIcon />,
        github_actions: <GitHubIcon />,
    };
    return iconMap[integrationId] || <CodeIcon />;
};

// Updated response interfaces to match the new ApiResponse<T> structure
interface ScriptGenerationResponse extends ApiResponse<ScriptGenerationData> { }

interface ErrorApiResponse extends ApiResponse<null> {
    status: ResponseStatus.ERROR;
    error: {
        code: number;
        message: string;
        details?: string;
    };
}

const HomePage: React.FC = () => {
    // Environment configuration
    const { CLIENT_PORT, SERVER_PORT, apiEndpoint }: EnvironmentConfig = getEnvironmentConfig();

    // Form state
    const [projectName, setProjectName] = useState<string>('');
    const [scriptOutput, setScriptOutput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [selectedIntegrations, setSelectedIntegrations] = useState<IntegrationType[]>(['typescript']);
    const [expandedSection, setExpandedSection] = useState<string | false>('main');
    const [advancedMode, setAdvancedMode] = useState<boolean>(false);

    // New state for response metadata
    const [responseMetadata, setResponseMetadata] = useState<ResponseMetadata | null>(null);

    // Advanced configuration state
    const [packageManager, setPackageManager] = useState<PackageManagerType>('npm');
    const [nodeVersion, setNodeVersion] = useState<NodeVersionType>('18.x');

    // AI Mode state
    const [useAI, setUseAI] = useState<boolean>(false);

    // Configuration progress tracking
    const [currentStep, setCurrentStep] = useState<number>(0);

    // Get integration data from the library
    const availableIntegrations: IntegrationWithIcon[] = getAllIntegrations().map((integration: IntegrationInfo) => ({
        ...integration,
        icon: getIntegrationIcon(integration.id as IntegrationType)
    }));

    // Get package managers and node versions from the library
    const packageManagers: PackageManagerInfo[] = getAllPackageManagers();
    const nodeVersions: NodeVersionInfo[] = getAllNodeVersions();

    // Group integrations by category for display
    const groupedIntegrations: CategoryWithItems[] = React.useMemo(() =>
        Object.entries(INTEGRATION_CATEGORIES).map(([categoryId, category]) => ({
            ...category,
            id: categoryId,
            items: availableIntegrations.filter((integration: IntegrationWithIcon) => integration.category === categoryId)
        })),
        [availableIntegrations]);

    // Configuration steps for breadcrumb navigation
    const configurationSteps: ConfigurationStep[] = [
        { label: 'Project Setup', icon: <CodeIcon />, completed: Boolean(isValid && projectName) },
        { label: 'Integrations', icon: <ExtensionIcon />, completed: selectedIntegrations.length > 0 },
        { label: 'Advanced Options', icon: <TuneIcon />, completed: true },
        { label: 'Generate', icon: <BuildIcon />, completed: formSubmitted }
    ];

    // Update current step based on form state
    useEffect(() => {
        if (formSubmitted) {
            setCurrentStep(3);  // Generate
        } else if (advancedMode) {
            setCurrentStep(2);  // Advanced Options
        } else if (isValid && projectName && selectedIntegrations.length > 0) {
            setCurrentStep(1);  // Integrations (only when project is ready AND integrations exist)
        } else {
            setCurrentStep(0);  // Project Setup (default and when working on project name)
        }
    }, [isValid, projectName, selectedIntegrations, advancedMode, formSubmitted]);

    // Validate project name when it changes
    useEffect(() => {
        validateProjectName(projectName);
    }, [projectName]);

    // Form validation functions
    const validateProjectName = (name: string): void => {
        try {
            ProjectNameSchema.parse(name);
            setIsValid(true);
            setError(null);
        } catch (err: unknown) {
            const zodError = err as { errors?: Array<{ message: string }> };
            setIsValid(false);
            setError(zodError.errors?.[0]?.message || 'Invalid project name');
        }
    };

    // Event handlers
    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setProjectName(e.target.value);
    };

    const handleIntegrationToggle = (integrationId: IntegrationType): void => {
        setSelectedIntegrations(prev =>
            prev.includes(integrationId)
                ? prev.filter(id => id !== integrationId)
                : [...prev, integrationId]
        );
    };

    const handleCopy = (): void => {
        navigator.clipboard.writeText(scriptOutput);
        setSnackbarMessage('Script copied to clipboard successfully!');
        setSnackbarOpen(true);
    };

    const handleDownload = (): void => {
        if (!scriptOutput || !projectName) return;

        // Create a blob with the script content
        const blob = new Blob([scriptOutput], { type: 'text/plain' });

        // Create a temporary download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectName}-setup.sh`;

        // Trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Show success message
        setSnackbarMessage(`Script downloaded as ${projectName}-setup.sh`);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = (): void => {
        setSnackbarOpen(false);
        setSnackbarMessage('');
    };

    const getSelectedIntegrationsCount = (): number => {
        return selectedIntegrations.length;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!isValid) return;

        setLoading(true);
        setScriptOutput('');
        setApiError(null);
        setResponseMetadata(null);

        try {
            const requestData = prepareRequestData();
            const validatedData = ScriptGeneratorSchema.parse(requestData);
            const response = await submitForm(validatedData);

            // Handle the ApiResponse<ScriptGenerationData> structure
            const apiResponse = response.data as ScriptGenerationResponse;

            if (apiResponse.status === ResponseStatus.SUCCESS && apiResponse.data) {
                setScriptOutput(apiResponse.data.script);
                setResponseMetadata(apiResponse.data.metadata);
                setFormSubmitted(true);
            } else {
                // Handle error response
                const errorResponse = apiResponse as ErrorApiResponse;
                throw new Error(errorResponse.error?.message || 'Failed to generate script');
            }
        } catch (err: unknown) {
            handleSubmissionError(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper functions for form submission
    const prepareRequestData = (): ScriptGeneratorInput => ({
        projectName,
        integrations: selectedIntegrations,
        useAI: useAI,
        advancedConfig: advancedMode ? {
            packageManager,
            nodeVersion
        } : undefined
    });

    const submitForm = async (validatedData: ScriptGeneratorInput) => {
        // Use the main endpoint that returns ApiResponse<ScriptGenerationData>
        return axios.post(apiEndpoint, validatedData);
    };

    const handleSubmissionError = (err: unknown): void => {
        console.error('API Error:', err);

        // Type guard for axios error
        const isAxiosError = (error: unknown): error is {
            response?: { data: unknown };
            message?: string;
            errors?: Array<{ message: string }>
        } => {
            return typeof error === 'object' && error !== null;
        };

        if (isAxiosError(err)) {
            if (err.errors) {
                // Zod validation error
                setApiError(`Validation Error: ${err.errors[0]?.message || 'Invalid form data'}`);
            } else if (err.response?.data) {
                // Server response error - handle both old format and new ApiResponse format
                const responseData = err.response.data;

                // Type guard for ApiResponse error format
                const isApiResponseError = (data: unknown): data is ErrorApiResponse => {
                    return typeof data === 'object' && data !== null &&
                        'status' in data && (data as { status: string }).status === ResponseStatus.ERROR;
                };

                // Type guard for legacy error format
                const isLegacyError = (data: unknown): data is { message: string } => {
                    return typeof data === 'object' && data !== null && 'message' in data;
                };

                if (isApiResponseError(responseData)) {
                    // New ApiResponse error format
                    setApiError(`Error: ${responseData.error.message}`);
                } else if (isLegacyError(responseData)) {
                    // Legacy error format
                    setApiError(`Error: ${responseData.message}`);
                } else {
                    setApiError('An unexpected error occurred');
                }
            } else {
                // Network or other error
                const errorMessage = err.message || 'Failed to connect to server';
                setApiError(`Error: ${errorMessage}`);
            }
        } else {
            setApiError('An unexpected error occurred');
        }
        setScriptOutput('');
        setResponseMetadata(null);
    };

    // Visual separator component
    const SectionDivider: React.FC<{ icon?: React.ReactElement; title?: string }> = ({ icon, title }) => (
        <Box sx={{ my: 4 }}>
            <Divider sx={{
                borderColor: 'primary.light',
                '&::before, &::after': {
                    borderColor: 'primary.light',
                }
            }}>
                {(icon || title) && (
                    <Chip
                        {...(icon && { icon })}
                        label={title}
                        sx={{
                            bgcolor: 'background.paper',
                            color: 'primary.main',
                            fontWeight: 600,
                            px: 2,
                            border: '1px solid',
                            borderColor: 'primary.light'
                        }}
                    />
                )}
            </Divider>
        </Box>
    );

    // Progress indicator component
    const ConfigurationProgress: React.FC = () => (
        <Box sx={{ mb: 4 }}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                    Configuration Progress
                </Typography>

                <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 2 }}>
                    {configurationSteps.map((step: ConfigurationStep, index: number) => (
                        <Step key={step.label} completed={Boolean(step.completed)}>
                            <StepLabel
                                icon={step.completed ? <CheckCircleOutlineIcon color="success" /> : step.icon}
                                sx={{
                                    '& .MuiStepLabel-label': {
                                        fontSize: '0.875rem',
                                        fontWeight: step.completed ? 600 : 400
                                    }
                                }}
                            >
                                {step.label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>
        </Box>
    );

    // Render functions
    const renderProjectNameField = (): React.ReactElement => (
        <TextField
            label="Project Name"
            variant="outlined"
            fullWidth
            value={projectName}
            onChange={handleProjectNameChange}
            error={!!error}
            helperText={error || "Use lowercase letters, numbers, and hyphens only (e.g., my-awesome-project)"}
            required
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <CodeIcon color="action" />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            {isValid && projectName && (
                                <Fade in={true}>
                                    <CheckCircleOutlineIcon color="success" />
                                </Fade>
                            )}
                            {error && projectName && (
                                <Fade in={true}>
                                    <ErrorOutlineIcon color="error" />
                                </Fade>
                            )}
                        </InputAdornment>
                    ),
                }
            }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '&.Mui-focused': {
                        boxShadow: '0 0 0 3px rgba(74, 109, 167, 0.1)'
                    }
                }
            }}
        />
    );

    const renderIntegrationItem = (integration: IntegrationWithIcon, category: CategoryWithItems): React.ReactElement => (
        <Grid key={integration.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderColor: selectedIntegrations.includes(integration.id as IntegrationType)
                        ? category.color
                        : 'divider',
                    borderWidth: selectedIntegrations.includes(integration.id as IntegrationType) ? 2 : 1,
                    bgcolor: selectedIntegrations.includes(integration.id as IntegrationType)
                        ? `${category.color}10`
                        : 'background.paper',
                    transition: 'all 0.2s',
                    cursor: useAI ? 'not-allowed' : 'pointer',
                    opacity: useAI ? 0.5 : 1,
                    '&:hover': useAI ? {} : {
                        borderColor: category.color,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        transform: 'translateY(-1px)'
                    }
                }}
                onClick={() => !useAI && handleIntegrationToggle(integration.id as IntegrationType)}
            >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box sx={{ mr: 2, color: category.color }}>
                        {integration.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                            {integration.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            {integration.description}
                        </Typography>
                    </Box>
                    <Checkbox
                        checked={selectedIntegrations.includes(integration.id as IntegrationType)}
                        onChange={() => handleIntegrationToggle(integration.id as IntegrationType)}
                        disabled={useAI}
                        sx={{
                            p: 0.5,
                            '&.Mui-checked': {
                                color: category.color
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Box>
            </Paper>
        </Grid>
    );

    const renderIntegrationCategory = (category: CategoryWithItems): React.ReactElement => (
        <Box key={category.id} sx={{ mb: 3 }}>
            <Typography
                variant="subtitle1"
                sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    color: category.color,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {category.name}
            </Typography>
            <Grid container spacing={2}>
                {category.items.map((integration: IntegrationWithIcon) => renderIntegrationItem(integration, category))}
            </Grid>
        </Box>
    );

    const renderAdvancedOptions = (): React.ReactElement => (
        <Fade in={true}>
            <Box sx={{
                p: 3,
                backgroundColor: 'rgba(74, 109, 167, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(74, 109, 167, 0.15)',
                opacity: useAI ? 0.5 : 1,
                pointerEvents: useAI ? 'none' : 'auto'
            }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Package Manager
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Choose your preferred package manager for dependency management
                    </Typography>
                    <RadioGroup
                        row
                        value={packageManager}
                        onChange={(e) => setPackageManager(e.target.value as PackageManagerType)}
                        name="package-manager-radio-group"
                    >
                        {packageManagers.map((pm: PackageManagerInfo) => (
                            <FormControlLabel
                                key={pm.id}
                                value={pm.id}
                                control={<Radio disabled={useAI} />}
                                label={pm.name}
                            />
                        ))}
                    </RadioGroup>
                </Box>

                <Divider sx={{ my: 3, borderColor: 'rgba(74, 109, 167, 0.2)' }} />

                <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Node.js Version
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select the Node.js version for your project
                    </Typography>
                    <RadioGroup
                        row
                        value={nodeVersion}
                        onChange={(e) => setNodeVersion(e.target.value as NodeVersionType)}
                        name="node-version-radio-group"
                    >
                        {nodeVersions.map((nv: NodeVersionInfo) => (
                            <FormControlLabel
                                key={nv.id}
                                value={nv.id}
                                control={<Radio disabled={useAI} />}
                                label={nv.name}
                            />
                        ))}
                    </RadioGroup>
                </Box>
            </Box>
        </Fade>
    );

    const renderIntegrationChip = (id: IntegrationType): React.ReactElement | null => {
        const integration = availableIntegrations.find((i: IntegrationWithIcon) => i.id === id);
        if (!integration) return null;

        const category = INTEGRATION_CATEGORIES[integration.category as IntegrationCategory];
        return (
            <Chip
                key={id}
                label={integration.name}
                icon={integration.icon}
                size="small"
                sx={{
                    bgcolor: `${category.color}15`,
                    color: category.color,
                    borderColor: category.color,
                    borderWidth: 1,
                    borderStyle: 'solid'
                }}
            />
        );
    };

    const renderMetadataSection = (): React.ReactElement | null => (
        responseMetadata ? (
            <Box mt={3} p={3} sx={{
                backgroundColor: 'rgba(74, 109, 167, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(74, 109, 167, 0.15)'
            }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    📊 Generation Details
                </Typography>
                <Grid container spacing={3}>
                    <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Generated:</strong><br />
                            {new Date(responseMetadata.generatedAt).toLocaleString()}
                        </Typography>
                    </Grid>
                    <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Script Size:</strong><br />
                            {responseMetadata.scriptLength} characters
                        </Typography>
                    </Grid>
                    <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Integrations:</strong><br />
                            {responseMetadata.integrationsCount} selected
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        ) : null
    );

    const renderInstructions = (): React.ReactElement => (
        <Box mt={4} p={3} sx={{
            backgroundColor: 'rgba(74, 109, 167, 0.05)',
            borderRadius: 2,
            border: '1px solid rgba(74, 109, 167, 0.15)'
        }}>
            <Typography variant="h6" gutterBottom sx={{
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                mb: 3
            }}>
                <TerminalIcon sx={{ fontSize: 24, mr: 1 }} />
                How to Use This Script
            </Typography>

            <Box component="ol" sx={{ pl: 2, mb: 0, '& li': { mb: 2 } }}>
                <Box component="li">
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        Save the script
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Save to a file with a <code>.sh</code> extension, e.g., <code>{projectName}-setup.sh</code>
                    </Typography>
                </Box>

                <Box component="li">
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        Make executable
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Run the following command in your terminal:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#2d333b', borderRadius: 1, position: 'relative' }}>
                        <Typography variant="body2" sx={{
                            fontFamily: 'Consolas, Monaco, monospace',
                            color: '#e6edf3',
                            pr: 5
                        }}>
                            chmod +x {projectName}-setup.sh
                        </Typography>
                        <Tooltip title="Copy to clipboard">
                            <IconButton
                                onClick={() => {
                                    navigator.clipboard.writeText(`chmod +x ${projectName}-setup.sh`);
                                    setSnackbarMessage('Command copied to clipboard!');
                                    setSnackbarOpen(true);
                                }}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#e6edf3',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                                size="small"
                            >
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Paper>
                </Box>

                <Box component="li">
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        Execute the script
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Run the script using:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#2d333b', borderRadius: 1, position: 'relative' }}>
                        <Typography variant="body2" sx={{
                            fontFamily: 'Consolas, Monaco, monospace',
                            color: '#e6edf3',
                            pr: 5
                        }}>
                            ./{projectName}-setup.sh
                        </Typography>
                        <Tooltip title="Copy to clipboard">
                            <IconButton
                                onClick={() => {
                                    navigator.clipboard.writeText(`./${projectName}-setup.sh`);
                                    setSnackbarMessage('Command copied to clipboard!');
                                    setSnackbarOpen(true);
                                }}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#e6edf3',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                                size="small"
                            >
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Paper>
                </Box>
            </Box>

            <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                    Always review script contents before execution, especially when working with system configurations.
                </Typography>
            </Alert>
        </Box>
    );

    const renderHeaderSection = (): React.ReactElement => (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
            <TerminalIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                MonoForge Script Generator
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', fontWeight: 400 }}>
                Generate custom bash scripts for your development projects with pre-configured integrations and tools.
            </Typography>
        </Box>
    );

    const renderBasicConfigSection = (): React.ReactElement => (
        <Paper sx={{
            mb: 4,
            p: 4,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CodeIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Project Configuration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Start by naming your project
                    </Typography>
                </Box>
            </Box>
            <form onSubmit={handleSubmit}>
                {renderProjectNameField()}
            </form>
        </Paper>
    );

    const renderIntegrationsSection = (): React.ReactElement => (
        <Paper sx={{
            mb: 4,
            p: 4,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            opacity: useAI ? 0.5 : 1,
            pointerEvents: useAI ? 'none' : 'auto'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ExtensionIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Choose Your Integrations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {useAI ? 'Disabled in AI mode' : 'Select the tools and frameworks you want to include'}
                    </Typography>
                </Box>
                <Chip
                    label={`${getSelectedIntegrationsCount()} selected`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />
            </Box>

            {groupedIntegrations.map((category: CategoryWithItems) => renderIntegrationCategory(category))}
        </Paper>
    );

    const renderAIModeSection = (): React.ReactElement => (
        <Paper sx={{
            mb: 4,
            p: 4,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: useAI ? 'primary.main' : 'divider',
            boxShadow: useAI ? '0 0 20px rgba(74, 109, 167, 0.2)' : 'none',
            transition: 'all 0.3s'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BuildIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        AI-Powered Generation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Let AI generate your script automatically
                    </Typography>
                </Box>
            </Box>

            <FormControlLabel
                control={
                    <Switch
                        checked={useAI}
                        onChange={(e) => setUseAI(e.target.checked)}
                        color="primary"
                    />
                }
                label={
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Use AI Script Generation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {useAI
                                ? 'AI will handle all configuration automatically - manual options are disabled'
                                : 'Enable to let AI generate your script based on project name only'}
                        </Typography>
                    </Box>
                }
            />

            {useAI && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    AI mode is enabled. All integration and configuration options are disabled.
                    The AI will automatically determine the best setup for your project.
                </Alert>
            )}
        </Paper>
    );

    const renderAdvancedSection = (): React.ReactElement => (
        <Paper sx={{
            mb: 4,
            p: 4,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            opacity: useAI ? 0.5 : 1,
            pointerEvents: useAI ? 'none' : 'auto'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TuneIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Advanced Configuration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Fine-tune your project settings
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={advancedMode}
                            onChange={(e) => setAdvancedMode(e.target.checked)}
                            color="primary"
                            disabled={useAI}
                        />
                    }
                    label={
                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Enable Advanced Options
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Configure package manager and Node.js version
                            </Typography>
                        </Box>
                    }
                />
            </Box>

            {advancedMode && renderAdvancedOptions()}
        </Paper>
    );

    const renderGenerateButton = (): React.ReactElement => (
        <Paper sx={{
            p: 4,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            textAlign: 'center'
        }}>
            <Box sx={{ mb: 3 }}>
                <BuildIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                    Ready to Generate
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Review your configuration and generate your custom script
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    Project: <strong>{projectName || 'Not set'}</strong> •
                    Integrations: <strong>{selectedIntegrations.length}</strong> •
                    Package Manager: <strong>{packageManager}</strong>
                </Typography>
            </Box>

            <Button
                variant="contained"
                size="large"
                disabled={loading || !isValid || !projectName}
                disableElevation
                onClick={handleSubmit}
                startIcon={loading ? null : <PlayArrowIcon />}
                sx={{
                    py: 1.5,
                    px: 6,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(74, 109, 167, 0.3)'
                    }
                }}
            >
                {loading ? 'Generating Your Script...' : 'Generate Script'}
            </Button>
        </Paper>
    );

    const renderErrorMessage = (): React.ReactElement | null => (
        apiError ? (
            <Box mb={4}>
                <Alert
                    severity="error"
                    variant="outlined"
                    sx={{
                        fontWeight: 500,
                        '& .MuiAlert-icon': { alignItems: 'center' }
                    }}
                >
                    <Typography variant="body2">
                        {apiError}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        Make sure the server is running at port {SERVER_PORT}
                    </Typography>
                </Alert>
            </Box>
        ) : null
    );

    const renderLoadingIndicator = (): React.ReactElement | null => (
        loading ? (
            <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
                <LinearProgress />
            </Box>
        ) : null
    );

    const renderScriptOutput = (): React.ReactElement | null => (
        (formSubmitted && scriptOutput) ? (
            <Box mb={4}>
                <Fade in={true} timeout={800}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardHeader
                            title={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CheckCircleOutlineIcon sx={{ color: 'success.main', mr: 1 }} />
                                    Generated Script
                                </Box>
                            }
                            subheader={`Script for project: ${projectName} with ${getSelectedIntegrationsCount()} integrations`}
                            sx={{
                                pb: 2,
                                '& .MuiCardHeader-title': {
                                    fontSize: '1.5rem',
                                    color: 'primary.main',
                                    fontWeight: 600
                                }
                            }}
                            action={
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Download script file">
                                        <IconButton
                                            onClick={handleDownload}
                                            sx={{
                                                color: 'primary.main',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(74, 109, 167, 0.1)'
                                                }
                                            }}
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Copy to clipboard">
                                        <IconButton onClick={handleCopy}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                        />
                        <CardContent>
                            <Paper
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e0e0e0',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box sx={{ position: 'relative' }}>
                                    <SyntaxHighlighter
                                        language="bash"
                                        style={vscDarkPlus}
                                        customStyle={{
                                            margin: 0,
                                            padding: '16px',
                                            fontSize: '0.875rem',
                                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                            maxHeight: '500px',
                                            overflow: 'auto',
                                            backgroundColor: '#1e1e1e',
                                            borderRadius: '8px',
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: '#555 #2d2d2d',
                                        }}
                                        codeTagProps={{
                                            style: {
                                                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                                fontSize: '0.875rem'
                                            }
                                        }}
                                        wrapLines={true}
                                        wrapLongLines={true}
                                        showLineNumbers={true}
                                        lineNumberStyle={{
                                            color: '#858585',
                                            fontSize: '0.75rem',
                                            paddingRight: '16px',
                                            userSelect: 'none'
                                        }}
                                    >
                                        {scriptOutput}
                                    </SyntaxHighlighter>

                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            color: 'white',
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontSize: '0.75rem',
                                            fontFamily: 'monospace',
                                            pointerEvents: 'none',
                                            opacity: 0.9,
                                            zIndex: 1
                                        }}
                                    >
                                        {scriptOutput.split('\n').length} lines
                                    </Box>
                                </Box>
                            </Paper>

                            {renderMetadataSection()}

                            <Box mt={4} p={3} sx={{
                                backgroundColor: 'rgba(74, 109, 167, 0.05)',
                                borderRadius: 2,
                                border: '1px solid rgba(74, 109, 167, 0.15)'
                            }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    🧩 Included Integrations
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {selectedIntegrations.map((id: IntegrationType) => renderIntegrationChip(id))}
                                </Box>
                            </Box>

                            {renderInstructions()}
                        </CardContent>
                    </Card>
                </Fade>
            </Box>
        ) : null
    );

    const renderFooter = (): React.ReactElement => (
        <Box sx={{ mt: 6 }}>
            <SectionDivider />
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    © 2025 MonoForge - A modern scripting tool for developers
                </Typography>
                {process.env.NODE_ENV === 'development' && (
                    <Typography variant="caption" color="text.disabled">
                        Client: localhost:{CLIENT_PORT} | Server: localhost:{SERVER_PORT} | Environment: {process.env.NODE_ENV}
                    </Typography>
                )}
            </Box>
        </Box>
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                py: 6,
                backgroundColor: 'background.default'
            }}
        >
            <Container maxWidth="lg">
                {renderHeaderSection()}

                <SectionDivider icon={<PlayArrowIcon />} title="Configuration Wizard" />

                <ConfigurationProgress />

                {renderBasicConfigSection()}

                <SectionDivider />

                {renderAIModeSection()}

                <SectionDivider />

                {renderIntegrationsSection()}

                <SectionDivider />

                {renderAdvancedSection()}

                <SectionDivider />

                {renderGenerateButton()}

                {renderErrorMessage()}
                {renderLoadingIndicator()}

                {formSubmitted && (
                    <>
                        <SectionDivider icon={<CheckCircleOutlineIcon />} title="Generated Script" />
                        {renderScriptOutput()}
                    </>
                )}

                {renderFooter()}
            </Container>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default HomePage;
