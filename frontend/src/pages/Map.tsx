/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Define the type for map coordinates
type Coordinates = {
  lat: number;
  lng: number;
};

import { useNavigate } from 'react-router-dom';

const Map: React.FC = () => {
  // State for search box and marker
  const [search, setSearch] = useState("");
  const [currentCoords, setCurrentCoords] = useState<Coordinates>({ lat: 53.4129, lng: -7.9284 });
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!window.google) {
      console.error('Google Maps JavaScript API not loaded');
      return;
    }
    // Initialize the map
    mapInstance.current = new google.maps.Map(mapRef.current as HTMLElement, {
      center: currentCoords,
      zoom: 6,
      styles: [],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });
    // Place initial marker
    setMarker(new google.maps.Marker({
      position: currentCoords,
      map: mapInstance.current,
    }));
  }, []);

  // Update marker and center when currentCoords changes
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(currentCoords);
      if (marker) marker.setMap(null);
      const newMarker = new window.google.maps.Marker({
        position: currentCoords,
        map: mapInstance.current,
      });
      setMarker(newMarker);
    }
  }, [currentCoords]);

  // Setup autocomplete after mount
  useEffect(() => {
    if (!window.google || !inputRef.current) return;
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current!);
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current!.getPlace();
      if (
        place.geometry &&
        place.geometry.location &&
        typeof place.geometry.location.lat === "function" &&
        typeof place.geometry.location.lng === "function"
      ) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        if (
          typeof lat === "number" && typeof lng === "number" &&
          !isNaN(lat) && !isNaN(lng)
        ) {
          setCurrentCoords({ lat, lng });
        }
      }
    });
  }, [inputRef.current]);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
      
        <Paper 
          elevation={6} 
          sx={{ 
            position: 'absolute', 
            top: 72, // move below the button (16 + ~56px for button height)
            left: 16, 
            zIndex: 1000, 
            p: 1.2,
            backgroundColor: 'rgba(255,255,255,0.96)',
            minWidth: 180,
            maxWidth: 260,
            boxShadow: 3,
            pointerEvents: 'auto',
          }}
      >
        <Typography variant="subtitle1" sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>Map</Typography>
        <TextField
          inputRef={inputRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search location"
          size="small"
          sx={{ mt: 0.5, mb: 0.5, width: '100%' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton tabIndex={-1} edge="end" size="small">
                  <SearchIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Typography variant="caption" sx={{ fontSize: 12 }}>
          {typeof currentCoords.lat === "number" && typeof currentCoords.lng === "number"
            ? `${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}`
            : "N/A"}
        </Typography>
      </Paper>
      <Box 
        ref={mapRef} 
        sx={{ 
          height: '80%', 
          width: '80%'
        }} 
      />
    </Box>
  );
};

export default Map;