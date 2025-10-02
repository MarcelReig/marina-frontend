import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import http from "../../api/http";
import ConfirmDialog from "../shared/ConfirmDialog";
import UserForm from "../users/UserForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faShieldAlt, faUsers } from "@fortawesome/free-solid-svg-icons";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await http.get("/users");
      
      if (response?.status === 200 && response?.data) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar usuarios");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle user creation
  const handleCreateUser = async (userData) => {
    try {
      setError("");
      setSuccessMessage("");
      
      const response = await http.post("/users", userData);
      
      if (response?.status === 201) {
        setSuccessMessage(`Usuario '${userData.username}' creado exitosamente`);
        setShowCreateForm(false);
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear usuario");
      throw err; // Re-throw to let form handle it
    }
  };

  // Handle user update
  const handleUpdateUser = async (userId, userData) => {
    try {
      setError("");
      setSuccessMessage("");
      
      const response = await http.put(`/users/${userId}`, userData);
      
      if (response?.status === 200) {
        setSuccessMessage(`Usuario actualizado exitosamente`);
        setEditingUser(null);
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar usuario");
      throw err; // Re-throw to let form handle it
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    
    try {
      setError("");
      setSuccessMessage("");
      
      const response = await http.delete(`/users/${deleteTarget._id.$oid}`);
      
      if (response?.status === 200) {
        setSuccessMessage("Usuario eliminado exitosamente");
        setDeleteTarget(null);
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar usuario");
      setDeleteTarget(null);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "super_admin":
        return "badge-super-admin";
      case "admin":
        return "badge-admin";
      default:
        return "badge-user";
    }
  };

  const getUserId = (user) => {
    // Handle both BSON format {$oid: "..."} and plain string
    if (user._id?.$oid) return user._id.$oid;
    if (typeof user._id === 'string') return user._id;
    return user._id?.toString() || '';
  };

  if (loading) {
    return <div className="loading-spinner">Cargando usuarios...</div>;
  }

  return (
    <div className="user-manager-container">
      <div className="user-manager-header">
        <h1>
          <FontAwesomeIcon icon={faUsers} className="me-2" />
          Gestión de Usuarios
        </h1>
        <p className="subtitle">Administra los usuarios del sistema</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <button className="alert-close" onClick={() => setError("")}>×</button>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          <button className="alert-close" onClick={() => setSuccessMessage("")}>×</button>
          {successMessage}
        </div>
      )}

      {/* Create Button */}
      {!showCreateForm && !editingUser && (
        <div className="action-bar">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Crear Usuario
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="user-form-wrapper">
          <h2>Nuevo Usuario</h2>
          <UserForm
            onSubmit={handleCreateUser}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Edit Form */}
      {editingUser && (
        <div className="user-form-wrapper">
          <h2>Editar Usuario: {editingUser.username}</h2>
          <UserForm
            user={editingUser}
            onSubmit={(userData) => handleUpdateUser(getUserId(editingUser), userData)}
            onCancel={() => setEditingUser(null)}
          />
        </div>
      )}

      {/* Users Table */}
      {!showCreateForm && !editingUser && (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={getUserId(user)}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        <FontAwesomeIcon icon={faShieldAlt} className="me-1" />
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingUser(user)}
                        title="Editar usuario"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteTarget(user)}
                        title="Eliminar usuario"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          open={true}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar al usuario "${deleteTarget.username}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteTarget(null)}
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
};

export default UserManager;


