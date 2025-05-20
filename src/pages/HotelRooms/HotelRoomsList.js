import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { hotelService, hotelRoomService } from '../../services/api';
import Alert from '../../components/Alert';

const HotelRoomsList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [hotelRooms, setHotelRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hotelResponse, roomsResponse] = await Promise.all([
          hotelService.get(id),
          hotelService.getRooms(id)
        ]);
        
        setHotel(hotelResponse.data);
        setHotelRooms(roomsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlert({
          type: 'danger',
          message: 'Error al cargar los datos. Por favor, inténtalo de nuevo.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Calcular el total de habitaciones configuradas
  const totalConfiguredRooms = hotelRooms.reduce((sum, room) => sum + room.quantity, 0);
  
  // Calcular el número de habitaciones disponibles
  const availableRooms = hotel ? hotel.total_rooms - totalConfiguredRooms : 0;

  const handleDelete = async (roomId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta configuración de habitación?')) {
      try {
        await hotelRoomService.delete(roomId);
        setHotelRooms(hotelRooms.filter(room => room.id !== roomId));
        setAlert({ 
          type: 'success', 
          message: 'Configuración de habitación eliminada correctamente.' 
        });
      } catch (error) {
        console.error('Error deleting room configuration:', error);
        setAlert({ 
          type: 'danger', 
          message: 'Error al eliminar la configuración de habitación.' 
        });
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (!hotel) {
    return <div className="alert alert-danger">Hotel no encontrado.</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Habitaciones - {hotel.name}</h2>
          <p className="text-muted">
            Ciudad: {hotel.city} | Dirección: {hotel.address} | NIT: {hotel.nit}
          </p>
        </div>
        <div>
          <button 
            onClick={() => navigate('/hotels')} 
            className="btn btn-secondary me-2"
          >
            Volver a Hoteles
          </button>
          {availableRooms > 0 && (
            <Link 
              to={`/hotels/${id}/rooms/new`} 
              className="btn btn-primary"
            >
              <i className="bi bi-plus-circle me-2"></i> Agregar Habitación
            </Link>
          )}
        </div>
      </div>

      {alert.message && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert({ type: '', message: '' })} 
        />
      )}

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Resumen de Habitaciones</h5>
              <div className="d-flex justify-content-between">
                <p className="mb-1">Total de habitaciones:</p>
                <p className="mb-1 fw-bold">{hotel.total_rooms}</p>
              </div>
              <div className="d-flex justify-content-between">
                <p className="mb-1">Habitaciones configuradas:</p>
                <p className="mb-1 fw-bold">{totalConfiguredRooms}</p>
              </div>
              <div className="d-flex justify-content-between">
                <p className="mb-1">Habitaciones disponibles:</p>
                <p className={`mb-1 fw-bold ${availableRooms === 0 ? 'text-danger' : 'text-success'}`}>
                  {availableRooms}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hotelRooms.length === 0 ? (
        <div className="alert alert-info">
          No hay configuraciones de habitaciones registradas para este hotel.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-light">
              <tr>
                <th>Tipo de Habitación</th>
                <th>Acomodación</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {hotelRooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.room_type?.name ?? 'N/A'}</td>
                  <td>{room.accommodation?.name ?? 'N/A'}</td>
                  <td>{room.quantity}</td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link 
                        to={`/hotels/${id}/rooms/edit/${room.id}`} 
                        className="btn btn-warning btn-sm me-2"
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(room.id)}
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

export default HotelRoomsList;