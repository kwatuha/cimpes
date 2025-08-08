// src/components/HeatmapComponent.jsx
import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

// Hardcoded test data for heatmap (used for demo if API data is not available)
const HARDCODED_HEATMAP_DATA = [
  // Points around Nairobi, Kenya
  { lat: -1.286389, lng: 36.817223, disease_status_malaria: 'Yes' }, // Nairobi center
  { lat: -1.3000, lng: 36.7800, disease_status_malaria: 'No' },
  { lat: -1.2500, lng: 36.8500, disease_status_malaria: 'Yes' },
  { lat: -1.3200, lng: 36.8000, disease_status_malaria: 'Yes' },
  { lat: -1.2700, lng: 36.8300, disease_status_malaria: 'No' },
  { lat: -1.2900, lng: 36.8100, disease_status_malaria: 'Yes' },
  { lat: -1.3100, lng: 36.7900, disease_status_malaria: 'Yes' },
  { lat: -1.2600, lng: 36.8400, disease_status_malaria: 'No' },
  // Some points in other parts of Kenya for broader spread
  { lat: 0.5200, lng: 35.2600, disease_status_dengue: 'Yes' }, // Eldoret
  { lat: -0.0200, lng: 34.7600, disease_status_malaria: 'Yes' }, // Kisumu
  { lat: -4.0300, lng: 39.6700, disease_status_dengue: 'No' }, // Mombasa
  { lat: -0.4200, lng: 36.9500, disease_status_malaria: 'No' }, // Nakuru
  { lat: -1.0900, lng: 37.0100, disease_status_malaria: 'Yes' }, // Thika
  { lat: -1.0900, lng: 37.0100, disease_status_dengue: 'Yes' }, // Thika (high dengue)
  { lat: -1.0950, lng: 37.0150, disease_status_dengue: 'Yes' }, // Thika (high dengue)
  { lat: -1.1000, lng: 37.0200, disease_status_dengue: 'Yes' }, // Thika (high dengue)
  { lat: -1.1050, lng: 37.0250, disease_status_dengue: 'Yes' }, // Thika (high dengue)
  { lat: -1.1100, lng: 37.0300, disease_status_dengue: 'Yes' }, // Thika (high dengue)
  { lat: -1.1150, lng: 37.0350, disease_status_dengue: 'Yes' }, // Thika (high dengue)
  { lat: -1.1200, lng: 37.0400, disease_status_dengue: 'Yes' }, // Thika (high dengue)
  { lat: -1.1250, lng: 37.0450, disease_status_dengue: 'Yes' }, // Thika (high dengue)
  { lat: -1.1300, lng: 37.0500, disease_status_dengue: 'Yes' }, // Thika (high dengue)
  { lat: -1.1350, lng: 37.0550, disease_status_dengue: 'Yes' }, // Thika (high dengue)
];

// Main HeatmapComponent using ArcGIS API for JavaScript
function HeatmapComponent({ data, loading, availableProperties }) {
  const theme = useTheme();
  const mapDivRef = useRef(null); // Ref for the div that will hold the map
  const [mapView, setMapView] = useState(null); // State to hold the ArcGIS MapView instance
  const [heatmapLayer, setHeatmapLayer] = useState(null); // State to hold the heatmap GraphicsLayer
  const [arcgisLoaded, setArcgisLoaded] = useState(false); // State to track if ArcGIS API is loaded
  const [arcgisLoadError, setArcgisLoadError] = useState(null); // State to store ArcGIS loading errors

  const [selectedProperty, setSelectedProperty] = useState('disease_status_malaria');

  // Auto-detect available properties from data if not provided
  const detectedProperties = useMemo(() => {
    // In a real application, you would derive this from the 'data' prop
    // For now, using hardcoded properties as per previous instructions
    return ['disease_status_malaria', 'disease_status_dengue'];
  }, []);

  // Auto-select first available property if current selection is not available
  useEffect(() => {
    if (detectedProperties.length > 0 && !detectedProperties.includes(selectedProperty)) {
      setSelectedProperty(detectedProperties[0]);
    }
  }, [detectedProperties, selectedProperty]);

  // Process data for heatmap (same logic as before, but now for ArcGIS Graphics)
  const processedHeatmapData = useMemo(() => {
    // Use the 'data' prop if available and not empty, otherwise fall back to hardcoded data
    const sourceData = (data && data.length > 0) ? data : HARDCODED_HEATMAP_DATA; 

    if (!sourceData || sourceData.length === 0) {
      console.log('HeatmapComponent: No source data (API or hardcoded) available. Returning empty array.');
      return [];
    }

    const processed = sourceData
      .filter(p => {
        // Basic validation for lat/lng
        if (typeof p !== 'object' || p === null || !('lat' in p) || !('lng' in p)) {
          console.warn('HeatmapComponent: Invalid point format (missing lat/lng or not an object):', p);
          return false;
        }

        const lat = parseFloat(p.lat);
        const lng = parseFloat(p.lng);

        const isValidGeographic = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        const isNumeric = !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);

        const isValid = isNumeric && isValidGeographic;

        if (!isValid) {
          console.warn('HeatmapComponent: Invalid or out-of-bounds point filtered out:', p);
        }
        return isValid;
      })
      .map(p => {
        const lat = parseFloat(p.lat);
        const lng = parseFloat(p.lng);

        let intensityValue = p[selectedProperty];
        let intensity = 0.3; // Base intensity for "No" or default

        if (selectedProperty && typeof intensityValue === 'string') {
          intensity = (intensityValue.toLowerCase() === 'yes') ? 1.0 : 0.3; // 1.0 for 'Yes', 0.3 for 'No'
        } else if (typeof intensityValue === 'number') {
          intensity = Math.max(0, Math.min(1, intensityValue)); // Clamp between 0 and 1
        }

        if (!isFinite(intensity)) {
          console.warn(`HeatmapComponent: Invalid intensity value for point [${lat}, ${lng}]. Setting to default 0.3. Original:`, intensityValue);
          intensity = 0.3;
        }

        return { lat, lng, intensity };
      });

    console.log('HeatmapComponent: Processed heatmapData for ArcGIS:', processed.length, 'valid points');
    return processed;
  }, [selectedProperty, data]); // Added 'data' to dependencies

  // Calculate statistics for the selected property
  const stats = useMemo(() => {
    const sourceData = (data && data.length > 0) ? data : HARDCODED_HEATMAP_DATA;
    if (!sourceData || sourceData.length === 0) return null;
    
    const validData = sourceData.filter(p => p[selectedProperty] !== undefined);
    const totalPoints = validData.length;
    
    if (selectedProperty.includes('status')) {
      const positiveCount = validData.filter(p => 
        typeof p[selectedProperty] === 'string' && 
        p[selectedProperty].toLowerCase() === 'yes'
      ).length;
      
      return {
        total: totalPoints,
        positive: positiveCount,
        negative: totalPoints - positiveCount,
        positiveRate: totalPoints > 0 ? (positiveCount / totalPoints * 100).toFixed(1) : 0
      };
    }
    
    return { total: totalPoints };
  }, [selectedProperty, data]); // Added 'data' to dependencies

  // Effect to dynamically load ArcGIS API script and CSS
  useEffect(() => {
    console.log('HeatmapComponent: useEffect for ArcGIS API loading triggered.');
    // Check if ArcGIS API is already loaded
    if (window.require && window.require.defined && window.require.defined('esri/Map')) {
      console.log('HeatmapComponent: ArcGIS API already loaded, skipping dynamic load.');
      setArcgisLoaded(true);
      return;
    }

    console.log('HeatmapComponent: Dynamically loading ArcGIS API for JavaScript...');

    // Load ArcGIS CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://js.arcgis.com/4.29/esri/themes/light/main.css';
    document.head.appendChild(link);
    console.log('HeatmapComponent: ArcGIS CSS link appended to head.');

    // Load ArcGIS API script
    const script = document.createElement('script');
    script.src = 'https://js.arcgis.com/4.29/';
    script.async = true;
    script.onload = () => {
      console.log('HeatmapComponent: ArcGIS API script loaded successfully.');
      setArcgisLoaded(true);
      setArcgisLoadError(null); // Clear any previous errors
    };
    script.onerror = (error) => {
      console.error('HeatmapComponent: Failed to load ArcGIS API script:', error);
      setArcgisLoadError('Failed to load ArcGIS API. Please check your internet connection or try again later.');
      setArcgisLoaded(false);
    };
    document.body.appendChild(script);
    console.log('HeatmapComponent: ArcGIS JS script appended to body.');

    return () => {
      console.log('HeatmapComponent: Cleaning up ArcGIS script and link tags.');
      // Clean up script and link tags on component unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
      // Optionally, clear any ArcGIS resources if necessary
      if (mapView) {
        mapView.destroy();
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Effect to initialize the map and heatmap layer once ArcGIS API is loaded
  useEffect(() => {
    console.log('HeatmapComponent: useEffect for MapView initialization triggered. arcgisLoaded:', arcgisLoaded, 'mapDivRef.current:', mapDivRef.current, 'mapView:', mapView);
    if (arcgisLoaded && mapDivRef.current && !mapView) {
      console.log('HeatmapComponent: Initializing ArcGIS MapView...');
      window.require([
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/GraphicsLayer',
        'esri/Graphic',
        'esri/renderers/HeatmapRenderer'
      ], (Map, MapView, GraphicsLayer, Graphic, HeatmapRenderer) => {
        try {
          console.log('HeatmapComponent: ArcGIS modules loaded via require().');
          const map = new Map({
            basemap: 'topo-vector' // 'streets-navigation-vector', 'satellite', 'topo-vector'
          });
          console.log('HeatmapComponent: ArcGIS Map created.');

          // Create a GraphicsLayer for the heatmap
          const newHeatmapLayer = new GraphicsLayer({
            id: 'heatmapLayer',
            renderer: new HeatmapRenderer({
              field: 'intensity', // The field in the graphic's attributes that will drive intensity
              colorStops: [
                { ratio: 0, color: 'rgba(0, 255, 0, 0)' },   // Green (transparent)
                { ratio: 0.1, color: 'rgba(0, 255, 0, 0.5)' }, // Green (more opaque)
                { ratio: 0.5, color: 'rgba(255, 255, 0, 0.7)' }, // Yellow
                { ratio: 0.8, color: 'rgba(255, 140, 0, 0.8)' }, // Orange
                { ratio: 1, color: 'rgba(255, 0, 0, 0.9)' }    // Red
              ],
              blurRadius: 15, // Adjust for desired heatmap spread
              maxPixelIntensity: 100, // Adjust for desired intensity scale
              minPixelIntensity: 0
            })
          });
          map.add(newHeatmapLayer);
          setHeatmapLayer(newHeatmapLayer);
          console.log('HeatmapComponent: Heatmap GraphicsLayer created and added to map.');

          const view = new MapView({
            container: mapDivRef.current,
            map: map,
            center: [37.8, -0.02], // Approximate center of Kenya [longitude, latitude]
            zoom: 6, // Zoom level
            popup: {
              dockEnabled: true,
              dockOptions: {
                // Disables the dock button from the popup
                buttonEnabled: false,
                // Ignore the default sizes that trigger docking
                breakpoint: false
              }
            }
          });

          view.when(() => {
            console.log('HeatmapComponent: ArcGIS MapView is ready.');
            setMapView(view);
          }, (error) => {
            console.error('HeatmapComponent: ArcGIS MapView failed to load:', error);
            setArcgisLoadError('Failed to initialize map view. ' + error.message);
          });

        } catch (error) {
          console.error('HeatmapComponent: Error initializing ArcGIS Map:', error);
          setArcgisLoadError('Error during map initialization: ' + error.message);
        }
      });
    }
    // Cleanup function for MapView
    return () => {
      if (mapView) {
        console.log('HeatmapComponent: Destroying ArcGIS MapView on unmount/re-render.');
        mapView.destroy();
        setMapView(null);
        setHeatmapLayer(null);
      }
    };
  }, [arcgisLoaded, mapDivRef.current]); // Re-run only if ArcGIS API loads or mapDivRef changes

  // Effect to update heatmap layer when data or selected property changes
  useEffect(() => {
    console.log('HeatmapComponent: useEffect for heatmap data update triggered. mapView:', !!mapView, 'heatmapLayer:', !!heatmapLayer, 'processedHeatmapData.length:', processedHeatmapData.length);
    if (mapView && heatmapLayer && processedHeatmapData) {
      console.log('HeatmapComponent: Updating heatmap layer with new data...');
      heatmapLayer.removeAll(); // Clear existing graphics

      const graphics = processedHeatmapData.map(point => {
        return new window.require('esri/Graphic')({
          geometry: {
            type: 'point',
            longitude: point.lng,
            latitude: point.lat
          },
          attributes: {
            intensity: point.intensity // Pass intensity as an attribute
          }
        });
      });
      heatmapLayer.addMany(graphics);
      console.log(`HeatmapComponent: Added ${graphics.length} graphics to heatmap layer.`);
    } else {
      console.log('HeatmapComponent: Map or heatmap layer not ready for data update, or no processed data.');
    }
  }, [mapView, heatmapLayer, processedHeatmapData]); // Re-run when map/layer is ready or data changes

  // Display loading state or error message
  if (arcgisLoadError) {
    return (
      <Card raised sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.palette.background.paper }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {arcgisLoadError}
        </Alert>
        <Typography>Could not load the map. Please check your network connection or try again.</Typography>
      </Card>
    );
  }

  // Handle loading state for the component itself
  if (loading || !arcgisLoaded || !mapView) {
    return (
      <Card raised sx={{ p: 2, height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.palette.background.paper }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          {arcgisLoaded ? 'Initializing Map...' : 'Loading Map API...'}
        </Typography>
      </Card>
    );
  }

  return (
    <Card raised sx={{ p: 0, height: '600px', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Disease Property</InputLabel>
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              label="Disease Property"
            >
              {detectedProperties.map(prop => (
                <MenuItem key={prop} value={prop}>
                  {prop.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {stats && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total: {stats.total}
              </Typography>
              {stats.positive !== undefined && (
                <Typography variant="body2" color="text.secondary">
                  Positive: {stats.positive} ({stats.positiveRate}%)
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Valid Coords: {processedHeatmapData.length} (Hardcoded fallback if API data empty)
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 0, '&:last-child': { pb: 0 } }}>
        <Box
          ref={mapDivRef}
          sx={{
            position: 'relative',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            // ArcGIS map will render inside this div
            minHeight: '400px'
          }}
        >
          {/* Empty state overlay - only if no data AND map is loaded */}
          {processedHeatmapData.length === 0 && arcgisLoaded && mapView && (
            <Box sx={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 100, // Ensure this overlay is above the map if data is empty
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: theme.palette.text.secondary,
            }}>
              <Typography variant="body1">
                No geospatial data available for selected filters. (Using hardcoded data for testing)
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

HeatmapComponent.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  availableProperties: PropTypes.arrayOf(PropTypes.string),
};

HeatmapComponent.defaultProps = {
  availableProperties: undefined,
};

export default HeatmapComponent;
