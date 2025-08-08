// src/components/gis/ProjectsLayer.jsx
import React, { useState, useEffect } from 'react';
import { MarkerF, InfoWindowF } from '@react-google-maps/api';

// IMPORTED: getProjectStatusBackgroundColor and getProjectStatusTextColor from the utils folder
import { getProjectStatusBackgroundColor, getProjectStatusTextColor } from '../../utils/projectStatusColors';


/**
 * A React component that renders a layer of projects on a Google Map.
 * @param {object} props
 * @param {Array<object>} props.data - An array of project objects.
 */
function ProjectsLayer({ data }) {
  // CORRECTED: State now stores the ID of the selected marker, not the full object.
  // This is a more reliable way to manage which InfoWindow is open.
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [projectIcon, setProjectIcon] = useState(null);

  // Use an effect to create the icon once the Google Maps API is ready
  useEffect(() => {
    // Check if window.google is defined before trying to access its properties
    if (window.google && window.google.maps) {
      // UPDATED: Using a red-dot icon for better visibility
      setProjectIcon({
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(32, 32),
      });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Return null if data or icon is not yet available
  if (!data || data.length === 0 || !projectIcon) {
    return null; 
  }
  
  return (
    <>
      {data.map(project => {
        // Use a consistent ID for the key to prevent re-renders
        // Use projectId and mapId for a unique key
        const keyId = `${project.projectId}-${project.mapId}`;
        
        let position;
        
        if (project.parsedMap && project.parsedMap.features && project.parsedMap.features[0]) {
            const firstFeature = project.parsedMap.features[0];
            if (firstFeature.geometry && firstFeature.geometry.coordinates) {
                // For a Point, coordinates is [longitude, latitude]
                const [lng, lat] = firstFeature.geometry.coordinates;
                position = { lat: parseFloat(lat), lng: parseFloat(lng) };
            }
        } else {
            return null; // Skip if no valid coordinates
        }
        
        return (
          <MarkerF
            key={keyId}
            position={position}
            icon={projectIcon}
            // UPDATED: Set the state with the unique key of the clicked project.
            onClick={() => setSelectedMarkerId(keyId)}
          >
            {/* CORRECTED: The InfoWindow only opens for the marker with the matching keyId */}
            {selectedMarkerId === keyId && (
              <InfoWindowF
                position={position}
                onCloseClick={() => setSelectedMarkerId(null)}
              >
                <div>
                  <h4>{project.projectName}</h4>
                  {/* REMOVED: The project ID entry from the info window */}
                  {/* NEW: Display project status as a colored badge */}
                  <p>
                    Status: 
                    <span style={{
                      backgroundColor: getProjectStatusBackgroundColor(project.status),
                      color: getProjectStatusTextColor(project.status),
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      display: 'inline-block',
                      minWidth: '80px',
                      textAlign: 'center',
                    }}>
                      {project.status}
                    </span>
                  </p>
                  {/* NEW: Formatted project cost to display as KES with commas */}
                  {project.costOfProject && (
                      <p>Cost: KES {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(project.costOfProject)}</p>
                  )}
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        );
      })}
    </>
  );
}

export default ProjectsLayer;
