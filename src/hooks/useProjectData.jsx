import { useState, useEffect, useCallback } from 'react';
import apiService from '../api';
import { checkUserPrivilege } from '../utils/tableHelpers';

const useProjectData = (user, authLoading, filterState) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [allMetadata, setAllMetadata] = useState({
    departments: [],
    sections: [],
    financialYears: [],
    programs: [],
    subPrograms: [],
    counties: [],
    subcounties: [],
    wards: [],
    projectCategories: [],
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    if (!user || !checkUserPrivilege(user, 'project.read_all')) {
      setProjects([]);
      setLoading(false);
      setError("You do not have 'project.read_all' privilege to view projects.");
      return;
    }

    const filterParams = Object.fromEntries(
      Object.entries(filterState).filter(([key, value]) => value !== '' && value !== null)
    );

    try {
      const data = await apiService.projects.getProjects(filterParams);
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
      setError(err.response?.data?.message || err.message || "Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, filterState]);

  const fetchAllMetadata = useCallback(async () => {
    if (authLoading || !user) return;

    try {
      const [
        departments, financialYears, programs, counties, projectCategories
      ] = await Promise.all([
        apiService.metadata.departments.getAllDepartments(),
        apiService.metadata.financialYears.getAllFinancialYears(),
        apiService.metadata.programs.getAllPrograms(),
        apiService.metadata.counties.getAllCounties(),
        apiService.metadata.projectCategories.getAllCategories(),
      ]);

      const newMetadata = { departments, financialYears, programs, counties, projectCategories };

      if (filterState.departmentId) {
        newMetadata.sections = await apiService.metadata.departments.getSectionsByDepartment(filterState.departmentId);
      }
      if (filterState.programId) {
        newMetadata.subPrograms = await apiService.metadata.programs.getSubProgramsByProgram(filterState.programId);
      }
      if (filterState.countyId) {
        newMetadata.subcounties = await apiService.metadata.counties.getSubcountiesByCounty(filterState.countyId);
      }
      if (filterState.subcountyId) {
        newMetadata.wards = await apiService.metadata.subcounties.getWardsBySubcounty(filterState.subcountyId);
      }
      
      setAllMetadata(newMetadata);

    } catch (err) {
      console.error("Error fetching metadata:", err);
      setSnackbar({ open: true, message: 'Failed to load some dropdown options.', severity: 'error' });
    }
  }, [authLoading, user, filterState]);

  useEffect(() => {
    if (!authLoading && user) {
        fetchProjects();
        fetchAllMetadata();
    }
  }, [authLoading, user, fetchProjects, fetchAllMetadata]);

  return {
    projects,
    loading,
    error,
    snackbar,
    setSnackbar,
    allMetadata,
    fetchProjects,
  };
};

export default useProjectData;