// src/pages/StrategicPlanDetailsPage.jsx
import React, { useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button,
  Grid, Snackbar, Tabs, Tab, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Paper,
  List, ListItem, ListItemText, IconButton,
  Accordion, AccordionSummary, AccordionDetails,
  Divider, ListItemButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack as ArrowBackIcon, FileDownload as FileDownloadIcon,
  Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon
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
import SubprogramForm from '../components/strategicPlan/SubprogramForm';
import AttachmentForm from '../components/strategicPlan/AttachmentForm';

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


function StrategicPlanDetailsPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const {
    strategicPlan, programs, subprograms, attachments,
    loading: dataLoading, error, fetchStrategicPlanData
  } = useStrategicPlanDetails(planId);

  const {
    openDialog, dialogType, currentRecord, formData, handleFormChange,
    handleOpenCreateDialog, handleOpenEditDialog, handleCloseDialog, setFormData
  } = useFormManagement();

  const {
    loading: crudLoading, handleSubmit, handleDelete, handleDownloadPdf
  } = useCrudOperations('strategy', fetchStrategicPlanData, setSnackbar);

  const loading = dataLoading || crudLoading;

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue !== 1) {
        setSelectedProgram(null);
    }
  };

  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
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

  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  const renderDialogForm = () => {
    const commonProps = { formData, handleFormChange };
    const jsonInputListProps = { ...commonProps, setFormData };

    switch (dialogType) {
      case 'strategicPlan': return <StrategicPlanForm {...commonProps} />;
      case 'program': return <ProgramForm {...commonProps} />;
      case 'subprogram': return <SubprogramForm {...commonProps} setFormData={setFormData} />;
      case 'attachment': return <AttachmentForm {...jsonInputListProps} />;
      default: return <Typography>No form available for this type.</Typography>;
    }
  };

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
            <Typography variant="subtitle1" color="inherit">{strategicPlanningLabels.strategicPlan.fields.cidpName}:</Typography>
            <Typography variant="h6" color="inherit" sx={{ wordBreak: 'break-word' }}>{strategicPlan.cidpName || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="inherit">{strategicPlanningLabels.strategicPlan.fields.cidpid}:</Typography>
            <Typography variant="h6" color="inherit">{strategicPlan.cidpid || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="inherit">{strategicPlanningLabels.strategicPlan.fields.startDate}:</Typography>
            <Typography variant="h6" color="inherit">{strategicPlan.startDate || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="inherit">{strategicPlanningLabels.strategicPlan.fields.endDate}:</Typography>
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

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <DataDisplayCard
              title={strategicPlanningLabels.strategicPlan.singular}
              data={strategicPlan}
              type="strategicPlan"
              onAdd={handleOpenCreateDialog}
              onEdit={handleOpenEditDialog}
              onDelete={handleDelete}
            >
              <Typography variant="body1" sx={{ mb: 1 }}><strong>{strategicPlanningLabels.strategicPlan.fields.cidpName}:</strong> {strategicPlan.cidpName || 'N/A'}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>{strategicPlanningLabels.strategicPlan.fields.cidpid}:</strong> {strategicPlan.cidpid || 'N/A'}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>{strategicPlanningLabels.strategicPlan.fields.startDate}:</strong> {strategicPlan.startDate || 'N/A'}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>{strategicPlanningLabels.strategicPlan.fields.endDate}:</strong> {strategicPlan.endDate || 'N/A'}</Typography>
              <MultiLineTextAsList text={strategicPlan.strategicGoal} label={strategicPlanningLabels.strategicPlan.fields.strategicGoal} sx={{ mb: 1.5 }} />
            </DataDisplayCard>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={selectedProgram ? 3 : 12}>
            <Box mb={2}>
              {checkUserPrivilege(user, 'program.create') && (
                <Button startIcon={<AddIcon />} variant="contained" onClick={() => handleOpenCreateDialog('program', strategicPlan.cidpid)}>
                  Add Program
                </Button>
              )}
            </Box>
            <DataDisplayCard
              title={strategicPlanningLabels.program.plural}
              data={programs}
              type="program"
            >
              {programs.length > 0 ? (
                <List dense sx={{ maxHeight: CARD_CONTENT_MAX_HEIGHT, overflowY: 'auto' }}>
                  {programs.map(program => (
                    <ListItemButton
                      key={program.programId}
                      selected={selectedProgram?.programId === program.programId}
                      onClick={() => setSelectedProgram(program)}
                      sx={{
                        py: 1.5,
                        '&.Mui-selected': {
                          borderLeft: '4px solid',
                          borderLeftColor: 'primary.main',
                          bgcolor: 'primary.light',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          },
                        },
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                        borderRadius: 1,
                        my: 0.5,
                      }}
                    >
                      <ListItemText
                        primary={<Typography variant="body1" sx={{ fontWeight: 'bold' }}>{program.programme || 'N/A'}</Typography>}
                        secondary={program.description || "No description"}
                      />
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No programs available for this plan.
                </Typography>
              )}
            </DataDisplayCard>
          </Grid>
          {selectedProgram && (
            <Grid item xs={12} md={9}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Program Details</Typography>
                  <Box>
                    {checkUserPrivilege(user, 'program.update') && (
                      <IconButton color="primary" onClick={() => handleOpenEditDialog('program', selectedProgram)}><EditIcon /></IconButton>
                    )}
                    {checkUserPrivilege(user, 'program.delete') && (
                      <IconButton color="error" onClick={() => handleDelete('program', selectedProgram.programId)}><DeleteIcon /></IconButton>
                    )}
                    {checkUserPrivilege(user, 'program_pdf.download') && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => handleDownloadPdf('program_pdf', selectedProgram.programme, selectedProgram.programId)}
                        sx={{ ml: 2 }}
                      >
                        Download Program PDF
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => setSelectedProgram(null)}
                      sx={{ ml: 2 }}
                    >
                      Back to Programs
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                  <Typography variant="body1" sx={{ mb: 1 }}><strong>{strategicPlanningLabels.program.fields.programme}:</strong> {selectedProgram.programme || 'N/A'}</Typography>
                  <MultiLineTextAsList text={selectedProgram.needsPriorities} label={strategicPlanningLabels.program.fields.needsPriorities} />
                  <MultiLineTextAsList text={selectedProgram.strategies} label={strategicPlanningLabels.program.fields.strategies} />
                  <MultiLineTextAsList text={selectedProgram.objectives} label={strategicPlanningLabels.program.fields.objectives} />
                  <MultiLineTextAsList text={selectedProgram.outcomes} label={strategicPlanningLabels.program.fields.outcomes} />
                  <MultiLineTextAsList text={selectedProgram.remarks} label={strategicPlanningLabels.program.fields.remarks} />

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2">{strategicPlanningLabels.subprogram.plural}</Typography>
                    {checkUserPrivilege(user, 'subprogram.create') && (
                      <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        size="small"
                        onClick={() => {
                          handleOpenCreateDialog('subprogram', selectedProgram.programId);
                        }}
                      >
                        Add Subprogram
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  {subprograms.filter(sub => sub.programId === selectedProgram.programId).length > 0 ? (
                    <List disablePadding dense>
                      {subprograms.filter(sub => sub.programId === selectedProgram.programId).map(item => (
                        <Accordion key={item.subProgramId} sx={{ my: 1, boxShadow: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'grey.100' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {strategicPlanningLabels.subprogram.fields.subProgramme}: {item.subProgramme || 'N/A'}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'primary.main' }}>
                              <Typography variant="body2" sx={{ display: 'block' }}>
                                <strong>{strategicPlanningLabels.subprogram.fields.kpi}:</strong> {item.kpi || 'N/A'}
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'block' }}>
                                <strong>{strategicPlanningLabels.subprogram.fields.totalBudget}:</strong> {formatCurrency(item.totalBudget)}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Grid container spacing={1}>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Yearly Targets:</Typography>
                                    <List disablePadding dense>
                                      <ListItem disableGutters>
                                        <ListItemText primary={`Year 1: ${item.yr1Targets || 'N/A'}`} />
                                      </ListItem>
                                      <ListItem disableGutters>
                                        <ListItemText primary={`Year 2: ${item.yr2Targets || 'N/A'}`} />
                                      </ListItem>
                                      <ListItem disableGutters>
                                        <ListItemText primary={`Year 3: ${item.yr3Targets || 'N/A'}`} />
                                      </ListItem>
                                      <ListItem disableGutters>
                                        <ListItemText primary={`Year 4: ${item.yr4Targets || 'N/A'}`} />
                                      </ListItem>
                                      <ListItem disableGutters>
                                        <ListItemText primary={`Year 5: ${item.yr5Targets || 'N/A'}`} />
                                      </ListItem>
                                    </List>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Yearly Budgets:</Typography>
                                    <List disablePadding dense>
                                      <ListItem disableGutters>
                                        <ListItemText primary={`Year 1: ${formatCurrency(item.yr1Budget)}`} />
                                      </ListItem>
                                      <ListItem disableGutters>
                                        <ListItemText primary={`Year 2: ${formatCurrency(item.yr2Budget)}`} />
                                      </ListItem>
                                      <ListItem disableGutters>
                                        <ListItemText primary={`Year 3: ${formatCurrency(item.yr3Budget)}`} />
                                      </ListItem>
                                      <ListItem disableGutters>
                                        <ListItemText primary={`Year 4: ${formatCurrency(item.yr4Budget)}`} />
                                      </ListItem>
                                      <ListItem disableGutters>
                                        <ListItemText primary={`Year 5: ${formatCurrency(item.yr5Budget)}`} />
                                      </ListItem>
                                    </List>
                                  </Grid>
                                </Grid>
                              </Box>
                              <MultiLineTextAsList text={item.keyOutcome} label={strategicPlanningLabels.subprogram.fields.keyOutcome} />
                              <MultiLineTextAsList text={item.remarks} label={strategicPlanningLabels.subprogram.fields.remarks} />
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No subprograms available for this program.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

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

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {currentRecord ? `Edit ${getDialogLabel(dialogType).singular}` : `Add ${getDialogLabel(dialogType).singular}`}
        </DialogTitle>
        <DialogContent dividers>
          {renderDialogForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>Cancel</Button>
          <Button onClick={() => handleSubmit(dialogType, currentRecord, formData, handleCloseDialog, dialogType === 'subprogram' ? selectedProgram.programId : planId)} variant="contained" disabled={loading}>
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
