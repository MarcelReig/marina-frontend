import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faSearch, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { formatPrice } from '../../utils/formatPrice';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { toast } from 'react-hot-toast';
import http from '../../api/http';
import ConfirmDialog from '../shared/ConfirmDialog';

const InventorySidebarList = ({ data, onDeleteClick, onReorder }) => {
  const navigate = useNavigate();
  const [confirmState, setConfirmState] = useState({ open: false, product: null });
  const [query, setQuery] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const listRef = useRef(null);
  
  const handleEditClick = (product) => {
    const id = product._id && product._id.$oid ? product._id.$oid : product._id;
    navigate(`/inventory-manager/edit/${id}`);
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
      await http.put('/store/reorder', { items: itemsToUpdate });

      toast.success(`✅ Producto movido de posición ${sourceFullIndex + 1} a ${destinationFullIndex + 1}`);
      
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Error al actualizar el orden');
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
        return source.data.type === 'inventory-item';
      },
      onDrop({ source, location }) {
        console.log('Drop event:', { source: source.data, location });
        const destination = location.current.dropTargets[0];
        if (!destination || source.data.index === undefined || destination.data.index === undefined) {
          setDraggedItem(null);
          return;
        }

        if (destination.data.type !== 'inventory-item') {
          setDraggedItem(null);
          return;
        }

        const sourceIndex = source.data.index;
        const destinationIndex = destination.data.index;
        console.log('Reordering from', sourceIndex, 'to', destinationIndex);

        if (sourceIndex !== destinationIndex) {
          handleReorder(sourceIndex, destinationIndex);
        } else {
          setDraggedItem(null);
        }
      },
    });
  }, [handleReorder]);

  // Setup drop target for the list container (visual feedback / consistency)
  useEffect(() => {
    const element = listRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ type: 'list' }),
      onDragEnter: () => {
        try { element.dataset.isDragOver = 'true'; } catch {}
      },
      onDragLeave: () => {
        try { delete element.dataset.isDragOver; } catch {}
      },
      onDrop: () => {
        try { delete element.dataset.isDragOver; } catch {}
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
          } catch {}
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
  if (!data || data.length === 0) {
    return (
      <div className="portfolio-sidebar-list-wrapper">
        <div className="no-items">
          <p className="empty-message">No hay productos en el inventario</p>
        </div>
      </div>
    );
  }

  const filtered = (data || []).filter(p => p.name.toLowerCase().includes(query.trim().toLowerCase()));

  // Component for individual draggable items
  const DraggableInventoryItem = ({ product, index }) => {
    const itemRef = useRef(null);
    const dragHandleRef = useRef(null);
    const [isDraggedOver, setIsDraggedOver] = useState(false);
    const id = product._id && product._id.$oid ? product._id.$oid : product._id;

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
          getInitialData: () => ({ id, index, type: 'inventory-item' }),
          onGenerateDragPreview: ({ nativeSetDragImage }) => {
            // Create a simple preview without extra DOM manipulation
            const rect = element.getBoundingClientRect();
            nativeSetDragImage(element, rect.width / 2, rect.height / 2);
          },
          onDragStart: () => {
            console.log('🎯 Drag started for product:', id, 'index:', index);
            setDraggedItem(id);
          },
          onDrop: () => {
            console.log('🎯 Drag ended for product:', id);
            setDraggedItem(null);
          },
        })
      );

      // Make the item a drop target
      cleanups.push(
        dropTargetForElements({
          element,
          getData: () => ({ index, type: 'inventory-item' }),
          canDrop: ({ source }) => {
            return source.data.type === 'inventory-item' && source.data.id !== id;
          },
          onDragEnter: () => {
            setIsDraggedOver(true);
            try { element.dataset.isDropTarget = 'true'; } catch {}
          },
          onDragLeave: () => {
            setIsDraggedOver(false);
            try { delete element.dataset.isDropTarget; } catch {}
          },
          onDrop: () => {
            setIsDraggedOver(false);
            try { delete element.dataset.isDropTarget; } catch {}
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
        className={`inventory-item-thumb ${isDragging ? 'is-dragging' : ''} ${isDraggedOver ? 'is-drop-target' : ''}`}
        data-item-id={id}
      >
        <div 
          ref={dragHandleRef}
          className="inventory-item-thumb__drag-handle"
          title="Arrastra para reordenar"
        >
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        
        <div className="inventory-item-thumb__image">
          <img src={product.image} alt={product.name} draggable={false} />
        </div>

        <div className="inventory-item-thumb__content">
          <div className="inventory-item-thumb__title">{product.name}</div>
          <div className="inventory-item-thumb__price">{formatPrice(product.price)}</div>
        </div>

        <div className="inventory-item-thumb__actions">
          <button
            className="inventory-item-thumb__action-btn inventory-item-thumb__action-btn--edit"
            onClick={() => handleEditClick(product)}
            aria-label={`Editar ${product.name}`}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            className="inventory-item-thumb__action-btn inventory-item-thumb__action-btn--delete"
            onClick={() => setConfirmState({ open: true, product })}
            aria-label={`Eliminar ${product.name}`}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    );
  };

  // PropTypes for internal component
  DraggableInventoryItem.propTypes = {
    product: PropTypes.shape({
      _id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          $oid: PropTypes.string
        })
      ]).isRequired,
      image: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
  };

  return (
    <div className="portfolio-sidebar-list-wrapper">
      <div className="sidebar-header">
        <h3>Productos</h3>
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Buscar producto..."
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
        {filtered.map((product, index) => {
          const itemId = product._id && product._id.$oid ? product._id.$oid : product._id;
          return (
            <DraggableInventoryItem
              key={itemId}
              product={product}
              index={index}
            />
          );
        })}
      </div>
      <ConfirmDialog
        open={confirmState.open}
        title="Eliminar producto"
        message={`¿Seguro que quieres eliminar "${confirmState.product?.name || ''}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          if (confirmState.product) onDeleteClick(confirmState.product);
          setConfirmState({ open: false, product: null });
        }}
        onCancel={() => setConfirmState({ open: false, product: null })}
      />
    </div>
  );
};

InventorySidebarList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string
  })),
  onDeleteClick: PropTypes.func.isRequired,
  onReorder: PropTypes.func,
};

export default InventorySidebarList;

