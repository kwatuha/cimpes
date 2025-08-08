import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart'; // Corrected import
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MapIcon from '@mui/icons-material/Map';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { Link as RouterLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../configs/appConfig.js';
import logo from '../assets/logo.png';

const drawerWidth = 240;
const collapsedDrawerWidth = 60;

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const baseRoutesToCollapse = [
      ROUTES.PROJECTS.split('/:')[0],
      ROUTES.GIS_MAPPING.split('/:')[0],
      ROUTES.USER_MANAGEMENT.split('/:')[0],
      ROUTES.DASHBOARD.split('/:')[0],
      ROUTES.STRATEGIC_PLANNING.split('/:')[0],
    ];

    const shouldCollapse = baseRoutesToCollapse.some(basePath =>
      location.pathname.startsWith(basePath)
    );

    setIsSidebarCollapsed(shouldCollapse);
  }, [location.pathname]);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
        {!isSidebarCollapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            KEMRI Dashboard
          </Typography>
        )}
        <IconButton onClick={handleSidebarToggle}>
          {isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        <Tooltip title="Dashboard" placement="right" disableHoverListener={!isSidebarCollapsed}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to={ROUTES.DASHBOARD}>
              <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
              {!isSidebarCollapsed && <ListItemText primary="Dashboard" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>
        
        <Tooltip title="Raw Data" placement="right" disableHoverListener={!isSidebarCollapsed}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to={ROUTES.RAW_DATA}>
              <ListItemIcon><TableChartIcon color="primary" /></ListItemIcon>
              {!isSidebarCollapsed && <ListItemText primary="Raw Data" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Tooltip title="Project Management" placement="right" disableHoverListener={!isSidebarCollapsed}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to={ROUTES.PROJECTS}>
              <ListItemIcon><FolderOpenIcon color="primary" /></ListItemIcon>
              {!isSidebarCollapsed && <ListItemText primary="Project Management" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>
        
        <Tooltip title="Reports" placement="right" disableHoverListener={!isSidebarCollapsed}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to={ROUTES.REPORTS}>
              <ListItemIcon><AssessmentIcon color="primary" /></ListItemIcon>
              {!isSidebarCollapsed && <ListItemText primary="Reports" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>
        
        <Tooltip title="GIS Mapping" placement="right" disableHoverListener={!isSidebarCollapsed}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to={ROUTES.GIS_MAPPING}>
              <ListItemIcon><MapIcon color="primary" /></ListItemIcon>
              {!isSidebarCollapsed && <ListItemText primary="GIS Mapping" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>
        
        <Tooltip title="Import Map Data" placement="right" disableHoverListener={!isSidebarCollapsed}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to={ROUTES.MAP_DATA_IMPORT}>
              <ListItemIcon><CloudUploadIcon color="primary" /></ListItemIcon>
              {!isSidebarCollapsed && <ListItemText primary="Import Map Data" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>
        
        <Tooltip title="Strategic Planning" placement="right" disableHoverListener={!isSidebarCollapsed}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to={ROUTES.STRATEGIC_PLANNING}>
              <ListItemIcon><AssignmentIcon color="primary" /></ListItemIcon>
              {!isSidebarCollapsed && <ListItemText primary="Strategic Planning" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>
        
        <Tooltip title="Import Strategic Data" placement="right" disableHoverListener={!isSidebarCollapsed}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to={ROUTES.STRATEGIC_DATA_IMPORT}>
              <ListItemIcon><CloudUploadIcon color="primary" /></ListItemIcon>
              {!isSidebarCollapsed && <ListItemText primary="Import Strategic Data" />}
            </ListItemButton>
          </ListItem>
        </Tooltip>
        
        {user && user.role === 'admin' && (
          <>
            <Divider sx={{ my: 1 }} />
            <Tooltip title="User Management" placement="right" disableHoverListener={!isSidebarCollapsed}>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to={ROUTES.USER_MANAGEMENT}>
                  <ListItemIcon><GroupIcon color="primary" /></ListItemIcon>
                  {!isSidebarCollapsed && <ListItemText primary="User Management" />}
                </ListItemButton>
              </ListItem>
            </Tooltip>

            <Tooltip title="Metadata Management" placement="right" disableHoverListener={!isSidebarCollapsed}>
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/metadata-management">
                  <ListItemIcon><SettingsIcon color="primary" /></ListItemIcon>
                  {!isSidebarCollapsed && <ListItemText primary="Metadata Management" />}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          </>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { sm: `${isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px` },
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
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { sm: isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth },
          flexShrink: { sm: 0 },
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              transition: 'width 0.3s ease-in-out',
              overflowX: 'hidden',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1, p: 3, mt: '64px',
          width: { sm: `calc(100% - ${isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          transition: 'margin 0.3s ease-in-out, width 0.3s ease-in-out',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;
