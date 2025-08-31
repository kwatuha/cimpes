import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, MenuItem, ListItemIcon, Checkbox, ListItemText, Box, Typography, Button, CircularProgress, IconButton,
  Snackbar, Alert, Stack, useTheme, Tooltip,
} from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewDetailsIcon, FilterList as FilterListIcon, BarChart as GanttChartIcon,
  ArrowForward as ArrowForwardIcon, ArrowBack as ArrowBackIcon, Settings as SettingsIcon, Category as CategoryIcon,
  GroupAdd as GroupAddIcon
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext.jsx';
import { checkUserPrivilege, currencyFormatter, getProjectStatusBackgroundColor, getProjectStatusTextColor } from '../utils/tableHelpers';
import projectTableColumnsConfig from '../configs/projectTableConfig';
import apiService from '../api';
import { tokens } from "./dashboard/theme"; // Import tokens for color styling

// Import our new, compact components and hooks
import Header from "./dashboard/Header"; // Import Header component
import ProjectFilters from '../components/ProjectFilters';
import ProjectFormDialog from '../components/ProjectFormDialog';
import useProjectData from '../hooks/useProjectData';
import useTableSort from '../hooks/useTableSort';
import useFilter from '../hooks/useFilter';
import useTableScrollShadows from '../hooks/useTableScrollShadows';
import AssignContractorModal from '../components/AssignContractorModal.jsx';

function ProjectManagementPage() {
  const { user, loading: authLoading, hasPrivilege } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Initialize colors

  // Custom hook for filters: state and handlers
  const { filterState, handleFilterChange, handleClearFilters } = useFilter();

  // Custom hook for data fetching and global state
  const {
    projects, loading, error, snackbar,
    setSnackbar, allMetadata, fetchProjects,
  } = useProjectData(user, authLoading, filterState);

  // Custom hook for table sorting
  const { order, orderBy, handleRequestSort, sortedData: sortedProjects } = useTableSort(projects || []);

  // Custom hook for table scroll shadows (no longer needed for DataGrid)
  const { tableContainerRef, showLeftShadow, showRightShadow, handleScrollRight, handleScrollLeft } = useTableScrollShadows(projects || []);

  // States for column visibility and menu
  const [visibleColumnIds, setVisibleColumnIds] = useState(() => {
    const savedColumns = localStorage.getItem('projectTableVisibleColumns');
    if (savedColumns) {
      try {
        const parsed = JSON.parse(savedColumns);
        const validSaved = parsed.filter(id => projectTableColumnsConfig.some(col => col.id === id));
        if (validSaved.length > 0) return validSaved;
      } catch (e) {
        console.error("Failed to parse saved columns from localStorage", e);
      }
    }
    return projectTableColumnsConfig.filter(col => col.show).map(col => col.id);
  });
  const [anchorElColumnsMenu, setAnchorElColumnsMenu] = useState(null);

  // Dialog state for create/edit
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  
  // State for Assign Contractor modal
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedProjectForAssignment, setSelectedProjectForAssignment] = useState(null);

  const handleOpenFormDialog = (project = null) => {
    if (project && !checkUserPrivilege(user, 'project.update')) {
      setSnackbar({ open: true, message: 'You do not have permission to edit projects.', severity: 'error' });
      return;
    }
    if (!project && !checkUserPrivilege(user, 'project.create')) {
      setSnackbar({ open: true, message: 'You do not have permission to create projects.', severity: 'error' });
      return;
    }
    setCurrentProject(project);
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setCurrentProject(null);
  };

  // Handlers for Assign Contractor modal
  const handleOpenAssignModal = (project) => {
      setSelectedProjectForAssignment(project);
      setOpenAssignModal(true);
  };
  
  const handleCloseAssignModal = () => {
      setOpenAssignModal(false);
      setSelectedProjectForAssignment(null);
      fetchProjects(); // Refresh projects list after a change
  };

  const handleFormSuccess = () => {
    handleCloseFormDialog();
    fetchProjects(); // Re-fetch projects to refresh the table
  };

  const handleDeleteProject = async (projectId) => {
    if (!checkUserPrivilege(user, 'project.delete')) {
      setSnackbar({ open: true, message: 'You do not have permission to delete projects.', severity: 'error' });
      return;
    }
    if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      try {
        await apiService.projects.deleteProject(projectId);
        setSnackbar({ open: true, message: 'Project deleted successfully!', severity: 'success' });
        fetchProjects();
      } catch (err) {
        setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete project.', severity: 'error' });
      }
    }
  };

  const handleViewDetails = useCallback((projectId) => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  }, [navigate]);

  const handleViewGanttChart = useCallback((projectId) => {
    if (projectId) {
      navigate(`/projects/${projectId}/gantt-chart`);
    }
  }, [navigate]);

  const handleViewKdspDetails = useCallback((projectId) => {
    if (projectId) {
      navigate(`/projects/${projectId}/kdsp-details`);
    }
  }, [navigate]);

  const handleCloseSnackbar = (event, reason) => { if (reason === 'clickaway') return; setSnackbar({ ...snackbar, open: false }); };

  const handleOpenColumnsMenu = (event) => setAnchorElColumnsMenu(event.currentTarget);
  const handleCloseColumnsMenu = () => setAnchorElColumnsMenu(null);

  const handleToggleColumn = (columnId, isChecked) => {
    setVisibleColumnIds(prev => {
      if (!isChecked && prev.length === 1) {
        setSnackbar({ open: true, message: 'At least one column must be visible.', severity: 'warning' });
        return prev;
      }
      const newVisible = isChecked ? [...prev, columnId] : prev.filter(id => id !== columnId);
      localStorage.setItem('projectTableVisibleColumns', JSON.stringify(newVisible));
      return newVisible;
    });
  };

  if (authLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Loading authentication data...</Typography></Box>;

  // Define columns for DataGrid
  const columns = projectTableColumnsConfig.map(col => {
    const dataGridColumn = {
      field: col.id,
      headerName: col.label,
      flex: col.flex,
      width: col.width,
      minWidth: col.minWidth,
      sortable: col.sortable,
    };

    switch (col.id) {
      case 'status':
        dataGridColumn.renderCell = (params) => {
          if (!params) return null;
          return (
            <Box sx={{ backgroundColor: getProjectStatusBackgroundColor(params.value), color: getProjectStatusTextColor(params.value), padding: '4px 8px', borderRadius: '4px', minWidth: '80px', textAlign: 'center', fontWeight: 'bold' }}>
              {params.value}
            </Box>
          );
        };
        break;
      case 'costOfProject':
      case 'paidOut':
        dataGridColumn.renderCell = (params) => {
          if (!params) return 'N/A';
          return !isNaN(parseFloat(params.value)) ? currencyFormatter.format(parseFloat(params.value)) : 'N/A';
        };
        break;
      case 'startDate':
      case 'endDate':
        dataGridColumn.renderCell = (params) => {
          if (!params) return 'N/A';
          return params.value ? new Date(params.value).toLocaleDateString() : 'N/A';
        };
        break;
      case 'principalInvestigator':
        dataGridColumn.valueGetter = (params) => {
          if (!params) return 'N/A';
          if (!params.row) return 'N/A';
          return params.row.pi_firstName || params.row.principalInvestigator || 'N/A';
        };
        break;
      case 'actions':
        dataGridColumn.renderCell = (params) => {
          if (!params) return null;
          if (!params.row) return null;
          return (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {checkUserPrivilege(user, 'projects.assign_contractor') && (
              <Tooltip title="Assign Contractors">
                <IconButton sx={{ color: colors.grey[100] }} onClick={() => handleOpenAssignModal(params.row)}>
                  <GroupAddIcon />
                </IconButton>
              </Tooltip>
            )}
            {checkUserPrivilege(user, 'project.update') && (
              <Tooltip title="Edit">
                <IconButton sx={{ color: colors.grey[100] }} onClick={() => handleOpenFormDialog(params.row)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {checkUserPrivilege(user, 'project.delete') && (
              <Tooltip title="Delete">
                <IconButton sx={{ color: colors.redAccent[500] }} onClick={() => handleDeleteProject(params.row.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
            {checkUserPrivilege(user, 'project.read_gantt_chart') && (
              <Tooltip title="Gantt Chart">
                <IconButton sx={{ color: colors.grey[100] }} onClick={() => handleViewGanttChart(params.row.id)}>
                  <GanttChartIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="View Details">
              <IconButton sx={{ color: colors.grey[100] }} onClick={() => handleViewDetails(params.row.id)}>
                <ViewDetailsIcon />
              </IconButton>
            </Tooltip>
            {checkUserPrivilege(user, 'project.read_kdsp_details') && (
              <Tooltip title="View KDSP Details">
                <Button variant="outlined" onClick={() => handleViewKdspDetails(params.row.id)} size="small" sx={{ whiteSpace: 'nowrap', color: colors.grey[100], borderColor: colors.grey[100] }}>
                  KDSP
                </Button>
              </Tooltip>
            )}
          </Stack>
          );
        };
        dataGridColumn.sortable = false;
        dataGridColumn.filterable = false;
        dataGridColumn.headerAlign = 'right';
        dataGridColumn.align = 'right';
        break;
      default:
        dataGridColumn.valueGetter = (params) => {
          if (!params) return 'N/A';
          return params.value || 'N/A';
        };
        break;
    }
    return dataGridColumn;
  }).filter(col => visibleColumnIds.includes(col.field));

  return (
    <Box m="20px">
      <Header title="PROJECTS" subtitle="List of Projects" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Stack direction="row" spacing={1}>
          {hasPrivilege('projectcategory.read_all') && (
              <Button
                  variant="outlined"
                  startIcon={<CategoryIcon />}
                  onClick={() => navigate('/settings/project-categories')}
                  sx={{ borderColor: colors.blueAccent[500], color: colors.blueAccent[500], '&:hover': { backgroundColor: colors.blueAccent[700], color: colors.white }, fontWeight: 'semibold', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
              >
                  Manage Categories
              </Button>
          )}
          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={handleOpenColumnsMenu}
            sx={{ color: colors.grey[100], borderColor: colors.grey[400], '&:hover': { backgroundColor: colors.primary[500], borderColor: colors.grey[100] } }}
          >Customize Columns</Button>
          {checkUserPrivilege(user, 'project.create') && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenFormDialog()}
              sx={{ backgroundColor: colors.greenAccent[600], '&:hover': { backgroundColor: colors.greenAccent[700] }, color: colors.white }}
            >
              Add New Project
            </Button>
          )}
        </Stack>
      </Box>

      <Menu anchorEl={anchorElColumnsMenu} open={Boolean(anchorElColumnsMenu)} onClose={handleCloseColumnsMenu} PaperProps={{ style: { maxHeight: 48 * 4.5, width: '25ch', backgroundColor: colors.primary[400], color: colors.grey[100] } }}>
        {projectTableColumnsConfig.map((column) => (
          <MenuItem key={column.id} disableRipple onClick={(e) => e.stopPropagation()}>
            <ListItemIcon>
              <Checkbox
                checked={visibleColumnIds.includes(column.id)}
                onChange={(e) => handleToggleColumn(column.id, e.target.checked)}
                sx={{ color: `${colors.greenAccent[200]} !important` }}
                disabled={column.sticky === 'left' && visibleColumnIds.filter(id => projectTableColumnsConfig.find(c => c.id === id)?.sticky === 'left').length === 1}
              />
            </ListItemIcon>
            <ListItemText primary={column.label} />
          </MenuItem>
        ))}
      </Menu>

      <ProjectFilters
        filterState={filterState}
        handleFilterChange={handleFilterChange}
        handleApplyFilters={() => fetchProjects()}
        handleClearFilters={() => { handleClearFilters(); }}
        allMetadata={allMetadata || {}}
      />

      {loading && (<Box display="flex" justifyContent="center" alignItems="center" height="200px"><CircularProgress /><Typography sx={{ ml: 2 }}>Loading projects...</Typography></Box>)}
      {error && (<Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>)}
      {!loading && !error && projects.length === 0 && checkUserPrivilege(user, 'project.read_all') && (<Alert severity="info" sx={{ mt: 2 }}>No projects found. Adjust filters or add a new project.</Alert>)}
      {!loading && !error && projects.length === 0 && !checkUserPrivilege(user, 'project.read_all') && (<Alert severity="warning" sx={{ mt: 2 }}>You do not have the necessary permissions to view any projects.</Alert>)}

      {!loading && !error && projects && projects.length > 0 && columns && columns.length > 0 && (
        <Box
          m="40px 0 0 0"
          height="75vh"
          width="100%"
          sx={{
            overflow: "hidden",
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: `${colors.blueAccent[700]} !important`,
              borderBottom: "none",
              minHeight: "56px",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: `${colors.blueAccent[700]} !important`,
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              color: "white !important",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: `${colors.blueAccent[700]} !important`,
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
          }}
        >
          <DataGrid
            rows={projects || []}
            columns={columns}
            getRowId={(row) => row?.id || Math.random()}
            initialState={{
              sorting: {
                sortModel: [{ field: orderBy, sort: order }],
              },
            }}
            disableRowSelectionOnClick
          />
        </Box>
      )}

      <ProjectFormDialog
        open={openFormDialog}
        handleClose={handleCloseFormDialog}
        currentProject={currentProject}
        onFormSuccess={handleFormSuccess}
        setSnackbar={setSnackbar}
        allMetadata={allMetadata || {}}
        user={user}
      />
      
      <AssignContractorModal
          open={openAssignModal}
          onClose={handleCloseAssignModal}
          project={selectedProjectForAssignment}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ProjectManagementPage;