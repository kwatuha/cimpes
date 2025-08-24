import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Button, Paper,
  List, ListItem, ListItemText, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel,
  Stack, Chip, Checkbox, FormControlLabel, Select, Snackbar, LinearProgress,
  Tooltip, Accordion, AccordionSummary, AccordionDetails, useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon, Link as LinkIcon, BarChart as BarChartIcon,
  Update as UpdateIcon,
  Attachment as AttachmentIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  Paid as PaidIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import apiService from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { getProjectStatusBackgroundColor, getProjectStatusTextColor } from '../utils/projectStatusColors';
import MilestoneAttachments from '../components/MilestoneAttachments.jsx';
import ProjectMonitoringComponent from '../components/ProjectMonitoringComponent.jsx';
import ProjectManagerReviewPanel from '../components/ProjectManagerReviewPanel.jsx';
import ActivityForm from '../components/strategicPlan/ActivityForm';
import AddEditMilestoneModal from '../components/modals/AddEditMilestoneModal';
import PaymentRequestForm from '../components/PaymentRequestForm';
import PaymentRequestDocumentUploader from '../components/PaymentRequestDocumentUploader';

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
  const theme = useTheme();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [staff, setStaff] = useState([]);
  const [projectCategory, setProjectCategory] = useState(null);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [categoryMilestones, setCategoryMilestones] = useState([]);
  const [milestoneActivities, setMilestoneActivities] = useState([]);
  
  const [projectWorkPlans, setProjectWorkPlans] = useState([]);
  const [loadingWorkPlans, setLoadingWorkPlans] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Corrected: use local state for the modal
  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  
  const [openAttachmentsModal, setOpenAttachmentsModal] = useState(false);
  const [milestoneToViewAttachments, setMilestoneToViewAttachments] = useState(null);
  const [openMonitoringModal, setOpenMonitoringModal] = useState(false); 
  const [openReviewPanel, setOpenReviewPanel] = useState(false);
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [activityFormData, setActivityFormData] = useState({
      activityName: '',
      activityDescription: '',
      responsibleOfficer: null,
      startDate: '',
      endDate: '',
      budgetAllocated: null,
      actualCost: null,
      percentageComplete: null,
      activityStatus: '',
      projectId: null,
      workplanId: null,
      milestoneIds: [],
  });
  const [activityFormErrors, setActivityFormErrors] = useState({});

  const [expandedWorkPlan, setExpandedWorkPlan] = useState(false);
  const [selectedWorkplanName, setSelectedWorkplanName] = useState('');

  const [paymentJustification, setPaymentJustification] = useState({
      totalBudget: 0,
      accomplishedActivities: [],
      accomplishedMilestones: []
  });
  
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  
  // NEW: State for the document uploader modal
  const [openDocumentUploader, setOpenDocumentUploader] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedWorkPlan(isExpanded ? panel : false);
  };
  
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

      const subProgramId = projectData.subProgramId;
      if (subProgramId) {
        setLoadingWorkPlans(true);
        try {
          const workPlansData = await apiService.strategy.annualWorkPlans.getWorkPlansBySubprogramId(subProgramId);
          setProjectWorkPlans(workPlansData);
        } catch (err) {
          console.error("Error fetching work plans for subprogram:", err);
          setProjectWorkPlans([]);
        } finally {
          setLoadingWorkPlans(false);
        }
      }
      
      if (projectData.categoryId) {
        const categoryData = await apiService.metadata.projectCategories.getCategoryById(projectData.categoryId);
        setProjectCategory(categoryData);
        const templatedMilestones = await apiService.metadata.projectCategories.getMilestonesByCategory(projectData.categoryId);
        setCategoryMilestones(templatedMilestones);
      } else {
        setProjectCategory(null);
        setCategoryMilestones([]);
      }

      const milestonesData = await apiService.milestones.getMilestonesForProject(projectId);
      setMilestones(milestonesData);
      
      const milestoneActivitiesPromises = milestonesData.map(m =>
          apiService.strategy.milestoneActivities.getActivitiesByMilestoneId(m.milestoneId)
      );
      const milestoneActivitiesResults = (await Promise.all(milestoneActivitiesPromises)).flat();
      setMilestoneActivities(milestoneActivitiesResults);

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

  // NEW: Effect to process data for payment justification
  useEffect(() => {
    if (!milestones.length && !milestoneActivities.length) {
        return;
    }

    // Identify accomplished activities and milestones
    const accomplishedActivities = milestoneActivities.filter(a => a.activityStatus === 'completed');
    const accomplishedMilestoneIds = new Set(accomplishedActivities.map(a => a.milestoneId));
    const accomplishedMilestones = milestones.filter(m => accomplishedMilestoneIds.has(m.milestoneId));

    // Calculate total budget for accomplished activities
    const totalAccomplishedBudget = accomplishedActivities.reduce((sum, activity) => sum + (parseFloat(activity.budgetAllocated) || 0), 0);

    setPaymentJustification({
        totalBudget: totalAccomplishedBudget,
        accomplishedActivities: accomplishedActivities,
        accomplishedMilestones: accomplishedMilestones
    });
  }, [milestones, milestoneActivities]);

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
    setOpenMilestoneDialog(true);
  };

  const handleOpenEditMilestoneDialog = (milestone) => {
    if (!checkUserPrivilege(user, 'milestone.update')) {
      setSnackbar({ open: true, message: 'You do not have permission to update milestones.', severity: 'error' });
      return;
    }
    setCurrentMilestone(milestone);
    setOpenMilestoneDialog(true);
  };

  const handleCloseMilestoneDialog = () => {
    setOpenMilestoneDialog(false);
    setCurrentMilestone(null);
  };

  const handleMilestoneSubmit = async (dataToSubmit) => {
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
  
  const handleManagePhotos = () => {
    navigate(`/projects/${projectId}/photos`);
  };

  const handleOpenMonitoringModal = () => {
    setOpenMonitoringModal(true);
  };
  const handleCloseMonitoringModal = () => {
    setOpenMonitoringModal(false);
  };
  
  const handleOpenReviewPanel = () => {
    setOpenReviewPanel(true);
  };
  const handleCloseReviewPanel = () => {
    setOpenReviewPanel(false);
  };

  const handleOpenPaymentRequest = () => {
    setOpenPaymentModal(true);
  };

  const handlePaymentRequestSubmit = async (projectId, formData) => {
    try {
        // Assume this API call creates the request and returns the new requestId
        const newRequest = await apiService.paymentRequests.createRequest(projectId, formData); 
        
        setSnackbar({ open: true, message: 'Payment request submitted successfully!', severity: 'success' });
        
        // After successful creation, close the current modal and open the document uploader for the new request
        setOpenPaymentModal(false);
        setSelectedRequestId(newRequest.requestId);
        setOpenDocumentUploader(true);

        fetchProjectDetails(); // Re-fetch data to show the new request
    } catch (err) {
        setSnackbar({ open: true, message: err.message || 'Failed to submit payment request.', severity: 'error' });
    }
  };

  const handleOpenCreateActivityDialog = (workplanId, workplanName) => {
      setOpenActivityDialog(true);
      setCurrentActivity(null);
      setSelectedWorkplanName(workplanName);
      setActivityFormData({
          activityName: '', activityDescription: '', responsibleOfficer: null, startDate: '', endDate: '', budgetAllocated: null,
          actualCost: null, percentageComplete: null, activityStatus: 'not_started',
          projectId: projectId,
          workplanId: workplanId,
          milestoneIds: [],
      });
      setActivityFormErrors({});
  };
  
  const handleOpenEditActivityDialog = async (activity) => {
      setOpenActivityDialog(true);
      setCurrentActivity(activity);
      setSelectedWorkplanName(projectWorkPlans.find(wp => wp.workplanId === activity.workplanId)?.workplanName || '');

      let currentMilestoneIds = [];
      try {
        const milestoneActivitiesData = await apiService.strategy.milestoneActivities.getActivitiesByActivityId(activity.activityId);
        currentMilestoneIds = milestoneActivitiesData.map(ma => ma.milestoneId);
      } catch (err) {
        console.error("Error fetching milestone activities:", err);
      }
      
      setActivityFormData({
          ...activity,
          startDate: activity.startDate ? new Date(activity.startDate).toISOString().split('T')[0] : '',
          endDate: activity.endDate ? new Date(activity.endDate).toISOString().split('T')[0] : '',
          milestoneIds: currentMilestoneIds,
      });
      setActivityFormErrors({});
  };
  
  const handleCloseActivityDialog = () => {
      setOpenActivityDialog(false);
      setCurrentActivity(null);
      setActivityFormErrors({});
      setSelectedWorkplanName('');
  };

  const handleActivityFormChange = (e) => {
      const { name, value, type, checked } = e.target;
      setActivityFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
      }));
  };
  
  const handleMilestoneSelectionChange = (e, newValue) => {
      const milestoneIds = newValue.map(m => m.milestoneId);
      setActivityFormData(prev => ({ ...prev, milestoneIds }));
  };
  
  const handleActivitySubmit = async () => {
      // Validation would go here
      try {
          let activityIdToUse;
          
          if (currentActivity) {
              await apiService.strategy.activities.updateActivity(currentActivity.activityId, activityFormData);
              activityIdToUse = currentActivity.activityId;
              setSnackbar({ open: true, message: 'Activity updated successfully!', severity: 'success' });
          } else {
              const createdActivity = await apiService.strategy.activities.createActivity(activityFormData);
              activityIdToUse = createdActivity.activityId;
              setSnackbar({ open: true, message: 'Activity created successfully!', severity: 'success' });
          }

          if (activityIdToUse) {
              // Fetch all existing links for this activity
              const existingMilestoneLinks = await apiService.strategy.milestoneActivities.getActivitiesByActivityId(activityIdToUse);
              const existingMilestoneIds = new Set(existingMilestoneLinks.map(link => link.milestoneId));
              const newMilestoneIds = new Set(activityFormData.milestoneIds);

              // Find milestones to link (the ones in the form that don't already exist)
              const milestonesToLink = Array.from(newMilestoneIds).filter(id => !existingMilestoneIds.has(id));
              
              // Find milestones to unlink (the ones in the database that are no longer in the form)
              const milestonesToUnlink = Array.from(existingMilestoneIds).filter(id => !newMilestoneIds.has(id));

              // Link new milestones
              await Promise.all(milestonesToLink.map(milestoneId => 
                  apiService.strategy.milestoneActivities.createMilestoneActivity({
                      milestoneId: milestoneId,
                      activityId: activityIdToUse
                  })
              ));

              // Unlink old milestones
              await Promise.all(milestonesToUnlink.map(milestoneId =>
                  apiService.strategy.milestoneActivities.deleteMilestoneActivity(milestoneId, activityIdToUse)
              ));
          }

          handleCloseActivityDialog();
          fetchProjectDetails();
      } catch (err) {
          setSnackbar({ open: true, message: err.message || 'Failed to save activity.', severity: 'error' });
      }
  };
  
  const handleDeleteActivity = async (activityId) => {
      if (window.confirm('Are you sure you want to delete this activity?')) {
          try {
              await apiService.strategy.activities.deleteActivity(activityId);
              setSnackbar({ open: true, message: 'Activity deleted successfully!', severity: 'success' });
              fetchProjectDetails();
          } catch (err) {
              setSnackbar({ open: true, message: err.message || 'Failed to delete activity.', severity: 'error' });
          }
      }
  };
  
  // NEW: Handlers for the document uploader modal
  const handleOpenDocumentUploader = (requestId) => {
    setSelectedRequestId(requestId);
    setOpenDocumentUploader(true);
  };
  
  const handleCloseDocumentUploader = () => {
    setOpenDocumentUploader(false);
    setSelectedRequestId(null);
    fetchProjectDetails(); // Re-fetch to show new documents
  };

  const canApplyTemplate = !!projectCategory && checkUserPrivilege(user, 'project.apply_template');
  const canReviewSubmissions = checkUserPrivilege(user, 'project_manager.review');
  
  // 🐛 FIX: Add a debug log to verify projectId
  console.log("ProjectDetailsPage projectId:", projectId);

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
                {canReviewSubmissions && (
                    <Tooltip title="Review Contractor Submissions">
                        <Button
                            variant="outlined"
                            startIcon={<PaidIcon />}
                            onClick={handleOpenReviewPanel}
                            sx={{ borderColor: '#0A2342', color: '#0A2342', '&:hover': { backgroundColor: '#e0e7ff' } }}
                        >
                            Review Submissions
                        </Button>
                    </Tooltip>
                )}
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
        </Stack>
      </Paper>

      {/* Payment Justification Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>Payment Justification</Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 2, borderRadius: '8px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Accomplished Milestones & Activities</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Total Accomplished Budget: <span style={{ color: theme.palette.success.main }}>KES {paymentJustification.totalBudget.toFixed(2)}</span>
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This section shows the budget for all completed project activities. You can use this to justify a payment request.
          </Typography>
          {paymentJustification.accomplishedMilestones.length > 0 ? (
            <List dense>
              {paymentJustification.accomplishedMilestones.map(milestone => (
                <Accordion key={milestone.milestoneId} expanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 'bold' }}>Milestone: {milestone.milestoneName}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: '#fafafa' }}>
                    <List dense>
                      {paymentJustification.accomplishedActivities
                        .filter(a => a.milestoneId === milestone.milestoneId)
                        .map(activity => (
                          <ListItem key={activity.activityId}>
                            <ListItemText
                              primary={activity.activityName}
                              secondary={`Budget: KES ${parseFloat(activity.budgetAllocated).toFixed(2)}`}
                            />
                          </ListItem>
                        ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          ) : (
            <Alert severity="info">No completed milestones with activities found yet.</Alert>
          )}
        </Paper>
        {/* Button to initiate payment request based on the accomplished work */}
        <Box sx={{ textAlign: 'right' }}>
            <Button
                variant="contained"
                startIcon={<PaidIcon />}
                onClick={handleOpenPaymentRequest}
                disabled={paymentJustification.accomplishedActivities.length === 0}
            >
                Request Payment for Accomplished Work
            </Button>
        </Box>
      </Box>

      {/* Work Plans Accordion */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>Work Plans</Typography>
        {loadingWorkPlans ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        ) : projectWorkPlans.length === 0 ? (
            <Alert severity="info">No work plans available for this project's subprogram.</Alert>
        ) : (
            projectWorkPlans.map((workplan) => {
                const activitiesForWorkplan = milestoneActivities.filter(a => String(a.workplanId) === String(workplan.workplanId));
                const totalMappedBudget = activitiesForWorkplan.reduce((sum, activity) => sum + (parseFloat(activity.budgetAllocated) || 0), 0);
                const remainingBudget = (parseFloat(workplan.totalBudget) || 0) - totalMappedBudget;

                return (
                    <Accordion
                        key={workplan.workplanId}
                        expanded={expandedWorkPlan === workplan.workplanId}
                        onChange={handleAccordionChange(workplan.workplanId)}
                        sx={{ mb: 2, borderRadius: '8px', '&:before': { display: 'none' } }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${workplan.workplanId}-content`}
                            id={`panel-${workplan.workplanId}-header`}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Typography variant="h6" sx={{ flexShrink: 0, fontWeight: 'bold' }}>
                                    {workplan.workplanName} ({workplan.financialYear})
                                </Typography>
                                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                    <Chip 
                                        label={`Budget: KES ${parseFloat(workplan.totalBudget).toFixed(2)}`} 
                                        color="primary" 
                                        sx={{ mr: 1 }} 
                                    />
                                    <Chip 
                                        label={`Utilized: KES ${totalMappedBudget.toFixed(2)}`} 
                                        color="secondary" 
                                        sx={{ mr: 1 }} 
                                    />
                                    <Chip 
                                        label={`Remaining: KES ${remainingBudget.toFixed(2)}`} 
                                        color={remainingBudget >= 0 ? 'success' : 'error'} 
                                    />
                                </Box>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                                {workplan.workplanDescription || 'No description provided.'}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Activities</Typography>
                                    {checkUserPrivilege(user, 'activity.create') && (
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            size="small"
                                            onClick={() => handleOpenCreateActivityDialog(workplan.workplanId, workplan.workplanName)}
                                        >
                                            Add Activity
                                        </Button>
                                    )}
                                </Box>
                                {activitiesForWorkplan.length > 0 ? (
                                    <List dense>
                                        {activitiesForWorkplan.map((activity) => (
                                            <ListItem 
                                                key={activity.activityId}
                                                secondaryAction={
                                                    <Stack direction="row" spacing={1}>
                                                        {checkUserPrivilege(user, 'activity.update') && (
                                                            <Tooltip title="Edit Activity">
                                                                <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); handleOpenEditActivityDialog(activity); }}><EditIcon /></IconButton>
                                                            </Tooltip>
                                                        )}
                                                        {checkUserPrivilege(user, 'activity.delete') && (
                                                            <Tooltip title="Delete Activity">
                                                                <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleDeleteActivity(activity.activityId); }}><DeleteIcon /></IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                }
                                            >
                                                <ListItemText
                                                    primary={activity.activityName}
                                                    secondary={`Budget: KES ${parseFloat(activity.budgetAllocated).toFixed(2)} | Status: ${activity.activityStatus.replace(/_/g, ' ')}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No activities have been added to this work plan yet.</Typography>
                                )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                );
            })
        )}
      </Box>

      {/* Milestones Section */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" color="primary.main">Milestones</Typography>
          <Stack direction="row" spacing={1}>
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
          </Stack>
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
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {milestone.milestoneName || 'Unnamed Milestone'}
                        </Typography>
                      }
                      sx={{ my: 0 }}
                    />
                    <Stack direction="row" spacing={1}>
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
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{milestone.description || 'No description.'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Due Date: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Progress: {milestone.progress}% (Weight: {milestone.weight})
                    </Typography>
                    <LinearProgress variant="determinate" value={milestone.progress || 0} sx={{ height: 6, borderRadius: 3 }} />
                    
                    {/* Activities section for the milestone */}
                    <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: theme.palette.secondary.main }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Activities</Typography>
                      </Box>
                      {(milestoneActivities || []).filter(a => a.milestoneId === milestone.milestoneId).length > 0 ? (
                          <List dense disablePadding>
                              {(milestoneActivities || []).filter(a => a.milestoneId === milestone.milestoneId).map(activity => (
                                  <ListItem key={activity.activityId} disablePadding sx={{ py: 0.5 }}>
                                      <ListItemText
                                        primary={activity.activityName}
                                        secondary={`Budget: KES ${parseFloat(activity.budgetAllocated).toFixed(2)} | Status: ${activity.activityStatus.replace(/_/g, ' ')}`}
                                      />
                                      <Box>
                                          {checkUserPrivilege(user, 'activity.update') && (
                                              <Tooltip title="Edit Activity">
                                                  <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); handleOpenEditActivityDialog(activity); }}><EditIcon /></IconButton>
                                              </Tooltip>
                                          )}
                                          {checkUserPrivilege(user, 'activity.delete') && (
                                              <Tooltip title="Delete Activity">
                                                  <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleDeleteActivity(activity.activityId); }}><DeleteIcon /></IconButton>
                                              </Tooltip>
                                          )}
                                      </Box>
                                  </ListItem>
                              ))}
                          </List>
                      ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', ml: 2 }}>
                              No activities linked to this milestone.
                          </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Modals for Activities, Milestones, and Monitoring */}
      <MilestoneAttachments
        open={openAttachmentsModal}
        onClose={() => setOpenAttachmentsModal(false)}
        milestoneId={milestoneToViewAttachments?.milestoneId}
        currentMilestoneName={milestoneToViewAttachments?.milestoneName}
        onUploadSuccess={fetchProjectDetails}
      />
      <ProjectMonitoringComponent
        open={openMonitoringModal}
        onClose={handleCloseMonitoringModal}
        projectId={projectId}
      />
      <ProjectManagerReviewPanel
          open={openReviewPanel}
          onClose={handleCloseReviewPanel}
          projectId={projectId}
          projectName={project?.projectName}
          paymentJustification={paymentJustification}
          handleOpenDocumentUploader={handleOpenDocumentUploader}
      />
      <AddEditMilestoneModal
        isOpen={openMilestoneDialog}
        onClose={handleCloseMilestoneDialog}
        editedMilestone={currentMilestone}
        projectId={projectId}
        onSave={handleMilestoneSubmit}
      />
      <ActivityForm
          open={openActivityDialog}
          onClose={handleCloseActivityDialog}
          onSubmit={handleActivitySubmit}
          initialData={activityFormData}
          milestones={milestones}
          staff={staff}
          formErrors={activityFormErrors}
          setFormErrors={setActivityFormErrors}
          selectedWorkplanName={selectedWorkplanName}
          isEditing={!!currentActivity}
          onChange={handleActivityFormChange}
          onMilestoneSelectionChange={handleMilestoneSelectionChange}
          workPlans={projectWorkPlans}
      />

      <PaymentRequestForm
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        projectId={project?.projectId}
        projectName={project?.projectName}
        onSubmit={handlePaymentRequestSubmit}
        accomplishedActivities={paymentJustification.accomplishedActivities}
        totalJustifiedAmount={paymentJustification.totalBudget}
      />
      
      {/* NEW: The document uploader modal */}
      <PaymentRequestDocumentUploader
        open={openDocumentUploader}
        onClose={handleCloseDocumentUploader}
        requestId={selectedRequestId}
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