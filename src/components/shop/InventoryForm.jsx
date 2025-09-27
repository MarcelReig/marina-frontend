import { useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';
import http from '../../api/http';
import { toast } from 'react-hot-toast';
import { uploadToCloudinary } from '../../utils/cloudinary';

const InventoryForm = ({ onSuccessfulSubmission, onFormSubmissionError, editMode = false, initialData = null, onCancel = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load initial data in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price ? (initialData.price / 100).toFixed(2) : '', // Convert cents to euros
        description: initialData.description || '',
        image: initialData.image ? { dataURL: initialData.image } : null
      });
    }
  }, [editMode, initialData]);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFormData(prev => ({
        ...prev,
        image: { file }
      }));
    }
  };

  const MAX_PRODUCT_SIZE = 5 * 1024 * 1024;
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic']
    },
    maxFiles: 1,
    maxSize: MAX_PRODUCT_SIZE,
    onDropRejected: (fileRejections) => {
      const tooLarge = fileRejections.some((rej) => (rej.errors || []).some((e) => e.code === 'file-too-large'));
      if (tooLarge) {
        toast.error(`La imagen supera el límite de ${(MAX_PRODUCT_SIZE / (1024 * 1024)).toFixed(0)} MB.`);
      } else {
        toast.error('Archivo no válido. Formatos permitidos: JPG, PNG, WEBP, HEIC.');
      }
    },
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
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name) newErrors.name = 'El nombre es obligatorio';
    if (!formData.price) newErrors.price = 'El precio es obligatorio';
    if (!formData.description) newErrors.description = 'La descripción es obligatoria';
    if (!formData.image) newErrors.image = 'La imagen es obligatoria';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Math.round(parseFloat(formData.price) * 100) // Convert euros to cents
      };

      // Upload to Cloudinary if new file present
      if (formData.image && formData.image.file) {
        const url = await uploadToCloudinary(formData.image.file, {
          preset: import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET,
          folder: 'store/products'
        });
        payload.image = url;
      } else if (editMode && formData.image && formData.image.dataURL) {
        payload.image = formData.image.dataURL; // keep existing URL for edit
      }

      const response = await toast.promise(
        editMode && initialData
          ? http.put(`/store/${initialData._id}`, payload)
          : http.post('/store', payload),
        {
          loading: editMode ? 'Actualizando producto...' : 'Guardando producto...',
          success: editMode ? 'Producto actualizado' : 'Producto creado',
          error: editMode ? 'No se pudo actualizar el producto' : 'No se pudo crear el producto',
        }
      );

      onSuccessfulSubmission?.(response.data);

      // Reset form only if not in edit mode
      if (!editMode) {
        setFormData({
          name: '',
          price: '',
          description: '',
          image: null
        });
      }

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
      <h2>{editMode ? 'Editar Producto' : 'Inventory Manager'}</h2>
      
      <div className="one-column">
        <input
          type="text"
          name="name"
          placeholder="Nombre del producto"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <small className="field-error" aria-live="polite">{errors.name}</small>}
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
        {errors.price && <small className="field-error" aria-live="polite">{errors.price}</small>}
      </div>

      <div className="one-column">
        <textarea
          name="description"
          placeholder="Descripción del producto"
          value={formData.description}
          onChange={handleChange}
          required
        />
        {errors.description && <small className="field-error" aria-live="polite">{errors.description}</small>}
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
                {formData.image.dataURL ? (
                  <img
                    src={formData.image.dataURL}
                    alt="Preview"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                ) : (
                  <p>Imagen lista para subir: {formData.image.file?.name}</p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <p style={{ margin: 0, flex: 1 }}>Arrastra otra imagen para reemplazar</p>
                  <button type="button" className="btn secondary" onClick={() => setFormData(prev => ({ ...prev, image: null }))}>
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <p>Arrastra aquí la imagen del producto o haz clic para seleccionar</p>
            )}
          </div>
        </div>
        {errors.image && <small className="field-error" aria-live="polite">{errors.image}</small>}
        <small style={{ display: 'block', marginTop: 8, opacity: 0.8 }}>
          Formatos: JPG, PNG, WEBP, HEIC — Máx. 5 MB
        </small>
      </div>

      <div className="form-actions">
        <button 
          className="btn" 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (editMode ? 'Actualizando...' : 'Creando...') 
            : (editMode ? 'Actualizar producto' : 'Añadir producto')
          }
        </button>
        {editMode && onCancel && (
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

InventoryForm.propTypes = {
  onSuccessfulSubmission: PropTypes.func,
  onFormSubmissionError: PropTypes.func,
  editMode: PropTypes.bool,
  initialData: PropTypes.object,
  onCancel: PropTypes.func,
};

export default InventoryForm;

