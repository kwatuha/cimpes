import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import AuthProvider
import { AuthProvider } from './context/AuthContext.jsx';

// Import Layout and Page Components
import MainLayout from './layouts/MainLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RawDataPage from './pages/RawDataPage.jsx';
import ProjectManagementPage from './pages/ProjectManagementPage.jsx';
import ProjectDetailsPage from './pages/ProjectDetailsPage.jsx';
import ProjectGanttChartPage from './pages/ProjectGanttChartPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import MapsPage from './pages/MapsPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import Login from './components/Login.jsx';

// Import the StrategicPlanningPage
import StrategicPlanningPage from './pages/StrategicPlanningPage.jsx';
// Import the StrategicPlanDetailsPage
import StrategicPlanDetailsPage from './pages/StrategicPlanDetailsPage.jsx';
// Import the DataImportPage
import DataImportPage from './pages/DataImportPage.jsx';
// NEW: Import the KdspProjectDetailsPage
import KdspProjectDetailsPage from './pages/KdspProjectDetailsPage.jsx';
// NEW: Import the GISMapPage for the new mapping component
import GISMapPage from './pages/GISMapPage.jsx';
// NEW: Import the MapDataImportPage for the map data import form
import MapDataImportPage from './pages/MapDataImportPage.jsx';
// NEW: Import the SettingsPage
import SettingsPage from './pages/SettingsPage.jsx';
// CORRECTED: Import the ProjectCategoryPage component
import ProjectCategoryPage from './pages/ProjectCategoryPage.jsx';
// NEW: Import the ProjectPhotoManager component
import ProjectPhotoManager from './pages/ProjectPhotoManager.jsx';


// Define a custom theme to match KEMRI's blue
const kemriTheme = createTheme({
  palette: {
    primary: {
      main: '#0A2342', // A deep blue, similar to KEMRI's branding
    },
    secondary: {
      main: '#ADD8E6', // A lighter blue for accents
    },
    background: {
      default: '#F5F5F5', // A light grey for the overall background
      paper: '#FFFFFF', // White for cards and surfaces
    },
  },
  typography: {
    h4: {
      color: '#0A2342',
      fontWeight: 600,
    },
    h5: {
      color: '#0A2342',
      fontWeight: 500,
    },
    h6: {
      color: '#0A2342',
      fontWeight: 500,
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A2342',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ADD8E6',
          color: '#0A2342',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#0A2342',
        }
      }
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

// Define your routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // MainLayout will now redirect to /login if not authenticated
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'raw-data',
        element: <RawDataPage />,
      },
      {
        path: 'projects',
        element: <ProjectManagementPage />,
      },
      {
        path: 'projects/:projectId', // Dynamic route for project details
        element: <ProjectDetailsPage />,
      },
      {
        path: 'projects/:projectId/gantt-chart', // Dynamic route for Gantt Chart
        element: <ProjectGanttChartPage />,
      },
      // NEW: Route for Project Photo Management
      {
        path: 'projects/:projectId/photos',
        element: <ProjectPhotoManager />,
      },
      {
        path: 'reports', // Dedicated route for Reports page
        element: <ReportsPage />,
      },
      {
        path: 'maps', // Replaced the placeholder MapsPage with the new GISMapPage
        element: <GISMapPage />,
      },
      {
        path: 'maps/import-data', // NEW route for the map data import page
        element: <MapDataImportPage />,
      },
      {
        path: 'user-management', // NEW ROUTE: User Management Page
        element: <UserManagementPage />,
      },
      {
        path: 'strategic-planning', // NEW ROUTE: Strategic Planning Page (list view)
        element: <StrategicPlanningPage />,
      },
      {
        path: 'strategic-planning/:planId', // Dynamic route for Strategic Plan Details Page
        element: <StrategicPlanDetailsPage />,
      },
      {
        path: 'strategic-planning/import', // NEW ROUTE: Strategic Plan Data Import Page
        element: <DataImportPage />,
      },
      {
        path: 'projects/:projectId/kdsp-details', // NEW: Dynamic route for KDSP project details
        element: <KdspProjectDetailsPage />,
      },
      {
        path: 'metadata-management', // NEW: Route for the Settings Page
        element: <SettingsPage />,
      },
      // CORRECTED: Route for the Project Category Management page
      {
        path: 'settings/project-categories',
        element: <ProjectCategoryPage />,
      }
    ],
  },
  {
    path: '/login', // This is the dedicated route for the Login component
    element: <Login />,
  },
]);

function App() {
  return (
    <ThemeProvider theme={kemriTheme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;