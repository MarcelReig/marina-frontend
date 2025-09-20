import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";
import http from "../../api/http";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "react-photo-album/styles.css";
import "yet-another-react-lightbox/styles.css";
// Import lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const PortfolioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [portfolioItem, setPortfolioItem] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadingCount, setImageLoadingCount] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const processGallery = useCallback((gallery) => {
    if (!gallery || gallery.length === 0) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    setImageLoadingCount(gallery.length);
    
    const imagePromises = gallery.map((dataURL, index) => 
      new Promise((resolve, reject) => {
        const img = new window.Image();
        
        const cleanup = () => {
          img.onload = null;
          img.onerror = null;
        };
        
        img.onload = () => {
          cleanup();
          setImageLoadingCount(prev => prev - 1);
          resolve({
            src: dataURL,
            width: img.naturalWidth,
            height: img.naturalHeight,
            alt: `${portfolioItem?.name || 'Portfolio'} - Imagen ${index + 1}`,
          });
        };
        
        img.onerror = () => {
          cleanup();
          setImageLoadingCount(prev => prev - 1);
          console.error(`Failed to load image: ${dataURL}`);
          reject(new Error(`Failed to load image ${index + 1}`));
        };
        
        img.src = dataURL;
      })
    );

    Promise.allSettled(imagePromises)
      .then((results) => {
        const successfulPhotos = results
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);
        
        setPhotos(successfulPhotos);
        
        const failedCount = results.filter(result => result.status === 'rejected').length;
        if (failedCount > 0) {
          console.warn(`${failedCount} images failed to load`);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [portfolioItem?.name]);

  useEffect(() => {
    const getPortfolioItem = async () => {
      if (!id) {
        setError("ID del álbum no válido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await http.get(`/portfolio/${id}`);
        
        if (!response.data) {
          throw new Error("No se encontraron datos del álbum");
        }
        
        setPortfolioItem(response.data);
        processGallery(response.data.gallery);
        
      } catch (error) {
        console.error("getPortfolioItem error", error);
        setError(
          error.response?.data?.error || 
          error.message || 
          "Error al cargar el álbum"
        );
        setLoading(false);
      }
    };

    getPortfolioItem();
  }, [id, processGallery]);

  // Handlers
  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handlePhotoClick = ({ index }) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="portfolio-detail-wrapper">
        <div className="portfolio-detail-navigation">
          <button 
            onClick={handleBackClick} 
            className="back-button"
            aria-label="Volver atrás"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Volver</span>
          </button>
          <nav className="breadcrumb" aria-label="Navegación">
            <Link to="/">Inicio</Link>
            <span className="separator">›</span>
            <span>Cargando...</span>
          </nav>
        </div>
        
        <div className="loading-state">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <h2>Cargando álbum...</h2>
          {imageLoadingCount > 0 && (
            <p>Procesando {imageLoadingCount} imagen{imageLoadingCount > 1 ? 's' : ''}...</p>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="portfolio-detail-wrapper">
        <div className="portfolio-detail-navigation">
          <button 
            onClick={handleBackClick} 
            className="back-button"
            aria-label="Volver atrás"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Volver</span>
          </button>
        </div>
        
        <div className="error-state">
          <h2>¡Oops! Algo salió mal</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="btn">
              Intentar de nuevo
            </button>
            <button onClick={handleHomeClick} className="btn btn-secondary">
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!portfolioItem) {
    return (
      <div className="portfolio-detail-wrapper">
        <div className="portfolio-detail-navigation">
          <button 
            onClick={handleBackClick} 
            className="back-button"
            aria-label="Volver atrás"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Volver</span>
          </button>
        </div>
        
        <div className="empty-state">
          <h2>Álbum no encontrado</h2>
          <p>El álbum que buscas no existe o ha sido eliminado.</p>
          <button onClick={handleHomeClick} className="btn">
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const { description, name } = portfolioItem;

  return (
    <div className="portfolio-detail-wrapper">
      {/* Navigation */}
      <div className="portfolio-detail-navigation">
        <button 
          onClick={handleBackClick} 
          className="back-button"
          aria-label="Volver atrás"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Volver</span>
        </button>
        
        <nav className="breadcrumb" aria-label="Navegación">
          <Link to="/">Inicio</Link>
          <span className="separator">›</span>
          <span className="current">{name}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="portfolio-detail-header">
        <h1>{name}</h1>
        {description && <p className="description">{description}</p>}
        {photos.length > 0 && (
          <p className="photo-count">
            {photos.length} imagen{photos.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Gallery */}
      {photos.length > 0 ? (
        <div className="portfolio-gallery" role="img" aria-label={`Galería de ${name}`}>
          <PhotoAlbum
            photos={photos}
            layout="rows"
            targetRowHeight={150}
            rowConstraints={{ 
              singleRowMaxHeight: 300,
              minPhotosInRow: 1,
              maxPhotosInRow: 3
            }}
            spacing={10}
            onClick={handlePhotoClick}
          />
          
          {/* Lightbox */}
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={lightboxIndex}
            slides={photos.map(photo => ({
              src: photo.src,
              alt: photo.alt,
              width: photo.width,
              height: photo.height
            }))}
            plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
            animation={{ fade: 300 }}
            controller={{ 
              closeOnPullDown: true, 
              closeOnBackdropClick: true 
            }}
            zoom={{
              maxZoomPixelRatio: 3,
              zoomInMultiplier: 2,
              doubleTapDelay: 300,
              doubleClickDelay: 300,
              doubleClickMaxStops: 2,
              keyboardMoveDistance: 50,
              wheelZoomDistanceFactor: 100,
              pinchZoomDistanceFactor: 100,
              scrollToZoom: true
            }}
            thumbnails={{
              position: "bottom",
              width: 120,
              height: 80,
              border: 2,
              borderRadius: 4,
              padding: 4,
              gap: 16
            }}
            slideshow={{
              autoplay: false,
              delay: 3000
            }}
          />
        </div>
      ) : (
        <div className="empty-gallery">
          <p>Este álbum no tiene imágenes aún.</p>
        </div>
      )}
    </div>
  );
};

// No props to validate for this component

export default PortfolioDetail;
