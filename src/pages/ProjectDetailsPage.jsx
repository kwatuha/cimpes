import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Button, Paper,
  List, ListItem, ListItemText, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel,
  Stack, Chip, Checkbox, FormControlLabel, Select, Snackbar, LinearProgress,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon, Link as LinkIcon, BarChart as BarChartIcon,
  Update as UpdateIcon,
  Attachment as AttachmentIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import apiService from '../api';
import { useAuth } from '../context/AuthContext';
import { getProjectStatusBackgroundColor, getProjectStatusTextColor } from '../utils/projectStatusColors';
import MilestoneAttachments from '../components/MilestoneAttachments.jsx';
// NEW: Import the ProjectMonitoringComponent
import ProjectMonitoringComponent from '../components/ProjectMonitoringComponent.jsx';


const checkUserPrivilege = (user, privilegeName) => {
  return user && user.privileges && Array.isArray(user.privileges) && user.privileges.includes(privilegeName);
};

const snakeToCamelCase = (obj) => {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(v => snakeToCamelCase(v));
  }
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      newObj[camelKey] = snakeToCamelCase(obj[key]);
    }
  }
  return newObj;
};

function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [staff, setStaff] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [projectCategory, setProjectCategory] = useState(null);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [categoryMilestones, setCategoryMilestones] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    taskName: '',
    description: '',
    startDate: '',
    endDate: '',
    dueDate: '',
    status: 'Not Started',
    assignees: [],
    dependencies: []
  });
  const [taskFormErrors, setTaskFormErrors] = useState({});

  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [milestoneFormData, setMilestoneFormData] = useState({
    milestoneName: '',
    milestoneDescription: '',
    dueDate: '',
    completed: false,
    completedDate: '',
    sequenceOrder: '',
    progress: 0,
    weight: 1,
  });
  const [milestoneFormErrors, setMilestoneFormErrors] = useState({});
  const [openAttachmentsModal, setOpenAttachmentsModal] = useState(false);
  const [milestoneToViewAttachments, setMilestoneToViewAttachments] = useState(null);
  // NEW: State for monitoring modal
  const [openMonitoringModal, setOpenMonitoringModal] = useState(false); 


  const taskStatuses = [
    'Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled', 'At Risk', 'Stalled', 'Delayed', 'Closed', 'Planning', 'Initiated'
  ];

  const fetchProjectDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!user || !Array.isArray(user.privileges)) {
      setLoading(false);
      setError("Authentication data loading or missing privileges. Cannot fetch project details.");
      return;
    }
    
    if (!projectId) {
      setLoading(false);
      setError("No project ID provided.");
      return;
    }

    try {
      if (!checkUserPrivilege(user, 'project.read_all')) {
        setError("You do not have 'project.read_all' privilege to view this project's details.");
        return;
      }

      const projectData = await apiService.projects.getProjectById(projectId);
      setProject(projectData);

      if (projectData.categoryId) {
        const categoryData = await apiService.metadata.projectCategories.getCategoryById(projectData.categoryId);
        setProjectCategory(categoryData);
        const templatedMilestones = await apiService.metadata.projectCategories.getMilestonesByCategory(projectData.categoryId);
        setCategoryMilestones(templatedMilestones);
      } else {
        setProjectCategory(null);
        setCategoryMilestones([]);
      }

      const tasksData = await apiService.tasks.getTasksForProject(projectId);
      setTasks(tasksData);
      setAllTasks(tasksData);

      const milestonesData = await apiService.milestones.getMilestonesForProject(projectId);
      setMilestones(milestonesData);

      const rawStaffData = await apiService.users.getStaff();
      const camelCaseStaffData = rawStaffData.map(s => snakeToCamelCase(s));
      setStaff(camelCaseStaffData);

    } catch (err) {
      console.error('ProjectDetailsPage: Error fetching project details:', err);
      setError(err.message || 'Failed to load project details.');
      if (err.response && err.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, logout, user]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleOpenCreateTaskDialog = () => {
    if (!checkUserPrivilege(user, 'task.create')) {
      setSnackbar({ open: true, message: 'You do not have permission to create tasks.', severity: 'error' });
      return;
    }
    setCurrentTask(null);
    setTaskFormData({
      taskName: '', description: '', startDate: '', endDate: '', dueDate: '',
      status: 'Not Started', assignees: [], dependencies: []
    });
    setTaskFormErrors({});
    setOpenTaskDialog(true);
  };

  const handleOpenEditTaskDialog = async (task) => {
    if (!checkUserPrivilege(user, 'task.update')) {
      setSnackbar({ open: true, message: 'You do not have permission to edit tasks.', severity: 'error' });
      return;
    }
    setCurrentTask(task);

    let currentAssignees = [];
    let currentDependencies = [];

    try {
      const assigneesResponse = await apiService.taskAssignees.getTaskAssigneesForTask(task.taskId);
      currentAssignees = assigneesResponse.map(a => a.staffId);

    } catch (err) {
      console.error('Error fetching task assignees for edit:', err);
      setSnackbar({ open: true, message: 'Failed to load task assignees.', severity: 'error' });
    }

    try {
      const dependenciesResponse = await apiService.taskDependencies.getTaskDependenciesForTask(task.taskId);
      currentDependencies = dependenciesResponse.map(d => d.dependsOnTaskId);
    } catch (err) {
        console.error('Error fetching task dependencies for edit:', err);
        setSnackbar({ open: true, message: 'Failed to load task dependencies.', severity: 'error' });
    }

    setTaskFormData({
      taskName: task.taskName || '',
      description: task.description || '',
      startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status || 'Not Started',
      assignees: currentAssignees,
      dependencies: currentDependencies
    });
    setTaskFormErrors({});
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setCurrentTask(null);
    setTaskFormErrors({});
  };

  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssigneesChange = (e) => {
    const { value } = e.target;
    setTaskFormData(prev => ({ ...prev, assignees: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleDependenciesChange = (e) => {
    const { value } = e.target;
    setTaskFormData(prev => ({ ...prev, dependencies: typeof value === 'string' ? value.split(',').map(Number) : value.map(Number) }));
  };

  const validateTaskForm = () => {
    let errors = {};
    if (!taskFormData.taskName.trim()) errors.taskName = 'Task Name is required.';
    if (!taskFormData.startDate) errors.startDate = 'Start Date is required.';
    if (!taskFormData.endDate) errors.endDate = 'End Date is required.';
    if (!taskFormData.dueDate) errors.dueDate = 'Due Date is required.';
    if (taskFormData.startDate && taskFormData.endDate && new Date(taskFormData.startDate) > new Date(taskFormData.endDate)) {
      errors.dateRange = 'End Date cannot be before Start Date.';
    }
    if (taskFormData.endDate && taskFormData.dueDate && new Date(taskFormData.endDate) > new Date(taskFormData.dueDate)) {
        errors.dueDateRange = 'Due Date cannot be before End Date.';
    }

    setTaskFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTaskSubmit = async () => {
    if (!validateTaskForm()) {
      setSnackbar({ open: true, message: 'Please correct the task form errors.', severity: 'error' });
      return;
    }

    try {
      let taskIdToUse;
      const taskDataToSubmit = {
          ...taskFormData,
          projectId: projectId,
      };

      if (currentTask) {
        if (!checkUserPrivilege(user, 'task.update')) {
          setSnackbar({ open: true, message: 'You do not have permission to update tasks.', severity: 'error' });
          return;
        }
        const response = await apiService.tasks.updateTask(currentTask.taskId, taskDataToSubmit);
        taskIdToUse = response.taskId;
        setSnackbar({ open: true, message: 'Task updated successfully!', severity: 'success' });
      } else {
        if (!checkUserPrivilege(user, 'task.create')) {
          setSnackbar({ open: true, message: 'You do not have permission to create tasks.', severity: 'error' });
          return;
        }
        const response = await apiService.tasks.createTask(taskDataToSubmit);
        taskIdToUse = response.taskId;
        setSnackbar({ open: true, message: 'Task created successfully!', severity: 'success' });
      }

      if (checkUserPrivilege(user, 'task.manage_assignees')) {
        const existingAssignees = await apiService.taskAssignees.getTaskAssigneesForTask(taskIdToUse);
        const existingStaffIds = new Set(existingAssignees.map(a => a.staffId));
        const newStaffIds = new Set(taskFormData.assignees);

        for (const existingStaffId of existingStaffIds) {
          if (!newStaffIds.has(existingStaffId)) {
            const assignmentToDelete = existingAssignees.find(a => a.staffId === existingStaffId);
            if (assignmentToDelete) {
              await apiService.taskAssignees.deleteTaskAssignee(assignmentToDelete.taskAssigneeId);
            }
          }
        }

        for (const newStaffId of newStaffIds) {
          if (!existingStaffIds.has(newStaffId)) {
            await apiService.taskAssignees.createTaskAssignee({ taskId: taskIdToUse, staffId: newStaffId, assignedAt: new Date() });
          }
        }
      } else if (taskFormData.assignees.length > 0) {
        setSnackbar({ open: true, message: 'Warning: You lack privilege to manage assignees. Task created/updated without assignee changes.', severity: 'warning' });
      }

      if (checkUserPrivilege(user, 'task.manage_dependencies')) {
        const existingDependencies = await apiService.taskDependencies.getTaskDependenciesForTask(taskIdToUse);
        const existingDependsOnTaskIds = new Set(existingDependencies.map(d => d.dependsOnTaskId));
        const newDependsOnTaskIds = new Set(taskFormData.dependencies);

        for (const existingDependsOnTaskId of existingDependsOnTaskIds) {
          if (!newDependsOnTaskIds.has(existingDependsOnTaskIds)) {
            const dependencyToDelete = existingDependencies.find(d => d.dependsOnTaskId === existingDependsOnTaskIds);
            if (dependencyToDelete) {
              await apiService.taskDependencies.deleteTaskDependency(dependencyToDelete.dependencyId);
            }
          }
        }

        for (const newDependsOnTaskId of newDependsOnTaskIds) {
          if (!existingDependsOnTaskIds.has(newDependsOnTaskIds)) {
            await apiService.taskDependencies.createTaskDependency({ taskId: taskIdToUse, dependsOnTaskIds: newDependsOnTaskIds });
          }
        }
      } else if (taskFormData.dependencies.length > 0) {
        setSnackbar({ open: true, message: 'Warning: You lack privilege to manage dependencies. Task created/updated without dependency changes.', severity: 'warning' });
      }

      handleCloseTaskDialog();
      fetchProjectDetails();
    } catch (err) {
      console.error("Submit task error:", err);
      setSnackbar({ open: true, message: err.error || err.message || 'Failed to save task.', severity: 'error' });
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!checkUserPrivilege(user, 'task.delete')) {
      setSnackbar({ open: true, message: 'You do not have permission to delete tasks.', severity: 'error' });
      return;
    }
    if (window.confirm('Are you sure you want to delete this task? This will also remove its assignees and dependencies.')) {
      try {
        await apiService.tasks.deleteTask(taskId);
        setSnackbar({ open: true, message: 'Task deleted successfully!', severity: 'success' });
        fetchProjectDetails();
      } catch (err) {
        console.error("Delete task error:", err);
        setSnackbar({ open: true, message: err.error || err.message || 'Failed to delete task.', severity: 'error' });
      }
    }
  };

  const handleApplyMilestoneTemplate = async () => {
    if (!checkUserPrivilege(user, 'project.apply_template')) {
      setSnackbar({ open: true, message: 'Permission denied to apply milestone templates.', severity: 'error' });
      return;
    }
    setApplyingTemplate(true);
    try {
        const response = await apiService.projects.applyMilestoneTemplate(projectId);
        setSnackbar({ open: true, message: response.message, severity: 'success' });
        fetchProjectDetails();
    } catch (err) {
        setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to apply milestone template.', severity: 'error' });
    } finally {
        setApplyingTemplate(false);
    }
  };
  
  const handleOpenCreateMilestoneDialog = () => {
    if (!checkUserPrivilege(user, 'milestone.create')) {
      setSnackbar({ open: true, message: 'You do not have permission to create milestones.', severity: 'error' });
      return;
    }
    setCurrentMilestone(null);
    setMilestoneFormData({
      milestoneName: '', milestoneDescription: '', dueDate: '', completed: false, completedDate: '', sequenceOrder: '',
      progress: 0,
      weight: 1,
    });
    setMilestoneFormErrors({});
    setOpenMilestoneDialog(true);
  };

  const handleOpenEditMilestoneDialog = (milestone) => {
    if (!checkUserPrivilege(user, 'milestone.update')) {
      setSnackbar({ open: true, message: 'You do not have permission to update milestones.', severity: 'error' });
      return;
    }
    setCurrentMilestone(milestone);
    setMilestoneFormData({
      milestoneName: milestone.milestoneName || '',
      milestoneDescription: milestone.milestoneDescription || '',
      dueDate: milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : '',
      completed: milestone.completed || false,
      completedDate: milestone.completedDate ? new Date(milestone.completedDate).toISOString().split('T')[0] : '',
      sequenceOrder: milestone.sequenceOrder || '',
      progress: milestone.progress || 0,
      weight: milestone.weight || 1,
    });
    setMilestoneFormErrors({});
    setOpenMilestoneDialog(true);
  };

  const handleCloseMilestoneDialog = () => {
    setOpenMilestoneDialog(false);
    setCurrentMilestone(null);
    setMilestoneFormErrors({});
  };

  const handleMilestoneFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMilestoneFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const validateMilestoneForm = () => {
    let errors = {};
    if (!milestoneFormData.milestoneName.trim()) errors.milestoneName = 'Milestone Name is required.';
    if (!milestoneFormData.dueDate) errors.dueDate = 'Due Date is required.';
    setMilestoneFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMilestoneSubmit = async () => {
    if (!validateMilestoneForm()) {
      setSnackbar({ open: true, message: 'Please correct the milestone form errors.', severity: 'error' });
      return;
    }

    let completedDateToSend = null;
    if (milestoneFormData.completed) {
      completedDateToSend = milestoneFormData.completedDate || new Date().toISOString().split('T')[0];
    }

    const dataToSubmit = {
        ...milestoneFormData,
        projectId: projectId,
        completedDate: completedDateToSend
    };

    try {
      if (currentMilestone) {
        if (!checkUserPrivilege(user, 'milestone.update')) {
          setSnackbar({ open: true, message: 'You do not have permission to update milestones.', severity: 'error' });
          return;
        }
        await apiService.milestones.updateMilestone(currentMilestone.milestoneId, dataToSubmit);
        setSnackbar({ open: true, message: 'Milestone updated successfully!', severity: 'success' });
      } else {
        if (!checkUserPrivilege(user, 'milestone.create')) {
          setSnackbar({ open: true, message: 'You do not have permission to create milestones.', severity: 'error' });
          return;
        }
        await apiService.milestones.createMilestone(dataToSubmit);
        setSnackbar({ open: true, message: 'Milestone created successfully!', severity: 'success' });
      }
      handleCloseMilestoneDialog();
      fetchProjectDetails();
    } catch (err) {
      console.error("Submit milestone error:", err);
      setSnackbar({ open: true, message: err.error || err.message || 'Failed to save milestone.', severity: 'error' });
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!checkUserPrivilege(user, 'milestone.delete')) {
      setSnackbar({ open: true, message: 'You do not have permission to delete milestones.', severity: 'error' });
      return;
    }
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        await apiService.milestones.deleteMilestone(milestoneId);
        setSnackbar({ open: true, message: 'Milestone deleted successfully!', severity: 'success' });
        fetchProjectDetails();
      } catch (err) {
        console.error("Delete milestone error:", err);
        setSnackbar({ open: true, message: err.error || err.message || 'Failed to delete milestone.', severity: 'error' });
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewGanttChart = () => {
    navigate(`/projects/${projectId}/gantt-chart`);
  };

  const handleManagePhotos = () => {
    navigate(`/projects/${projectId}/photos`);
  };

  // NEW: Handlers for monitoring modal
  const handleOpenMonitoringModal = () => {
    setOpenMonitoringModal(true);
  };
  const handleCloseMonitoringModal = () => {
    setOpenMonitoringModal(false);
  };

  const canApplyTemplate = !!projectCategory && checkUserPrivilege(user, 'project.apply_template');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Project not found or an unexpected error occurred.</Alert>
      </Box>
    );
  }

  const overallProgress = project?.overallProgress || 0;

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 3 }}
      >
        Back to Project Management
      </Button>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#0A2342', fontWeight: 'bold' }}>
        Project Details: "{project?.projectName || 'Project Name Missing'}"
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ color: '#333' }}>
        Project ID: {project.id}
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: '8px', borderLeft: '5px solid #0A2342' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary.main">Overview</Typography>
            <Stack direction="row" spacing={1}>
                <Tooltip title="View Project Monitoring">
                    <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={handleOpenMonitoringModal}
                        sx={{ borderColor: '#0A2342', color: '#0A2342', '&:hover': { backgroundColor: '#e0e7ff' } }}
                    >
                        Monitoring
                    </Button>
                </Tooltip>
                <Tooltip title="Manage Project Photos">
                  <Button
                      variant="outlined"
                      startIcon={<PhotoCameraIcon />}
                      onClick={handleManagePhotos}
                      sx={{ borderColor: '#0A2342', color: '#0A2342', '&:hover': { backgroundColor: '#e0e7ff' } }}
                  >
                      Photos
                  </Button>
                </Tooltip>
            </Stack>
        </Box>
        <Stack spacing={1}>
          <Typography variant="body1">
            <strong>Overall Progress:</strong> {overallProgress.toFixed(2)}%
          </Typography>
          <LinearProgress variant="determinate" value={overallProgress} sx={{ height: 10, borderRadius: 5, mb: 2 }} />
          
          <Typography variant="body1">
            <strong>Project Category:</strong> {projectCategory?.categoryName || 'N/A'}
          </Typography>
          <Typography variant="body1"><strong>Directorate:</strong> {project?.directorate || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Principal Investigator:</strong> {project?.principalInvestigator || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Status:</strong>
            <Chip
              label={project?.status || 'N/A'}
              sx={{
                ml: 1,
                backgroundColor: getProjectStatusBackgroundColor(project?.status),
                color: getProjectStatusTextColor(project?.status),
                fontWeight: 'bold',
              }}
            />
          </Typography>
          <Typography variant="body1"><strong>Start Date:</strong> {project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</Typography>
          <Typography variant="body1"><strong>End Date:</strong> {project?.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</Typography>
          <Typography variant="body1"><strong>Cost:</strong> ${parseFloat(project?.costOfProject || 0).toFixed(2)}</Typography>
          <Typography variant="body1"><strong>Paid Out:</strong> ${parseFloat(project?.paidOut || 0).toFixed(2)}</Typography>
          <Typography variant="body1"><strong>Objective:</strong> {project?.objective || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Expected Output:</strong> {project?.expectedOutput || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Expected Outcome:</strong> {project?.expectedOutcome || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Description:</strong> {project?.projectDescription || 'N/A'}</Typography>
        </Stack>
      </Paper>

      {/* Tasks Section */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" color="primary.main">Tasks</Typography>
          <Stack direction="row" spacing={1}>
            {checkUserPrivilege(user, 'task.create') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateTaskDialog}
                sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' } }}
              >
                Add Task
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<BarChartIcon />}
              onClick={handleViewGanttChart}
              sx={{ borderColor: '#0A2342', color: '#0A2342', '&:hover': { backgroundColor: '#e0e7ff' } }}
            >
              View Gantt Chart
            </Button>
          </Stack>
        </Box>
        {tasks.length === 0 ? (
          <Alert severity="info">No tasks defined for this project.</Alert>
        ) : (
          <List component={Paper} elevation={2} sx={{ borderRadius: '8px' }}>
            {tasks.map((task) => (
              <ListItem
                key={task.taskId}
                divider
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    {checkUserPrivilege(user, 'task.update') && (
                      <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditTaskDialog(task)}>
                        <EditIcon />
                      </IconButton>
                    )}
                    {checkUserPrivilege(user, 'task.delete') && (
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.taskId)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{task.taskName || 'Unnamed Task'}</Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">{task.description || 'No description.'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start: {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'} | End: {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A'} | Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        Status: <Chip label={task.status || 'N/A'} size="small" sx={{ backgroundColor: getProjectStatusBackgroundColor(task.status), color: getProjectStatusTextColor(task.status), fontWeight: 'bold' }} />
                      </Typography>
                      {Array.isArray(task.assignees) && task.assignees.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <PeopleIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> Assigned To: {
                            task.assignees.map(aId => {
                                const assignee = staff.find(s => s.staffId === aId);
                                return assignee ? `${assignee.firstName} ${assignee.lastName}` : `Staff ${aId}`;
                            }).join(', ')
                          }
                        </Typography>
                      )}
                      {Array.isArray(task.dependencies) && task.dependencies.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinkIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> Depends On: {
                              task.dependencies.map(d => {
                                  const dependentTask = allTasks.find(t => t.taskId === d.dependsOnTaskId);
                                  return dependentTask ? dependentTask.taskName : `Task ${d.dependsOnTaskId}`;
                              }).join(', ')
                          }
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Milestones Section */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" color="primary.main">Milestones</Typography>
          {checkUserPrivilege(user, 'project.apply_template') && projectCategory && (
              <Button
                  variant="contained"
                  startIcon={<UpdateIcon />}
                  onClick={handleApplyMilestoneTemplate}
                  disabled={applyingTemplate}
              >
                  {applyingTemplate ? <CircularProgress size={24} /> : 'Apply Latest Milestones'}
              </Button>
          )}
          {checkUserPrivilege(user, 'milestone.create') && !projectCategory && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateMilestoneDialog}
              sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' } }}
            >
              Add Milestone
            </Button>
          )}
        </Box>
        {milestones.length === 0 ? (
            projectCategory?.categoryName ? (
                <Alert severity="info">Milestones for this project are generated from the '{projectCategory.categoryName}' template. Please apply the template first.</Alert>
            ) : (
                <Alert severity="info">No milestones defined for this project.</Alert>
            )
        ) : (
          <List component={Paper} elevation={2} sx={{ borderRadius: '8px' }}>
            {milestones.map((milestone) => (
              <ListItem
                key={milestone.milestoneId}
                divider
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    {/* NEW: Button to view attachments */}
                    <IconButton edge="end" aria-label="attachments" onClick={() => {
                        setMilestoneToViewAttachments(milestone);
                        setOpenAttachmentsModal(true);
                    }}>
                        <AttachmentIcon />
                    </IconButton>
                    {checkUserPrivilege(user, 'milestone.update') && (
                      <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditMilestoneDialog(milestone)}>
                        <EditIcon />
                      </IconButton>
                    )}
                    {checkUserPrivilege(user, 'milestone.delete') && (
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMilestone(milestone.milestoneId)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {milestone.milestoneName || 'Unnamed Milestone'}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">{milestone.milestoneDescription || 'No description.'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Due Date: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                      {/* NEW: Display milestone progress */}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Progress: {milestone.progress}% (Weight: {milestone.weight})
                      </Typography>
                      <LinearProgress variant="determinate" value={milestone.progress || 0} sx={{ height: 6, borderRadius: 3 }} />
                      
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        Completed: {!!milestone.completed ? 'Yes' : 'No'}
                        {!!milestone.completed && milestone.completedDate && ` on ${new Date(milestone.completedDate).toLocaleDateString()}`}
                        {!!milestone.completed && (
                            <Chip
                                label="Completed"
                                size="small"
                                sx={{
                                    ml: 1,
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    fontWeight: 'bold',
                                }}
                            />
                        )}
                        {!milestone.completed && (
                            <Chip
                                label="Not Completed"
                                size="small"
                                sx={{
                                    ml: 1,
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontWeight: 'bold',
                                }}
                            />
                        )}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Task Create/Edit Dialog */}
      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} fullWidth maxWidth="md">
        <DialogTitle>{currentTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            name="taskName"
            label="Task Name"
            type="text"
            fullWidth
            variant="outlined"
            value={taskFormData.taskName}
            onChange={handleTaskFormChange}
            error={!!taskFormErrors.taskName}
            helperText={taskFormErrors.taskName}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={taskFormData.description}
            onChange={handleTaskFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="startDate"
            label="Start Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={taskFormData.startDate}
            onChange={handleTaskFormChange}
            error={!!taskFormErrors.startDate}
            helperText={taskFormErrors.startDate}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="endDate"
            label="End Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={taskFormData.endDate}
            onChange={handleTaskFormChange}
            error={!!taskFormErrors.endDate || !!taskFormErrors.dateRange}
            helperText={taskFormErrors.endDate || taskFormErrors.dateRange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="dueDate"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={taskFormData.dueDate}
            onChange={handleTaskFormChange}
            error={!!taskFormErrors.dueDate || !!taskFormErrors.dueDateRange}
            helperText={taskFormErrors.dueDate || taskFormErrors.dueDateRange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              label="Status"
              value={taskFormData.status}
              onChange={handleTaskFormChange}
            >
              {taskStatuses.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {checkUserPrivilege(user, 'task.manage_assignees') && (
            <FormControl fullWidth margin="dense" variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Assignees</InputLabel>
              <Select
                name="assignees"
                label="Assignees"
                multiple
                value={taskFormData.assignees}
                onChange={handleAssigneesChange}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map(id => {
                            const assignee = staff.find(s => s.staffId === id);
                            return <Chip key={id} label={assignee ? `${assignee.firstName} ${assignee.lastName}` : `Staff ${id}`} />;
                        })}
                    </Box>
                )}
              >
                {staff.map((s) => (
                  <MenuItem key={s.staffId} value={s.staffId}>
                    {s.firstName} {s.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {checkUserPrivilege(user, 'task.manage_dependencies') && (
            <FormControl fullWidth margin="dense" variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Dependencies</InputLabel>
              <Select
                name="dependencies"
                label="Dependencies"
                multiple
                value={taskFormData.dependencies}
                onChange={handleDependenciesChange}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map(id => {
                            const dependentTask = allTasks.find(t => t.taskId === id);
                            return <Chip key={id} label={dependentTask ? dependentTask.taskName : `Task ${id}`} />;
                        })}
                    </Box>
                )}
              >
                {allTasks.filter(t => t.taskId !== (currentTask ? currentTask.taskId : null)).map((t) => (
                  <MenuItem key={t.taskId} value={t.taskId}>
                    {t.taskName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleTaskSubmit} color="primary" variant="contained">
            {currentTask ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Milestone Create/Edit Dialog */}
      <Dialog open={openMilestoneDialog} onClose={handleCloseMilestoneDialog} fullWidth maxWidth="sm">
        <DialogTitle>{currentMilestone ? 'Edit Milestone' : 'Add New Milestone'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            name="milestoneName"
            label="Milestone Name"
            type="text"
            fullWidth
            variant="outlined"
            value={milestoneFormData.milestoneName}
            onChange={handleMilestoneFormChange}
            error={!!milestoneFormErrors.milestoneName}
            helperText={milestoneFormErrors.milestoneName}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="milestoneDescription"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={milestoneFormData.milestoneDescription}
            onChange={handleMilestoneFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="dueDate"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={milestoneFormData.dueDate}
            onChange={handleMilestoneFormChange}
            error={!!milestoneFormErrors.dueDate}
            helperText={milestoneFormErrors.dueDate}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="progress"
            label="Progress (%)"
            type="number"
            fullWidth
            variant="outlined"
            value={milestoneFormData.progress}
            onChange={handleMilestoneFormChange}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="weight"
            label="Weight"
            type="number"
            fullWidth
            variant="outlined"
            value={milestoneFormData.weight}
            onChange={handleMilestoneFormChange}
            inputProps={{ min: 0, step: 0.1 }}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={milestoneFormData.completed}
                onChange={handleMilestoneFormChange}
                name="completed"
                color="primary"
              />
            }
            label="Completed"
            sx={{ mb: 2 }}
          />
          {milestoneFormData.completed && (
            <TextField
              margin="dense"
              name="completedDate"
              label="Completed Date"
              type="date"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={milestoneFormData.completedDate}
              onChange={handleMilestoneFormChange}
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMilestoneDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleMilestoneSubmit} color="primary" variant="contained">
            {currentMilestone ? 'Update Milestone' : 'Create Milestone'}
          </Button>
        </DialogActions>
      </Dialog>
        
      <MilestoneAttachments
        open={openAttachmentsModal}
        onClose={() => setOpenAttachmentsModal(false)}
        milestoneId={milestoneToViewAttachments?.milestoneId}
        currentMilestoneName={milestoneToViewAttachments?.milestoneName}
        onUploadSuccess={fetchProjectDetails}
      />

      {/* NEW: Render the ProjectMonitoringComponent as a modal */}
      <ProjectMonitoringComponent
        open={openMonitoringModal}
        onClose={handleCloseMonitoringModal}
        projectId={projectId}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProjectDetailsPage;