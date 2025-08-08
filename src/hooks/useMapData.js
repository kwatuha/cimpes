// src/hooks/useMapData.js
import { useState, useEffect } from 'react';
import projectService from '../api/projectService';

/**
 * A custom hook to fetch necessary data for the GIS map with optional filters.
 * @param {{countyId?: string, subcountyId?: string, wardId?: string}} filters - Optional geographical filter object.
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
        // Construct query parameters from the filters object
        const params = new URLSearchParams();
        if (filters?.countyId) {
          params.append('countyId', filters.countyId);
        }
        if (filters?.subcountyId) {
          params.append('subcountyId', filters.subcountyId);
        }
        if (filters?.wardId) {
          params.append('wardId', filters.wardId);
        }
        
        // Use a single consolidated API call to fetch all map-related data
        // The projectService.getFilteredProjectMaps function will need to be created.
        const response = await projectService.getFilteredProjectMaps(params.toString());
        
        // The backend response is expected to have 'data' and 'boundingBox' properties
        setData({
          projects: response.data,
          projectMaps: response.data, // Assuming projects and maps are combined here
          boundingBox: response.boundingBox,
        });

      } catch (err) {
        console.error("Failed to fetch map data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch data whenever the filters object changes
    fetchMapData();
    
  }, [filters]);

  return { data, loading, error };
};

export default useMapData;