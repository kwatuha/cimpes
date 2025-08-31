// src/components/ProjectManagerReviewPanel.jsx

import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button,
    Box,
    Typography
} from '@mui/material';
import SubcountySummaryReport from './SubcountySummaryReport';

const ProjectManagerReviewPanel = ({ 
    open, 
    onClose, 
    projectId, 
    projectName, 
    paymentJustification, 
    handleOpenDocumentUploader 
}) => {
    // Create filters for the subcounty report based on the current project
    const filters = {
        projectId: projectId
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="xl" 
            fullWidth
            PaperProps={{
                sx: {
                    minHeight: '80vh',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle>
                <Typography variant="h5" component="h2">
                    Project Manager Review Panel - {projectName}
                </Typography>
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <SubcountySummaryReport filters={filters} />
                </Box>
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProjectManagerReviewPanel;