// File: packages/client/src/App.tsx

import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import HomePage from "./pages/HomePage";

// Theme configuration - moved from HomePage
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

// Environment configuration - moved from HomePage
export interface EnvironmentConfig {
    CLIENT_PORT: string;
    SERVER_PORT: string;
    API_URL: string;
    apiEndpoint: string;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
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

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="App">
                <main>
                    <HomePage />
                </main>
                {/* <footer>
                    <p>&copy; {new Date().getFullYear()} My Company</p>
                </footer> */}
            </div>
        </ThemeProvider>
    );
}

export default App;