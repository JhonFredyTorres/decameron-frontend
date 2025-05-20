import React, { createContext, useState, useEffect } from 'react';
import { hotelService, roomTypeService, accommodationService } from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [hotels, setHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [hotelsRes, roomTypesRes, accommodationsRes] = await Promise.all([
        hotelService.getAll(),
        roomTypeService.getAll(),
        accommodationService.getAll()
      ]);

      setHotels(hotelsRes.data);
      setRoomTypes(roomTypesRes.data);
      setAccommodations(accommodationsRes.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Error cargando datos iniciales. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const value = {
    hotels,
    setHotels,
    roomTypes,
    accommodations,
    loading,
    error,
    refetch: fetchInitialData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};