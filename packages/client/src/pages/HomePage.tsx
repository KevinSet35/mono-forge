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
    ThemeProvider,
    createTheme,
    CssBaseline,
    LinearProgress,
    Tooltip,
    FormControlLabel,
    Checkbox,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Grid,
    Switch,
    Radio,
    RadioGroup,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TerminalIcon from '@mui/icons-material/Terminal';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GitHubIcon from '@mui/icons-material/GitHub';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import {
    ProjectNameSchema,
    IntegrationType,
    PackageManagerType,
    NodeVersionType,
    ScriptGeneratorSchema,
    ApiResponse,
    ResponseStatus,
    ScriptGenerationData,
    INTEGRATION_CATEGORIES,
    getAllIntegrations,
    getAllPackageManagers,
    getAllNodeVersions,
} from '@mono-forge/types';

// Theme configuration
const theme = createTheme({
    palette: {
        primary: { main: '#4a6da7' },
        secondary: { main: '#bb4d00' },
        background: { default: '#f7f9fc' },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 700 },
        h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 24px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' },
            },
        },
    },
});

// Environment configuration
const getEnvironmentConfig = () => {
    const CLIENT_PORT = process.env.REACT_APP_CLIENT_PORT || '3000';
    const SERVER_PORT = process.env.REACT_APP_SERVER_PORT || '5000';
    const API_URL = process.env.REACT_APP_API_URL || `http://localhost:${SERVER_PORT}/api`;
    const apiEndpoint = `${API_URL}/generatescript`;

    // Log environment configuration in development
    if (process.env.NODE_ENV === 'development') {
        console.log('Environment Configuration:');
        console.log(`- REACT_APP_CLIENT_PORT: ${CLIENT_PORT}`);
        console.log(`- REACT_APP_SERVER_PORT: ${SERVER_PORT}`);
        console.log(`- API URL: ${API_URL}`);
        console.log(`- API Endpoint: ${apiEndpoint}`);
    }

    return { CLIENT_PORT, SERVER_PORT, API_URL, apiEndpoint };
};

// Icon mapping for integrations
const getIntegrationIcon = (integrationId: IntegrationType) => {
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
    const { CLIENT_PORT, SERVER_PORT, apiEndpoint } = getEnvironmentConfig();

    // Form state
    const [projectName, setProjectName] = useState('');
    const [scriptOutput, setScriptOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(false);
    const [copiedSnackbar, setCopiedSnackbar] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [selectedIntegrations, setSelectedIntegrations] = useState<IntegrationType[]>(['typescript']);
    const [expandedSection, setExpandedSection] = useState<string | false>('main');
    const [advancedMode, setAdvancedMode] = useState(false);

    // New state for response metadata
    const [responseMetadata, setResponseMetadata] = useState<any>(null);

    // Advanced configuration state
    const [packageManager, setPackageManager] = useState<PackageManagerType>('npm');
    const [nodeVersion, setNodeVersion] = useState<NodeVersionType>('18.x');

    // Get integration data from the library
    const availableIntegrations = getAllIntegrations().map(integration => ({
        ...integration,
        icon: getIntegrationIcon(integration.id as IntegrationType)
    }));

    // Get package managers and node versions from the library
    const packageManagers = getAllPackageManagers();
    const nodeVersions = getAllNodeVersions();

    // Group integrations by category for display
    const groupedIntegrations = React.useMemo(() =>
        Object.entries(INTEGRATION_CATEGORIES).map(([categoryId, category]) => ({
            ...category,
            id: categoryId,
            items: availableIntegrations.filter(integration => integration.category === categoryId)
        })),
        [availableIntegrations]);

    // Validate project name when it changes
    useEffect(() => {
        validateProjectName(projectName);
    }, [projectName]);

    // Form validation functions
    const validateProjectName = (name: string) => {
        try {
            ProjectNameSchema.parse(name);
            setIsValid(true);
            setError(null);
        } catch (err: any) {
            setIsValid(false);
            setError(err.errors?.[0]?.message || 'Invalid project name');
        }
    };

    // Event handlers
    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(e.target.value);
    };

    const handleIntegrationToggle = (integrationId: IntegrationType) => {
        setSelectedIntegrations(prev =>
            prev.includes(integrationId)
                ? prev.filter(id => id !== integrationId)
                : [...prev, integrationId]
        );
    };

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedSection(isExpanded ? panel : false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(scriptOutput);
        setCopiedSnackbar(true);
    };

    const handleCloseSnackbar = () => {
        setCopiedSnackbar(false);
    };

    const getSelectedIntegrationsCount = () => {
        return selectedIntegrations.length;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
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
        } catch (err: any) {
            handleSubmissionError(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper functions for form submission
    const prepareRequestData = () => ({
        projectName,
        integrations: selectedIntegrations,
        advancedConfig: advancedMode ? {
            packageManager,
            nodeVersion
        } : undefined
    });

    const submitForm = async (validatedData: any) => {
        // Use the main endpoint that returns ApiResponse<ScriptGenerationData>
        return axios.post(apiEndpoint, validatedData);
    };

    const handleSubmissionError = (err: any) => {
        console.error('API Error:', err);

        if (err.errors) {
            // Zod validation error
            setApiError(`Validation Error: ${err.errors[0]?.message || 'Invalid form data'}`);
        } else if (err.response?.data) {
            // Server response error - handle both old format and new ApiResponse format
            const responseData = err.response.data;

            if (responseData.status === ResponseStatus.ERROR && responseData.error) {
                // New ApiResponse error format
                setApiError(`Error: ${responseData.error.message}`);
            } else if (responseData.message) {
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
        setScriptOutput('');
        setResponseMetadata(null);
    };

    // Render functions
    const renderProjectNameField = () => (
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

    const renderIntegrationItem = (integration: typeof availableIntegrations[0], category: any) => (
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
                    cursor: 'pointer',
                    '&:hover': {
                        borderColor: category.color,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }
                }}
                onClick={() => handleIntegrationToggle(integration.id as IntegrationType)}
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

    const renderIntegrationCategory = (category: any) => (
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
                {category.items.map((integration: any) => renderIntegrationItem(integration, category))}
            </Grid>
        </Box>
    );

    const renderAdvancedOptions = () => (
        <Fade in={true}>
            <Box sx={{
                p: 2,
                backgroundColor: 'rgba(74, 109, 167, 0.05)',
                borderRadius: 1,
                border: '1px solid rgba(74, 109, 167, 0.15)'
            }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Package Manager
                </Typography>
                <RadioGroup
                    row
                    value={packageManager}
                    onChange={(e) => setPackageManager(e.target.value as PackageManagerType)}
                    name="package-manager-radio-group"
                    sx={{ mb: 3 }}
                >
                    {packageManagers.map((pm) => (
                        <FormControlLabel
                            key={pm.id}
                            value={pm.id}
                            control={<Radio />}
                            label={pm.name}
                        />
                    ))}
                </RadioGroup>

                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Node Version
                </Typography>
                <RadioGroup
                    row
                    value={nodeVersion}
                    onChange={(e) => setNodeVersion(e.target.value as NodeVersionType)}
                    name="node-version-radio-group"
                >
                    {nodeVersions.map((nv) => (
                        <FormControlLabel
                            key={nv.id}
                            value={nv.id}
                            control={<Radio />}
                            label={nv.name}
                        />
                    ))}
                </RadioGroup>
            </Box>
        </Fade>
    );

    const renderIntegrationChip = (id: IntegrationType) => {
        const integration = availableIntegrations.find(i => i.id === id);
        if (!integration) return null;

        const category = INTEGRATION_CATEGORIES[integration.category as keyof typeof INTEGRATION_CATEGORIES];
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

    const renderMetadataSection = () => (
        responseMetadata && (
            <Box mt={2} p={2} sx={{ backgroundColor: 'rgba(74, 109, 167, 0.05)', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Generation Details
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Generated:</strong> {new Date(responseMetadata.generatedAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Script Size:</strong> {responseMetadata.scriptLength} characters
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Integrations:</strong> {responseMetadata.integrationsCount}
                    </Typography>
                </Box>
            </Box>
        )
    );

    const renderInstructions = () => (
        <Box mt={3} p={2.5} sx={{ backgroundColor: 'rgba(74, 109, 167, 0.05)', borderRadius: 1, border: '1px solid rgba(74, 109, 167, 0.15)' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                <TerminalIcon sx={{ fontSize: 20, mr: 1 }} />
                How to Use This Script
            </Typography>

            <Box component="ol" sx={{ pl: 2, mb: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                        <strong>Save the script</strong> to a file with a <code>.sh</code> extension, e.g., <code>{projectName}-setup.sh</code>
                    </Typography>
                </Box>

                <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                        <strong>Make the script executable</strong> by running the following command in your terminal:
                    </Typography>
                    <Paper sx={{ p: 1, my: 1, backgroundColor: '#2d333b', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Consolas, Monaco, monospace', color: '#e6edf3' }}>
                            chmod +x {projectName}-setup.sh
                        </Typography>
                    </Paper>
                </Box>

                <Box component="li">
                    <Typography variant="body2">
                        <strong>Execute the script</strong> using:
                    </Typography>
                    <Paper sx={{ p: 1, my: 1, backgroundColor: '#2d333b', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Consolas, Monaco, monospace', color: '#e6edf3' }}>
                            ./{projectName}-setup.sh
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            <Box mt={2} px={2} py={1.5} sx={{ backgroundColor: 'rgba(255, 248, 230, 0.7)', borderRadius: 1, border: '1px solid rgba(255, 204, 0, 0.3)' }}>
                <Typography variant="body2" sx={{ color: 'rgba(122, 90, 0, 0.9)', display: 'flex', alignItems: 'center' }}>
                    <ErrorOutlineIcon sx={{ fontSize: 16, mr: 1, color: 'rgba(200, 150, 0, 0.9)' }} />
                    Always review script contents before execution, especially when working with system configurations.
                </Typography>
            </Box>
        </Box>
    );

    const renderHeaderSection = () => (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
            <TerminalIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
                MonoForge Script Generator
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                Generate custom bash scripts for your development projects with pre-configured integrations and tools.
            </Typography>
        </Box>
    );

    const renderBasicConfigSection = () => (
        <Box sx={{ mb: 3, p: 3, backgroundColor: 'background.paper', borderRadius: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                Basic Configuration
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box mb={1}>
                    {renderProjectNameField()}
                </Box>
            </form>
        </Box>
    );

    const renderIntegrationsSection = () => (
        <Accordion
            expanded={expandedSection === 'integrations'}
            onChange={handleAccordionChange('integrations')}
            elevation={0}
            sx={{ mb: 2 }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Integrations & Tools
                    </Typography>
                    <Chip
                        label={`${getSelectedIntegrationsCount()} selected`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Select the integrations and tools you want to include in your project setup script.
                </Typography>

                {groupedIntegrations.map(category => renderIntegrationCategory(category))}
            </AccordionDetails>
        </Accordion>
    );

    const renderAdvancedSection = () => (
        <Accordion
            expanded={expandedSection === 'advanced'}
            onChange={handleAccordionChange('advanced')}
            elevation={0}
            sx={{ mb: 3 }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Advanced Options
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={advancedMode}
                                onChange={(e) => setAdvancedMode(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Enable Advanced Configuration"
                    />
                </Box>

                {advancedMode && renderAdvancedOptions()}
            </AccordionDetails>
        </Accordion>
    );

    const renderGenerateButton = () => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
                variant="contained"
                disabled={loading || !isValid || !projectName}
                disableElevation
                onClick={handleSubmit}
                sx={{
                    py: 1.5,
                    px: 4,
                    transition: 'all 0.2s',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(74, 109, 167, 0.2)'
                    }
                }}
            >
                {loading ? 'Generating...' : 'Generate Script'}
            </Button>
        </Box>
    );

    const renderErrorMessage = () => (
        apiError && (
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
        )
    );

    const renderLoadingIndicator = () => (
        loading && (
            <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
                <LinearProgress />
            </Box>
        )
    );

    const renderScriptOutput = () => (
        formSubmitted && scriptOutput && (
            <Box mb={4}>
                <Fade in={true} timeout={800}>
                    <Card elevation={0}>
                        <CardHeader
                            title="Generated Script"
                            subheader={`Script for project: ${projectName} with ${getSelectedIntegrationsCount()} integrations`}
                            sx={{
                                pb: 0,
                                '& .MuiCardHeader-title': {
                                    fontSize: '1.25rem',
                                    color: 'primary.main'
                                }
                            }}
                            action={
                                <Tooltip title="Copy to clipboard">
                                    <IconButton onClick={handleCopy}>
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Tooltip>
                            }
                        />
                        <CardContent>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 0, // Remove padding to let the TextField handle it
                                    borderRadius: 1,
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e0e0e0',
                                    maxHeight: '500px', // Increased height for better visibility
                                    overflow: 'hidden', // Let the inner component handle scrolling
                                    position: 'relative'
                                }}
                            >
                                <TextField
                                    multiline
                                    fullWidth
                                    maxRows={25} // Set maximum rows for better control
                                    value={scriptOutput}
                                    variant="filled"
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                            disableUnderline: true,
                                            sx: {
                                                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                                fontSize: '0.875rem',
                                                padding: '16px',
                                                backgroundColor: '#f8f9fa',
                                                maxHeight: '500px',
                                                overflow: 'auto',
                                                // Enhanced scrollbar styling
                                                '&::-webkit-scrollbar': {
                                                    width: '12px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    background: '#f1f1f1',
                                                    borderRadius: '6px',
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    background: '#c1c1c1',
                                                    borderRadius: '6px',
                                                    border: '2px solid #f1f1f1',
                                                },
                                                '&::-webkit-scrollbar-thumb:hover': {
                                                    background: '#a8a8a8',
                                                },
                                                // Firefox scrollbar styling
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: '#c1c1c1 #f1f1f1',
                                                // Ensure the text wraps properly
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }
                                        }
                                    }}
                                    InputProps={{
                                        style: {
                                            color: '#2d3748',
                                            backgroundColor: 'transparent'
                                        }
                                    }}
                                />
                                {/* Optional: Add a scroll indicator */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace',
                                        pointerEvents: 'none',
                                        opacity: 0.8
                                    }}
                                >
                                    {scriptOutput.split('\n').length} lines
                                </Box>
                            </Paper>

                            {/* Metadata Section */}
                            {renderMetadataSection()}

                            {/* Included Integrations Summary */}
                            <Box mt={3} mb={2}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    Included Integrations
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {selectedIntegrations.map(id => renderIntegrationChip(id))}
                                </Box>
                            </Box>

                            {renderInstructions()}
                        </CardContent>
                    </Card>
                </Fade>
            </Box>
        )
    );

    const renderFooter = () => (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
                © 2025 MonoForge - A modern scripting tool for developers
            </Typography>
            {process.env.NODE_ENV === 'development' && (
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                    Client: localhost:{CLIENT_PORT} | Server: localhost:{SERVER_PORT} | Environment: {process.env.NODE_ENV}
                </Typography>
            )}
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    py: 6,
                    backgroundColor: 'background.default'
                }}
            >
                <Container maxWidth="md">
                    {renderHeaderSection()}

                    <Box mb={4}>
                        {renderBasicConfigSection()}
                        {renderIntegrationsSection()}
                        {renderAdvancedSection()}
                        {renderGenerateButton()}
                    </Box>

                    {renderErrorMessage()}
                    {renderLoadingIndicator()}
                    {renderScriptOutput()}
                    {renderFooter()}
                </Container>
            </Box>

            <Snackbar
                open={copiedSnackbar}
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
                    Script copied to clipboard successfully!
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
};

export default HomePage;