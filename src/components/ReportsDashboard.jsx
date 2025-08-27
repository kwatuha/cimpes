// src/components/ReportsDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Stack,
  useTheme
} from '@mui/material';
import ReportFilters from './ReportFilters';
import ReportTabs from './ReportTabs';
import apiService from '../api';

// Make sure to import all of the report components
import DepartmentSummaryReport from './DepartmentSummaryReport'; 
import ProjectSummaryReport from './ProjectSummaryReport'; 
import SubcountySummaryReport from './SubcountySummaryReport'; // 👈 New import

const ReportsDashboard = () => {
    const theme = useTheme();

    // The activeTab state controls which report component to display
    const [activeTab, setActiveTab] = useState('SubcountySummary');
    
    // The filters state is shared across the entire dashboard
    const [filters, setFilters] = useState({});
    
    // State for fetching metadata for filters (e.g., dropdown options)
    const [allMetadata, setAllMetadata] = useState({});
    const [metadataLoading, setMetadataLoading] = useState(true);

    // Fetch all metadata needed for the filters once on component mount
    useEffect(() => {
      const fetchMetadata = async () => {
        try {
          const fetchedMetadata = await apiService.metadata.getAllMetadata();
          setAllMetadata(fetchedMetadata);
        } catch (err) {
          console.error("Failed to fetch metadata:", err);
        } finally {
          setMetadataLoading(false);
        }
      };
      fetchMetadata();
    }, []);

    // Memoized function to handle changes from the ReportFilters component
    const handleFilterChange = useCallback((event) => {
      const { name, value } = event.target;
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
      }));
    }, []);

    // Memoized function to clear all filters
    const handleClearFilters = useCallback(() => {
      setFilters({});
    }, []);

    // Function to conditionally render the correct report component
    const renderReportComponent = () => {
      if (metadataLoading) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading report metadata...</Typography>
          </Box>
        );
      }
      
      // Each report component now fetches its own data
      switch(activeTab) {
        case 'DepartmentSummary':
          return <DepartmentSummaryReport filters={filters} />;
        case 'ProjectSummary':
          return <ProjectSummaryReport filters={filters} />;
        case 'SubcountySummary': // 👈 New case to render the subcounty report
          return <SubcountySummaryReport filters={filters} />;
        default:
          return (
             <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <Typography variant="h6">Select a report to view.</Typography>
            </Box>
          );
      }
    };

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 3 }}>
          Comprehensive Reports
        </Typography>
        
        <ReportFilters
          filterState={filters}
          handleFilterChange={handleFilterChange}
          handleApplyFilters={() => {}}
          handleClearFilters={handleClearFilters}
          allMetadata={allMetadata}
        />

        <ReportTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', mt: 3 }}>
          {renderReportComponent()}
        </Paper>
      </Box>
    );
};

export default ReportsDashboard;