// src/configs/projectTableConfig.js
const projectTableColumns = [
  { id: 'id', label: 'ID', minWidth: 20, show: false, sortable: true },
  { id: 'projectName', label: 'Project Name', minWidth: 200, show: true, sticky: 'left', sortable: true },
  { id: 'status', label: 'Status', minWidth: 120, show: true, sticky: 'left', sortable: true },
  { id: 'directorate', label: 'Directorate', minWidth: 150, show: false, sortable: true },
  { id: 'startDate', label: 'Start Date', minWidth: 120, show: false, sortable: true }, // Added sortable
  { id: 'endDate', label: 'End Date', minWidth: 120, show: false, sortable: true },     // Added sortable
  
  { id: 'costOfProject', label: 'Contracted', minWidth: 100, show: true, sortable: true },   // Added sortable
  { id: 'paidOut', label: 'Paid', minWidth: 100, show: true, sortable: true },     // Added sortable
  { id: 'departmentName', label: 'Department', minWidth: 150, show: false, sortable: true },
  { id: 'sectionName', label: 'Section', minWidth: 150, show: false, sortable: true },
  { id: 'financialYearName', label: 'Fin. Year', minWidth: 120, show: false, sortable: true },
  { id: 'programName', label: 'Program', minWidth: 150, show: false, sortable: true },
  { id: 'subProgramName', label: 'Sub-Program', minWidth: 150, show: false, sortable: true },
  { id: 'countyNames', label: 'Counties', minWidth: 180, show: false, sortable: false }, // Typically not sortable
  { id: 'subcountyNames', label: 'Sub-Counties', minWidth: 180, show: false, sortable: false }, // Typically not sortable
  { id: 'wardNames', label: 'Wards', minWidth: 180, show: false, sortable: false }, 
  { id: 'principalInvestigator', label: 'PI', minWidth: 150, show: true, sortable: true },        // Typically not sortable
  { id: 'actions', label: 'Actions', minWidth: 180, show: true, sticky: 'right', sortable: false },
];

export default projectTableColumns;