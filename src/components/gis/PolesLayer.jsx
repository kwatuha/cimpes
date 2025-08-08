// src/components/gis/PolesLayer.jsx
import React, { useState, useEffect } from 'react';
import { MarkerF, InfoWindowF, PolygonF, PolylineF } from '@react-google-maps/api';

/**
 * A React component that renders a layer of poles on a Google Map.
 * This version handles and parses GeoJSON data from a string.
 * @param {object} props
 * @param {Array<object>} props.data - An array of pole objects, where the location is a GeoJSON string in the 'map' property.
 */
function PolesLayer({ data }) {
  const [openInfoWindowId, setOpenInfoWindowId] = useState(null);
  // NEW: State to hold the icon object, initialized to null
  const [poleIcon, setPoleIcon] = useState(null);

  // NEW: useEffect hook to create the icon once the Google Maps API is loaded
  useEffect(() => {
    // This code only runs after the Google Maps API script is available
    if (window.google && window.google.maps) {
      setPoleIcon({
        url: 'https://cdn-icons-png.flaticon.com/512/3257/3257406.png',
        scaledSize: new window.google.maps.Size(25, 25),
      });
    }
  }, []); // The empty dependency array ensures this runs only once on mount

  // Helper function to convert GeoJSON coordinates to Google Maps format
  const toGoogleMapsCoordinates = (coords) => {
    // GeoJSON is [lng, lat], Google Maps is { lat, lng }
    return { lat: parseFloat(coords[1]), lng: parseFloat(coords[0]) };
  };

  // Condition to prevent rendering until data and the icon are ready
  if (!data || data.length === 0 || !poleIcon) {
    return null;
  }

  return (
    <>
      {data.map(item => {
        let geoJson;
        try {
          geoJson = JSON.parse(item.map);
        } catch (e) {
          console.error("Error parsing GeoJSON for item:", item, e);
          return null;
        }

        return geoJson.features.map((feature, index) => {
          const { geometry, properties } = feature;
          const featureKey = `${item.mapId}-${index}`;
          const infoWindowContent = (
            <div>
              <h4>{properties.name || 'Unnamed Feature'}</h4>
              <p>Project ID: {item.projectId}</p>
            </div>
          );

          const infoWindow = (position) => openInfoWindowId === featureKey && (
            <InfoWindowF
              position={position}
              onCloseClick={() => setOpenInfoWindowId(null)}
            >
              {infoWindowContent}
            </InfoWindowF>
          );
          
          switch (geometry.type) {
            case 'Point':
              const position = toGoogleMapsCoordinates(geometry.coordinates);
              return (
                <MarkerF
                  key={featureKey}
                  position={position}
                  icon={poleIcon}
                  onClick={() => setOpenInfoWindowId(featureKey)}
                >
                  {infoWindow(position)}
                </MarkerF>
              );
            
            case 'MultiPoint':
              return geometry.coordinates.map((coords, subIndex) => {
                const multiPointKey = `${featureKey}-${subIndex}`;
                const multiPosition = toGoogleMapsCoordinates(coords);
                return (
                  <MarkerF
                    key={multiPointKey}
                    position={multiPosition}
                    icon={poleIcon}
                    onClick={() => setOpenInfoWindowId(multiPointKey)}
                  >
                    {infoWindow(multiPosition)}
                  </MarkerF>
                );
              });

            case 'LineString':
              const path = geometry.coordinates.map(toGoogleMapsCoordinates);
              return (
                <PolylineF
                  key={featureKey}
                  path={path}
                  options={{ strokeColor: '#FF0000', strokeWeight: 3 }}
                  onClick={() => setOpenInfoWindowId(featureKey)}
                >
                  {infoWindow(path[0])}
                </PolylineF>
              );
              
            case 'Polygon':
            case 'MultiPolygon':
              const paths = geometry.coordinates[0].map(toGoogleMapsCoordinates);
              return (
                <PolygonF
                  key={featureKey}
                  paths={paths}
                  options={{
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#0000FF',
                    fillOpacity: 0.35,
                  }}
                  onClick={() => setOpenInfoWindowId(featureKey)}
                >
                  {infoWindow(paths[0])}
                </PolygonF>
              );

            default:
              return null;
          }
        });
      })}
    </>
  );
}

export default PolesLayer;