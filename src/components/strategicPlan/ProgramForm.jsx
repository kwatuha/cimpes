// src/components/strategicPlan/ProgramForm.jsx
import React from 'react';
import { Box, TextField, Typography, Grid } from '@mui/material';

const ProgramForm = React.memo(({ formData, handleFormChange }) => {
  return (
    <Box sx={{ mt: 2, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            autoFocus
            margin="dense"
            name="programme"
            label="Program Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.programme || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={formData.description || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="needsPriorities"
            label="Needs & Priorities"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.needsPriorities || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="strategies"
            label="Strategies"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.strategies || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="objectives"
            label="Objectives"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.objectives || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="outcomes"
            label="Outcomes"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.outcomes || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="remarks"
            label="Remarks"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.remarks || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

export default ProgramForm;