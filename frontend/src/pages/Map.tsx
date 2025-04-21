/// <reference types="@types/google.maps" />
import { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Define the type for map coordinates
type Coordinates = {
  lat: number;
  lng: number;
};

const Map: React.FC = () => {
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

      new google.maps.Map(mapRef.current as HTMLElement, {
        center: {
          lat: 53.4129, // Dublin, Ireland coordinates
          lng: -7.9284
        },
        zoom: 6, // Adjusted zoom level for Ireland
        styles: [], // You can add custom styles here
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });
    };

    initMap();
  }, []);

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
          Current Location: 53.4129, -7.9284
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