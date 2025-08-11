// src/components/strategicPlan/SubprogramForm.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, TextField, Typography, Grid, Divider } from '@mui/material';

const SubprogramForm = React.memo(({ formData, handleFormChange }) => {
  const years = [1, 2, 3, 4, 5];
  
  const isInitialRender = useRef(true);

  const [formState, setFormState] = useState(() => ({
    ...formData,
    ...years.reduce((acc, year) => {
      acc[`yr${year}Budget`] = formData[`yr${year}Budget`] ? formData[`yr${year}Budget`].toLocaleString('en-US') : '';
      return acc;
    }, {})
  }));

  // Helper to parse numbers from formatted strings
  const parseNumber = useCallback((value) => {
    return parseFloat(String(value).replace(/,/g, '')) || 0;
  }, []);

  // Helper to format numbers for display
  const formatNumber = useCallback((value) => {
    if (value === null || value === undefined || value === '') return '';
    return parseFloat(value).toLocaleString('en-US');
  }, []);
  
  const totalBudget = years.reduce((sum, year) => sum + parseNumber(formState[`yr${year}Budget`]), 0);

  // This useEffect syncs parent state on initial load.
  useEffect(() => {
    if (isInitialRender.current) {
        setFormState(prev => ({
            ...prev,
            ...years.reduce((acc, year) => {
                acc[`yr${year}Budget`] = formData[`yr${year}Budget`] ? formatNumber(formData[`yr${year}Budget`]) : '';
                return acc;
            }, {}),
            totalBudget: formData.totalBudget ? formatNumber(formData.totalBudget) : ''
        }));
        isInitialRender.current = false;
    }
  }, [formData, formatNumber, years]);

  // CORRECTED: New local change handler
  const handleLocalFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  // CORRECTED: New onBlur handler to update parent state only when focus is lost
  const handleBlur = useCallback((e) => {
    const { name, value, type } = e.target;
    const isBudgetField = name.includes('Budget');
    
    let formattedValueForLocalState = value;
    let valueForParentState = value;

    if (type === 'number' || isBudgetField) {
      valueForParentState = parseNumber(value);
      formattedValueForLocalState = formatNumber(valueForParentState);
    }

    setFormState(prev => ({ ...prev, [name]: formattedValueForLocalState }));
    
    if (formData[name] !== valueForParentState) {
        handleFormChange({ target: { name, value: valueForParentState } });
    }
    
  }, [handleFormChange, parseNumber, formatNumber, formData]);

  useEffect(() => {
    if (parseNumber(formData.totalBudget) !== totalBudget) {
        handleFormChange({ target: { name: 'totalBudget', value: totalBudget } });
    }
  }, [totalBudget, formData.totalBudget, handleFormChange, parseNumber]);
  

  return (
    <Box sx={{ mt: 2, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            autoFocus
            margin="dense"
            name="subProgramme"
            label="Subprogram Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formState.subProgramme || ''}
            onChange={handleLocalFormChange}
            onBlur={handleBlur}
          />
        </Grid>
        
        <Divider sx={{ my: 2, width: '100%' }} />

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Yearly Targets & Budgets</Typography>
            <Box sx={{ width: '40%' }}>
              <TextField
                margin="none"
                name="totalBudget"
                label="Total Budget"
                type="text"
                fullWidth
                variant="filled" // CORRECTED: Changed variant to 'filled'
                value={formatNumber(totalBudget) || ''}
                InputProps={{ readOnly: true }}
                onBlur={handleBlur}
              />
            </Box>
          </Box>
          <Box sx={{ border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
            
            <Box sx={{ display: 'flex', bgcolor: 'grey.100', borderBottom: '1px solid #ccc' }}>
                <Box sx={{ width: '15%', borderRight: '1px solid #ccc' }} />
                {years.map(year => (
                    <Box key={`year-header-${year}`} sx={{ flex: 1, borderRight: '1px solid #ccc', py: 1, '&:last-child': { borderRight: 'none' } }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }} align="center">Year {year}</Typography>
                    </Box>
                ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc' }}>
                <Box sx={{ width: '15%', py: 1, borderRight: '1px solid #ccc', display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Target</Typography>
                </Box>
                {years.map(year => (
                    <Box key={`target-input-${year}`} sx={{ flex: 1, borderRight: '1px solid #ccc', px: 0.5, '&:last-child': { borderRight: 'none' } }}>
                        <TextField
                            margin="none"
                            size="small"
                            name={`yr${year}Targets`}
                            fullWidth
                            variant="outlined"
                            value={formState[`yr${year}Targets`] || ''}
                            onChange={handleLocalFormChange}
                            onBlur={handleBlur}
                        />
                    </Box>
                ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '15%', py: 1, borderRight: '1px solid #ccc', display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Budget</Typography>
                </Box>
                {years.map(year => (
                    <Box key={`budget-input-${year}`} sx={{ flex: 1, borderRight: '1px solid #ccc', px: 0.5, '&:last-child': { borderRight: 'none' } }}>
                        <TextField
                            margin="none"
                            size="small"
                            name={`yr${year}Budget`}
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formState[`yr${year}Budget`] || ''}
                            onChange={handleLocalFormChange}
                            onBlur={handleBlur}
                        />
                    </Box>
                ))}
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <TextField
                    margin="dense"
                    name="kpi"
                    label="Key Performance Indicator (KPI)"
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={formState.kpi || ''}
                    onChange={handleLocalFormChange}
                    onBlur={handleBlur}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                margin="dense"
                name="keyOutcome"
                label="Key Outcome"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={formState.keyOutcome || ''}
                onChange={handleLocalFormChange}
                onBlur={handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                margin="dense"
                name="remarks"
                label="Remarks"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={formState.remarks || ''}
                onChange={handleLocalFormChange}
                onBlur={handleBlur}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
});

export default SubprogramForm;