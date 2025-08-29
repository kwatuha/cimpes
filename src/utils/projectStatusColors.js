// src/utils/projectStatusColors.js

const PROJECT_STATUS_COLORS = {
  'At Risk': '#b22222',    // FireBrick - Red
  'In Progress': '#1e90ff', // DodgerBlue - Bright Blue
  'Completed': '#32cd32',  // LimeGreen - Bright Green
  'Initiated': '#6495ED',  // LightBlue - This is a bit muted, consider '#6495ED' (CornflowerBlue) for sharper
  'Stalled': '#ffa500',    // Orange - Bright Orange
  'Delayed': '#e00202',    // A slightly darker red than At Risk for emphasis - Sharp Red
  'Cancelled': '#000000',  // Black - Sharp
  'Closed': '#228B22',     // DarkGreen - This is a bit muted, consider '#228B22' (ForestGreen) for sharper
  'Default': '#757575',    // Grey - This is fine for a default
};

// This function determines the background color for a given status
export function getProjectStatusBackgroundColor(status) {
  return PROJECT_STATUS_COLORS[status] || PROJECT_STATUS_COLORS['Default'];
}

// This function determines the text color based on the background color for readability
export function getProjectStatusTextColor(status) {
  const bgColor = getProjectStatusBackgroundColor(status);

  // Determine if background is dark or light to pick appropriate text color
  // Simple heuristic: sum of R, G, B values. If low, it's dark; if high, it's light.
  // This is a simplified check and might not be perfect for all colors.
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const { r, g, b } = hexToRgb(bgColor);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 180 ? 'black' : 'white'; // Use black text for light backgrounds, white for dark
}