import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Divider, Tooltip } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../pages/dashboard/theme";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MapIcon from '@mui/icons-material/Map';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import PaidIcon from '@mui/icons-material/Paid';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../configs/appConfig.js';
import logo from '../assets/logo.png';
import userProfilePicture from '../assets/user.png';

const Item = ({ title, to, icon, selected, setSelected, isCollapsed, privilegeCheck }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (privilegeCheck && !privilegeCheck()) {
    return null;
  }

  return (
    <Tooltip title={title} placement="right" disableHoverListener={!isCollapsed}>
      <MenuItem
        active={selected === title}
        style={{ color: colors.grey[100] }}
        onClick={() => setSelected(title)}
        icon={icon}
      >
        <Typography>{title}</Typography>
        <Link to={to} />
      </MenuItem>
    </Tooltip>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState(location.pathname);

  const { user, hasPrivilege } = useAuth();
  
  // Update selected state when route changes
  useState(() => {
    setSelected(location.pathname);
  }, [location]);

  const internalStaffItems = [
    { title: "Dashboard", to: ROUTES.DASHBOARD, icon: <DashboardIcon /> },
    { title: "Raw Data", to: ROUTES.RAW_DATA, icon: <TableChartIcon /> },
    { title: "Project Management", to: ROUTES.PROJECTS, icon: <FolderOpenIcon /> },
    { title: "Contractor Dashboard", to: ROUTES.CONTRACTOR_DASHBOARD, icon: <PaidIcon /> },
    { title: "Reports", to: ROUTES.REPORTS, icon: <AssessmentIcon /> },
    { title: "Comprehensive Reporting", to: ROUTES.REPORTING, icon: <AssessmentIcon /> },
    { title: "GIS Mapping", to: ROUTES.GIS_MAPPING, icon: <MapIcon /> },
    { title: "Import Map Data", to: ROUTES.MAP_DATA_IMPORT, icon: <CloudUploadIcon /> },
    { title: "Strategic Planning", to: ROUTES.STRATEGIC_PLANNING, icon: <AssignmentIcon /> },
    { title: "Import Strategic Data", to: ROUTES.STRATEGIC_DATA_IMPORT, icon: <CloudUploadIcon /> },
    { title: "HR Module", to: ROUTES.HR, icon: <PeopleIcon />, privilege: () => hasPrivilege('hr.access') },
  ];

  const adminItems = [
    { title: "User Management", to: ROUTES.USER_MANAGEMENT, icon: <GroupIcon /> },
    { title: "Workflow Management", to: ROUTES.WORKFLOW_MANAGEMENT, icon: <AccountTreeIcon />, privilege: () => hasPrivilege('project_workflow.read') },
    { title: "Approval Levels", to: ROUTES.APPROVAL_LEVELS_MANAGEMENT, icon: <SettingsIcon />, privilege: () => hasPrivilege('approval_levels.read') },
    { title: "Metadata Management", to: ROUTES.METADATA_MANAGEMENT, icon: <SettingsIcon /> },
    { title: "Contractor Management", to: ROUTES.CONTRACTOR_MANAGEMENT, icon: <BusinessIcon /> },
  ];

  const contractorItems = [
    { title: "My Projects", to: ROUTES.CONTRACTOR_DASHBOARD, icon: <FolderOpenIcon /> },
    { title: "Payment Requests", to: `${ROUTES.CONTRACTOR_DASHBOARD}/payments`, icon: <PaidIcon /> },
    { title: "Progress Photos", to: `${ROUTES.CONTRACTOR_DASHBOARD}/photos`, icon: <PhotoCameraIcon /> },
  ];

  const itemsToRender = (user?.roleName === 'contractor') ? contractorItems : (user?.roleName === 'admin' ? [...internalStaffItems, ...adminItems] : internalStaffItems);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  IPMES
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="IPMES logo"
                  width="100px"
                  height="100px"
                  src={userProfilePicture}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user?.username}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {user?.roleName}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            {itemsToRender.map((item, index) => (
              <Item
                key={index}
                title={item.title}
                to={item.to}
                icon={item.icon}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
                privilegeCheck={item.privilege}
              />
            ))}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;