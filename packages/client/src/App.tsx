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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TerminalIcon from '@mui/icons-material/Terminal';

// Create React App automatically loads variables from .env files
// No need for manual dotenv config as long as variables have REACT_APP_ prefix
fdsafdsa

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

const App: React.FC = () => {
    const [projectName, setProjectName] = useState('');
    const [scriptOutput, setScriptOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(false);
    const [copiedSnackbar, setCopiedSnackbar] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Validate project name when it changes
    useEffect(() => {
        validateProjectName(projectName);
    }, [projectName]);

    const validateProjectName = (name: string) => {
        // Empty is not valid but we don't want to show an error initially
        if (!name) {
            setError(null);
            setIsValid(false);
            return;
        }

        // Check if name contains uppercase letters
        if (/[A-Z]/.test(name)) {
            setError('Project name cannot contain uppercase letters');
            setIsValid(false);
            return;
        }

        // Check if name contains spaces
        if (/\s/.test(name)) {
            setError('Project name cannot contain spaces');
            setIsValid(false);
            return;
        }

        // Check if name contains special characters other than hyphens
        if (!/^[a-z0-9-]+$/.test(name)) {
            setError('Project name can only contain lowercase letters, numbers, and hyphens');
            setIsValid(false);
            return;
        }

        // Check if name starts or ends with a hyphen
        if (name.startsWith('-') || name.endsWith('-')) {
            setError('Project name cannot start or end with a hyphen');
            setIsValid(false);
            return;
        }

        // Check if name contains consecutive hyphens
        if (name.includes('--')) {
            setError('Project name cannot contain consecutive hyphens');
            setIsValid(false);
            return;
        }

        // All checks passed
        setError(null);
        setIsValid(true);
    };

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
                { projectName },
                { responseType: 'text' }
            );
            setScriptOutput(response.data);
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
                            Generate custom bash scripts for your development projects by entering a valid project name below.
                        </Typography>
                    </Box>

                    {/* Form Section */}
                    <Box mb={4}>
                        <Card elevation={0}>
                            <CardHeader
                                title="Configure Your Script"
                                subheader="Enter your project details below"
                                sx={{
                                    pb: 0,
                                    '& .MuiCardHeader-title': {
                                        fontSize: '1.25rem',
                                        color: 'primary.main',
                                    }
                                }}
                            />
                            <CardContent>
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
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading || !isValid || !projectName}
                                            disableElevation
                                            sx={{
                                                py: 1,
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
                                </form>
                            </CardContent>
                        </Card>
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
                                        subheader={`Script for project: ${projectName}`}
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

export default App;