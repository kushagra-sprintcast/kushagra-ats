import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, IconButton, Tooltip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Jobs from './pages/Jobs';
import Clients from './pages/Clients';
import Pipeline from './pages/Pipeline';
import './App.css';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      primary: { main: '#00C8FF' },
      secondary: { main: '#7B61FF' },
      background: { default: '#0A0F1E', paper: '#111827' },
      text: { primary: '#F1F5F9', secondary: '#94A3B8' },
    } : {
      primary: { main: '#0066CC' },
      secondary: { main: '#7B61FF' },
      background: { default: '#F0F4F8', paper: '#FFFFFF' },
      text: { primary: '#0F172A', secondary: '#475569' },
    }),
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          ...(mode === 'dark' && { border: '1px solid rgba(255,255,255,0.06)' }),
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
  },
});

const navItems = [
  { path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
  { path: '/candidates', icon: <PeopleIcon />, label: 'Candidates' },
  { path: '/jobs', icon: <WorkIcon />, label: 'Jobs' },
  { path: '/pipeline', icon: <AccountTreeIcon />, label: 'Pipeline' },
  { path: '/clients', icon: <BusinessIcon />, label: 'Clients' },
];

export default function App() {
  const [mode, setMode] = useState('dark');
  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <Box sx={{
            width: 240,
            flexShrink: 0,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            position: 'fixed',
            height: '100vh',
            zIndex: 100,
          }}>
            {/* Logo */}
            <Box sx={{ px: 1, py: 2, mb: 3 }}>
              <Box sx={{
                fontSize: '1.3rem',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: 'primary.main',
                fontFamily: '"DM Sans", sans-serif',
              }}>
                ⚡ Sprintcast
              </Box>
              <Box sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.5 }}>
                Recruitment Intelligence
              </Box>
            </Box>

            {/* Nav Items */}
            <Box sx={{ flex: 1 }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  style={{ textDecoration: 'none' }}
                >
                  {({ isActive }) => (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      mb: 0.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      bgcolor: isActive ? 'primary.main' : 'transparent',
                      color: isActive ? '#fff' : 'text.secondary',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isActive ? 'primary.main' : mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        color: isActive ? '#fff' : 'text.primary',
                      },
                    }}>
                      {item.icon}
                      <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</Box>
                    </Box>
                  )}
                </NavLink>
              ))}
            </Box>

            {/* Theme Toggle */}
            <Box sx={{ px: 1, pb: 1 }}>
              <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
                <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} sx={{ color: 'text.secondary' }}>
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, ml: '240px', p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/clients" element={<Clients />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}