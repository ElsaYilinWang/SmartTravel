import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Define the type for map coordinates
type Coordinates = {
  lat: number;
  lng: number;
};

const Map: React.FC = () => {
  // State for storing the map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // State for current center position
  const [center, setCenter] = useState<Coordinates>({
    lat: 40.7128, // Default to New York City coordinates
    lng: -74.0060
  });

  // Ref for the map container div
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      // Check if Google Maps script is loaded
      if (!window.google) {
        console.error('Google Maps JavaScript API not loaded');
        return;
      }

      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        styles: [], // You can add custom styles here
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      setMap(newMap);
    };

    initMap();
  }, [center]);

  return (
    <Box sx={{ height: '100vh', width: '100%', position: 'relative' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          zIndex: 1, 
          p: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <Typography variant="h6">Interactive Map</Typography>
        <Typography variant="body2">
          Current Location: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
        </Typography>
      </Paper>
      
      {/* Map Container */}
      <Box 
        ref={mapRef} 
        sx={{ 
          height: '100%', 
          width: '100%'
        }} 
      />
    </Box>
  );
};

export default Map;