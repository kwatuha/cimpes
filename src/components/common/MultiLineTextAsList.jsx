// src/components/common/MultiLineTextAsList.jsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

/**
 * A reusable component that takes a string of text containing newline characters
 * and displays each line as an item in an unordered list.
 *
 * @param {object} props - The component props.
 * @param {string} props.text - The text to be split by newlines and rendered.
 * @param {string} props.label - An optional label to display before the list.
 * @param {object} props.sx - Optional custom styling using the sx prop.
 */
function MultiLineTextAsList({ text, label, sx }) {
  if (!text) {
    return (
      <Box sx={sx}>
        {label && <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{label}:</Typography>}
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          N/A
        </Typography>
      </Box>
    );
  }

  const items = text.split('\n').filter(item => item.trim() !== '');

  if (items.length === 0) {
    return (
      <Box sx={sx}>
        {label && <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{label}:</Typography>}
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          N/A
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={sx}>
      {label && <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{label}:</Typography>}
      <List disablePadding dense>
        {items.map((item, index) => (
          <ListItem key={index} disableGutters sx={{ py: 0 }}>
            <ListItemText primary={<Typography variant="body2">{item}</Typography>} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default MultiLineTextAsList;
