import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ServiceCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const { userId } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    fullDescription: "",
    priceRange: "",
    duration: "",
    featured: false,
    isActive: true,
    sortOrder: 0,
    createdBy: userId,
    image: null,
  });

  // Générer le slug automatiquement à partir du titre
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title]);

  // Gestion des changements des champs
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));

      // Prévisualisation de l'image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    } else if (formData.title.length < 2) {
      newErrors.title = "Le titre doit contenir au moins 2 caractères";
    } else if (formData.title.length > 200) {
      newErrors.title = "Le titre ne peut pas dépasser 200 caractères";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Le slug est requis";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug =
        "Le slug doit être en minuscules avec des traits d'union (ex: mon-service)";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    } else if (formData.description.length < 10) {
      newErrors.description =
        "La description doit contenir au moins 10 caractères";
    } else if (formData.description.length > 1000) {
      newErrors.description =
        "La description ne peut pas dépasser 1000 caractères";
    }

    if (formData.fullDescription && formData.fullDescription.length > 5000) {
      newErrors.fullDescription =
        "La description complète ne peut pas dépasser 5000 caractères";
    }

    if (formData.priceRange && formData.priceRange.length > 100) {
      newErrors.priceRange =
        "La fourchette de prix ne peut pas dépasser 100 caractères";
    }

    if (formData.duration && formData.duration.length > 100) {
      newErrors.duration = "La durée ne peut pas dépasser 100 caractères";
    }

    if (!formData.image) {
      newErrors.image = "L'image est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("slug", formData.slug);
      submitData.append("description", formData.description);
      submitData.append("fullDescription", formData.fullDescription);
      submitData.append("priceRange", formData.priceRange);
      submitData.append("duration", formData.duration);
      submitData.append("featured", formData.featured);
      submitData.append("isActive", formData.isActive);
      submitData.append("sortOrder", formData.sortOrder);
      submitData.append("image", formData.image);

      const response = await axios.post("/services", submitData);

      if (response.data.success) {
        navigate("/admin/services", {
          state: { message: "Service créé avec succès" },
        });
      }
    } catch (error) {
      console.error("Error creating service:", error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Erreur lors de la création du service" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/services");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Créer un Nouveau Service
              </h1>
              <p className="text-gray-600 mt-2">
                Remplissez les informations pour créer un nouveau service
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>

        {/* Message d'erreur général */}
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {errors.submit}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm rounded-xl border border-gray-200"
        >
          <div className="p-6 space-y-8">
            {/* Section Informations de base */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations de base
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Titre */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Titre du service *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ex: Broderie personnalisée"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Slug URL *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={generatedSlug(formData.title)}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.slug ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ex: broderie-personnalisee"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Version URL-friendly du titre (minuscules, traits d'union)
                  </p>
                </div>
              </div>
            </div>

            {/* Section Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <div className="space-y-6">
                {/* Description courte */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description courte *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Description concise du service (10-1000 caractères)"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.description.length}/1000 caractères
                  </p>
                </div>

                {/* Description complète */}
                <div>
                  <label
                    htmlFor="fullDescription"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description complète
                  </label>
                  <textarea
                    id="fullDescription"
                    name="fullDescription"
                    rows="5"
                    value={formData.fullDescription}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.fullDescription
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Description détaillée du service (max 5000 caractères)"
                  />
                  {errors.fullDescription && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fullDescription}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.fullDescription.length}/5000 caractères
                  </p>
                </div>
              </div>
            </div>

            {/* Section Détails */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Détails du service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fourchette de prix */}
                <div>
                  <label
                    htmlFor="priceRange"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fourchette de prix
                  </label>
                  <input
                    type="text"
                    id="priceRange"
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.priceRange ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ex: 25€ - 150€"
                  />
                  {errors.priceRange && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.priceRange}
                    </p>
                  )}
                </div>

                {/* Durée */}
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Durée
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.duration ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ex: 1-2 semaines"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.duration}
                    </p>
                  )}
                </div>

                {/* Ordre de tri */}
                <div>
                  <label
                    htmlFor="sortOrder"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    id="sortOrder"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Définit l'ordre d'affichage (plus petit = premier)
                  </p>
                </div>
              </div>
            </div>

            {/* Section Image */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Image du service
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="image"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Image *
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleChange}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.image ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Formats acceptés: JPG, PNG, GIF, WebP (max 10MB)
                  </p>
                </div>

                {/* Prévisualisation de l'image */}
                {imagePreview && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Aperçu de l'image:
                    </p>
                    <div className="w-64 h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section Paramètres */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Paramètres
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="featured"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Service en vedette
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Service actif
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions du formulaire */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Créer le service</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceCreate;
