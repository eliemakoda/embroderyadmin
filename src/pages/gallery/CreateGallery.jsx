import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const GalleryCreateForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alt: '',
    categoryId: '',
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('info');
const {userId}= useAuth();
  // Fetch des catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        setCategories(response.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        showToast('Erreur lors du chargement des catégories', 'error');
      }
    };
    
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation de la taille (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        image: 'La taille du fichier ne doit pas dépasser 15MB' 
      }));
      return;
    }

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        image: 'Format de fichier non supporté. Utilisez JPG, PNG, GIF, WebP ou SVG' 
      }));
      return;
    }

    setImageFile(file);
    setErrors(prev => ({ ...prev, image: '' }));

    // Création de la prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.length < 2) {
      newErrors.title = 'Le titre doit contenir au moins 2 caractères';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'La description ne doit pas dépasser 1000 caractères';
    }

    if (formData.alt.length > 255) {
      newErrors.alt = 'Le texte alternatif ne doit pas dépasser 255 caractères';
    }

    if (!imageFile) {
      newErrors.image = 'Une image est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message, type = 'success') => {
    // Création d'un toast basique
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('alt', formData.alt);
      submitData.append('categoryId', formData.categoryId);
      submitData.append('isActive', formData.isActive);
      submitData.append('image', imageFile);
      submitData.append('createdBy', userId)
      const response = await axios.post('/galleries', submitData);

      showToast('Galerie créée avec succès !');
      
      // Reset du formulaire
      setFormData({
        title: '',
        description: '',
        alt: '',
        categoryId: '',
        isActive: true
      });
      setImageFile(null);
      setImagePreview(null);
      
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      showToast(
        error.response?.data?.message || 'Erreur lors de la création de la galerie', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Créer une Nouvelle Galerie
          </h1>
          <p className="text-gray-600">
            Ajoutez une nouvelle œuvre à votre collection de broderie et couture
          </p>
        </div>

        {/* Formulaire principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📝 Informations
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                  activeTab === 'image'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🖼️ Image
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                  activeTab === 'preview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                👀 Aperçu
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Tab: Informations */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la galerie *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Broderie florale printanière"
                    maxLength={255}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {formData.title.length}/255 caractères
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Décrivez votre œuvre en détail..."
                    maxLength={1000}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {formData.description.length}/1000 caractères
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte alternatif (Accessibilité)
                  </label>
                  <input
                    type="text"
                    name="alt"
                    value={formData.alt}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.alt ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Description de l'image pour l'accessibilité"
                    maxLength={255}
                  />
                  {errors.alt && (
                    <p className="mt-1 text-sm text-red-600">{errors.alt}</p>
                  )}
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {formData.alt.length}/255 caractères
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Galerie active
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Image */}
            {activeTab === 'image' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Image de la galerie *
                  </label>
                  
                  {/* Zone de drop/upload */}
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    errors.image ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-500'
                  }`}>
                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Aperçu"
                            className="max-h-64 rounded-lg shadow-md"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">
                          Image sélectionnée: {imageFile.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-4">📁</div>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Glissez-déposez votre image ici
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          ou cliquez pour sélectionner
                        </p>
                        <input
                          type="file"
                          onChange={handleImageChange}
                          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                        >
                          Choisir une image
                        </label>
                        <p className="text-xs text-gray-500 mt-4">
                          Formats supportés: JPG, PNG, GIF, WebP, SVG • Max 15MB
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.image && (
                    <p className="mt-2 text-sm text-red-600">{errors.image}</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Aperçu */}
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Aperçu de la galerie
                  </h3>
                  
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="aspect-w-16 aspect-h-9 bg-white rounded-lg shadow-sm border p-4">
                        <img
                          src={imagePreview}
                          alt={formData.alt || 'Aperçu'}
                          className="w-full h-48 object-cover rounded"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong className="text-gray-700">Titre:</strong>
                          <p className="text-gray-900">{formData.title || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <strong className="text-gray-700">Catégorie:</strong>
                          <p className="text-gray-900">
                            {categories.find(c => c.id === formData.categoryId)?.name || 'Non sélectionnée'}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <strong className="text-gray-700">Description:</strong>
                          <p className="text-gray-900">{formData.description || 'Non renseignée'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <strong className="text-gray-700">Statut:</strong>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            formData.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {formData.isActive ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-4">🖼️</div>
                      <p>Aucune image sélectionnée</p>
                      <p className="text-sm">Veuillez ajouter une image dans l'onglet "Image"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation et boutons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'info' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Informations
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('image')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'image' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'preview' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Aperçu
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    'Créer la Galerie'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Les champs marqués d'un * sont obligatoires</p>
        </div>
      </div>
    </div>
  );
};

export default GalleryCreateForm;