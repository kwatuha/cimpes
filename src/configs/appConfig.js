/**
 * @file Configuration settings for the application.
 * This file centralizes default map coordinates, resource types, and all application routes,
 * making them easy to modify for different deployments.
 */

// Default map center coordinates for initial load (e.g., Nairobi, Kenya)
export const INITIAL_MAP_POSITION = [-1.286389, 36.817223];

// Define the available resource types for the dropdowns
export const RESOURCE_TYPES = [
    { value: 'projects', label: 'Projects' },
    { value: 'participants', label: 'Participants' },
    { value: 'poles', label: 'Poles' },
    // Add other resource types here specific to a county or client
];

// NEW: Project types with default icon URLs.
// You can replace these with custom icon URLs for a better visual representation.
export const PROJECT_TYPES = [
    { value: 'all', label: 'All Projects', icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
    { value: 'hospitals', label: 'Hospitals', icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' },
    { value: 'water_projects', label: 'Water Projects', icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' },
    { value: 'classrooms', label: 'Classrooms', icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png' },
    { value: 'offices', label: 'Offices', icon: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png' },
    { value: 'roads', label: 'Roads', icon: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png' },
    { value: 'schools', label: 'Schools', icon: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png' },
];

// --- Define application routes in a centralized object ---
export const ROUTES = {
    // Top-level routes
    LOGIN: '/login',
    DASHBOARD: '/',

    // Main layout routes
    RAW_DATA: '/raw-data',
    PROJECTS: '/projects',
    REPORTS: '/reports',
    GIS_MAPPING: '/maps',
    USER_MANAGEMENT: '/user-management',
    STRATEGIC_PLANNING: '/strategic-planning',
    METADATA_MANAGEMENT: '/metadata-management', // NEW: Route for the metadata management page

    // Sub-routes with dynamic parameters
    PROJECT_DETAILS: '/projects/:projectId',
    PROJECT_GANTT_CHART: '/projects/:projectId/gantt-chart',
    KDSP_PROJECT_DETAILS: '/projects/:projectId/kdsp-details',
    MAP_DATA_IMPORT: '/maps/import-data',
    STRATEGIC_PLAN_DETAILS: '/strategic-planning/:planId',
    STRATEGIC_DATA_IMPORT: '/strategic-planning/import',
};
