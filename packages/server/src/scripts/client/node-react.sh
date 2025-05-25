#!/bin/bash

# Setup React TypeScript client with Material UI
setup_react_client() {
    echo "⚛️ Setting up React TypeScript client..."
    
    # Create the client package using create-react-app with TypeScript
    npx create-react-app packages/client --template typescript > /dev/null 2>&1
    
    # Install Material UI and Axios in client package
    cd packages/client
    npm install @mui/material @mui/icons-material @emotion/react @emotion/styled axios > /dev/null 2>&1
    
    # Update client package.json with the scoped name and version
    mv package.json package.json.bak
    cat package.json.bak | sed "s/\"name\": \"client\"/\"name\": \"@$PROJECT_NAME\/client\"/" | sed 's/"version": "0.1.0"/"version": "1.0.0"/' > package.json
    rm package.json.bak
    
    # Add proxy configuration to package.json for development API calls
    # Cross-platform compatible approach using awk
    cp package.json package.json.tmp
    awk '/"private": true,/{print; print "  \"proxy\": \"http://localhost:5000\","; next}1' package.json.tmp > package.json
    rm package.json.tmp
    
    # Remove CSS files and update the App component with Material UI
    rm src/App.css src/index.css
    
    create_theme_file
    create_api_service
    update_index_tsx
    update_app_tsx
    
    cd ../..
    echo "✅ React client setup complete"
}

create_theme_file() {
    # Create a theme file
    mkdir -p src/theme
    cat > src/theme/theme.ts << 'EOF'
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

export default theme;
EOF
}

create_api_service() {
    # Create API service for communicating with the backend with updated baseURL
    mkdir -p src/services
    cat > src/services/api.ts << 'EOF'
import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Add this if you're using credentials: true in CORS
});

// Health check API call
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking server health:', error);
    throw error;
  }
};

export default api;
EOF
}

update_index_tsx() {
    # Update index.tsx to use Material UI and remove index.css import
    cat > src/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme/theme';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
EOF
}

update_app_tsx() {
    # Replace App.tsx with a Material UI version that includes server health check
    cat > src/App.tsx << EOF
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box,
  Paper,
  Stack,
  Divider,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid'; // Import Grid separately to ensure correct typing
import { 
  Apartment as ApartmentIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { checkServerHealth } from './services/api';

function App() {
  const [healthStatus, setHealthStatus] = useState<{status?: string; message?: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleHealthCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await checkServerHealth();
      setHealthStatus(response);
      setSnackbarOpen(true);
    } catch (err) {
      setError("Failed to connect to the server. Make sure it's running.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const features = [
    {
      title: 'Monorepo Structure',
      description: 'Organized codebase with modular architecture for better development experience',
      icon: <ApartmentIcon sx={{ fontSize: 40 }} color="primary" />
    },
    {
      title: 'TypeScript Ready',
      description: 'Full TypeScript support for both frontend and backend components',
      icon: <CodeIcon sx={{ fontSize: 40 }} color="primary" />
    },
    {
      title: 'Secure by Default',
      description: 'Best security practices implemented across the entire stack',
      icon: <SecurityIcon sx={{ fontSize: 40 }} color="primary" />
    },
    {
      title: 'Performance Optimized',
      description: 'Built with performance in mind to deliver exceptional user experience',
      icon: <SpeedIcon sx={{ fontSize: 40 }} color="primary" />
    }
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ${PROJECT_NAME}
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleHealthCheck}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            disabled={loading}
          >
            Check Server
          </Button>
          <Button color="inherit">Documentation</Button>
          <Button color="inherit">GitHub</Button>
        </Toolbar>
      </AppBar>
      
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || (healthStatus && \`Server status: \${healthStatus.status} - \${healthStatus.message}\`)}
        </Alert>
      </Snackbar>
      
      <Box 
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to ${PROJECT_NAME}
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            A modern, flexible monorepo template for multi-language projects
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            justifyContent="center"
          >
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              sx={{ px: 4, py: 1 }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              sx={{ px: 4, py: 1 }}
            >
              Learn More
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Key Features
        </Typography>
        <Box sx={{ flexGrow: 1, mt: 2 }}>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid key={index} sx={{ width: { xs: '100%', sm: '50%' }, padding: 2 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="center" mb={2}>
                      {feature.icon}
                    </Box>
                    <Typography gutterBottom variant="h5" component="h3" textAlign="center">
                      {feature.title}
                    </Typography>
                    <Typography textAlign="center">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {healthStatus && (
        <Container sx={{ mb: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" />
                <Typography variant="h6">
                  Server Connection: {healthStatus.status}
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {healthStatus.message}
              </Typography>
            </CardContent>
          </Card>
        </Container>
      )}

      <Box sx={{ bgcolor: '#f5f5f5', py: 6 }}>
        <Container>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Project Structure
          </Typography>
          <Paper sx={{ p: 3, mt: 4 }}>
            <pre style={{ overflowX: 'auto', margin: 0 }}>
              {\`${PROJECT_NAME}/
├── package.json         # Root package.json for workspace management
├── packages/            # All packages live here
│   ├── client/          # React TypeScript client (@${PROJECT_NAME}/client)
│   └── server/          # NestJS TypeScript server (@${PROJECT_NAME}/server)
│       └── src/         # Server source code
│           ├── app.module.ts          
│           └── modules/               
└── README.md\`}
            </pre>
          </Paper>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid sx={{ width: { xs: '100%', md: '50%' }, padding: 2 }}>
              <Typography variant="h3" component="h2" gutterBottom>
                Ready to Build?
              </Typography>
              <Typography paragraph>
                ${PROJECT_NAME} provides a solid foundation for building modern web applications
                with a well-structured monorepo setup, TypeScript integration, and best practices
                already configured.
              </Typography>
              <Button variant="contained" color="primary" size="large">
                Start Your Project
              </Button>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' }, padding: 2 }}>
              <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                <pre style={{ 
                  backgroundColor: '#282c34', 
                  color: '#abb2bf',
                  padding: '16px',
                  borderRadius: '8px',
                  overflowX: 'auto'
                }}>
                  {\`\$ npx create-${PROJECT_NAME} my-project
\$ cd my-project
\$ npm install
\$ npm run dev

🚀 Server running on port 5000
✅ Client started successfully\`}
                </pre>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Divider />
      
      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} ${PROJECT_NAME}. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
}

export default App;
EOF
}