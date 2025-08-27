// src/components/KpiCard.jsx

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const KpiCard = ({ label, value, isCurrency = false }) => {
    // Function to format a number as a currency
    const formatValue = (number) => {
        if (isCurrency && !isNaN(number)) {
            return new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
                maximumFractionDigits: 0, // Optional: No decimals for whole numbers
            }).format(number);
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