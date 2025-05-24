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
    FormGroup,
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
import { ProjectNameSchema } from '@mono-forge/types';


// Create React App automatically loads variables from .env files
// No need for manual dotenv config as long as variables have REACT_APP_ prefix

const theme = createTheme({
    palette: {
        primary: {
            main: '#4a6da7',
        },
        secondary: {
            main: '#bb4d00',
        },
        background: {
            default: '#f7f9fc',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
        },
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8,
    },
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
                root: {
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                },
            },
        },
    },
});

// Access environment variables with standard CRA approach (REACT_APP_ prefix)
const CLIENT_PORT = process.env.REACT_APP_CLIENT_PORT || '3000';
const SERVER_PORT = process.env.REACT_APP_SERVER_PORT || '5000';
const API_URL = process.env.REACT_APP_API_URL || `http://localhost:${SERVER_PORT}/api`;
const apiEndpoint = `${API_URL}/generatescript`;

console.log('yoooo client:', process.env.REACT_APP_CLIENT_PORT);
console.log('yoooo server:', process.env.REACT_APP_SERVER_PORT);

// Log environment configuration in development
if (process.env.NODE_ENV === 'development') {
    console.log('Environment Configuration:');
    console.log(`- REACT_APP_CLIENT_PORT: ${CLIENT_PORT}`);
    console.log(`- REACT_APP_SERVER_PORT: ${SERVER_PORT}`);
    console.log(`- API URL: ${API_URL}`);
    console.log(`- API Endpoint: ${apiEndpoint}`);
}

// Defines available integrations and their descriptions
const availableIntegrations = [
    {
        id: 'git',
        name: 'Git',
        description: 'Initialize Git repository with .gitignore and initial commit',
        icon: <GitHubIcon />,
        category: 'vcs'
    },
    {
        id: 'supabase',
        name: 'Supabase',
        description: 'Setup Supabase client libraries and configuration',
        icon: <StorageIcon />,
        category: 'database'
    },
    {
        id: 'docker',
        name: 'Docker',
        description: 'Add Dockerfile and docker-compose.yml configurations',
        icon: <CodeIcon />,
        category: 'deployment'
    },
    {
        id: 'jest',
        name: 'Jest',
        description: 'Configure Jest for unit and integration testing',
        icon: <CheckCircleOutlineIcon />,
        category: 'testing'
    },
    {
        id: 'typescript',
        name: 'TypeScript',
        description: 'Setup TypeScript with tsconfig.json',
        icon: <CodeIcon />,
        category: 'language'
    },
    {
        id: 'eslint',
        name: 'ESLint',
        description: 'Add ESLint configuration for code quality',
        icon: <SettingsIcon />,
        category: 'quality'
    },
    {
        id: 'prettier',
        name: 'Prettier',
        description: 'Add Prettier for consistent code formatting',
        icon: <SettingsIcon />,
        category: 'quality'
    },
    {
        id: 'github_actions',
        name: 'GitHub Actions',
        description: 'Setup CI/CD workflows with GitHub Actions',
        icon: <GitHubIcon />,
        category: 'ci_cd'
    },
];

// Group integrations by category
const integrationCategories = {
    vcs: { name: 'Version Control', color: '#2e7d32' },
    database: { name: 'Database', color: '#0288d1' },
    deployment: { name: 'Deployment', color: '#d32f2f' },
    testing: { name: 'Testing', color: '#7b1fa2' },
    language: { name: 'Language', color: '#f57c00' },
    quality: { name: 'Code Quality', color: '#5d4037' },
    ci_cd: { name: 'CI/CD', color: '#455a64' },
};

const HomePage: React.FC = () => {
    const [projectName, setProjectName] = useState('');
    const [scriptOutput, setScriptOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(false);
    const [copiedSnackbar, setCopiedSnackbar] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(['git']); // Git enabled by default
    const [expandedSection, setExpandedSection] = useState<string | false>('main');
    const [advancedMode, setAdvancedMode] = useState(false);

    // Validate project name when it changes
    useEffect(() => {
        try {
            ProjectNameSchema.parse(projectName);
            setIsValid(true);
            setError(null);
        } catch (err: any) {
            setIsValid(false);
            setError(err.errors?.[0]?.message || 'Invalid project name');
        }
    }, [projectName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate again before submission
        if (!isValid) {
            return;
        }

        setLoading(true);
        setScriptOutput('');
        setApiError(null);

        try {
            const response = await axios.post(
                apiEndpoint,
                {
                    projectName,
                    integrations: selectedIntegrations,
                    advancedConfig: advancedMode ? getAdvancedConfigurations() : {}
                },
            );
            setScriptOutput(response.data.data);
            setFormSubmitted(true);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to connect to server';
            setApiError(`Error: ${errorMessage}`);
            console.error('API Error:', err);
            setScriptOutput('');
        } finally {
            setLoading(false);
        }
    };

    // State for advanced configuration options
    const [packageManager, setPackageManager] = useState('npm');
    const [nodeVersion, setNodeVersion] = useState('18.x');

    // Function to gather advanced configurations
    const getAdvancedConfigurations = () => {
        if (!advancedMode) return {};

        return {
            packageManager,
            nodeVersion,
        };
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(scriptOutput);
        setCopiedSnackbar(true);
    };

    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(e.target.value);
    };

    const handleCloseSnackbar = () => {
        setCopiedSnackbar(false);
    };

    const handleIntegrationToggle = (integrationId: string) => {
        setSelectedIntegrations(prev =>
            prev.includes(integrationId)
                ? prev.filter(id => id !== integrationId)
                : [...prev, integrationId]
        );
    };

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedSection(isExpanded ? panel : false);
    };

    const getSelectedIntegrationsCount = () => {
        return selectedIntegrations.length;
    };

    // Group integrations by category for display
    const groupedIntegrations = Object.entries(integrationCategories).map(([categoryId, category]) => ({
        ...category,
        id: categoryId,
        items: availableIntegrations.filter(integration => integration.category === categoryId)
    }));

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
                    {/* Header Section */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <TerminalIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" component="h1" gutterBottom>
                            MonoForge Script Generator
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                            Generate custom bash scripts for your development projects with pre-configured integrations and tools.
                        </Typography>
                    </Box>

                    {/* Form Section */}
                    <Box mb={4}>
                        <Accordion
                            expanded={expandedSection === 'main'}
                            onChange={handleAccordionChange('main')}
                            elevation={0}
                            sx={{ mb: 2 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    Basic Configuration
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <form onSubmit={handleSubmit}>
                                    <Box mb={3}>
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
                                    </Box>
                                </form>
                            </AccordionDetails>
                        </Accordion>

                        {/* Integrations Section */}
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

                                {/* Integrations by category */}
                                {groupedIntegrations.map(category => (
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
                                            {category.items.map((integration) => (
                                                <Grid key={integration.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 2,
                                                            borderColor: selectedIntegrations.includes(integration.id)
                                                                ? category.color
                                                                : 'divider',
                                                            borderWidth: selectedIntegrations.includes(integration.id) ? 2 : 1,
                                                            bgcolor: selectedIntegrations.includes(integration.id)
                                                                ? `${category.color}10`
                                                                : 'background.paper',
                                                            transition: 'all 0.2s',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                borderColor: category.color,
                                                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                                            }
                                                        }}
                                                        onClick={() => handleIntegrationToggle(integration.id)}
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
                                                                checked={selectedIntegrations.includes(integration.id)}
                                                                onChange={() => handleIntegrationToggle(integration.id)}
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
                                            ))}
                                        </Grid>
                                    </Box>
                                ))}
                            </AccordionDetails>
                        </Accordion>

                        {/* Advanced Options */}
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

                                {advancedMode && (
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
                                                onChange={(e) => setPackageManager(e.target.value)}
                                                name="package-manager-radio-group"
                                                sx={{ mb: 3 }}
                                            >
                                                <FormControlLabel value="npm" control={<Radio />} label="NPM" />
                                                <FormControlLabel value="yarn" control={<Radio />} label="Yarn" />
                                                <FormControlLabel value="pnpm" control={<Radio />} label="PNPM" />
                                            </RadioGroup>

                                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                                Node Version
                                            </Typography>
                                            <RadioGroup
                                                row
                                                value={nodeVersion}
                                                onChange={(e) => setNodeVersion(e.target.value)}
                                                name="node-version-radio-group"
                                            >
                                                <FormControlLabel value="18.x" control={<Radio />} label="18.x (LTS)" />
                                                <FormControlLabel value="20.x" control={<Radio />} label="20.x (Current)" />
                                                <FormControlLabel value="latest" control={<Radio />} label="Latest" />
                                            </RadioGroup>
                                        </Box>
                                    </Fade>
                                )}
                            </AccordionDetails>
                        </Accordion>

                        {/* Generate Button */}
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
                    </Box>

                    {/* API Error Message */}
                    {apiError && (
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
                    )}

                    {/* Loading Indicator */}
                    {loading && (
                        <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
                            <LinearProgress />
                        </Box>
                    )}

                    {/* Script Output Section */}
                    {formSubmitted && scriptOutput && (
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
                                                p: 2,
                                                borderRadius: 1,
                                                backgroundColor: '#f5f7f9',
                                                border: '1px solid #e0e0e0',
                                                maxHeight: '400px',
                                                overflow: 'auto'
                                            }}
                                        >
                                            <TextField
                                                multiline
                                                fullWidth
                                                minRows={10}
                                                value={scriptOutput}
                                                variant="standard"
                                                slotProps={{
                                                    input: {
                                                        readOnly: true,
                                                        disableUnderline: true,
                                                        sx: {
                                                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                                            fontSize: '0.875rem',
                                                            padding: 0
                                                        }
                                                    }
                                                }}
                                            />
                                        </Paper>

                                        {/* Included Integrations Summary */}
                                        <Box mt={3} mb={2}>
                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                Included Integrations
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {selectedIntegrations.map(id => {
                                                    const integration = availableIntegrations.find(i => i.id === id);
                                                    if (!integration) return null;

                                                    const category = integrationCategories[integration.category as keyof typeof integrationCategories];
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
                                                })}
                                            </Box>
                                        </Box>

                                        {/* Instructions Section */}
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

                                    </CardContent>
                                </Card>
                            </Fade>
                        </Box>
                    )}

                    {/* Footer Section */}
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