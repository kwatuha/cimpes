// src/hooks/useTableSort.jsx

import { useState, useMemo, useCallback } from 'react';
import { getComparator, stableSort } from '../utils/tableHelpers';

const useTableSort = (data, projectTableColumnsConfig) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');

  const handleRequestSort = useCallback((event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const sortedData = useMemo(() => {
    // If no data or no sort key, return original array
    if (!data || !orderBy) {
      return data;
    }
    return stableSort(data, getComparator(order, orderBy));
  }, [data, order, orderBy]);

  return {
    order,
    orderBy,
    handleRequestSort,
    sortedData,
  };
};

export default useTableSort;