import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, MenuItem, ListItemIcon, Checkbox, ListItemText, Box, Typography, Button, CircularProgress, IconButton,
  Snackbar, Alert, Stack, useTheme, Tooltip, Paper,
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewDetailsIcon, FilterList as FilterListIcon, BarChart as GanttChartIcon,
  ArrowForward as ArrowForwardIcon, ArrowBack as ArrowBackIcon, Settings as SettingsIcon,
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext.jsx';
import { checkUserPrivilege, currencyFormatter, getProjectStatusBackgroundColor, getProjectStatusTextColor, getComparator, stableSort } from '../utils/tableHelpers';
import projectTableColumnsConfig from '../configs/projectTableConfig';
import apiService from '../api';

// Import our new, compact components and hooks
import ProjectFilters from '../components/ProjectFilters';
import ProjectFormDialog from '../components/ProjectFormDialog';
import useProjectData from '../hooks/useProjectData';
import useTableSort from '../hooks/useTableSort';
import useFilter from '../hooks/useFilter';
import useTableScrollShadows from '../hooks/useTableScrollShadows';

function ProjectManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Custom hook for filters: state and handlers
  const { filterState, handleFilterChange, handleClearFilters } = useFilter();

  // Custom hook for data fetching and global state
  const {
    projects, loading, error, snackbar,
    setSnackbar, allMetadata, fetchProjects,
  } = useProjectData(user, authLoading, filterState);

  // Custom hook for table sorting
  const { order, orderBy, handleRequestSort, sortedData: sortedProjects } = useTableSort(projects);

  // Custom hook for table scroll shadows
  const { tableContainerRef, showLeftShadow, showRightShadow, handleScrollRight, handleScrollLeft } = useTableScrollShadows(projects);

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

  const visibleColumns = projectTableColumnsConfig.filter(col => visibleColumnIds.includes(col.id));
  const stickyLeftPositions = visibleColumns.reduce((acc, col, index) => {
    if (col.sticky === 'left') {
      const prevSticky = visibleColumns.slice(0, index).filter(c => c.sticky === 'left');
      acc[col.id] = prevSticky.reduce((sum, c) => sum + (c.minWidth || 150), 0);
    }
    return acc;
  }, {});

  const getCellContent = (project, column) => {
    switch (column.id) {
      case 'status':
        return <Box sx={{ backgroundColor: getProjectStatusBackgroundColor(project.status), color: getProjectStatusTextColor(project.status), padding: '4px 8px', borderRadius: '4px', minWidth: '80px', textAlign: 'center', fontWeight: 'bold' }}>{project.status}</Box>;
      case 'costOfProject':
      case 'paidOut':
        return !isNaN(parseFloat(project[column.id])) ? currencyFormatter.format(parseFloat(project[column.id])) : 'N/A';
      case 'startDate':
      case 'endDate':
        return project[column.id] ? new Date(project[column.id]).toLocaleDateString() : 'N/A';
      case 'principalInvestigator':
        return project.pi_firstName || project.principalInvestigator || 'N/A';
      case 'actions':
        return (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {checkUserPrivilege(user, 'project.update') && (
              <Tooltip title="Edit">
                <IconButton color="primary" onClick={() => handleOpenFormDialog(project)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {checkUserPrivilege(user, 'project.delete') && (
              <Tooltip title="Delete">
                <IconButton color="error" onClick={() => handleDeleteProject(project.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
            {checkUserPrivilege(user, 'project.read_gantt_chart') && (
              <Tooltip title="Gantt Chart">
                <IconButton color="secondary" onClick={() => handleViewGanttChart(project.id)}>
                  <GanttChartIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="View Details">
              <IconButton color="info" onClick={() => handleViewDetails(project.id)}>
                <ViewDetailsIcon />
              </IconButton>
            </Tooltip>
            {checkUserPrivilege(user, 'project.read_kdsp_details') && (
              <Tooltip title="View KDSP Details">
                <Button variant="outlined" onClick={() => handleViewKdspDetails(project.id)} size="small" sx={{ whiteSpace: 'nowrap' }}>
                  KDSP
                </Button>
              </Tooltip>
            )}
          </Stack>
        );
      default:
        return project[column.id] || 'N/A';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>Project Management</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={handleOpenColumnsMenu}>Customize Columns</Button>
          {checkUserPrivilege(user, 'project.create') && (<Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenFormDialog()}>Add New Project</Button>)}
        </Stack>
      </Box>

      <Menu anchorEl={anchorElColumnsMenu} open={Boolean(anchorElColumnsMenu)} onClose={handleCloseColumnsMenu} PaperProps={{ style: { maxHeight: 48 * 4.5, width: '25ch' } }}>
        {projectTableColumnsConfig.map((column) => (
          <MenuItem key={column.id} disableRipple onClick={(e) => e.stopPropagation()}>
            <ListItemIcon><Checkbox checked={visibleColumnIds.includes(column.id)} onChange={(e) => handleToggleColumn(column.id, e.target.checked)} disabled={column.sticky === 'left' && visibleColumnIds.filter(id => projectTableColumnsConfig.find(c => c.id === id)?.sticky === 'left').length === 1} /></ListItemIcon>
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

      {!loading && !error && projects.length > 0 && (
        <TableContainer ref={tableContainerRef} component={Paper} sx={{ position: 'relative', overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader sx={{ minWidth: 1400 }}>
            <TableHead>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.id} sortDirection={orderBy === column.id ? order : false}
                    sx={{ fontWeight: 'bold', color: 'white', backgroundColor: theme.palette.primary.main, minWidth: column.minWidth, ... (column.sticky === 'left' && { position: 'sticky', left: stickyLeftPositions[column.id], zIndex: 11 }), ... (column.sticky === 'right' && { position: 'sticky', right: 0, zIndex: 11 })}}
                  >
                    {column.id === 'actions' ? (
                      <Stack direction="row" alignItems="center" justifyContent="flex-end">
                        {showLeftShadow && <IconButton size="small" onClick={handleScrollLeft} sx={{ color: 'white' }}><ArrowBackIcon /></IconButton>}
                        <Box component="span" sx={{ flexGrow: 1, textAlign: 'right' }}>{column.label}</Box>
                        {showRightShadow && <IconButton size="small" onClick={handleScrollRight} sx={{ color: 'white' }}><ArrowForwardIcon /></IconButton>}
                      </Stack>
                    ) : (
                      <TableSortLabel active={orderBy === column.id} direction={orderBy === column.id ? order : 'asc'} onClick={(e) => handleRequestSort(e, column.id)}>{column.label}</TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProjects.map((project, rowIndex) => (
                <TableRow key={project.id} sx={{ backgroundColor: rowIndex % 2 === 1 ? '#f9f9f9' : 'white' }}>
                  {visibleColumns.map((column) => (
                    <TableCell key={`${project.id}-${column.id}`} sx={{ ... (column.sticky === 'left' && { position: 'sticky', left: stickyLeftPositions[column.id], zIndex: 10, backgroundColor: rowIndex % 2 === 1 ? '#f9f9f9' : 'white' }), ... (column.sticky === 'right' && { position: 'sticky', right: 0, zIndex: 10, backgroundColor: rowIndex % 2 === 1 ? '#f9f9f9' : 'white' }) }}>
                      {getCellContent(project, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ProjectManagementPage;