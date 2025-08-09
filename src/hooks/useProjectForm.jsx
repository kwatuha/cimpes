import { useState, useEffect, useCallback } from 'react';
import apiService from '../api';

const useProjectForm = (currentProject, allMetadata, onFormSuccess, setSnackbar) => {
  const [formData, setFormData] = useState({
    projectName: '', projectDescription: '', startDate: '', endDate: '',
    directorate: '', costOfProject: '', paidOut: '',
    objective: '', expectedOutput: '', principalInvestigator: '', expectedOutcome: '',
    status: 'Not Started', statusReason: '', principalInvestigatorStaffId: '',
    departmentId: '', sectionId: '', finYearId: '', programId: '', subProgramId: '',
    categoryId: '', // ADDED: categoryId to the form state
    countyIds: [], subcountyIds: [], wardIds: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formSections, setFormSections] = useState([]);
  const [formSubPrograms, setFormSubPrograms] = useState([]);
  const [formSubcounties, setFormSubcounties] = useState([]);
  const [formWards, setFormWards] = useState([]);

  const [initialAssociations, setInitialAssociations] = useState({
    countyIds: [],
    subcountyIds: [],
    wardIds: [],
  });

  useEffect(() => {
    if (currentProject) {
      setLoading(true);
      const fetchAssociations = async () => {
        try {
          const [countiesRes, subcountiesRes, wardsRes] = await Promise.all([
            apiService.junctions.getProjectCounties(currentProject.id),
            apiService.junctions.getProjectSubcounties(currentProject.id),
            apiService.junctions.getProjectWards(currentProject.id),
          ]);
          const countyIds = countiesRes.map(c => String(c.countyId));
          const subcountyIds = subcountiesRes.map(sc => String(sc.subcountyId));
          const wardIds = wardsRes.map(w => String(w.wardId));

          setFormData({
            projectName: currentProject.projectName || '',
            projectDescription: currentProject.projectDescription || '',
            startDate: currentProject.startDate ? new Date(currentProject.startDate).toISOString().split('T')[0] : '',
            endDate: currentProject.endDate ? new Date(currentProject.endDate).toISOString().split('T')[0] : '',
            directorate: currentProject.directorate || '',
            costOfProject: currentProject.costOfProject || '',
            paidOut: currentProject.paidOut || '',
            objective: currentProject.objective || '',
            expectedOutput: currentProject.expectedOutput || '',
            principalInvestigator: currentProject.principalInvestigator || '',
            expectedOutcome: currentProject.expectedOutcome || '',
            status: currentProject.status || 'Not Started',
            statusReason: currentProject.statusReason || '',
            principalInvestigatorStaffId: currentProject.principalInvestigatorStaffId || '',
            departmentId: String(currentProject.departmentId || ''),
            sectionId: String(currentProject.sectionId || ''),
            finYearId: String(currentProject.finYearId || ''),
            programId: String(currentProject.programId || ''),
            subProgramId: String(currentProject.subProgramId || ''),
            categoryId: String(currentProject.categoryId || ''), // FIXED: Populating categoryId from the project object
            countyIds,
            subcountyIds,
            wardIds,
          });

          setInitialAssociations({ countyIds, subcountyIds, wardIds });

        } catch (err) {
          setSnackbar({ open: true, message: 'Failed to load project associations for editing.', severity: 'error' });
          console.error("Error fetching project associations:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAssociations();
    } else {
      setFormData({
        projectName: '', projectDescription: '', startDate: '', endDate: '',
        directorate: '', costOfProject: '', paidOut: '',
        objective: '', expectedOutput: '', principalInvestigator: '', expectedOutcome: '',
        status: 'Not Started', statusReason: '', principalInvestigatorStaffId: '',
        departmentId: '', sectionId: '', finYearId: '', programId: '', subProgramId: '',
        categoryId: '', // ADDED: Reset categoryId for new projects
        countyIds: [], subcountyIds: [], wardIds: [],
      });
      setInitialAssociations({ countyIds: [], subcountyIds: [], wardIds: [] });
      setLoading(false);
    }
  }, [currentProject, setSnackbar]);


  useEffect(() => {
    const fetchFormDropdowns = async () => {
        if (formData.departmentId) {
            try { setFormSections(await apiService.metadata.departments.getSectionsByDepartment(formData.departmentId)); } catch (err) { console.error("Error fetching form sections:", err); setFormSections([]); }
        } else { setFormSections([]); }

        if (formData.programId) {
            try { setFormSubPrograms(await apiService.metadata.programs.getSubProgramsByProgram(formData.programId)); } catch (err) { console.error("Error fetching form sub-programs:", err); setFormSubPrograms([]); }
        } else { setFormSubPrograms([]); }

        if (formData.countyIds && formData.countyIds.length > 0) {
            const firstCountyId = formData.countyIds[0];
            try { setFormSubcounties(await apiService.metadata.counties.getSubcountiesByCounty(firstCountyId)); } catch (err) { console.error("Error fetching form sub-counties:", err); setFormSubcounties([]); }
        } else { setFormSubcounties([]); }
        
        if (formData.subcountyIds && formData.subcountyIds.length > 0) {
            const firstSubcountyId = formData.subcountyIds[0];
            try { setFormWards(await apiService.metadata.subcounties.getWardsBySubcounty(firstSubcountyId)); } catch (err) { console.error("Error fetching form wards:", err); setFormWards([]); }
        } else { setFormWards([]); }
    };

    fetchFormDropdowns();
  }, [formData.departmentId, formData.programId, formData.countyIds, formData.subcountyIds]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newState = { ...prev, [name]: value };

        if (name === 'departmentId' && prev.departmentId !== value) { newState.sectionId = ''; }
        if (name === 'programId' && prev.programId !== value) { newState.subProgramId = ''; }
        if (name === 'countyIds' && prev.countyIds[0] !== value[0]) { newState.subcountyIds = []; newState.wardIds = []; }
        if (name === 'subcountyIds' && prev.subcountyIds[0] !== value[0]) { newState.wardIds = []; }

        return newState;
    });
  };

  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newArrayValue = typeof value === 'string' ? value.split(',') : value;
        const newState = { ...prev, [name]: newArrayValue };
        
        if (name === 'countyIds' && newArrayValue[0] !== prev.countyIds[0]) { newState.subcountyIds = []; newState.wardIds = []; }
        if (name === 'subcountyIds' && newArrayValue[0] !== prev.subcountyIds[0]) { newState.wardIds = []; }
        
        return newState;
    });
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.projectName.trim()) errors.projectName = 'Project Name is required.';
    if (!formData.startDate) errors.startDate = 'Start Date is required.';
    if (!formData.endDate) errors.endDate = 'End Date is required.';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.date_range = 'End Date cannot be before Start Date.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const synchronizeAssociations = useCallback(async (projectId, currentIds, newIds, addFn, removeFn) => {
    const idsToAdd = newIds.filter(id => !currentIds.includes(id));
    const idsToRemove = currentIds.filter(id => !newIds.includes(id));
    const addPromises = idsToAdd.map(id => addFn(projectId, id));
    const removePromises = idsToRemove.map(id => removeFn(projectId, id));
    await Promise.allSettled([...addPromises, ...removePromises]);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Please correct the form errors.', severity: 'error' });
      return;
    }

    setLoading(true);
    const dataToSubmit = { ...formData };
    for (const key of ['costOfProject', 'paidOut', 'principalInvestigatorStaffId']) {
      if (dataToSubmit[key] === '' || dataToSubmit[key] === null) { dataToSubmit[key] = null; } else if (typeof dataToSubmit[key] === 'string') { const parsed = parseFloat(dataToSubmit[key]); dataToSubmit[key] = isNaN(parsed) ? null : parsed; }
    }
    for (const key of ['departmentId', 'sectionId', 'finYearId', 'programId', 'subProgramId', 'categoryId']) { // FIXED: Add categoryId here
      if (dataToSubmit[key] === '' || dataToSubmit[key] === null) { dataToSubmit[key] = null; } else if (typeof dataToSubmit[key] === 'string') { const parsed = parseInt(dataToSubmit[key], 10); dataToSubmit[key] = isNaN(parsed) ? null : parsed; }
    }

    const countyIdsToSave = dataToSubmit.countyIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    const subcountyIdsToSave = dataToSubmit.subcountyIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    const wardIdsToSave = dataToSubmit.wardIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    
    delete dataToSubmit.countyIds; delete dataToSubmit.subcountyIds; delete dataToSubmit.wardIds;

    let projectId = currentProject ? currentProject.id : null;

    try {
      if (currentProject) {
        await apiService.projects.updateProject(projectId, dataToSubmit);
        setSnackbar({ open: true, message: 'Project updated successfully!', severity: 'success' });
      } else {
        const createdProject = await apiService.projects.createProject(dataToSubmit);
        projectId = createdProject.id;
        setSnackbar({ open: true, message: 'Project created successfully!', severity: 'success' });
      }

      if (projectId) {
        await Promise.all([
          synchronizeAssociations(projectId, initialAssociations.countyIds.map(id => parseInt(id, 10)), countyIdsToSave, apiService.junctions.addProjectCounty, apiService.junctions.removeProjectCounty),
          synchronizeAssociations(projectId, initialAssociations.subcountyIds.map(id => parseInt(id, 10)), subcountyIdsToSave, apiService.junctions.addProjectSubcounty, apiService.junctions.removeProjectSubcounty),
          synchronizeAssociations(projectId, initialAssociations.wardIds.map(id => parseInt(id, 10)), wardIdsToSave, apiService.junctions.addProjectWard, apiService.junctions.removeProjectWard),
        ]);
      }
      onFormSuccess();
    } catch (err) {
      console.error("Submit project error:", err);
      setSnackbar({ open: true, message: err.response?.data?.message || err.message || 'Failed to save project.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [formData, currentProject, initialAssociations, onFormSuccess, setSnackbar, synchronizeAssociations, validateForm]);

  return {
    formData, formErrors, loading, handleChange, handleMultiSelectChange, handleSubmit,
    formSections, formSubPrograms, formSubcounties, formWards,
  };
};

export default useProjectForm;
