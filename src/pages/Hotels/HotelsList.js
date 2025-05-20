import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { hotelService } from '../../services/api';
import Alert from '../../components/Alert';

const HotelsList = () => {
  const { hotels, setHotels, loading } = useContext(AppContext);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este hotel?')) {
      try {
        await hotelService.delete(id);
        setHotels(hotels.filter(hotel => hotel.id !== id));
        setAlert({ type: 'success', message: 'Hotel eliminado correctamente.' });
      } catch (error) {
        console.error('Error al eliminar el hotel:', error);
        setAlert({ type: 'danger', message: 'Error al eliminar el hotel. Por favor, inténtalo de nuevo.' });
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Hoteles</h2>
        <Link to="/hotels/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i> Nuevo Hotel
        </Link>
      </div>

      {alert.message && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert({ type: '', message: '' })} 
        />
      )}

      {hotels.length === 0 ? (
        <div className="alert alert-info">No hay hoteles registrados.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Dirección</th>
                <th>NIT</th>
                <th>Habitaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel.id}>
                  <td>{hotel.name}</td>
                  <td>{hotel.city}</td>
                  <td>{hotel.address}</td>
                  <td>{hotel.nit}</td>
                  <td>{hotel.total_rooms}</td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link to={`/hotels/${hotel.id}/rooms`} className="btn btn-info btn-sm me-2">
                        <i className="bi bi-door-open"></i> Habitaciones
                      </Link>
                      <Link to={`/hotels/edit/${hotel.id}`} className="btn btn-warning btn-sm me-2">
                        <i className="bi bi-pencil"></i> Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(hotel.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HotelsList;