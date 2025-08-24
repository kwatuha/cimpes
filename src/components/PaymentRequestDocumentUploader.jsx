import React, { useState } from 'react';
import PropTypes from 'prop-types';
import GenericFileUploadModal from './GenericFileUploadModal';
import apiService from '../api';

const documentTypeOptions = [
    { value: 'invoice', label: 'Invoice' },
    { value: 'photo_payment', label: 'Payment Photo' }, // ⬅️ NEW: Added a specific type for payment photos
    { value: 'inspection_report', label: 'Inspection Report' },
    { value: 'payment_certificate', label: 'Payment Certificate' },
    { value: 'other', label: 'Other' }
];

const PaymentRequestDocumentUploader = ({ open, onClose, requestId, projectId }) => {
    
    const uploadConfig = {
        options: documentTypeOptions,
        optionsLabel: 'Document Type',
        apiCallKey: 'documentType',
        description: {
            label: 'Description',
            placeholder: 'Briefly describe the document or photo...',
        }
    };

    const submitUpload = async (formData) => {
        return apiService.documents.uploadDocument(formData);
    };

    const additionalData = {
      projectId: projectId,
      requestId: requestId,
      documentCategory: 'payment', // The category is 'payment' for all these documents
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
