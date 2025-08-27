// src/components/ReportTabs.jsx

import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';

// Define the tabs for the reports dashboard
const tabs = [
  { label: 'Project Summary', value: 'ProjectSummary' },
  { label: 'Funding Source Summary', value: 'FundingSourceSummary' },
  { label: 'Department Summary', value: 'DepartmentSummary' },
  { label: 'Subcounty Summary', value: 'SubcountySummary' },
  { label: 'Ward Summary', value: 'WardSummary' },
  { label: 'Yearly Trends', value: 'YearlyTrends' },
];

function a11yProps(index) {
  return {
    id: `report-tab-${index}`,
    'aria-controls': `report-tabpanel-${index}`,
  };
}

const ReportTabs = ({ activeTab, setActiveTab }) => {
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {tabs.map((tab, index) => (
          <Tab 
            key={tab.value} 
            label={tab.label} 
            value={tab.value} 
            sx={{ fontWeight: 'bold' }} // 👈 New: Bold font for tab labels
            {...a11yProps(index)} 
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default ReportTabs;