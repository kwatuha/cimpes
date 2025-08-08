// src/components/EmbeddedArcGISMap.jsx
import React from 'react';

// Accept mapUrl as a prop
const EmbeddedArcGISMap = ({ mapUrl }) => {
  // Use the provided mapUrl, or a default one if none is provided
  const defaultMapUrl = "https://esrieagovernment.maps.arcgis.com/apps/mapviewer/index.html?panel=gallery&suggestField=true&layerId=1&layers=e491051538b847918e9b587735a32427";
  const finalMapUrl = mapUrl || defaultMapUrl;

  const openMap = () => {
    window.open(finalMapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4">
      <div className="text-center">
        <p className="mb-4 text-lg text-gray-700">
          Click the button below to view the ArcGIS Map in a new window.
        </p>
        <button
          onClick={openMap}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Open ArcGIS Map
        </button>
      </div>
    </div>
  );
};

export default EmbeddedArcGISMap;
