import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AppContext } from '../../context/AppContext';
import { hotelService, hotelRoomService, roomTypeService } from '../../services/api';
import Alert from '../../components/Alert';

const HotelRoomSchema = Yup.object().shape({
  room_type_id: Yup.number()
    .required('El tipo de habitación es obligatorio'),
  accommodation_id: Yup.number()
    .required('La acomodación es obligatoria'),
  quantity: Yup.number()
    .required('La cantidad es obligatoria')
    .positive('La cantidad debe ser positiva')
    .integer('La cantidad debe ser un número entero'),
});

const HotelRoomForm = () => {
  // Obtener los parámetros de la URL de forma más flexible
  const params = useParams();
  const hotelId = params.hotelId || params.id;
  const id = params.id && params.hotelId ? params.id : null;
  
  const navigate = useNavigate();
  const { roomTypes } = useContext(AppContext);
  
  // Lista predefinida de acomodaciones para evitar problemas con la API
  const [accommodations] = useState([
    { id: 1, name: 'Sencilla' },
    { id: 2, name: 'Doble' },
    { id: 3, name: 'Triple' },
    { id: 4, name: 'Cuádruple' }
  ]);
  
  const [hotel, setHotel] = useState(null);
  const [hotelRoom, setHotelRoom] = useState({
    hotel_id: hotelId,
    room_type_id: '',
    accommodation_id: '',
    quantity: '',
  });
  const [validAccommodations, setValidAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const isEditMode = !!id;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        console.log("Fetching hotel with ID:", hotelId);
        
        // Fetch hotel data
        const hotelResponse = await hotelService.get(hotelId);
        console.log("Hotel data:", hotelResponse.data);
        setHotel(hotelResponse.data);
        
        // If in edit mode, fetch the hotelRoom data
        if (isEditMode) {
          const roomResponse = await hotelRoomService.get(id);
          setHotelRoom(roomResponse.data);
          
          // Set valid accommodations based on the room type
          const roomTypeId = roomResponse.data.room_type_id;
          if (roomTypeId) {
            setValidAccommodationsForRoomType(roomTypeId);
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Intenta obtener el hotel de otra manera si falla
        try {
          const hotelsResponse = await hotelService.getAll();
          const foundHotel = hotelsResponse.data.find(h => h.id.toString() === hotelId.toString());
          if (foundHotel) {
            setHotel(foundHotel);
          } else {
            setAlert({
              type: 'danger',
              message: 'Error al cargar los datos del hotel.',
            });
          }
        } catch (fallbackError) {
          console.error('Error in fallback:', fallbackError);
          setAlert({
            type: 'danger',
            message: 'Error al cargar los datos iniciales.',
          });
        }
      } finally {
        setInitialLoading(false);
      }
    };

    if (hotelId) {
      fetchInitialData();
    }
  }, [hotelId, id, isEditMode, accommodations]);

  // Función para establecer acomodaciones válidas basadas en el tipo de habitación
  const setValidAccommodationsForRoomType = (roomTypeId) => {
    const selectedRoomType = roomTypes.find(rt => rt.id.toString() === roomTypeId.toString());
    
    if (selectedRoomType) {
      let validAccoms = [];
      
      if (selectedRoomType.name === 'Estándar') {
        // Filtrar solo acomodaciones Sencilla y Doble
        validAccoms = accommodations.filter(acc => 
          acc.name === 'Sencilla' || acc.name === 'Doble');
      } else if (selectedRoomType.name === 'Junior') {
        // Filtrar solo acomodaciones Triple y Cuádruple
        validAccoms = accommodations.filter(acc => 
          acc.name === 'Triple' || acc.name === 'Cuádruple');
      } else if (selectedRoomType.name === 'Suite') {
        // Filtrar acomodaciones Sencilla, Doble y Triple
        validAccoms = accommodations.filter(acc => 
          acc.name === 'Sencilla' || acc.name === 'Doble' || acc.name === 'Triple');
      }
      
      setValidAccommodations(validAccoms);
    } else {
      setValidAccommodations([]);
    }
  };

  const handleRoomTypeChange = (roomTypeId, setFieldValue) => {
    if (!roomTypeId) {
      setValidAccommodations([]);
      setFieldValue('accommodation_id', '');
      return;
    }

    setLoading(true);
    
    // Establecer acomodaciones válidas basadas en el tipo de habitación
    setValidAccommodationsForRoomType(roomTypeId);
    
    // Reset accommodation selection
    setFieldValue('accommodation_id', '');
    
    setLoading(false);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);
      
      // Add hotel_id to values
      const dataToSubmit = { ...values, hotel_id: parseInt(hotelId) };
      
      if (isEditMode) {
        const response = await hotelRoomService.update(id, dataToSubmit);
        setAlert({ type: 'success', message: 'Configuración de habitación actualizada correctamente.' });
      } else {
        const response = await hotelRoomService.create(dataToSubmit);
        setAlert({ type: 'success', message: 'Configuración de habitación creada correctamente.' });
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/hotels/${hotelId}/rooms`);
      }, 2000);
    } catch (error) {
      console.error('Error saving hotel room configuration:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setAlert({ type: 'danger', message: error.response.data.message });
      } else {
        setAlert({ 
          type: 'danger', 
          message: 'Error al guardar la configuración de habitación. Por favor, inténtalo de nuevo.' 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (!hotel) {
    return <div className="alert alert-danger">Hotel no encontrado.</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">
              {isEditMode ? 'Editar Configuración de Habitación' : 'Nueva Configuración de Habitación'}
            </h3>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <h5>Hotel: {hotel.name}</h5>
              <p className="text-muted mb-0">
                Ciudad: {hotel.city} | Dirección: {hotel.address}
              </p>
            </div>
            
            {alert.message && (
              <Alert 
                type={alert.type} 
                message={alert.message} 
                onClose={() => setAlert({ type: '', message: '' })} 
              />
            )}
            
            <Formik
              initialValues={hotelRoom}
              validationSchema={HotelRoomSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ isSubmitting, errors, touched, setFieldValue, values }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="room_type_id" className="form-label">Tipo de Habitación</label>
                    <Field 
                      as="select"
                      id="room_type_id" 
                      name="room_type_id" 
                      className={`form-select ${errors.room_type_id && touched.room_type_id ? 'is-invalid' : ''}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFieldValue('room_type_id', value);
                        handleRoomTypeChange(value, setFieldValue);
                      }}
                    >
                      <option value="">Selecciona un tipo de habitación</option>
                      {roomTypes.map(roomType => (
                        <option key={roomType.id} value={roomType.id}>{roomType.name}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="room_type_id" component="div" className="invalid-feedback" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="accommodation_id" className="form-label">Acomodación</label>
                    <Field 
                      as="select"
                      id="accommodation_id" 
                      name="accommodation_id" 
                      className={`form-select ${errors.accommodation_id && touched.accommodation_id ? 'is-invalid' : ''}`}
                      disabled={validAccommodations.length === 0 || loading}
                    >
                      <option value="">Selecciona una acomodación</option>
                      {validAccommodations.map(accommodation => (
                        <option key={accommodation.id} value={accommodation.id}>{accommodation.name}</option>
                      ))}
                    </Field>
                    {loading && <div className="text-muted mt-1">Cargando acomodaciones...</div>}
                    <ErrorMessage name="accommodation_id" component="div" className="invalid-feedback" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="quantity" className="form-label">Cantidad</label>
                    <Field 
                      id="quantity" 
                      name="quantity" 
                      type="number" 
                      className={`form-control ${errors.quantity && touched.quantity ? 'is-invalid' : ''}`} 
                    />
                    <ErrorMessage name="quantity" component="div" className="invalid-feedback" />
                  </div>

                  <div className="d-flex justify-content-between">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => navigate(`/hotels/${hotelId}/rooms`)}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Guardando...
                        </>
                      ) : (
                        'Guardar'
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelRoomForm;