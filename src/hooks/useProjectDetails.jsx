// src/hooks/useProjectDetails.jsx
import { useState, useEffect, useCallback } from 'react';
import apiService from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { checkUserPrivilege } from '../utils/helpers';

const useProjectDetails = (projectId) => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [project, setProject] = useState(null);
  const [conceptNote, setConceptNote] = useState(null);
  const [needsAssessment, setNeedsAssessment] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [fyBreakdown, setFyBreakdown] = useState([]);
  const [sustainability, setSustainability] = useState(null);
  const [implementationPlan, setImplementationPlan] = useState(null);
  const [mAndE, setMAndE] = useState(null);
  const [risks, setRisks] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [hazardAssessment, setHazardAssessment] = useState([]);
  const [climateRisk, setClimateRisk] = useState([]);
  const [esohsgScreening, setEsohsgScreening] = useState(null);

  const fetchProjectData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (authLoading) return;
    if (!user || !checkUserPrivilege(user, 'project.read_all')) {
      setError('You don\'t have permission to view project details.');
      setLoading(false);
      return;
    }

    try {
      const projectData = await apiService.projects.getProjectById(projectId);
      setProject(projectData);

      // Helper for numeric fields
      const parseNumericFields = (data, fields) => {
        if (!data) return null;
        const newData = { ...data };
        fields.forEach(field => {
          newData[field] = (newData[field] === null || newData[field] === undefined || newData[field] === '') ? null : Number(newData[field]);
        });
        return newData;
      };

      await Promise.all([
        apiService.kdspIIService.getProjectConceptNote(projectId).catch(() => null).then(setConceptNote),
        apiService.kdspIIService.getProjectNeedsAssessment(projectId).catch(() => null).then(setNeedsAssessment),
        apiService.kdspIIService.getProjectFinancials(projectId).catch(() => null).then(data => setFinancials(parseNumericFields(data, [
          'capitalCostConsultancy', 'capitalCostLandAcquisition', 'capitalCostSitePrep',
          'capitalCostConstruction', 'capitalCostPlantEquipment', 'capitalCostFixturesFittings',
          'capitalCostOther', 'recurrentCostLabor', 'recurrentCostOperating',
          'recurrentCostMaintenance', 'recurrentCostOther', 'landExpropriationExpenses'
        ]))),
        apiService.kdspIIService.getProjectFyBreakdown(projectId).catch(() => []).then(setFyBreakdown),
        apiService.kdspIIService.getProjectSustainability(projectId).catch(() => null).then(data => setSustainability(parseNumericFields(data, [
          'avgAnnualPersonnelCost', 'annualOperationMaintenanceCost', 'otherOperatingCosts'
        ]))),
        apiService.kdspIIService.getProjectImplementationPlan(projectId).catch(() => null).then(setImplementationPlan),
        apiService.kdspIIService.getProjectMAndE(projectId).catch(() => null).then(setMAndE),
        apiService.kdspIIService.getProjectRisks(projectId).catch(() => []).then(setRisks),
        apiService.kdspIIService.getProjectStakeholders(projectId).catch(() => []).then(setStakeholders),
        apiService.kdspIIService.getProjectReadiness(projectId).catch(() => null).then(setReadiness),
        apiService.kdspIIService.getProjectHazardAssessment(projectId).catch(() => []).then(setHazardAssessment),
        apiService.kdspIIService.getProjectClimateRisk(projectId).catch(() => null).then(data => setClimateRisk(parseNumericFields(data, [
          'riskReductionCosts'
        ]))),
        apiService.kdspIIService.getProjectEsohsgScreening(projectId).catch(() => null).then(setEsohsgScreening),
      ]);

    } catch (err) {
      console.error('Error fetching KDSP project details:', err);
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }, [projectId, user, authLoading]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  return {
    project, conceptNote, needsAssessment, financials, fyBreakdown,
    sustainability, implementationPlan, mAndE, risks, stakeholders,
    readiness, hazardAssessment, climateRisk, esohsgScreening,
    loading, error, fetchProjectData
  };
};

export default useProjectDetails;