// src/components/gis/ProjectsLayer.jsx

import React from 'react';
import { Marker, InfoWindow, Polygon, Polyline } from '@react-google-maps/api';
import { Box, Typography } from '@mui/material';

// Custom info window component for project details
const InfoWindowContent = ({ project }) => (
  <Box sx={{ p: 1 }}>
    <Typography variant="h6">{project.projectName}</Typography>
    <Typography variant="body2" color="text.secondary">{project.projectDescription || 'No description'}</Typography>
    <Typography variant="caption" color="text.disabled">Status: {project.status}</Typography>
  </Box>
);

// Helper function to extract all coordinates from a GeoJSON geometry object
const extractCoordinates = (geometry) => {
    if (!geometry) return [];
    if (geometry.type === 'Point') return [geometry.coordinates];
    if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') return geometry.coordinates;
    if (geometry.type === 'Polygon') return geometry.coordinates[0];
    if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat(Infinity);
    return [];
};

/**
 * A React component that renders a layer of projects on a Google Map from GeoJSON data.
 * @param {object} props
 * @param {Array<object>} props.data - An array of project objects with GeoJSON data.
 */
function ProjectsLayer({ data }) {
  const [selectedProject, setSelectedProject] = React.useState(null);

  if (!data || data.length === 0) {
    return null; 
  }
  
  return (
    <>
      {data.map(project => {
        if (!project.geoJson || !project.geoJson.features || project.geoJson.features.length === 0) {
            console.warn(`ProjectsLayer - Skipping project ID: ${project.id} due to missing GeoJSON features.`);
            return null;
        }

        const key = `${project.id}-${project.geoJson.mapId}`;
        const feature = project.geoJson.features[0]; // Assuming only one feature per GeoJSON for now
        const { type, coordinates } = feature.geometry;

        switch (type) {
          case 'Point':
            const pointPosition = { lat: coordinates[1], lng: coordinates[0] };
            return (
              <Marker
                key={key}
                position={pointPosition}
                title={project.projectName}
                onClick={() => setSelectedProject(project)}
              >
                {selectedProject && selectedProject.id === project.id && (
                    <InfoWindow position={pointPosition} onCloseClick={() => setSelectedProject(null)}>
                      <InfoWindowContent project={selectedProject} />
                    </InfoWindow>
                )}
              </Marker>
            );
          case 'LineString':
            const linePath = coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }));
            return (
              <Polyline
                key={key}
                path={linePath}
                options={{ strokeColor: '#FF0000', strokeWeight: 2 }}
                onClick={() => setSelectedProject(project)}
              />
            );
          case 'Polygon':
            const polygonPath = coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }));
            return (
              <Polygon
                key={key}
                paths={polygonPath}
                options={{
                  strokeColor: '#0A2342',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: '#0A2342',
                  fillOpacity: 0.35,
                }}
                onClick={() => setSelectedProject(project)}
              />
            );
          default:
            console.warn(`ProjectsLayer - Unknown geometry type: ${type} for project ID: ${project.id}`);
            return null;
        }
      })}
      
      {/* Conditionally render InfoWindow for selected polygon/polyline */}
      {selectedProject && selectedProject.geoJson && ['LineString', 'Polygon'].includes(selectedProject.geoJson.features[0].geometry.type) && (
          <InfoWindow
              position={{ lat: extractCoordinates(selectedProject.geoJson.features[0].geometry)[0][1], lng: extractCoordinates(selectedProject.geoJson.features[0].geometry)[0][0] }}
              onCloseClick={() => setSelectedProject(null)}
          >
              <InfoWindowContent project={selectedProject} />
          </InfoWindow>
      )}
    </>
  );
}

export default ProjectsLayer;