// src/components/KpiCard.jsx

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const KpiCard = ({ label, value, isCurrency = false }) => {
    // Function to format a number as a currency
    const formatValue = (number) => {
        // Check if the value is a valid number before formatting
        if (isCurrency && typeof number === 'number' && !isNaN(number)) {
            return number.toLocaleString('en-KE', {
                style: 'currency',
                currency: 'KES',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            });
        }
        return number;
    };

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: '8px' }}>
            <Typography variant="body2" color="text.secondary" noWrap>
                {label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                {formatValue(value)}
            </Typography>
        </Paper>
    );
};

export default KpiCard;