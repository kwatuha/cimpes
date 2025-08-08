// src/components/common/DataDisplayCard.jsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext.jsx';
import { checkUserPrivilege, CARD_CONTENT_MAX_HEIGHT } from '../../utils/helpers';

/**
 * A reusable component to display a section of data in a card format.
 * It conditionally renders action buttons (Add, Edit, Delete) based on user privileges.
 *
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the data section.
 * @param {object|Array} props.data - The data to be displayed in the card. It can be a single object or an array.
 * @param {string} props.type - The type of resource (e.g., 'conceptNote', 'program') for privilege checks.
 * @param {function} props.onAdd - Callback for the "Add" button.
 * @param {function} props.onEdit - Callback for the "Edit" button.
 * @param {function} props.onDelete - Callback for the "Delete" button.
 * @param {React.ReactNode} props.children - The content to be rendered inside the card, typically read-only data.
 */
function DataDisplayCard({ title, data, type, onAdd, onEdit, onDelete, children }) {
  const { user } = useAuth();
  const hasData = Array.isArray(data) ? data.length > 0 : !!data;

  // Determine permissions based on the 'type' prop
  const canCreate = checkUserPrivilege(user, `${type}.create`);
  const canUpdate = checkUserPrivilege(user, `${type}.update`);
  const canDelete = checkUserPrivilege(user, `${type}.delete`);

  const handleEditClick = () => {
    // Pass the entire data object or the specific item for editing
    if (onEdit && data) {
      onEdit(type, data);
    }
  };

  const handleDeleteClick = () => {
    // Pass the ID of the item to be deleted
    if (onDelete && data) {
      const idKey = Object.keys(data).find(key => key.endsWith('Id'));
      const id = idKey ? data[idKey] : (data.id || data._id);
      if (id) {
        onDelete(type, id);
      } else {
        console.error('DataDisplayCard: Could not find a valid ID for deletion.');
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{title}</Typography>
        <Box>
          {/* Render Edit and Delete buttons if data exists */}
          {hasData && (
            <>
              {canUpdate && onEdit && (
                <IconButton color="primary" onClick={handleEditClick}>
                  <EditIcon />
                </IconButton>
              )}
              {canDelete && onDelete && (
                <IconButton color="error" onClick={handleDeleteClick}>
                  <DeleteIcon />
                </IconButton>
              )}
            </>
          )}
          {/* Render the Add button if data does NOT exist for single-item sections
              or if the section is a list (hasData check is skipped) */}
          {!hasData && canCreate && onAdd && (
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => onAdd(type)}>
              Add {title}
            </Button>
          )}
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: CARD_CONTENT_MAX_HEIGHT }}>
        {hasData ? (
          children
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No {title.toLowerCase()} available.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default DataDisplayCard;
