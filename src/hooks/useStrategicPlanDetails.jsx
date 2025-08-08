// src/hooks/useStrategicPlanDetails.jsx
import { useState, useEffect, useCallback } from 'react';
import apiService from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { checkUserPrivilege } from '../utils/helpers';

const useStrategicPlanDetails = (planId) => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [strategicPlan, setStrategicPlan] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [subprograms, setSubprograms] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const fetchStrategicPlanData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (authLoading) return;

    if (!user || !checkUserPrivilege(user, 'strategic_plan.read_all')) {
      setError('You don\'t have permission to view strategic plan details.');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Fetch the main strategic plan data.
      const planData = await apiService.strategy.getStrategicPlanById(planId);
      setStrategicPlan(planData);

      // Step 2: Fetch the programs associated with this specific plan.
      const programsData = await apiService.strategy.getProgramsByPlanId(planId);
      setPrograms(programsData);

      // Step 3: Fetch the subprograms for each program in the list.
      // We use Promise.all to fetch all subprograms concurrently for efficiency.
      const subprogramsPromises = programsData.map(program =>
        apiService.strategy.getSubprogramsByProgramId(program.programId)
      );
      
      const subprogramsResults = await Promise.all(subprogramsPromises);
      
      // Flatten the array of arrays into a single list of subprograms.
      const allSubprograms = subprogramsResults.flat();
      setSubprograms(allSubprograms);

      // Step 4: Fetch attachments for the plan.
      const attachmentsData = await apiService.strategy.getPlanningDocumentsForEntity('plan', planId);
      setAttachments(attachmentsData);

    } catch (err) {
      console.error('Error fetching strategic plan details:', err);
      setError(err.message || 'Failed to load strategic plan details.');
    } finally {
      setLoading(false);
    }
  }, [planId, user, authLoading]);

  useEffect(() => {
    fetchStrategicPlanData();
  }, [fetchStrategicPlanData]);

  return {
    strategicPlan, programs, subprograms, attachments,
    loading, error, fetchStrategicPlanData
  };
};

export default useStrategicPlanDetails;
