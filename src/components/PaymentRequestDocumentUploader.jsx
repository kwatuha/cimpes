import React, { useState } from 'react';
import PropTypes from 'prop-types';
import GenericFileUploadModal from './GenericFileUploadModal'; // ⬅️ Import the new generic component
import apiService from '../api';

const documentTypeOptions = [
    { value: 'invoice', label: 'Invoice' },
    { value: 'photo', label: 'Photo' },
    { value: 'inspection_report', label: 'Inspection Report' },
    { value: 'payment_certificate', label: 'Payment Certificate' },
    { value: 'other', label: 'Other' }
];

// This component is now a simple wrapper for the generic modal
const PaymentRequestDocumentUploader = ({ open, onClose, requestId, projectId }) => {
    
    // Define the configuration for the generic modal
    const uploadConfig = {
        options: documentTypeOptions,
        optionsLabel: 'Document Type',
        apiCallKey: 'documentType', // The key Multer will use for the selected option
    };

    // Define the API submission function, which is now a single, clean call
    const submitUpload = async (formData) => {
        // The API service call now needs the requestId as an argument
        return apiService.paymentRequests.uploadDocuments(requestId, formData);
    };

    // Define additional data to pass to the FormData
    const additionalData = {
      requestId: requestId,
      // You can add other data here if needed, e.g., userId from the context
    };

    return (
        <GenericFileUploadModal
            open={open}
            onClose={onClose}
            title="Attach Documents to Payment Request"
            uploadConfig={uploadConfig}
            submitFunction={submitUpload}
            additionalFormData={additionalData}
        />
    );
};

PaymentRequestDocumentUploader.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    requestId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    projectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

PaymentRequestDocumentUploader.defaultProps = {
    projectId: null,
};

export default PaymentRequestDocumentUploader;