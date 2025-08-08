import { useState, useEffect, useCallback } from 'react';
import metaDataService from '../api/metaDataService';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Custom hook to fetch and manage data for departments and sections.
 * @returns {{
 * departments: Array,
 * loading: boolean,
 * setLoading: Function, // ADDED: Now returns the setter function
 * snackbar: { open: boolean, message: string, severity: string },
 * setSnackbar: Function,
 * fetchDepartmentsAndSections: Function,
 * }}
 */
const useDepartmentData = () => {
  const { hasPrivilege } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDepartmentsAndSections = useCallback(async () => {
    setLoading(true);
    try {
      if (!hasPrivilege('department.read_all')) {
        setDepartments([]);
        setSnackbar({ open: true, message: "Permission denied to view departments.", severity: 'error' });
        return;
      }
      
      const departmentsData = await metaDataService.departments.getAllDepartments();
      const departmentsWithSections = await Promise.all(
        departmentsData.map(async (dept) => {
          const sectionsData = await metaDataService.departments.getSectionsByDepartment(dept.departmentId);
          return { ...dept, sections: sectionsData };
        })
      );
      setDepartments(departmentsWithSections);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({ open: true, message: 'Failed to fetch data.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [hasPrivilege]);

  useEffect(() => {
    fetchDepartmentsAndSections();
  }, [fetchDepartmentsAndSections]);

  return {
    departments,
    loading,
    setLoading, // ADDED: Return the setter function
    snackbar,
    setSnackbar,
    fetchDepartmentsAndSections,
  };
};

export default useDepartmentData;