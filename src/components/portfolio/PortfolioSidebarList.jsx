import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faGripVertical, faSearch } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { useState, useEffect, useRef, useCallback } from 'react';
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import http from "../../api/http";
import { thumbUrl } from "../../utils/cloudinary";
import ConfirmDialog from '../shared/ConfirmDialog';

const PortfolioSidebarList = ({ data = [], handleDeleteClick, onReorder }) => {
  const navigate = useNavigate();
  const [confirmState, setConfirmState] = useState({ open: false, item: null });
  const [query, setQuery] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const listRef = useRef(null);
  
  const handleEditClick = (portfolioItem) => {
    const id = typeof portfolioItem._id === 'object' ? portfolioItem._id.$oid : portfolioItem._id;
    navigate(`/portfolio-manager/edit/${id}`);
  };

  const handleReorder = useCallback(async (sourceIndex, destinationIndex) => {
    setIsReordering(true);
    
    try {
      const getId = (item) => (typeof item._id === 'object' ? item._id.$oid : item._id);

      // Work with filtered view for indices but reorder the FULL list
      const filtered = data.filter(i => i.name.toLowerCase().includes(query.trim().toLowerCase()));
      const sourceItem = filtered[sourceIndex];
      const destinationItem = filtered[destinationIndex];
      if (!sourceItem || !destinationItem) {
        return;
      }

      const sourceFullIndex = data.findIndex(i => getId(i) === getId(sourceItem));
      const destinationFullIndex = data.findIndex(i => getId(i) === getId(destinationItem));
      if (sourceFullIndex === -1 || destinationFullIndex === -1) {
        return;
      }

      const previousFullList = data;

      // Optimistically reorder the full list for immediate feedback
      const fullReordered = reorder({
        list: previousFullList,
        startIndex: sourceFullIndex,
        finishIndex: destinationFullIndex,
      });
      if (onReorder) {
        onReorder(fullReordered);
      }

      // Prepare payload with full order so backend can assign sequential display_order
      const itemsToUpdate = fullReordered.map((item) => ({ id: getId(item) }));

      // Persist to backend
      await http.put('/portfolio/reorder', { items: itemsToUpdate });

      toast.success(`✅ Álbum movido de posición ${sourceFullIndex + 1} a ${destinationFullIndex + 1}`);
      
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Error al actualizar el orden');
      // Rollback optimistic update if provided
      if (onReorder) {
        onReorder(data);
      }
    } finally {
      setIsReordering(false);
      setDraggedItem(null);
    }
  }, [data, query, onReorder]);

  // Setup monitor for drag and drop
  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data.type === 'portfolio-item';
      },
      onDrop({ source, location }) {
        console.log('Drop event:', { source: source.data, location });
        const destination = location.current.dropTargets[0];
        if (!destination || source.data.index === undefined || destination.data.index === undefined) {
          // Ensure restore if dropped outside any valid target
          setDraggedItem(null);
          return;
        }

        if (destination.data.type !== 'portfolio-item') {
          setDraggedItem(null);
          return;
        }

        const sourceIndex = source.data.index;
        const destinationIndex = destination.data.index;
        console.log('Reordering from', sourceIndex, 'to', destinationIndex);

        if (sourceIndex !== destinationIndex) {
          handleReorder(sourceIndex, destinationIndex);
        } else {
          // No movement: clear dragging state
          setDraggedItem(null);
        }
      },
    });
  }, [handleReorder]);

  // Setup drop target for the list container
  useEffect(() => {
    const element = listRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ type: 'list' }),
      onDragEnter: () => {
        if (element) element.dataset.isDragOver = 'true';
      },
      onDragLeave: () => {
        if (element) delete element.dataset.isDragOver;
      },
      onDrop: () => {
        if (element) delete element.dataset.isDragOver;
      },
    });
  }, []);
  
  // Suppress native copy cursor/overlay when dragging outside the sidebar
  useEffect(() => {
    const handleDragOver = (e) => {
      if (!draggedItem) return;
      const listEl = listRef.current;
      if (listEl && !listEl.contains(e.target)) {
        e.preventDefault();
        if (e.dataTransfer) {
          try {
            e.dataTransfer.dropEffect = 'none';
          } catch (err) {
            // no-op
          }
        }
      }
    };
    const handleDrop = (e) => {
      if (!draggedItem) return;
      const listEl = listRef.current;
      if (listEl && !listEl.contains(e.target)) {
        e.preventDefault();
        setDraggedItem(null);
      }
    };
    window.addEventListener('dragover', handleDragOver, true);
    window.addEventListener('drop', handleDrop, true);
    return () => {
      window.removeEventListener('dragover', handleDragOver, true);
      window.removeEventListener('drop', handleDrop, true);
    };
  }, [draggedItem]);

  const filtered = (data || []).filter(i => i.name.toLowerCase().includes(query.trim().toLowerCase()));

  // Component for individual draggable items
  const DraggablePortfolioItem = ({ portfolioItem, index }) => {
    const itemRef = useRef(null);
    const dragHandleRef = useRef(null);
    const [isDraggedOver, setIsDraggedOver] = useState(false);
    const id = typeof portfolioItem._id === 'object' ? portfolioItem._id.$oid : portfolioItem._id;

    useEffect(() => {
      const element = itemRef.current;
      const dragHandle = dragHandleRef.current;
      if (!element || !dragHandle) return;

      const cleanups = [];

      // Make the item draggable via the drag handle
      cleanups.push(
        draggable({
          element: element, // Make the whole element draggable
          dragHandle: dragHandle, // But only via the handle
          getInitialData: () => ({ id, index, type: 'portfolio-item' }),
          onGenerateDragPreview: ({ nativeSetDragImage }) => {
            // Create a simple preview without extra DOM manipulation
            const rect = element.getBoundingClientRect();
            nativeSetDragImage(element, rect.width / 2, rect.height / 2);
          },
          onDragStart: () => {
            console.log('🎯 Drag started for item:', id, 'index:', index);
            setDraggedItem(id);
          },
          onDrop: () => {
            console.log('🎯 Drag ended for item:', id);
            setDraggedItem(null);
          },
        })
      );

      // Make the item a drop target
      cleanups.push(
        dropTargetForElements({
          element,
          getData: () => ({ index, type: 'portfolio-item' }),
          canDrop: ({ source }) => {
            return source.data.type === 'portfolio-item' && source.data.id !== id;
          },
          onDragEnter: () => {
            setIsDraggedOver(true);
            if (element) element.dataset.isDropTarget = 'true';
          },
          onDragLeave: () => {
            setIsDraggedOver(false);
            if (element) delete element.dataset.isDropTarget;
          },
          onDrop: () => {
            setIsDraggedOver(false);
            if (element) delete element.dataset.isDropTarget;
          },
        })
      );

      return () => {
        cleanups.forEach(cleanup => cleanup());
      };
    }, [id, index]);

    const isDragging = draggedItem === id;

    return (
      <div
        ref={itemRef}
        className={`portfolio-item-thumb ${isDragging ? 'is-dragging' : ''} ${isDraggedOver ? 'is-drop-target' : ''}`}
        data-item-id={id}
      >
        <div 
          ref={dragHandleRef}
          className="portfolio-item-thumb__drag-handle"
          title="Arrastra para reordenar"
        >
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        
        <div className="portfolio-item-thumb__image">
          <img src={thumbUrl(portfolioItem.thumb_img_url)} alt={portfolioItem.name} draggable={false} />
        </div>

        <div className="portfolio-item-thumb__content">
          <div className="portfolio-item-thumb__title">{portfolioItem.name}</div>
        </div>

        <div className="portfolio-item-thumb__actions">
          <button
            className="portfolio-item-thumb__action-btn portfolio-item-thumb__action-btn--edit"
            onClick={() => handleEditClick(portfolioItem)}
            aria-label={`Editar ${portfolioItem.name}`}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            className="portfolio-item-thumb__action-btn portfolio-item-thumb__action-btn--delete"
            onClick={() => setConfirmState({ open: true, item: portfolioItem })}
            aria-label={`Eliminar ${portfolioItem.name}`}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    );
  };

  // PropTypes for internal component
  DraggablePortfolioItem.propTypes = {
    portfolioItem: PropTypes.shape({
      _id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          $oid: PropTypes.string
        })
      ]).isRequired,
      thumb_img_url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
  };

  return (
    <div className="portfolio-sidebar-list-wrapper">
      <div className="sidebar-header">
        <h3>Álbumes</h3>
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Buscar álbum..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {isReordering && (
          <div className="reordering-indicator">
            <span>Reordenando...</span>
          </div>
        )}
      </div>
      
      <div ref={listRef} className="droppable-list">
        {filtered.map((portfolioItem, index) => {
          // eslint-disable-next-line react/prop-types
          const itemId = typeof portfolioItem._id === 'object' ? portfolioItem._id.$oid : portfolioItem._id;
          return (
            <DraggablePortfolioItem
              key={itemId}
              portfolioItem={portfolioItem}
              index={index}
            />
          );
        })}
      </div>
      
      <ConfirmDialog
        open={confirmState.open}
        title="Eliminar álbum"
        message={`¿Seguro que quieres eliminar "${confirmState.item?.name || ''}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          if (confirmState.item) {
            handleDeleteClick(confirmState.item);
          }
          setConfirmState({ open: false, item: null });
        }}
        onCancel={() => setConfirmState({ open: false, item: null })}
      />
    </div>
  );
};

PortfolioSidebarList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          $oid: PropTypes.string
        })
      ]).isRequired,
      thumb_img_url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleDeleteClick: PropTypes.func.isRequired,
  onReorder: PropTypes.func,
};

export default PortfolioSidebarList;
