import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CategoryNew = () => {
    const {userId}= useAuth();
    
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: null,
    sortOrder: 0,
    isActive: true,
    createdBy: userId 
  });

  const [imageFile, setImageFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Format de fichier non supporté. Utilisez JPEG, PNG, WebP ou GIF.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('La taille de l\'image ne doit pas dépasser 5MB.');
        return;
      }

      setImageFile(file);
      setError('');

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await axios.post('/categories', submitData);

      navigate('/admin/categories', { 
        state: { message: 'Catégorie créée avec succès' } 
      });

    } catch (err) {
      console.error('Error creating category:', err);
      setError(
        err.response?.data?.message || 
        'Erreur lors de la création de la catégorie. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/categories');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la liste
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Catégorie</h1>
          <p className="text-gray-600 mt-2">Créez une nouvelle catégorie pour organiser vos produits</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Colonne gauche - Informations de base */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Informations de base</h2>
                
                {/* Nom */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la catégorie *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: Broderie Main"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: broderie-main"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Identifiant unique pour les URLs. Généré automatiquement à partir du nom.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Décrivez cette catégorie..."
                  />
                </div>

                {/* Parent et Ordre */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie parente
                    </label>
                    <select
                      id="parentId"
                      name="parentId"
                      value={formData.parentId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Aucune (catégorie principale)</option>
                      {/* Les options des catégories parentes seraient chargées depuis l'API */}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                      Ordre d'affichage
                    </label>
                    <input
                      type="number"
                      id="sortOrder"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Statut */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Catégorie active
                  </label>
                </div>
              </div>

              {/* Colonne droite - Image */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Image de la catégorie</h2>
                
                {/* Zone d'upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="max-h-48 rounded-lg mx-auto"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">Image sélectionnée</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600 mb-2">
                        <label htmlFor="image-upload" className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                          Cliquez pour uploader
                        </label>{' '}
                        ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WebP jusqu'à 5MB
                      </p>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Informations sur l'image */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Recommandations pour l'image</h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Format recommandé : WebP ou PNG</li>
                    <li>• Taille idéale : 800x600 pixels</li>
                    <li>• Poids maximum : 5MB</li>
                    <li>• Arrière-plan transparent pour un meilleur rendu</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions du formulaire */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Créer la catégorie
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryNew;