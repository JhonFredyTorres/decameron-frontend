import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Importar componentes de páginas
import Navbar from './components/Navbar';
import HotelsList from './pages/Hotels/HotelsList';
import HotelForm from './pages/Hotels/HotelForm';
import HotelRoomsList from './pages/HotelRooms/HotelRoomsList';
import HotelRoomForm from './pages/HotelRooms/HotelRoomForm';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container mt-4">
            <Routes>
              <Route path="/hotels" element={<HotelsList />} />
              <Route path="/hotels/new" element={<HotelForm />} />
              <Route path="/hotels/edit/:id" element={<HotelForm />} />
              <Route path="/hotels/:id/rooms" element={<HotelRoomsList />} />
              <Route path="/hotels/:id/rooms/new" element={<HotelRoomForm />} />
              <Route path="/hotels/:hotelId/rooms/edit/:id" element={<HotelRoomForm />} />
              <Route path="/" element={<Navigate to="/hotels" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;