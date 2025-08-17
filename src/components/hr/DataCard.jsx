import React from 'react';
import { Box, Typography, Stack, IconButton, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function DataCard({
  item,
  fields,
  modalType,
  hasPrivilege,
  handleOpenEditModal,
  handleOpenDeleteConfirmModal,
}) {
  const getDisplayValue = (value, key) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    if (key.includes('Date') || key.includes('Period')) {
      return value.slice(0, 10);
    }
    // Specific formatting for different field types
    if (key === 'baseSalary' || key === 'allowances' || key === 'bonuses' || key === 'grossSalary' || key === 'netSalary' || key === 'loanAmount') {
      return `$${value}`;
    }
    if (key === 'isPrimary') {
        return value === 1 ? 'Yes' : 'No';
    }
    return value;
  };
    
  const getDeletionMessage = () => {
    const defaultName = item.name || item.title || item.groupName || item.courseName || item.benefitName || item.assetName || item.dependantName;
    
    switch (modalType) {
        case 'performance.review': return `performance review on ${item.reviewDate}`;
        case 'employee': return `employee: ${item.firstName} ${item.lastName}`;
        case 'leave.type': return `leave type: ${defaultName}`;
        case 'leave.application': return `leave application for ${defaultName}`;
        case 'job.group': return `job group: ${defaultName}`;
        case 'compensation': return `compensation record for ${defaultName}`;
        case 'training': return `training record for ${defaultName}`;
        case 'disciplinary': return `disciplinary record for ${defaultName}`;
        case 'contracts': return `contract for ${defaultName}`;
        case 'retirements': return `retirement record for ${defaultName}`;
        case 'loans': return `loan record for ${defaultName}`;
        case 'payroll': return `payroll record for ${defaultName}`;
        case 'dependants': return `dependant record for ${defaultName}`;
        case 'terminations': return `termination record for ${defaultName}`;
        case 'bank.details': return `bank details for ${defaultName}`;
        case 'memberships': return `membership record for ${defaultName}`;
        case 'benefits': return `benefit record for ${defaultName}`;
        case 'assigned.assets': return `asset assignment for ${defaultName}`;
        case 'promotions': return `promotion record`;
        case 'project.assignments': return `project assignment for ${defaultName}`;
        default: return '';
    }
  };

  return (
    // The 'backgroundColor' property has been removed from the sx prop below
    <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: '8px', position: 'relative' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }}>
        {fields.map((field) => (
          <Box key={field.key} sx={{ flexGrow: 1, minWidth: '100px' }}>
            <Typography variant="subtitle2" color="text.secondary">{field.label}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {field.customRenderer ? field.customRenderer(item[field.key]) : getDisplayValue(item[field.key], field.key)}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        {hasPrivilege(`${modalType}.update`) && (
          <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(item, modalType)}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        {hasPrivilege(`${modalType}.delete`) && (
          <IconButton
            size="small"
            color="error"
            onClick={() => handleOpenDeleteConfirmModal(item.id, getDeletionMessage(), modalType)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
}