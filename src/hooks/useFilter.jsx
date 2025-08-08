import { useState, useCallback } from 'react';

/**
 * A custom hook to manage filter states and their handlers.
 * It provides a single state object for all filters and functions
 * to update and clear them, making the parent component more compact.
 * * @returns {{
 * filterState: object,
 * handleFilterChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
 * handleClearFilters: () => void,
 * getFilterSummary: () => string,
 * }}
 */
const useFilter = () => {
  const [filterState, setFilterState] = useState({
    projectName: '',
    startDate: '',
    endDate: '',
    status: '',
    departmentId: '',
    sectionId: '',
    finYearId: '',
    programId: '',
    subProgramId: '',
    countyId: '',
    subcountyId: '',
    wardId: '',
  });

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilterState(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterState({
      projectName: '',
      startDate: '',
      endDate: '',
      status: '',
      departmentId: '',
      sectionId: '',
      finYearId: '',
      programId: '',
      subProgramId: '',
      countyId: '',
      subcountyId: '',
      wardId: '',
    });
  }, []);

  const getFilterSummary = useCallback(() => {
    const activeFilters = Object.entries(filterState).filter(
      ([, value]) => value !== '' && value !== null
    );
    if (activeFilters.length === 0) {
      return 'No filters applied';
    }
    
    // You can add more detailed summary logic here if needed
    // For now, it just shows a count.
    return `Filters applied: ${activeFilters.length}`;
  }, [filterState]);

  // A more detailed summary can be built by mapping the filterState
  // This version assumes a simple summary for brevity.

  return {
    filterState,
    handleFilterChange,
    handleClearFilters,
    getFilterSummary,
  };
};

export default useFilter;