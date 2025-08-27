
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

// We will build this component in the next steps
import DepartmentSummaryReport from './DepartmentSummaryReport'; 

const ReportsDashboard = () => {
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState('DepartmentSummary');
    const [filters, setFilters] = useState({});
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Assuming you have a way to get metadata for filters, like in your ProjectManagementPage
    // This hook will fetch the necessary data for dropdowns once on component mount.
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

    // Function to handle filter changes
    const handleFilterChange = useCallback((event) => {
      const { name, value } = event.target;
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
      }));
    }, []);

    // Function to handle clearing filters
    const handleClearFilters = useCallback(() => {
      setFilters({});
    }, []);

    // Main data fetching effect
    useEffect(() => {
        const fetchReportData = async () => {
            setIsLoading(true);
            setError(null);
            setReportData(null); // Clear previous data
            try {
                // Fetch data based on the active tab
                let fetchedData;
                switch (activeTab) {
                    case 'DepartmentSummary':
                        fetchedData = await apiService.reports.getDepartmentSummaryReport(filters);
                        break;
                    // Add other cases for different reports here
                    // case 'ProjectSummary':
                    //     fetchedData = await apiService.reports.getProjectSummaryReport(filters);
                    //     break;
                    default:
                        fetchedData = null;
                        break;
                }
                setReportData(fetchedData);
            } catch (err) {
                setError(err.message || "An unexpected error occurred while fetching report data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReportData();
    }, [activeTab, filters]); // Re-run effect when activeTab or filters change

    // Determine which report component to render
    const renderReportComponent = () => {
      if (isLoading || metadataLoading) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading report...</Typography>
          </Box>
        );
      }
      if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
      }
      if (!reportData || reportData.length === 0) {
        return <Alert severity="info" sx={{ mt: 2 }}>No data found for this report. Try adjusting the filters.</Alert>;
      }
      
      switch(activeTab) {
        case 'DepartmentSummary':
          return <DepartmentSummaryReport data={reportData} />;
        // Add other cases for other report components here
        // case 'ProjectSummary':
        //   return <ProjectSummaryReport data={reportData} />;
        default:
          return null;
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
          handleApplyFilters={() => {/* Logic is now handled by the useEffect dependency array */}}
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