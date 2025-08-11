// src/hooks/useMapData.js

import { useState, useEffect } from 'react';
import apiService from '../api'; // Use the central apiService

/**
 * A custom hook to fetch necessary data for the GIS map with optional filters.
 * @param {{countyId?: string, subcountyId?: string, wardId?: string, projectType?: string}} filters - Optional filter object.
 * @returns {{data: {projects: Array, projectMaps: Array, boundingBox: object}, loading: boolean, error: object}}
 */
const useMapData = (filters) => {
  const [data, setData] = useState({ projects: [], projectMaps: [], boundingBox: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Call the project service directly with the filters object
        const response = await apiService.projects.getFilteredProjectMaps(filters);
        
        // The backend response is expected to have 'projects', 'projectMaps', and 'boundingBox'
        // Data is now assumed to be in camelCase from the backend
        setData({
          projects: response.projects,
          projectMaps: response.projectMaps,
          boundingBox: response.boundingBox,
        });

      } catch (err) {
        console.error("Failed to fetch map data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMapData();
    
  }, [filters]);

  return { data, loading, error };
};

export default useMapData;