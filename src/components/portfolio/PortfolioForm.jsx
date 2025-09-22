import { useState, useCallback, useEffect } from "react";
import http from "../../api/http";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";

// Dropzone styles
const baseStyle = {
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
};

const focusedStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

const imgPreviewStyle = {
  maxWidth: '100px',
  margin: '10px'
};

// Base URL handled by http client

// Form component to add new portfolio items
const PortfolioForm = ({
  handleSuccessfulFormSubmission, 
  handleFormSubmissionError,
  editMode = false,
  initialData = null,
  onCancel = null,
}) => {
  const [formState, setFormState] = useState({
    collection_name: "",
    description: "",
    thumb_img_url: null, // File object, no base64
    gallery: [], // Array of File objects
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cargar datos iniciales en modo edición
  useEffect(() => {
    if (editMode && initialData) {
      setFormState({
        collection_name: initialData.name || "",
        description: initialData.description || "",
        thumb_img_url: initialData.thumb_img_url || null,
        gallery: initialData.gallery || [],
      });
    }
  }, [editMode, initialData]);
  

  // Convertir archivo a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Imagen de portada
  const onThumbDrop = useCallback((acceptedFiles) => {
    setFormState((prevState) => ({
      ...prevState,
      thumb_img_url: acceptedFiles[0],
    }));
  }, []);

  // Imágenes de la galería
  const onGalleryDrop = useCallback((acceptedFiles) => {
    setFormState((prevState) => ({
      ...prevState,
      gallery: acceptedFiles,
    }));
  }, []);
  

  // Configuración de Dropzone de imagen de portada
  const { getRootProps: getThumbRootProps, getInputProps: getThumbInputProps, isFocused: isThumbFocused, isDragAccept: isThumbDragAccept, isDragReject: isThumbDragReject } =
    useDropzone({
      onDrop: onThumbDrop,
      accept: {
        'image/png': ['.png'],
        'image/jpg': ['.jpg'],
        'image/jpeg': ['.jpeg']
      },
      multiple: false,
    });

 // Configuración de Dropzone de galería
  const {
    getRootProps: getGalleryRootProps,
    getInputProps: getGalleryInputProps,
    isFocused: isGalleryFocused,
    isDragAccept: isGalleryDragAccept,
    isDragReject: isGalleryDragReject 
  } = useDropzone({
    onDrop: onGalleryDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpg': ['.jpg'],
      'image/jpeg': ['.jpeg']
    },
    maxSize: 2 * 1024 * 1024,
    multiple: true,
  });

// Manejadores de eventos
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

// Manejo de envio de formulario
const handleSubmit = async (event) => {
  event.preventDefault();
  
  setIsSubmitting(true);

  try {
    // En modo edición, solo convertir a base64 si son archivos nuevos
    const thumbBase64 = (formState.thumb_img_url && typeof formState.thumb_img_url === 'object' && formState.thumb_img_url.constructor === File)
      ? await fileToBase64(formState.thumb_img_url)
      : formState.thumb_img_url; // Mantener URL existente
      
    const galleryBase64Array = await Promise.all(
      formState.gallery.map(async (item) => {
        if (typeof item === 'string') {
          return item; // Es una URL existente
        }
        return await fileToBase64(item); // Es un archivo nuevo
      })
    );

    const formData = {
      name: formState.collection_name,
      description: formState.description,
      thumb_img_url: thumbBase64,
      gallery: galleryBase64Array,
    };

    let response;
    if (editMode && initialData) {
      // Extract ID properly (handle both string and object formats)
      const itemId = typeof initialData._id === 'object' ? initialData._id.$oid : initialData._id;
      response = await http.put(`/portfolio/${itemId}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      response = await http.post(`/portfolio`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    
    handleSuccessfulFormSubmission(response.data);
    setFormState({
      collection_name: "",
      description: "",
      thumb_img_url: null,
      gallery: [],
    });
    
  } catch (error) {
    console.log("portfolio form handleSubmit error", error);
    const errorMessage = error?.response?.data?.error || error?.message || 'Error inesperado al procesar el álbum';
    handleFormSubmissionError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  // Renderizado del componente
  
  // Dropzone styles
  const getThumbStyle = () => ({
    ...baseStyle,
    ...(isThumbFocused ? focusedStyle : {}),
    ...(isThumbDragAccept ? acceptStyle : {}),
    ...(isThumbDragReject ? rejectStyle : {}),
  });

  const getGalleryStyle = () => ({
    ...baseStyle,
    ...(isGalleryFocused ? focusedStyle : {}),
    ...(isGalleryDragAccept ? acceptStyle : {}),
    ...(isGalleryDragReject ? rejectStyle : {}),
  });

  return (
    <div>
      <form onSubmit={handleSubmit} className="portfolio-form-wrapper">
        <h2>{editMode ? 'Editar Álbum' : 'Portfolio Manager'}</h2>
        <div className="one-column">
          <input
            type="text"
            name="collection_name"
            placeholder="Nombre de la colección"
            value={formState.collection_name}
            onChange={handleChange}
          />
        </div>

        <div className="one-column">
          <textarea
            type="text"
            name="description"
            placeholder="Descripción"
            value={formState.description}
            onChange={handleChange}
          />
        </div>

        <div className="image-uploaders">
          <div
            {...getThumbRootProps({ style: getThumbStyle() })}
            className="dropzone"
          >
            <input {...getThumbInputProps()} />
            {isSubmitting ? (
              <div className="uploading-state">
                <div className="spinner"></div>
                <p>Subiendo imágenes...</p>
              </div>
            ) : formState.thumb_img_url ? (
              <img
                src={typeof formState.thumb_img_url === 'string' 
                  ? formState.thumb_img_url 
                  : URL.createObjectURL(formState.thumb_img_url)}
                alt="Thumbnail"
                style={imgPreviewStyle}
              />
            ) : (
              <p>Arrastra aquí la imagen de portada</p>
            )}
          </div>

          <div
            {...getGalleryRootProps({ style: getGalleryStyle() })}
            className="dropzone"
          >
            <input {...getGalleryInputProps()} />
            {isSubmitting ? (
              <div className="uploading-state">
                <div className="spinner"></div>
                <p>Subiendo imágenes...</p>
              </div>
            ) : formState.gallery.length > 0 ? (
              formState.gallery.map((file, index) => (
                <img
                  key={index}
                  src={typeof file === 'string' 
                    ? file 
                    : URL.createObjectURL(file)}
                  alt={`Gallery ${index}`}
                  style={imgPreviewStyle}
                />
              ))
            ) : (
              <p>Arrastra aquí las imágenes de la galería</p>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? 'Subiendo imágenes...' 
              : editMode 
                ? 'Actualizar álbum' 
                : 'Añadir colección'
            }
          </button>
          {editMode && onCancel && (
            <button type="button" className="btn secondary" onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

PortfolioForm.propTypes = {
  handleSuccessfulFormSubmission: PropTypes.func.isRequired,
  handleFormSubmissionError: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  initialData: PropTypes.object,
  onCancel: PropTypes.func,
};

export default PortfolioForm;
