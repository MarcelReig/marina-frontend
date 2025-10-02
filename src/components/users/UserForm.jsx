import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faLock, faShieldAlt, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

const UserForm = ({ user, onSubmit, onCancel }) => {
  const isEditMode = Boolean(user);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "", // Don't pre-fill password
        role: user.role || "admin",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es obligatorio";
    } else if (formData.username.length < 2 || formData.username.length > 50) {
      newErrors.username = "Debe tener entre 2 y 50 caracteres";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Password validation (required for create, optional for edit)
    if (!isEditMode && !formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "Debe tener al menos 8 caracteres";
    } else if (formData.password && !/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Debe contener al menos una letra y un número";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "El rol es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data (don't send empty password in edit mode)
      const submitData = { ...formData };
      if (isEditMode && !submitData.password) {
        delete submitData.password;
      }
      
      await onSubmit(submitData);
      
      // Reset form on success (only in create mode)
      if (!isEditMode) {
        setFormData({
          username: "",
          email: "",
          password: "",
          role: "admin",
        });
      }
    } catch (err) {
      // Error handling is done by parent component
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      {/* Username */}
      <div className="form-group">
        <label htmlFor="username">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          Nombre de Usuario
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={errors.username ? "input-error" : ""}
          placeholder="Nombre del usuario"
          disabled={isSubmitting}
        />
        {errors.username && (
          <span className="error-message">{errors.username}</span>
        )}
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email">
          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "input-error" : ""}
          placeholder="usuario@ejemplo.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <span className="error-message">{errors.email}</span>
        )}
      </div>

      {/* Password */}
      <div className="form-group">
        <label htmlFor="password">
          <FontAwesomeIcon icon={faLock} className="me-2" />
          {isEditMode ? "Nueva Contraseña (opcional)" : "Contraseña"}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? "input-error" : ""}
          placeholder={isEditMode ? "Dejar vacío para mantener la actual" : "Mínimo 8 caracteres"}
          disabled={isSubmitting}
        />
        {errors.password && (
          <span className="error-message">{errors.password}</span>
        )}
        {!errors.password && (
          <small className="form-text">
            {isEditMode 
              ? "Dejar vacío para mantener la contraseña actual" 
              : "Mínimo 8 caracteres, debe contener letras y números"}
          </small>
        )}
      </div>

      {/* Role */}
      <div className="form-group">
        <label htmlFor="role">
          <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
          Rol
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className={errors.role ? "input-error" : ""}
          disabled={isSubmitting}
        >
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        {errors.role && (
          <span className="error-message">{errors.role}</span>
        )}
        <small className="form-text">
          Admin: puede gestionar portfolio y tienda. Super Admin: puede gestionar usuarios.
        </small>
      </div>

      {/* Action Buttons */}
      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          <FontAwesomeIcon icon={faSave} className="me-2" />
          {isSubmitting ? "Guardando..." : (isEditMode ? "Actualizar" : "Crear Usuario")}
        </button>
        
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <FontAwesomeIcon icon={faTimes} className="me-2" />
          Cancelar
        </button>
      </div>
    </form>
  );
};

UserForm.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        $oid: PropTypes.string
      })
    ]),
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default UserForm;


