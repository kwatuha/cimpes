import React, { useState, useEffect, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  CssBaseline,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../configs/appConfig.js';
import logo from '../assets/logo.png';
import { useTheme } from "@mui/material";
import { ColorModeContext, tokens } from "../pages/dashboard/theme";
import Topbar from "./Topbar.jsx";
import Sidebar from "./Sidebar.jsx";

const drawerWidth = 240;
const collapsedDrawerWidth = 60;

function MainLayout() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const [mobileOpen, setMobileOpen] = useState(false);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  useEffect(() => {
    if (user && user.roleName === 'contractor' && location.pathname !== ROUTES.CONTRACTOR_DASHBOARD) {
        navigate(ROUTES.CONTRACTOR_DASHBOARD, { replace: true });
    }
  }, [location.pathname, user, navigate]);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };
  
  return (
     <ColorModeContext.Provider value={colorMode}>
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${collapsedDrawerWidth}px)` },
          ml: { sm: `${collapsedDrawerWidth}px` },
          transition: 'width 0.3s ease-in-out, margin 0.3s ease-in-out',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src={logo} alt="IPMES Logo" style={{ height: '40px', marginRight: '10px' }} />
            <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
              IPMES
            </Typography>
          </Box>
          
          {user && (
            <Typography variant="subtitle1" sx={{ ml: 2, color: 'white' }}>
              Welcome, {user.username}!
            </Typography>
          )}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            sx={{
              ml: 2, backgroundColor: '#dc2626',
              '&:hover': { backgroundColor: '#b91c1c' },
              color: 'white', fontWeight: 'semibold', borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            Logout
          </Button>
           {/* <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton>
          <PersonOutlinedIcon />
        </IconButton>
      </Box> */}
      <Topbar/>
        </Toolbar>
      </AppBar>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1, p: 3, mt: '64px',
          width: { sm: `calc(100% - ${collapsedDrawerWidth}px)` },
          transition: 'margin 0.3s ease-in-out, width 0.3s ease-in-out',
        }}
      >
        <Outlet />
      </Box>
    </Box>
    </ColorModeContext.Provider>
  );
}

export default MainLayout;