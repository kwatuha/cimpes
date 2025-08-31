import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button,
  Grid, Snackbar, Tabs, Tab, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Paper,
  List, ListItem, ListItemText, IconButton,
  Accordion, AccordionSummary, AccordionDetails,
  Divider, ListItemButton, Stack, Tooltip, useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon, FileDownload as FileDownloadIcon,
  Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon, Star as StarIcon, Visibility as ViewIcon
} from '@mui/icons-material';

// Hooks
import { useAuth } from '../context/AuthContext.jsx';
import useStrategicPlanDetails from '../hooks/useStrategicPlanDetails';
import useFormManagement from '../hooks/useFormManagement';
import useCrudOperations from '../hooks/useCrudOperations';

// Components
import DataDisplayCard from '../components/common/DataDisplayCard';
import MultiLineTextAsList from '../components/common/MultiLineTextAsList.jsx';
import JsonInputList from '../components/common/JsonInputList.jsx';
import StrategicPlanForm from '../components/strategicPlan/StrategicPlanForm';
import ProgramForm from '../components/strategicPlan/ProgramForm';
import SubprogramForm from "../components/strategicPlan/SubprogramForm";
import AttachmentForm from '../components/strategicPlan/AttachmentForm';
import AnnualWorkPlanForm from '../components/strategicPlan/AnnualWorkPlanForm';

// Helpers
import {
  formatCurrency,
  getStatusChipColor,
  checkUserPrivilege,
  formatBooleanForDisplay,
  CARD_CONTENT_MAX_HEIGHT
} from '../utils/helpers';
// Labels
import strategicPlanningLabels from '../configs/strategicPlanningLabels';
import { tokens } from './dashboard/theme';


function StrategicPlanDetailsPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [expandedProgram, setExpandedProgram] = useState(false);
  const [parentEntityId, setParentEntityId] = useState(null);

  const {
    strategicPlan, programs, subprograms, annualWorkPlans, activities, attachments,
    loading: dataLoading, error, fetchStrategicPlanData, milestones
  } = useStrategicPlanDetails(planId);

  const {
    openDialog, dialogType, currentRecord, formData,
    handleOpenCreateDialog, handleOpenEditDialog, handleCloseDialog, setFormData
  } = useFormManagement();

  const {
    loading: crudLoading, handleSubmit, handleDelete, handleDownloadPdf
  } = useCrudOperations('strategy', fetchStrategicPlanData, setSnackbar);

  const loading = dataLoading || crudLoading;

  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
    }));
  }, [setFormData]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProgramAccordionChange = (programId) => (event, isExpanded) => {
    setExpandedProgram(isExpanded ? programId : false);
  };

  const handleOpenCreateProgramDialog = (parentId) => {
      setParentEntityId(parentId);
      handleOpenCreateDialog('program');
  };

  const handleOpenCreateSubprogramDialog = (programId) => {
      setParentEntityId(programId);
      handleOpenCreateDialog('subprogram');
  };

  const handleOpenEditSubprogramDialog = (subprogram) => {
    setParentEntityId(subprogram.programId);
    handleOpenEditDialog('subprogram', subprogram);
  };

  const handleOpenCreateWorkPlanDialog = (subProgramId) => {
      setParentEntityId(subProgramId);
      handleOpenCreateDialog('workplan');
  };

  const handleOpenEditWorkPlanDialog = (workplan) => {
      setParentEntityId(workplan.subProgramId);
      handleOpenEditDialog('workplan', workplan);
  };

  const handleCloseDialogWithReset = () => {
      setParentEntityId(null);
      handleCloseDialog();
  };

  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-controls={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 0, pt: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  const renderDialogForm = () => {
    const commonFormProps = { formData, handleFormChange, setFormData };
    switch (dialogType) {
      case 'strategicPlan': return <StrategicPlanForm {...commonFormProps} />;
      case 'program': return <ProgramForm {...commonFormProps} />;
      case 'subprogram': return <SubprogramForm {...commonFormProps} />;
      case 'workplan': return <AnnualWorkPlanForm {...commonFormProps} />;
      case 'attachment': return <AttachmentForm {...commonFormProps} />;
      default: return <Typography>No form available for this type.</Typography>;
    }
  };

  // DataGrid Columns Definitions
  const subprogramColumns = [
    { field: 'subProgramme', headerName: strategicPlanningLabels.subprogram.fields.subProgramme, flex: 1.5, minWidth: 200 },
    { field: 'kpi', headerName: strategicPlanningLabels.subprogram.fields.kpi, flex: 1, minWidth: 150 },
    { field: 'totalBudget', headerName: strategicPlanningLabels.subprogram.fields.totalBudget, flex: 1, minWidth: 150, valueFormatter: (params) => formatCurrency(params.value) },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View Details">
            <IconButton color="info" onClick={() => navigate(`/strategic-planning/subprogram/${params.row.subProgramId}`)}><ViewIcon /></IconButton>
          </Tooltip>
          {checkUserPrivilege(user, 'subprogram.update') && (
            <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleOpenEditSubprogramDialog(params.row)}><EditIcon /></IconButton></Tooltip>
          )}
          {checkUserPrivilege(user, 'subprogram.delete') && (
            <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete('subprogram', params.row.subProgramId)}><DeleteIcon /></IconButton></Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  if (loading && !strategicPlan) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading strategic plan data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/strategic-plans')} sx={{ mt: 2 }}>
          Back to Strategic Plans
        </Button>
      </Box>
    );
  }

  if (!strategicPlan) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Strategic Plan not found.</Alert>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/strategic-plans')} sx={{ mt: 2 }}>
          Back to Strategic Plans
        </Button>
      </Box>
    );
  }

  const getDialogLabel = (type) => {
    const labelMapping = {
      strategicPlan: strategicPlanningLabels.strategicPlan,
      program: strategicPlanningLabels.program,
      subprogram: strategicPlanningLabels.subprogram,
      workplan: { singular: 'Work Plan', plural: 'Work Plans' },
      activity: { singular: 'Activity', plural: 'Activities' },
      attachment: strategicPlanningLabels.attachments,
    };
    return labelMapping[type] || { singular: 'Record' };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/strategic-plans')}>
          Back to All Plans
        </Button>
        {checkUserPrivilege(user, 'strategic_plan_pdf.download') && (
          <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={() => handleDownloadPdf('strategic_plan_pdf', strategicPlan.planName, strategicPlan.planId)}>
            Download Plan PDF
          </Button>
        )}
      </Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        {strategicPlanningLabels.strategicPlan.singular}: {strategicPlan.planName || 'N/A'}
      </Typography>
      <Paper elevation={2} sx={{ p: 2.5, mb: 4, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="inherit"><strong>{strategicPlanningLabels.strategicPlan.fields.cidpName}:</strong></Typography>
            <Typography variant="h6" color="inherit" sx={{ wordBreak: 'break-word' }}>{strategicPlan.cidpName || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="inherit"><strong>{strategicPlanningLabels.strategicPlan.fields.cidpid}:</strong></Typography>
            <Typography variant="h6" color="inherit">{strategicPlan.cidpid || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="inherit"><strong>{strategicPlanningLabels.strategicPlan.fields.startDate}:</strong></Typography>
            <Typography variant="h6" color="inherit">{strategicPlan.startDate || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="inherit"><strong>{strategicPlanningLabels.strategicPlan.fields.endDate}:</strong></Typography>
            <Typography variant="h6" color="inherit">{strategicPlan.endDate || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="strategic plan details tabs" variant="scrollable" scrollButtons="auto">
          <Tab label={strategicPlanningLabels.strategicPlan.plural} {...a11yProps(0)} />
          <Tab label={strategicPlanningLabels.program.plural} {...a11yProps(1)} />
          <Tab label={strategicPlanningLabels.attachments.title} {...a11yProps(2)} />
        </Tabs>
      </Box>

      {/* Strategic Plan Tab */}
      <TabPanel value={activeTab} index={0}>
          <Box mb={2}>
              <Grid container spacing={3}>
                  <Grid item xs={12}>
                      <DataDisplayCard title="Strategic Plan Information" onAdd={() => handleOpenEditDialog('strategicPlan', strategicPlan)} showAdd={checkUserPrivilege(user, 'strategic_plan.update')} addLabel="Edit">
                          <Grid container spacing={2}>
                              <Grid item xs={12} sm={6} md={4}>
                                  <JsonInputList label="Objectives" items={strategicPlan.objectives} />
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                  <JsonInputList label="Strategies" items={strategicPlan.strategies} />
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                  <JsonInputList label="Key Result Areas" items={strategicPlan.keyResultAreas} />
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Is Active:</Typography>
                                  <Chip label={formatBooleanForDisplay(strategicPlan.isActive)} color={strategicPlan.isActive ? "success" : "default"} />
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Remarks:</Typography>
                                  <MultiLineTextAsList text={strategicPlan.remarks} />
                              </Grid>
                          </Grid>
                      </DataDisplayCard>
                  </Grid>
                  <Grid item xs={12}>
                      <DataDisplayCard title="Milestones" showAdd={checkUserPrivilege(user, 'milestone.create')} onAdd={() => handleOpenCreateDialog('milestone')}>
                          {milestones && milestones.length > 0 ? (
                              <List dense sx={{ maxHeight: CARD_CONTENT_MAX_HEIGHT, overflowY: 'auto' }}>
                                  {milestones.map(milestone => (
                                      <ListItem
                                          key={milestone.milestoneId}
                                          secondaryAction={
                                              <Stack direction="row" spacing={1}>
                                                  {checkUserPrivilege(user, 'milestone.update') && (
                                                      <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog('milestone', milestone)} size="small"><EditIcon fontSize="small" /></IconButton>
                                                  )}
                                                  {checkUserPrivilege(user, 'milestone.delete') && (
                                                      <IconButton edge="end" aria-label="delete" onClick={() => handleDelete('milestone', milestone.milestoneId)} size="small"><DeleteIcon fontSize="small" /></IconButton>
                                                  )}
                                              </Stack>
                                          }
                                      >
                                          <ListItemText
                                              primary={milestone.title}
                                              secondary={`Target Date: ${milestone.targetDate}`}
                                          />
                                      </ListItem>
                                  ))}
                              </List>
                          ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No milestones defined for this plan.</Typography>
                          )}
                      </DataDisplayCard>
                  </Grid>
              </Grid>
          </Box>
      </TabPanel>

      {/* Programs Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box mb={2}>
            {checkUserPrivilege(user, 'program.create') && (
                <Button startIcon={<AddIcon />} variant="contained" onClick={() => handleOpenCreateProgramDialog(strategicPlan.cidpid)}>
                  Add Program
                </Button>
            )}
        </Box>
        {programs.length > 0 ? (
          <Box>
            {programs.map(program => (
              <Accordion
                key={program.programId}
                expanded={expandedProgram === program.programId}
                onChange={handleProgramAccordionChange(program.programId)}
                sx={{
                  my: 1,
                  boxShadow: 2,
                  borderRadius: 1,
                  '&:before': { display: 'none' },
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ transition: 'transform 0.3s' }} />}
                  aria-controls={`panel-${program.programId}-content`}
                  id={`panel-${program.programId}-header`}
                  sx={{
                    // Removed the hardcoded bgcolor to ensure theme consistency
                    // Instead, use an action color for visual distinction
                    bgcolor: theme.palette.action.hover, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&.Mui-expanded': { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                      transform: 'rotate(180deg)',
                    },
                  }}
                >
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                      <Box sx={{ width: 16, height: 16, bgcolor: '#00A5A5', borderRadius: '4px' }} />
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{program.programme || 'N/A'}</Typography>
                      {program.description && <Typography variant="body2" color="text.secondary">{program.description}</Typography>}
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Program Details</Typography>
                    <Stack direction="row" spacing={1}>
                      {checkUserPrivilege(user, 'program.update') && (
                        <Tooltip title="Edit Program">
                          <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleOpenEditDialog('program', program); }}><EditIcon /></IconButton>
                        </Tooltip>
                      )}
                      {checkUserPrivilege(user, 'program.delete') && (
                        <Tooltip title="Delete Program">
                          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete('program', program.programId); }}><DeleteIcon /></IconButton>
                        </Tooltip>
                      )}
                      {checkUserPrivilege(user, 'program_pdf.download') && (
                        <Tooltip title="Download Program PDF">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => { e.stopPropagation(); handleDownloadPdf('program_pdf', program.programme, program.programId); }}
                          >
                            <FileDownloadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Box>
                    <MultiLineTextAsList text={program.needsPriorities} label={strategicPlanningLabels.program.fields.needsPriorities} />
                    <MultiLineTextAsList text={program.strategies} label={strategicPlanningLabels.program.fields.strategies} />
                    <MultiLineTextAsList text={program.objectives} label={strategicPlanningLabels.program.fields.objectives} />
                    <MultiLineTextAsList text={program.outcomes} label={strategicPlanningLabels.program.fields.outcomes} />
                    <MultiLineTextAsList text={program.remarks} label={strategicPlanningLabels.program.fields.remarks} />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">{strategicPlanningLabels.subprogram.plural}</Typography>
                    {checkUserPrivilege(user, 'subprogram.create') && (
                      <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenCreateSubprogramDialog(program.programId)}
                      >
                        Add Subprogram
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  {subprograms.filter(sub => sub.programId === program.programId).length > 0 ? (
                      <Box
                          height="auto"
                          sx={{
                              "& .MuiDataGrid-root": { border: "none" },
                              "& .MuiDataGrid-cell": { borderBottom: "none", color: theme.palette.text.primary },
                              "& .MuiDataGrid-columnHeaders": {
                                  backgroundColor: `${colors.blueAccent[700]} !important`,
                                  borderBottom: "none",
                              },
                              "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
                              "& .MuiDataGrid-footerContainer": {
                                  borderTop: "none",
                                  backgroundColor: `${colors.blueAccent[700]} !important`,
                              },
                          }}
                      >
                          <DataGrid
                              rows={subprograms.filter(sub => sub.programId === program.programId)}
                              columns={subprogramColumns}
                              getRowId={(row) => row.subProgramId}
                              autoHeight
                              hideFooter
                          />
                      </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 2 }}>
                      No subprograms available for this program.
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No programs available for this plan.
          </Typography>
        )}
      </TabPanel>

      {/* Attachments Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <DataDisplayCard
              title={strategicPlanningLabels.attachments.title}
              data={attachments}
              type="attachment"
              onAdd={() => handleOpenCreateDialog('attachment', planId)}
            >
              {attachments.length > 0 ? (
                <List dense sx={{ height: '100%', overflowY: 'auto', maxHeight: CARD_CONTENT_MAX_HEIGHT }}>
                  {attachments.map(item => (
                    <ListItem
                      key={item.attachmentId}
                      secondaryAction={
                        <Box>
                          {checkUserPrivilege(user, 'planning_document.delete') && (
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete('attachment', item.attachmentId)} size="small"><DeleteIcon fontSize="small" /></IconButton>
                          )}
                        </Box>
                      }
                      sx={{ mb: 1, borderBottom: '1px solid #eee', pb: 1 }}
                    >
                      <ListItemText
                        primary={<Typography variant="body1"><strong>{item.fileName || 'N/A'}</strong></Typography>}
                        secondary={<>
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                            <strong>Description:</strong> {item.description || 'N/A'}
                          </Typography>
                        </>}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No attachments available.
                </Typography>
              )}
            </DataDisplayCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Shared Dialog for all Forms */}
      <Dialog open={openDialog} onClose={handleCloseDialogWithReset} fullWidth maxWidth="md">
        <DialogTitle>
          {currentRecord ? `Edit ${getDialogLabel(dialogType).singular}` : `Add ${getDialogLabel(dialogType).singular}`}
        </DialogTitle>
        <DialogContent dividers>
          {renderDialogForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogWithReset} disabled={loading}>Cancel</Button>
          <Button onClick={() => handleSubmit(dialogType, currentRecord, formData, handleCloseDialogWithReset, parentEntityId)} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (currentRecord ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StrategicPlanDetailsPage;