// src/hooks/useProjectCategoryData.jsx

import { useState, useEffect, useCallback } from 'react';
import apiService from '../api/metaDataService';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Custom hook to fetch and manage data for project categories and their milestones.
 * It fetches all categories and then fetches the milestones for each category,
 * combining them into a single, comprehensive state.
 * * @returns {{
 * projectCategories: Array,
 * loading: boolean,
 * setLoading: Function,
 * snackbar: { open: boolean, message: string, severity: string },
 * setSnackbar: Function,
 * fetchCategoriesAndMilestones: Function,
 * }}
 */
const useProjectCategoryData = () => {
  const { hasPrivilege } = useAuth();
  const [projectCategories, setProjectCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCategoriesAndMilestones = useCallback(async () => {
    setLoading(true);
    try {
      if (!hasPrivilege('projectcategory.read_all')) {
        setProjectCategories([]);
        setSnackbar({ open: true, message: "Permission denied to view project categories.", severity: 'error' });
        return;
      }
      
      const categoriesData = await apiService.projectCategories.getAllCategories();
      const categoriesWithMilestones = await Promise.all(
        categoriesData.map(async (category) => {
          const milestonesData = await apiService.projectCategories.getMilestonesByCategory(category.categoryId);
          return { ...category, milestones: milestonesData };
        })
      );
      setProjectCategories(categoriesWithMilestones);
    } catch (error) {
      console.error('Error fetching project category data:', error);
      setSnackbar({ open: true, message: 'Failed to fetch categories and milestones.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [hasPrivilege]);

  useEffect(() => {
    fetchCategoriesAndMilestones();
  }, [fetchCategoriesAndMilestones]);

  return {
    projectCategories,
    loading,
    setLoading,
    snackbar,
    setSnackbar,
    fetchCategoriesAndMilestones,
  };
};

export default useProjectCategoryData;
