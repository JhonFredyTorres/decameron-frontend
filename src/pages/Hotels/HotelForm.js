import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AppContext } from '../../context/AppContext';
import { hotelService } from '../../services/api';
import Alert from '../../components/Alert';

const HotelSchema = Yup.object().shape({
  name: Yup.string()
    .required('El nombre es obligatorio')
    .max(255, 'El nombre no debe exceder los 255 caracteres'),
  address: Yup.string()
    .required('La dirección es obligatoria')
    .max(255, 'La dirección no debe exceder los 255 caracteres'),
  city: Yup.string()
    .required('La ciudad es obligatoria')
    .max(255, 'La ciudad no debe exceder los 255 caracteres'),
  nit: Yup.string()
    .required('El NIT es obligatorio')
    .max(255, 'El NIT no debe exceder los 255 caracteres'),
  total_rooms: Yup.number()
    .required('El número de habitaciones es obligatorio')
    .positive('El número de habitaciones debe ser positivo')
    .integer('El número de habitaciones debe ser un número entero'),
});

const HotelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hotels, setHotels } = useContext(AppContext);
  const [hotel, setHotel] = useState({
    name: '',
    address: '',
    city: '',
    nit: '',
    total_rooms: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const fetchHotel = async () => {
        try {
          setLoading(true);
          const response = await hotelService.get(id);
          setHotel(response.data);
        } catch (error) {
          console.error('Error fetching hotel:', error);
          setAlert({
            type: 'danger',
            message: 'Error al cargar los datos del hotel.',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchHotel();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);
      
      if (isEditMode) {
        const response = await hotelService.update(id, values);
        setHotels(hotels.map(h => (h.id === parseInt(id) ? response.data : h)));
        setAlert({ type: 'success', message: 'Hotel actualizado correctamente.' });
      } else {
        const response = await hotelService.create(values);
        setHotels([...hotels, response.data]);
        setAlert({ type: 'success', message: 'Hotel creado correctamente.' });
        
        // Redireccionar después de unos segundos
        setTimeout(() => {
          navigate('/hotels');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setAlert({ type: 'danger', message: error.response.data.message });
      } else {
        setAlert({ 
          type: 'danger', 
          message: 'Error al guardar el hotel. Por favor, inténtalo de nuevo.' 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">{isEditMode ? 'Editar Hotel' : 'Nuevo Hotel'}</h3>
          </div>
          <div className="card-body">
            {alert.message && (
              <Alert 
                type={alert.type} 
                message={alert.message} 
                onClose={() => setAlert({ type: '', message: '' })} 
              />
            )}
            
            <Formik
              initialValues={hotel}
              validationSchema={HotelSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre</label>
                    <Field 
                      id="name" 
                      name="name" 
                      type="text" 
                      className={`form-control ${errors.name && touched.name ? 'is-invalid' : ''}`} 
                    />
                    <ErrorMessage name="name" component="div" className="invalid-feedback" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Dirección</label>
                    <Field 
                      id="address" 
                      name="address" 
                      type="text" 
                      className={`form-control ${errors.address && touched.address ? 'is-invalid' : ''}`} 
                    />
                    <ErrorMessage name="address" component="div" className="invalid-feedback" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="city" className="form-label">Ciudad</label>
                    <Field 
                      id="city" 
                      name="city" 
                      type="text" 
                      className={`form-control ${errors.city && touched.city ? 'is-invalid' : ''}`} 
                    />
                    <ErrorMessage name="city" component="div" className="invalid-feedback" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="nit" className="form-label">NIT</label>
                    <Field 
                      id="nit" 
                      name="nit" 
                      type="text" 
                      className={`form-control ${errors.nit && touched.nit ? 'is-invalid' : ''}`} 
                    />
                    <ErrorMessage name="nit" component="div" className="invalid-feedback" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="total_rooms" className="form-label">Número de Habitaciones</label>
                    <Field 
                      id="total_rooms" 
                      name="total_rooms" 
                      type="number" 
                      className={`form-control ${errors.total_rooms && touched.total_rooms ? 'is-invalid' : ''}`} 
                    />
                    <ErrorMessage name="total_rooms" component="div" className="invalid-feedback" />
                  </div>

                  <div className="d-flex justify-content-between">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => navigate('/hotels')}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={isSubmitting}
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

export default HotelForm;