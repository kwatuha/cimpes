// src/components/kdsp/KdspConceptNoteForm.jsx
import React from 'react';
import { Box, TextField, Grid } from '@mui/material';
import { formatNumberForInput } from '../../utils/helpers'; // Import if needed for other forms

function KdspConceptNoteForm({ formData, handleFormChange }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="situationAnalysis"
            label="Situation Analysis"
            fullWidth multiline rows={4}
            value={formData.situationAnalysis || ''}
            onChange={handleFormChange}
            helperText="Enter each item on a new line."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="problemStatement"
            label="Problem Statement"
            fullWidth multiline rows={4}
            value={formData.problemStatement || ''}
            onChange={handleFormChange}
            helperText="Enter each item on a new line."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="relevanceProjectIdea"
            label="Relevance of the Project Idea"
            fullWidth multiline rows={4}
            value={formData.relevanceProjectIdea || ''}
            onChange={handleFormChange}
            helperText="Enter each item on a new line."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="scopeOfProject"
            label="Scope of the Project"
            fullWidth multiline rows={4}
            value={formData.scopeOfProject || ''}
            onChange={handleFormChange}
            helperText="Enter each item on a new line."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="projectGoal"
            label="Project Goal"
            fullWidth multiline rows={2}
            value={formData.projectGoal || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="goalIndicator"
            label="Goal Indicator"
            fullWidth
            value={formData.goalIndicator || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="goalMeansVerification"
            label="Goal Means of Verification"
            fullWidth
            value={formData.goalMeansVerification || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="goalAssumptions"
            label="Goal Assumptions"
            fullWidth
            value={formData.goalAssumptions || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspConceptNoteForm;