import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, IconButton, Grid
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const JsonInputList = ({ label, items, onChange }) => {
    // The component's internal state for the list of input values.
    // It defaults to an array with a single empty string if the provided
    // items array is empty or not an array.
    const [listItems, setListItems] = useState(
        Array.isArray(items) && items.length > 0 ? items : ['']
    );

    useEffect(() => {
        // This useEffect hook ensures the component's internal state
        // remains synchronized with the `items` prop from the parent component.
        // It's crucial for edit functionality where the form data is loaded initially.
        if (Array.isArray(items)) {
            setListItems(items.length > 0 ? items : ['']);
        }
    }, [items]);

    const handleItemChange = (index, newValue) => {
        const newItems = [...listItems];
        newItems[index] = newValue;
        setListItems(newItems);
        // We pass the new, cleaned array back up to the parent.
        // The parent is responsible for converting this array to JSON.
        onChange(newItems.filter(item => item.trim() !== ''));
    };

    const handleAddItem = () => {
        // Adds a new empty string to the list, creating a new input field.
        const newItems = [...listItems, ''];
        setListItems(newItems);
        onChange(newItems.filter(item => item.trim() !== ''));
    };

    const handleRemoveItem = (index) => {
        // Removes an item from the list based on its index.
        const newItems = listItems.filter((_, i) => i !== index);
        setListItems(newItems);
        onChange(newItems.filter(item => item.trim() !== ''));
    };

    return (
        <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>{label}</Typography>
            {listItems.map((item, index) => (
                <Grid container spacing={1} alignItems="center" key={index} sx={{ mb: 1 }}>
                    <Grid item xs>
                        <TextField
                            margin="dense"
                            fullWidth
                            value={item}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                        />
                    </Grid>
                    <Grid item>
                        <IconButton
                            onClick={() => handleRemoveItem(index)}
                            color="error"
                            disabled={listItems.length <= 1} // Disable remove button if only one item remains
                            size="small"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{ mt: 1, textTransform: 'none' }}
            >
                Add another
            </Button>
        </Box>
    );
};

export default JsonInputList;
