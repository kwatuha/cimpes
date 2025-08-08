// src/components/ProjectFilters.jsx

import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Stack, useTheme, Accordion, AccordionSummary, AccordionDetails, Chip, Grid,
} from '@mui/material';
import { FilterList as FilterListIcon, Clear as ClearIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { getProjectStatusBackgroundColor, getProjectStatusTextColor } from '../utils/tableHelpers';

const ProjectFilters = ({
  filterState,
  handleFilterChange,
  handleApplyFilters,
  handleClearFilters,
  allMetadata, // Now receives metadata as a prop
}) => {
  const theme = useTheme();
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const projectStatuses = [
    'Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled',
    'At Risk', 'Stalled', 'Delayed', 'Closed', 'Planning', 'Initiated'
  ];
  
  // Helper to get a human-readable summary of active filters
  const getFilterSummary = () => {
    const activeFilters = [];
    if (filterState.projectName) activeFilters.push(`Project: "${filterState.projectName}"`);
    if (filterState.status) activeFilters.push(`Status: ${filterState.status}`);
    if (filterState.departmentId) {
      const deptName = allMetadata.departments.find(d => String(d.departmentId) === String(filterState.departmentId))?.name;
      if (deptName) activeFilters.push(`Department: ${deptName}`);
    }
    if (filterState.finYearId) {
      const finYearName = allMetadata.financialYears.find(fy => String(fy.finYearId) === String(filterState.finYearId))?.finYearName;
      if (finYearName) activeFilters.push(`FY: ${finYearName}`);
    }
    if (filterState.programId) {
      const progName = allMetadata.programs.find(p => String(p.programId) === String(filterState.programId))?.programme;
      if (progName) activeFilters.push(`Program: ${progName}`);
    }
    if (filterState.countyId) {
      const countyName = allMetadata.counties.find(c => String(c.countyId) === String(filterState.countyId))?.name;
      if (countyName) activeFilters.push(`County: ${countyName}`);
    }
    if (activeFilters.length === 0) {
      return 'No filters applied';
    }
    return activeFilters.join(', ');
  };

  // Use a fallback empty array for dynamic metadata to prevent undefined errors
  const departments = allMetadata.departments || [];
  const sections = allMetadata.sections || [];
  const financialYears = allMetadata.financialYears || [];
  const programs = allMetadata.programs || [];
  const subPrograms = allMetadata.subPrograms || [];
  const counties = allMetadata.counties || [];
  const subcounties = allMetadata.subcounties || [];
  const wards = allMetadata.wards || [];

  return (
    <>
      <Accordion expanded={filtersExpanded} onChange={() => setFiltersExpanded(!filtersExpanded)} sx={{ mb: 3, borderRadius: '8px', boxShadow: theme.shadows[2] }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '8px 8px 0 0' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterListIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>Filter Projects</Typography>
            {!filtersExpanded && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', ml: 1 }}>{getFilterSummary()}</Typography>
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Grid container spacing={2} alignItems="flex-end">
            {/* Filter Text Fields */}
            <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Project Name" name="projectName" value={filterState.projectName} onChange={handleFilterChange} variant="outlined" size="small" /></Grid>
            <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Start Date" name="startDate" type="date" value={filterState.startDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} variant="outlined" size="small" /></Grid>
            <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="End Date" name="endDate" type="date" value={filterState.endDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} variant="outlined" size="small" /></Grid>

            {/* Filter Selects */}
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small"><InputLabel shrink color="primary" sx={{ fontWeight: 'bold' }}>Status</InputLabel><Select label="Status" name="status" value={filterState.status} onChange={handleFilterChange}><MenuItem value=""><em>All</em></MenuItem>{projectStatuses.map(status => (<MenuItem key={status} value={status}><Box component="span" sx={{ backgroundColor: getProjectStatusBackgroundColor(status), color: getProjectStatusTextColor(status), padding: '4px 8px', borderRadius: '4px', display: 'inline-block', minWidth: '80px', textAlign: 'center', fontWeight: 'bold' }}>{status}</Box></MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small"><InputLabel shrink color="primary" sx={{ fontWeight: 'bold' }}>Department</InputLabel><Select label="Department" name="departmentId" value={filterState.departmentId} onChange={handleFilterChange}><MenuItem value=""><em>All</em></MenuItem>{departments.map(dept => (<MenuItem key={dept.departmentId} value={String(dept.departmentId)}>{dept.name}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small" disabled={!filterState.departmentId}><InputLabel shrink color="primary" sx={{ fontWeight: 'bold' }}>Section</InputLabel><Select label="Section" name="sectionId" value={filterState.sectionId} onChange={handleFilterChange}><MenuItem value=""><em>All</em></MenuItem>{sections.map(sec => (<MenuItem key={sec.sectionId} value={String(sec.sectionId)}>{sec.name}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small"><InputLabel shrink color="primary" sx={{ fontWeight: 'bold' }}>Financial Year</InputLabel><Select label="Financial Year" name="finYearId" value={filterState.finYearId} onChange={handleFilterChange}><MenuItem value=""><em>All</em></MenuItem>{financialYears.map(fy => (<MenuItem key={fy.finYearId} value={String(fy.finYearId)}>{fy.finYearName}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small"><InputLabel shrink color="primary" sx={{ fontWeight: 'bold' }}>Program</InputLabel><Select label="Program" name="programId" value={filterState.programId} onChange={handleFilterChange}><MenuItem value=""><em>All</em></MenuItem>{programs.map(prog => (<MenuItem key={prog.programId} value={String(prog.programId)}>{prog.programme}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small" disabled={!filterState.programId}><InputLabel shrink color="primary" sx={{ fontWeight: 'bold' }}>Sub-Program</InputLabel><Select label="Sub-Program" name="subProgramId" value={filterState.subProgramId} onChange={handleFilterChange}><MenuItem value=""><em>All</em></MenuItem>{subPrograms.map(subProg => (<MenuItem key={subProg.subProgramId} value={String(subProg.subProgramId)}>{subProg.subProgramme}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small"><InputLabel shrink color="primary" sx={{ fontWeight: 'bold' }}>County</InputLabel><Select label="County" name="countyId" value={filterState.countyId} onChange={handleFilterChange}><MenuItem value=""><em>All</em></MenuItem>{counties.map(county => (<MenuItem key={county.countyId} value={String(county.countyId)}>{county.name}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small" disabled={!filterState.countyId}><InputLabel shrink color="primary" sx={{ fontWeight: 'bold' }}>Sub-County</InputLabel><Select label="Sub-County" name="subcountyId" value={filterState.subcountyId} onChange={handleFilterChange}><MenuItem value=""><em>All</em></MenuItem>{subcounties.map(subc => (<MenuItem key={subc.subcountyId} value={String(subc.subcountyId)}>{subc.name}</MenuItem>))}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth variant="outlined" size="small" disabled={!filterState.subcountyId}><InputLabel shrink color="primary" sx={{ fontWeight: 'bold' }}>Ward</InputLabel><Select label="Ward" name="wardId" value={filterState.wardId} onChange={handleFilterChange}><MenuItem value=""><em>All</em></MenuItem>{wards.map(ward => (<MenuItem key={ward.wardId} value={String(ward.wardId)}>{ward.name}</MenuItem>))}</Select></FormControl></Grid>
            
            {/* Action Buttons */}
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<FilterListIcon />} onClick={handleApplyFilters} sx={{ flexGrow: 1, backgroundColor: theme.palette.primary.main }} >Apply Filters</Button>
                <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters} sx={{ flexGrow: 1 }} >Clear</Button>
              </Stack>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      {/* Active Filter Chips */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {filterState.projectName && (<Chip label={`Project: ${filterState.projectName}`} onDelete={() => handleFilterChange({ target: { name: 'projectName', value: '' } })} color="primary" variant="outlined" />)}
          {filterState.status && (<Chip label={`Status: ${filterState.status}`} onDelete={() => handleFilterChange({ target: { name: 'status', value: '' } })} color="primary" variant="outlined" />)}
          {filterState.departmentId && (<Chip label={`Dept: ${departments.find(d => String(d.departmentId) === String(filterState.departmentId))?.name || filterState.departmentId}`} onDelete={() => handleFilterChange({ target: { name: 'departmentId', value: '' } })} color="primary" variant="outlined" />)}
          {filterState.sectionId && (<Chip label={`Section: ${sections.find(s => String(s.sectionId) === String(filterState.sectionId))?.name || filterState.sectionId}`} onDelete={() => handleFilterChange({ target: { name: 'sectionId', value: '' } })} color="primary" variant="outlined" />)}
          {filterState.finYearId && (<Chip label={`FY: ${financialYears.find(fy => String(fy.finYearId) === String(filterState.finYearId))?.finYearName || filterState.finYearId}`} onDelete={() => handleFilterChange({ target: { name: 'finYearId', value: '' } })} color="primary" variant="outlined" />)}
          {filterState.programId && (<Chip label={`Program: ${programs.find(p => String(p.programId) === String(filterState.programId))?.programme || filterState.programId}`} onDelete={() => handleFilterChange({ target: { name: 'programId', value: '' } })} color="primary" variant="outlined" />)}
          {filterState.subProgramId && (<Chip label={`Sub-Program: ${subPrograms.find(sp => String(sp.subProgramId) === String(filterState.subProgramId))?.subProgramme || filterState.subProgramId}`} onDelete={() => handleFilterChange({ target: { name: 'subProgramId', value: '' } })} color="primary" variant="outlined" />)}
          {filterState.countyId && (<Chip label={`County: ${counties.find(c => String(c.countyId) === String(filterState.countyId))?.name || filterState.countyId}`} onDelete={() => handleFilterChange({ target: { name: 'countyId', value: '' } })} color="primary" variant="outlined" />)}
          {filterState.subcountyId && (<Chip label={`Sub-County: ${subcounties.find(sc => String(sc.subcountyId) === String(filterState.subcountyId))?.name || filterState.subcountyId}`} onDelete={() => handleFilterChange({ target: { name: 'subcountyId', value: '' } })} color="primary" variant="outlined" />)}
          {filterState.wardId && (<Chip label={`Ward: ${wards.find(w => String(w.wardId) === String(filterState.wardId))?.name || filterState.wardId}`} onDelete={() => handleFilterChange({ target: { name: 'wardId', value: '' } })} color="primary" variant="outlined" />)}
        </Stack>
      </Box>
    </>
  );
};

export default ProjectFilters;