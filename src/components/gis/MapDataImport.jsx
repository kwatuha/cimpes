// src/components/gis/MapDataImport.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Grid,
  Paper,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import useCrudOperations from '../../hooks/useCrudOperations';
import apiService from '../../api'; // Import your main api service object

/**
 * A component to handle the input of project map data.
 * Users can either enter coordinates or paste GeoJSON data.
 * @param {object} props
 * @param {function} props.onSuccess - Callback function to run after a successful data submission.
 */
function MapDataImport({ onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    projectId: '',
    geojson: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // The useCrudOperations hook is designed for CRUD actions.
  // We'll set a placeholder serviceType and a dummy callback for this component's specific needs.
  const { loading, handleSubmit } = useCrudOperations(
    'projects', // Placeholder service type, we'll manually call the API
    onSuccess,
    ({ message, severity }) => {
        if (severity === 'error') {
            setError(message);
            setSuccess('');
        } else {
            setSuccess(message);
            setError('');
        }
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMapDataSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // A simple validation check
    if (!formData.projectId || !formData.geojson) {
      setError('Please provide both a Project ID and GeoJSON data.');
      return;
    }

    try {
      // Check for user permissions here
      // This is a new custom check, assuming a privilege like 'projects.create_map_data' exists
      if (!user || !user.privileges || !user.privileges.includes('projects.create_map_data')) {
        setError('You do not have permission to create map data.');
        return;
      }

      const mapData = {
        projectId: formData.projectId,
        map: formData.geojson,
      };

      // We'll call the API directly instead of relying on the dynamic `useCrudOperations` hook
      // to ensure the correct endpoint is hit.
      await apiService.projectService.createProjectMap(mapData);
      
      setSuccess('Map data imported successfully!');
      if (onSuccess) {
        onSuccess();
      }
      setFormData({ projectId: '', geojson: '' }); // Clear the form
    } catch (err) {
      console.error('Error importing map data:', err);
      setError(err.response?.data?.message || 'Failed to import map data.');
    }
  };

  return (
    <Box component={Paper} elevation={3} sx={{ p: 4, my: 3 }}>
      <Typography variant="h5" gutterBottom>
        Import Project Map Data
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter or paste GeoJSON data to associate it with a project. Supported geometry types are Point, LineString, and Polygon.
      </Typography>
      <form onSubmit={handleMapDataSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project ID"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              placeholder="e.g., 12345"
              required
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="GeoJSON Data"
              name="geojson"
              value={formData.geojson}
              onChange={handleChange}
              placeholder='e.g., { "type": "FeatureCollection", "features": [ ... ] }'
              required
              disabled={loading}
            />
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          {success && (
            <Grid item xs={12}>
              <Alert severity="success">{success}</Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Importing...' : 'Import Data'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default MapDataImport;
