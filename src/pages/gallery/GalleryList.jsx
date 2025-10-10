import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const REACT_APP_API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

const AdminGalleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, gallery: null });
  const navigate = useNavigate();

  // Récupérer les galeries depuis l'API
  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/galleries');
      if (response.data.success) {
        setGalleries(response.data.data);
      } else {
        setError('Échec de la récupération des galeries');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des galeries : ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  // Gérer la modification
  const handleEdit = (galleryId) => {
    navigate(`/admin/admin/galleries/edit/${galleryId}`);
  };

  // Gérer le modal de confirmation de suppression
  const handleDeleteClick = (gallery) => {
    setDeleteModal({ isOpen: true, gallery });
  };

  // Confirmer la suppression
  const confirmDelete = async () => {
    if (!deleteModal.gallery) return;

    try {
      await axios.delete(`/galleries/${deleteModal.gallery.id}`);
      // Supprimer de l'état local
      setGalleries(galleries.filter(g => g.id !== deleteModal.gallery.id));
      setDeleteModal({ isOpen: false, gallery: null });
    } catch (err) {
      setError('Erreur lors de la suppression de la galerie : ' + (err.response?.data?.message || err.message));
    }
  };

  // Gérer l'ajout d'une nouvelle galerie
  const handleAddNew = () => {
    navigate('/admin/galleries/add');
  };

  // Formater le nombre de vues
  const formatViewCount = (count) => {
    return count?.toLocaleString('fr-FR') || '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des galeries</h1>
            <p className="text-gray-600 mt-2">Gérez vos galeries d'images et collections</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Ajouter une nouvelle galerie</span>
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Grille des galeries */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Image de la galerie */}
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={`${REACT_APP_API_BASE_URL}${gallery.imageUrl}`}
                  alt={gallery.alt || gallery.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      gallery.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {gallery.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              {/* Contenu de la galerie */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                    {gallery.title}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {gallery.description}
                </p>

                {/* Catégorie */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {gallery.category?.name}
                  </span>
                </div>

                {/* Statistiques */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span>{formatViewCount(gallery.viewCount)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span>{gallery.likes}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {gallery.formattedCreatedAt}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {/* <button
                    onClick={() => handleEdit(gallery.id)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Modifier</span>
                  </button> */}
                  <button
                    onClick={() => handleDeleteClick(gallery)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* État vide */}
        {galleries.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune galerie trouvée</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre première galerie.</p>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Ajouter une nouvelle galerie
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Supprimer la galerie
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer "{deleteModal.gallery?.title}" ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, gallery: null })}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGalleries;