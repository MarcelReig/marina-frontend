import { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';
import http from '../../api/http';

const InventoryForm = ({ onSuccessfulSubmission, onFormSubmissionError }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: {
            file,
            dataURL: e.target.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const baseStyle = useMemo(() => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  }), []);

  const focusedStyle = useMemo(() => ({ borderColor: '#2196f3' }), []);
  const acceptStyle = useMemo(() => ({ borderColor: '#00e676' }), []);
  const rejectStyle = useMemo(() => ({ borderColor: '#ff1744' }), []);

  const dropzoneStyle = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
  }), [baseStyle, focusedStyle, acceptStyle, rejectStyle, isFocused, isDragAccept, isDragReject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.description || !formData.image) {
      onFormSubmissionError?.('Todos los campos son obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await http.post('/store', {
        name: formData.name,
        description: formData.description,
        image: formData.image.dataURL,
        price: Math.round(parseFloat(formData.price) * 100) // Convertir euros a céntimos
      });

      onSuccessfulSubmission?.(response.data);

      // Reset form
      setFormData({
        name: '',
        price: '',
        description: '',
        image: null
      });

      // Clear dropzone preview by resetting input (react-dropzone keeps no files, preview is from state)

    } catch (error) {
      console.error('Error creating product:', error);
      onFormSubmissionError?.(error.response?.data?.error || 'Error al crear el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="portfolio-form-wrapper">
      <h2>Inventory Manager</h2>
      
      <div className="one-column">
        <input
          type="text"
          name="name"
          placeholder="Nombre del producto"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="one-column">
        <input
          type="number"
          name="price"
          placeholder="Precio en euros (ej: 15.99)"
          value={formData.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="one-column">
        <textarea
          name="description"
          placeholder="Descripción del producto"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="image-uploaders">
        <div {...getRootProps({ style: dropzoneStyle })} className="dropzone">
          <input {...getInputProps()} />
          <div className="dz-message">
            {isSubmitting ? (
              <div className="uploading-state">
                <div className="spinner"></div>
                <p>Subiendo imagen...</p>
              </div>
            ) : formData.image ? (
              <div className="uploaded-image">
                <img
                  src={formData.image.dataURL}
                  alt="Preview"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
                <p>Arrastra otra imagen para reemplazar</p>
              </div>
            ) : (
              <p>Arrastra aquí la imagen del producto o haz clic para seleccionar</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <button 
          className="btn" 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Añadir producto'}
        </button>
      </div>
    </form>
  );
};

InventoryForm.propTypes = {
  onSuccessfulSubmission: PropTypes.func,
  onFormSubmissionError: PropTypes.func,
};

export default InventoryForm;

