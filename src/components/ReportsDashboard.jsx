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

// Make sure all report components are imported
import DepartmentSummaryReport from './DepartmentSummaryReport'; 
import ProjectSummaryReport from './ProjectSummaryReport'; 
import SubcountySummaryReport from './SubcountySummaryReport'; 
import WardSummaryReport from './WardSummaryReport'; 
import YearlyTrendsReport from './YearlyTrendsReport'; // 👈 New import

const ReportsDashboard = () => {
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState('YearlyTrends'); // 👈 Default tab for testing
    const [filters, setFilters] = useState({});
    const [allMetadata, setAllMetadata] = useState({});
    const [metadataLoading, setMetadataLoading] = useState(true);

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

    const handleFilterChange = useCallback((event) => {
      const { name, value } = event.target;
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
      }));
    }, []);

    const handleClearFilters = useCallback(() => {
      setFilters({});
    }, []);

    const renderReportComponent = () => {
      if (metadataLoading) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading report metadata...</Typography>
          </Box>
        );
      }
      
      switch(activeTab) {
        case 'DepartmentSummary':
          return <DepartmentSummaryReport filters={filters} />;
        case 'ProjectSummary':
          return <ProjectSummaryReport filters={filters} />;
        case 'SubcountySummary':
          return <SubcountySummaryReport filters={filters} />;
        case 'WardSummary':
          return <WardSummaryReport filters={filters} />;
        case 'YearlyTrends': // 👈 New case to render the yearly trends report
          return <YearlyTrendsReport filters={filters} />;
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