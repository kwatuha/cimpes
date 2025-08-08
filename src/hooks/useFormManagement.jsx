// src/hooks/useFormManagement.jsx
import { useState } from 'react';
import { parseNumberFromFormattedInput } from '../utils/helpers';

const useFormManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [currentRecord, setCurrentRecord] = useState(null);

  // Existing KDSP form states
  const [conceptNoteFormData, setConceptNoteFormData] = useState({});
  const [needsAssessmentFormData, setNeedsAssessmentFormData] = useState({});
  const [financialsFormData, setFinancialsFormData] = useState({});
  const [fyBreakdownFormData, setFyBreakdownFormData] = useState({});
  const [sustainabilityFormData, setSustainabilityFormData] = useState({});
  const [implementationPlanFormData, setImplementationPlanFormData] = useState({});
  const [mAndEFormData, setMAndEFormData] = useState({});
  const [risksFormData, setRisksFormData] = useState({});
  const [stakeholdersFormData, setStakeholdersFormData] = useState({});
  const [readinessFormData, setReadinessFormData] = useState({});
  const [hazardAssessmentFormData, setHazardAssessmentFormData] = useState({});
  const [climateRiskFormData, setClimateRiskFormData] = useState({});
  const [esohsgScreeningFormData, setEsohsgScreeningFormData] = useState({});

  // NEW: Strategic Plan form states
  const [strategicPlanFormData, setStrategicPlanFormData] = useState({});
  const [programFormData, setProgramFormData] = useState({});
  const [subprogramFormData, setSubprogramFormData] = useState({});
  const [attachmentFormData, setAttachmentFormData] = useState({});

  const setterMap = {
    // Existing KDSP setters
    conceptNote: setConceptNoteFormData,
    needsAssessment: setNeedsAssessmentFormData,
    financials: setFinancialsFormData,
    fyBreakdown: setFyBreakdownFormData,
    sustainability: setSustainabilityFormData,
    implementationPlan: setImplementationPlanFormData,
    mAndE: setMAndEFormData,
    risks: setRisksFormData,
    stakeholders: setStakeholdersFormData,
    readiness: setReadinessFormData,
    hazardAssessment: setHazardAssessmentFormData,
    climateRisk: setClimateRiskFormData,
    esohsgScreening: setEsohsgScreeningFormData,
    // NEW: Strategic Plan setters
    strategicPlan: setStrategicPlanFormData,
    program: setProgramFormData,
    subprogram: setSubprogramFormData,
    attachment: setAttachmentFormData,
  };

  const formDataMap = {
    // Existing KDSP form data
    conceptNote: conceptNoteFormData,
    needsAssessment: needsAssessmentFormData,
    financials: financialsFormData,
    fyBreakdown: fyBreakdownFormData,
    sustainability: sustainabilityFormData,
    implementationPlan: implementationPlanFormData,
    mAndE: mAndEFormData,
    risks: risksFormData,
    stakeholders: stakeholdersFormData,
    readiness: readinessFormData,
    hazardAssessment: hazardAssessmentFormData,
    climateRisk: climateRiskFormData,
    esohsgScreening: esohsgScreeningFormData,
    // NEW: Strategic Plan form data
    strategicPlan: strategicPlanFormData,
    program: programFormData,
    subprogram: subprogramFormData,
    attachment: attachmentFormData,
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;
    const currentSetter = setterMap[dialogType];

    let newValue = value;
    if (type === 'checkbox' || type === 'switch') {
      newValue = checked;
    } else if (dataset.type === 'number' || type === 'number') {
      newValue = parseNumberFromFormattedInput(value);
    }

    currentSetter(prev => ({ ...prev, [name]: newValue }));
  };

  const handleOpenCreateDialog = (type, parentId = null) => {
    setDialogType(type);
    setCurrentRecord(null);
    switch (type) {
      // Existing KDSP cases
      case 'conceptNote': setConceptNoteFormData({}); break;
      case 'needsAssessment': setNeedsAssessmentFormData({}); break;
      case 'financials': setFinancialsFormData({
        capitalCostConsultancy: null, capitalCostLandAcquisition: null, capitalCostSitePrep: null,
        capitalCostConstruction: null, capitalCostPlantEquipment: null, capitalCostFixturesFittings: null,
        capitalCostOther: null, recurrentCostLabor: null, recurrentCostOperating: null,
        recurrentCostMaintenance: null, recurrentCostOther: null,
        landExpropriationRequired: false, landExpropriationExpenses: null, compensationRequired: false,
        proposedSourceFinancing: '', costImplicationsRelatedProjects: '', otherAttendantCosts: ''
      }); break;
      case 'fyBreakdown': setFyBreakdownFormData({ financialYear: '', totalCost: null }); break;
      case 'sustainability': setSustainabilityFormData({
        description: '', owningOrganization: '', hasAssetRegister: false,
        technicalCapacityAdequacy: '', managerialCapacityAdequacy: '', financialCapacityAdequacy: '',
        avgAnnualPersonnelCost: null, annualOperationMaintenanceCost: null, otherOperatingCosts: null,
        revenueSources: '', operationalCostsCoveredByRevenue: false
      }); break;
      case 'implementationPlan': setImplementationPlanFormData({ description: '', keyPerformanceIndicators: [], responsiblePersons: [] }); break;
      case 'mAndE': setMAndEFormData({ description: '', mechanismsInPlace: '', resourcesBudgetary: '', resourcesHuman: '', dataGatheringMethod: '', reportingChannels: '', lessonsLearnedProcess: '' }); break;
      case 'risks': setRisksFormData({ riskDescription: '', likelihood: '', impact: '', mitigationStrategy: '' }); break;
      case 'stakeholders': setStakeholdersFormData({ stakeholderName: '', levelInfluence: '', engagementStrategy: '' }); break;
      case 'readiness': setReadinessFormData({ designsPreparedApproved: false, landAcquiredSiteReady: false, regulatoryApprovalsObtained: false, consultationsUndertaken: false, canBePhasedScaledDown: false, governmentAgenciesInvolved: [] }); break;
      case 'hazardAssessment': setHazardAssessmentFormData({ hazardName: '', question: '', answerYesNo: false, remarks: '' }); break;
      case 'climateRisk': setClimateRiskFormData({
        hazardName: '', hazardExposure: '', vulnerability: '', riskLevel: '',
        riskReductionStrategies: '', riskReductionCosts: null, resourcesRequired: ''
      }); break;
      case 'esohsgScreening': setEsohsgScreeningFormData({ nameOfTheProject: '', briefProjectDescription: '', locationOfTheProject: '', emcaTriggers: false, emcaDescription: '', worldBankSafeguardApplicable: false, worldBankStandards: [], goKPoliciesApplicable: false, goKPoliciesLaws: [], screeningResultOutcome: '', screeningUndertakenBy: '' }); break;
      // NEW: Strategic Plan cases
      case 'strategicPlan': setStrategicPlanFormData({}); break;
      case 'program': setProgramFormData({ cidpid: parentId }); break;
      case 'subprogram': setSubprogramFormData({ programId: parentId }); break;
      case 'attachment': setAttachmentFormData({}); break;
      default: break;
    }
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (type, record) => {
    setDialogType(type);
    setCurrentRecord(record);
    switch (type) {
      // Existing KDSP cases
      case 'conceptNote': setConceptNoteFormData(record); break;
      case 'needsAssessment': setNeedsAssessmentFormData(record); break;
      case 'financials': setFinancialsFormData(record); break;
      case 'fyBreakdown': setFyBreakdownFormData(record); break;
      case 'sustainability': setSustainabilityFormData(record); break;
      case 'implementationPlan': setImplementationPlanFormData({
        ...record,
        keyPerformanceIndicators: Array.isArray(record.keyPerformanceIndicators) ? record.keyPerformanceIndicators : [],
        responsiblePersons: Array.isArray(record.responsiblePersons) ? record.responsiblePersons : [],
      }); break;
      case 'mAndE': setMAndEFormData(record); break;
      case 'risks': setRisksFormData(record); break;
      case 'stakeholders': setStakeholdersFormData(record); break;
      case 'readiness': setReadinessFormData({
        ...record,
        governmentAgenciesInvolved: Array.isArray(record.governmentAgenciesInvolved) ? record.governmentAgenciesInvolved : [],
      }); break;
      case 'hazardAssessment': setHazardAssessmentFormData(record); break;
      case 'climateRisk': setClimateRiskFormData(record); break;
      case 'esohsgScreening': setEsohsgScreeningFormData({
        ...record,
        worldBankStandards: Array.isArray(record.worldBankStandards) ? record.worldBankStandards : [],
        goKPoliciesLaws: Array.isArray(record.goKPoliciesLaws) ? record.goKPoliciesLaws : [],
      }); break;
      // NEW: Strategic Plan cases
      case 'strategicPlan': setStrategicPlanFormData(record); break;
      case 'program': setProgramFormData(record); break;
      case 'subprogram': setSubprogramFormData(record); break;
      case 'attachment': setAttachmentFormData(record); break;
      default: break;
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRecord(null);
  };

  return {
    openDialog,
    dialogType,
    currentRecord,
    formData: formDataMap[dialogType], // Get current form data based on dialogType
    handleFormChange,
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleCloseDialog,
    setFormData: setterMap[dialogType], // Expose setter for specific list inputs
  };
};

export default useFormManagement;
