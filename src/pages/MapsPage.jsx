// src/pages/MapsPage.jsx
import React from 'react';
import { Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// --- Inline SVG Icon Components ---
// Users Icon
const UsersIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke={props.color || "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// Map Icon
const MapIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke={props.color || "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 4L20 7L14.5 10L9 7L3.5 10L9 13L3.5 16L9 19L14.5 16L20 19V7" />
    <path d="M3.5 10V16" />
    <path d="M9 7V13" />
    <path d="M14.5 10V16" />
  </svg>
);

// Globe Icon
const GlobeIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke={props.color || "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2" />
    <path d="M2 12h20" />
  </svg>
);

// MapLinkCard Component
const MapLinkCard = ({ title, url, description, icon: IconComponent }) => {
  const theme = useTheme();

  return (
    <Card raised sx={{
      backgroundColor: theme.palette.background.paper,
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      p: 2.5,
      textAlign: 'left',
      border: `1px solid ${theme.palette.primary.main}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '180px',
      height: '100%', // Added to ensure consistent height within grid item
    }}>
      <CardContent sx={{ width: '100%', p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          {IconComponent && <IconComponent size={30} color={theme.palette.primary.main} sx={{ mr: 1.5 }} />}
          <Typography variant="h6" component="div" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            width: '100%',
            py: 1,
            borderRadius: '8px',
            fontWeight: 'bold',
            textTransform: 'none',
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          View Map
        </Button>
      </CardContent>
    </Card>
  );
};

function MapsPage() {
  // Define the map links
  const externalMapLinks = [
    {
      title: "Distribution By Gender (Disease Impact)",
      url: "https://esrieagovernment.maps.arcgis.com/apps/mapviewer/index.html?panel=gallery&suggestField=true&layerId=1&layers=e491051538b847918e9b587735a32427",
      description: "Explore how disease impact varies across different gender groups.",
      icon: UsersIcon
    },
    {
      title: "Disease Distribution by County",
      url: "https://esrieagovernment.maps.arcgis.com/apps/mapviewer/index.html?layers=e491051538b847918e9b587735a32427",
      description: "Visualize the spread and prevalence of diseases across various counties.",
      icon: MapIcon
    },
    {
      title: "Counties in Kenya",
      url: "https://esrieagovernment.maps.arcgis.com/apps/mapviewer/index.html?layers=8bd4c7965aea4dc9a9a978cf98362148",
      description: "View the administrative boundaries and geographical layout of Kenyan counties.",
      icon: GlobeIcon
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Geospatial Disease Insights
      </Typography>
      <Grid container spacing={3}>
        {externalMapLinks.map((link, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <MapLinkCard
              title={link.title}
              url={link.url}
              description={link.description}
              icon={link.icon}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default MapsPage;
