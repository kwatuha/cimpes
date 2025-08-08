    // src/components/gis/MapComponent.jsx
    import React, { useRef, useEffect } from 'react'; // Ensure useRef and useEffect are imported
    import { MapContainer, TileLayer } from 'react-leaflet';
    import 'leaflet/dist/leaflet.css'; // Ensure Leaflet CSS is imported here as well

    /**
     * MapComponent
     * This component is a wrapper for react-leaflet's MapContainer.
     * It's designed to expose the Leaflet map instance to its parent component
     * (MapDataImportPage) once the map has fully initialized.
     *
     * @param {object} props - Component props
     * @param {React.ReactNode} props.children - Child components to render inside the map (e.g., Markers, Polylines)
     * @param {Array<number>} props.center - The initial geographical center of the map [latitude, longitude]
     * @param {number} props.zoom - The initial zoom level of the map
     * @param {object} props.style - Inline CSS styles to apply to the map container (e.g., height, width)
     * @param {function} props.onCreated - Callback function that receives the Leaflet map instance when it's created
     */
    function MapComponent({ children, center, zoom, style, onCreated }) {
      // 1. Create a ref to hold the DOM element/component instance
      const mapInstanceRef = useRef(null);

      // 2. Use useEffect to run code after the component mounts and the ref is assigned
      useEffect(() => {
        // This log MUST appear in your browser's console. If it doesn't,
        // it means this useEffect is not running, indicating a deeper issue
        // with how MapComponent is being rendered or compiled.
        console.log("[MapComponent] useEffect triggered.");

        // Check if the map instance is available through the ref
        // and if the onCreated callback was provided by the parent.
        if (mapInstanceRef.current && onCreated) {
          console.log("[MapComponent] Map instance found and onCreated callback exists. Calling onCreated.");
          // 3. Call the onCreated callback with the actual Leaflet map instance
          onCreated(mapInstanceRef.current);
        } else {
          console.log("[MapComponent] Map instance not yet available or onCreated is missing.");
          console.log("  mapInstanceRef.current (inside useEffect):", mapInstanceRef.current);
          console.log("  onCreated (inside useEffect):", onCreated);
        }

        // This effect runs once after the initial render because its dependency array is empty.
        // It will also re-run if 'onCreated' function reference changes (though it shouldn't often).
      }, [onCreated]); // Dependency array: re-run if 'onCreated' prop changes

      return (
        <MapContainer
          center={center}
          zoom={zoom}
          style={style}
          // CRITICAL: Assign the ref to the MapContainer.
          // This is how react-leaflet v5+ provides access to the map instance.
          ref={mapInstanceRef}
          // You can add other global MapContainer props here if needed,
          // for example, to control scroll wheel zoom or other behaviors.
          // scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {children}
        </MapContainer>
      );
    }

    export default MapComponent;
    