import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A custom hook to manage scroll shadows for a horizontally scrollable table.
 * It tracks the scroll position of the table and updates state to show/hide
 * shadows on the left and right edges, indicating more content is available.
 * * @param {Array<object>} data - The data array (projects) that populates the table. Used for re-evaluating shadows when data changes.
 * @returns {{
 * tableContainerRef: React.RefObject<HTMLDivElement>,
 * showLeftShadow: boolean,
 * showRightShadow: boolean,
 * handleScrollRight: () => void,
 * handleScrollLeft: () => void
 * }}
 */
const useTableScrollShadows = (data) => {
  const tableContainerRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const handleScroll = useCallback(() => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      const scrollThreshold = 5; // A small buffer to avoid flicker at the edges
      
      // Show left shadow if scrolled past the beginning
      setShowLeftShadow(scrollLeft > scrollThreshold);

      // Show right shadow if there's more content to the right
      const isAtRightEdge = Math.round(scrollLeft + clientWidth) >= scrollWidth - scrollThreshold;
      setShowRightShadow(!isAtRightEdge);
    }
  }, []);

  const handleScrollRight = useCallback(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = tableContainerRef.current.scrollWidth;
    }
  }, []);

  const handleScrollLeft = useCallback(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = 0;
    }
  }, []);

  useEffect(() => {
    const currentRef = tableContainerRef.current;
    if (currentRef) {
      // Set initial state after the component mounts and renders
      const animationFrameId = requestAnimationFrame(handleScroll);
      
      // Add event listeners
      currentRef.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);

      // Cleanup function to remove listeners
      return () => {
        cancelAnimationFrame(animationFrameId);
        currentRef.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
    
    // No-op cleanup for when ref is null
    return () => {};
  }, [handleScroll, data]); // Re-run effect if data changes to re-evaluate scroll state

  return {
    tableContainerRef,
    showLeftShadow,
    showRightShadow,
    handleScrollRight,
    handleScrollLeft
  };
};

export default useTableScrollShadows;