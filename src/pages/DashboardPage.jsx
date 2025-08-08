// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Grid, Card, CardContent, CircularProgress, Button } from '@mui/material';
import FilterPanel from '../components/FilterPanel';
import apiService from '../api'; // This imports the consolidated apiService
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext.jsx';

// Import Chart Components
import GenderChart from '../components/charts/GenderChart';
import AgeGroupChart from '../components/charts/AgeGroupChart';
import DiseasePrevalenceChart from '../components/charts/DiseasePrevalenceChart';

// IMPORT NEW CHART COMPONENTS
import EducationLevelChart from '../components/charts/EducationLevelChart';
import OccupationChart from '../components/charts/OccupationChart';
import MosquitoNetUseChart from '../components/charts/MosquitoNetUseChart';
import HouseholdSizeChart from '../components/charts/HouseholdSizeChart';
import HealthcareAccessChart from '../components/charts/HealthcareAccessChart';
import WaterStorageChart from '../components/charts/WaterStorageChart';
import ClimatePerceptionChart from '../components/charts/ClimatePerceptionChart';

// Initial state for summary statistics
const initialSummary = {
  totalParticipants: 'N/A',
  averageAge: 'N/A',
  malariaPrevalence: 'N/A',
  denguePrevalence: 'N/A',
};

function DashboardPage() {
  const theme = useTheme();
  const { token, logout } = useAuth();

  const [filters, setFilters] = useState({});
  const [summaryData, setSummaryData] = useState(initialSummary);
  const [demographicsData, setDemographicsData] = useState({ genderData: [], ageGroupData: [], educationLevelData: [], occupationData: [] });
  const [diseasePrevalenceData, setDiseasePrevalenceData] = useState({ malariaByCounty: [], dengueByCounty: [], mosquitoNetUse: [] });

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDemographics, setLoadingDemographics] = useState(true);
  const [loadingDiseasePrevalence, setLoadingDiseasePrevalence] = useState(true);

  // NEW STATES FOR ADDITIONAL CHARTS
  const [householdSizeData, setHouseholdSizeData] = useState([]);
  const [healthcareAccessData, setHealthcareAccessData] = useState([]);
  const [waterStorageData, setWaterStorageData] = useState([]);
  const [climatePerceptionData, setClimatePerceptionData] = useState([]);

  // NEW LOADING STATES
  const [loadingHouseholdSize, setLoadingHouseholdSize] = useState(true);
  const [loadingHealthcareAccess, setLoadingHealthcareAccess] = useState(true);
  const [loadingWaterStorage, setLoadingWaterStorage] = useState(true);
  const [loadingClimatePerception, setLoadingClimatePerception] = useState(true);

  const fetchData = useCallback(async (currentFilters) => {
    // Only attempt to fetch data if a token is present
    if (!token) {
      setLoadingSummary(false);
      setLoadingDemographics(false);
      setLoadingDiseasePrevalence(false);
      setLoadingHouseholdSize(false);
      setLoadingHealthcareAccess(false);
      setLoadingWaterStorage(false);
      setLoadingClimatePerception(false);
      return;
    }

    // --- Fetch Summary ---
    setLoadingSummary(true);
    try {
      // Corrected API call: apiService.dashboard.getSummaryStatistics
      const summary = await apiService.dashboard.getSummaryStatistics(currentFilters);
      setSummaryData(summary);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setSummaryData(initialSummary);
      if (error.response && error.response.status === 401) logout(); // Log out on auth error
    } finally {
      setLoadingSummary(false);
    }

    // --- Fetch Demographics ---
    setLoadingDemographics(true);
    try {
      // Corrected API call: apiService.dashboard.getDemographicData
      const demographics = await apiService.dashboard.getDemographicData(currentFilters);
      setDemographicsData(demographics);
    } catch (error) {
      console.error('Error fetching demographic data:', error);
      setDemographicsData({ genderData: [], ageGroupData: [], educationLevelData: [], occupationData: [] });
      if (error.response && error.response.status === 401) logout();
    } finally {
      setLoadingDemographics(false);
    }

    // --- Fetch Disease Prevalence ---
    setLoadingDiseasePrevalence(true);
    try {
      // Corrected API call: apiService.dashboard.getDiseasePrevalenceData
      const disease = await apiService.dashboard.getDiseasePrevalenceData(currentFilters);
      setDiseasePrevalenceData(disease);
    } catch (error) {
      console.error('Error fetching disease prevalence data:', error);
      setDiseasePrevalenceData({ malariaByCounty: [], dengueByCounty: [], mosquitoNetUse: [] });
      if (error.response && error.response.status === 401) logout();
    } finally {
      setLoadingDiseasePrevalence(false);
    }

    // --- NEW: Fetch Household Size Data ---
    setLoadingHouseholdSize(true);
    try {
      // Corrected API call: apiService.dashboard.getHouseholdSizeData
      const data = await apiService.dashboard.getHouseholdSizeData(currentFilters);
      setHouseholdSizeData(data);
    } catch (error) {
      console.error('Error fetching household size data:', error);
      setHouseholdSizeData([]);
      if (error.response && error.response.status === 401) logout();
    } finally {
      setLoadingHouseholdSize(false);
    }

    // --- NEW: Fetch Healthcare Access Data ---
    setLoadingHealthcareAccess(true);
    try {
      // Corrected API call: apiService.dashboard.getHealthcareAccessData
      const data = await apiService.dashboard.getHealthcareAccessData(currentFilters);
      setHealthcareAccessData(data);
    } catch (error) {
      console.error('Error fetching healthcare access data:', error);
      setHealthcareAccessData([]);
      if (error.response && error.response.status === 401) logout();
    } finally {
      setLoadingHealthcareAccess(false);
    }

    // --- NEW: Fetch Water Storage Data ---
    setLoadingWaterStorage(true);
    try {
      // Corrected API call: apiService.dashboard.getWaterStorageData
      const data = await apiService.dashboard.getWaterStorageData(currentFilters);
      setWaterStorageData(data);
    } catch (error) {
      console.error('Error fetching water storage data:', error);
      setWaterStorageData([]);
      if (error.response && error.response.status === 401) logout();
    } finally {
      setLoadingWaterStorage(false);
    }

    // --- NEW: Fetch Climate Perception Data ---
    setLoadingClimatePerception(true);
    try {
      // Corrected API call: apiService.dashboard.getClimatePerceptionData
      const data = await apiService.dashboard.getClimatePerceptionData(currentFilters);
      setClimatePerceptionData(data);
    } catch (error) {
      console.error('Error fetching climate perception data:', error);
      setClimatePerceptionData([]);
      if (error.response && error.response.status === 401) logout();
    } finally {
      setLoadingClimatePerception(false);
    }

  }, [token, logout]);

  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      {/* Filter Panel */}
      <FilterPanel onApplyFilters={handleApplyFilters} />

      {/* Summary Statistics */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Summary Statistics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loadingSummary ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading Summary...</Typography>
          </Grid>
        ) : (
          <>
            <Grid item xs={12} sm={6} lg={3}>
              <Card raised sx={{ backgroundColor: theme.palette.secondary.main }}>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    Total Participants
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {summaryData.totalParticipants}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Card raised sx={{ backgroundColor: theme.palette.secondary.main }}>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    Average Age
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {summaryData.averageAge} years
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Card raised sx={{ backgroundColor: theme.palette.secondary.main }}>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    Malaria Prevalence
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {summaryData.malariaPrevalence}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Card raised sx={{ backgroundColor: theme.palette.secondary.main }}>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    Dengue Prevalence
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {summaryData.denguePrevalence}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Charts Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Key Visualizations
      </Typography>
      <Grid container spacing={3}>
        {loadingDemographics || loadingDiseasePrevalence || loadingHouseholdSize || loadingHealthcareAccess || loadingWaterStorage || loadingClimatePerception ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading Charts...</Typography>
          </Grid>
        ) : (
          <>
            <Grid item xs={12} md={6}>
              <GenderChart data={demographicsData.genderData} />
            </Grid>
            <Grid item xs={12} md={6}>
              <AgeGroupChart data={demographicsData.ageGroupData} />
            </Grid>
            <Grid item xs={12}>
              <DiseasePrevalenceChart
                malariaData={diseasePrevalenceData.malariaByCounty}
                dengueData={diseasePrevalenceData.dengueByCounty}
              />
            </Grid>

             {/* NEW CHARTS */}
            <Grid item xs={12} md={6}>
              <EducationLevelChart data={demographicsData.educationLevelData} />
            </Grid>
            <Grid item xs={12} md={6}>
              <OccupationChart data={demographicsData.occupationData} />
            </Grid>
            <Grid item xs={12} md={6}>
              <MosquitoNetUseChart data={diseasePrevalenceData.mosquitoNetUse} />
            </Grid>
            <Grid item xs={12} md={6}>
              <HouseholdSizeChart data={householdSizeData} />
            </Grid>
            <Grid item xs={12} md={6}>
              <HealthcareAccessChart data={healthcareAccessData} />
            </Grid>
            <Grid item xs={12} md={6}>
              <WaterStorageChart data={waterStorageData} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ClimatePerceptionChart data={climatePerceptionData} />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}

export default DashboardPage;
