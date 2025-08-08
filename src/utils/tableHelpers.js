// --- Permissions Helper ---
/**
 * Helper function to check if the user has a specific privilege.
 * @param {object | null} user - The user object from AuthContext.
 * @param {string} privilegeName - The name of the privilege to check.
 * @returns {boolean} True if the user has the privilege, false otherwise.
 */
export const checkUserPrivilege = (user, privilegeName) => {
  return user && user.privileges && Array.isArray(user.privileges) && user.privileges.includes(privilegeName);
};

// --- Sorting Helpers ---
/**
 * Compares two objects for sorting in descending order.
 * Handles different data types gracefully (strings, numbers, dates).
 */
function descendingComparator(a, b, orderBy) {
  let valA = a[orderBy] === null || a[orderBy] === undefined ? '' : a[orderBy];
  let valB = b[orderBy] === null || b[orderBy] === undefined ? '' : b[orderBy];

  if (orderBy.includes('Date')) {
    valA = valA ? new Date(valA) : null;
    valB = valB ? new Date(valB) : null;
  } else if (!isNaN(parseFloat(valA)) && isFinite(valA) && !isNaN(parseFloat(valB)) && isFinite(valB)) {
    valA = parseFloat(valA);
    valB = parseFloat(valB);
  } else if (typeof valA === 'string' && typeof valB === 'string') {
    valA = valA.toLowerCase();
    valB = valB.toLowerCase();
  }

  if (valB < valA) {
    return -1;
  }
  if (valB > valA) {
    return 1;
  }
  return 0;
}

/**
 * A factory function that returns a comparator for the given order and property.
 */
export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * Sorts an array of objects while maintaining the original order for equal elements.
 */
export function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// --- Formatting Helpers ---
/**
 * Formats a number as KES currency.
 */
export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number with a maximum of 2 decimal places.
 */
export const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// --- Status Color Helpers ---
/**
 * Returns the background color for a given project status.
 */
export const getProjectStatusBackgroundColor = (status) => {
  switch (status) {
    case 'Completed': return '#dcfce7'; // green-100
    case 'In Progress': return '#e0f2fe'; // light-blue-100
    case 'On Hold': return '#fef3c7'; // yellow-100
    case 'Cancelled': return '#fee2e2'; // red-100
    case 'At Risk': return '#fecaca'; // red-200
    case 'Stalled': return '#fbcfe8'; // pink-200
    case 'Delayed': return '#e2e8f0'; // slate-200
    case 'Planning': return '#eef2ff'; // indigo-100
    case 'Initiated': return '#dbeafe'; // blue-100
    case 'Closed': return '#e5e7eb'; // gray-200
    case 'Not Started':
    default: return '#f1f5f9'; // slate-100
  }
};

/**
 * Returns the text color for a given project status.
 */
export const getProjectStatusTextColor = (status) => {
  switch (status) {
    case 'Completed': return '#16a34a'; // green-600
    case 'In Progress': return '#0369a1'; // light-blue-600
    case 'On Hold': return '#a16207'; // yellow-600
    case 'Cancelled': return '#dc2626'; // red-600
    case 'At Risk': return '#ef4444'; // red-500
    case 'Stalled': return '#be185d'; // pink-600
    case 'Delayed': return '#475569'; // slate-600
    case 'Planning': return '#4f46e5'; // indigo-600
    case 'Initiated': return '#2563eb'; // blue-600
    case 'Closed': return '#4b5563'; // gray-600
    case 'Not Started':
    default: return '#64748b'; // slate-600
  }
};