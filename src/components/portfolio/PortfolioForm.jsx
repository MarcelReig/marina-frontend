import { useState, useCallback } from "react";
import axios from "axios";
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

// Form component to add new portfolio items
const PortfolioForm = ({
  handleSuccessfulFormSubmission, 
  handleFormSubmissionError,
}) => {
  const [formState, setFormState] = useState({
    collection_name: "",
    description: "",
    thumb_img_url: "",
    gallery: [],
  });

  const onThumbDrop = useCallback((acceptedFiles) => {
    setFormState((prevState) => ({
      ...prevState,
      thumb_img_url: URL.createObjectURL(acceptedFiles[0]),
    }));
  }, []);

  const onGalleryDrop = useCallback((acceptedFiles) => {
    setFormState((prevState) => ({
      ...prevState,
      gallery: acceptedFiles.map((file) => URL.createObjectURL(file)),
    }));
  }, []);

  const { getRootProps: getThumbRootProps, getInputProps: getThumbInputProps, isFocused: isThumbFocused, isDragAccept: isThumbDragAccept, isDragReject: isThumbDragReject } =
    useDropzone({
      onDrop: onThumbDrop,
      accept: "image/jpeg, image/jpg, image/png",
      multiple: false,
    });

 
  const {
    getRootProps: getGalleryRootProps,
    getInputProps: getGalleryInputProps,
    isFocused: isGalleryFocused,
    isDragAccept: isGalleryDragAccept,
    isDragReject: isGalleryDragReject 
  } = useDropzone({
    onDrop: onGalleryDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.png']
    },
    multiple: true,
  });


  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("https://marina-backend.onrender.com/add", {
        collection_name: formState.collection_name,
        description: formState.description,
        thumb_img_url: formState.thumb_img_url,
        gallery: formState.gallery,
      })
      .then((response) => {
        handleSuccessfulFormSubmission(response.data);

        setFormState({
          collection_name: "",
          description: "",
          thumb_img_url: "",
          gallery: [],
        });
      })
      .catch((error) => {
        console.log("portfolio form handleSubmit error", error);
        handleFormSubmissionError(error);
      });
  };

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
        <h2>Portfolio Manager</h2>
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
        <div {...getThumbRootProps({ style: getThumbStyle() })} className="dropzone">
            <input {...getThumbInputProps()} />
            {formState.thumb_img_url ? (
              <img src={formState.thumb_img_url} alt="Thumbnail" style={imgPreviewStyle} />
            ) : (
              <p>Arrastra aquí la imagen de portada</p>
            )}
          </div>

          <div {...getGalleryRootProps({ style: getGalleryStyle() })} className="dropzone">
            <input {...getGalleryInputProps()} />
            {formState.gallery.length > 0 ? (
              formState.gallery.map((url, index) => (
                <img key={index} src={url} alt={`Gallery ${index}`} style={imgPreviewStyle} />
              ))
            ) : (
              <p>Arrastra aquí las imágenes de la galería</p>
            )}
          </div>
        </div>

        <button className="btn" type="submit">
          Añadir colección
        </button>
      </form>
    </div>
  );
};

PortfolioForm.propTypes = {
  handleSuccessfulFormSubmission: PropTypes.func.isRequired,
  handleFormSubmissionError: PropTypes.func.isRequired,
};

export default PortfolioForm;
