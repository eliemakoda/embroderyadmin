import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  X,
  Image,
  Tag,
  Award,
  Download,
  Clock,
  Package,
  Scale,
  Palette,
  Scissors,
  AlertCircle,
  CheckCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const { userId } = useAuth();

  // Product state
  const [product, setProduct] = useState({
    name: "",
    slug: "",
    description: "",
    createdBy: userId,
    shortDescription: "",
    price: 0,
    discountPrice: 0,
    difficulty: "BEGINNER",
    estimatedTime: "",
    materials: [],
    colors: [],
    dimensions: "",
    instructions: "",
    featured: false,
    isActive: true,
    stock: 0,
    sku: "",
    weight: 0,
    categoryId: null,
    advantages: [],
    images: [],
    tags: [],
    patterns: [],
  });

  // Temporary input states
  const [newMaterial, setNewMaterial] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newAdvantage, setNewAdvantage] = useState({
    title: "",
    description: "",
    icon: "default-icon",
  });

  // Form step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8; // Increased from 7 to 8 to include preview

  // Load initial data
  useEffect(() => {
    fetchCategories();
    // fetchTags();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/categories");
      setCategories(response.data.data || response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      setErrors((prev) => ({
        ...prev,
        categories: "Erreur lors du chargement des catégories",
      }));
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("/tags");
      if (response.data.success) {
        setExistingTags(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
      setErrors((prev) => ({
        ...prev,
        tags: "Erreur lors du chargement des tags",
      }));
    }
  };

  // Step validation
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!product.name.trim()) newErrors.name = "Le nom est requis";
        if (!product.slug.trim()) newErrors.slug = "Le slug est requis";
        else if (!/^[a-z0-9-]+$/.test(product.slug)) {
          newErrors.slug = "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets";
        }
        if (!product.categoryId) newErrors.categoryId = "La catégorie est requise";
        if (!product.description.trim() || product.description.length < 10) {
          newErrors.description = "La description doit contenir au moins 10 caractères";
        }
        break;

      case 2:
        if (product.price < 0) newErrors.price = "Le prix ne peut pas être négatif";
        if (product.discountPrice < 0) {
          newErrors.discountPrice = "Le prix promotionnel ne peut pas être négatif";
        }
        if (product.discountPrice > 0 && product.discountPrice > product.price) {
          newErrors.discountPrice = "Le prix promotionnel ne peut pas être supérieur au prix original";
        }
        if (product.stock < 0) newErrors.stock = "Le stock ne peut pas être négatif";
        if (product.weight < 0) newErrors.weight = "Le poids ne peut pas être négatif";
        break;

      case 3:
        if (product.estimatedTime && product.estimatedTime.length > 100) {
          newErrors.estimatedTime = "Le temps estimé ne peut pas dépasser 100 caractères";
        }
        if (product.dimensions && product.dimensions.length > 255) {
          newErrors.dimensions = "Les dimensions ne peuvent pas dépasser 255 caractères";
        }
        break;

      case 4:
        if (product.tags.length > 10) {
          newErrors.tags = "Vous ne pouvez pas ajouter plus de 10 tags";
        }
        break;

      case 5:
        if (product.advantages.length > 10) {
          newErrors.advantages = "Vous ne pouvez pas ajouter plus de 10 avantages";
        }
        product.advantages.forEach((adv, idx) => {
          if (!adv.icon.trim()) {
            newErrors[`advantages[${idx}].icon`] = "L'icône est requise";
          }
        });
        break;

      case 6:
        if (product.images.length === 0) {
          newErrors.images = "Au moins une image est requise";
        }
        break;

      case 7:
        if (product.patterns.length > 5) {
          newErrors.patterns = "Vous ne pouvez pas ajouter plus de 5 patterns";
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      setErrors({});
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  // Handle basic field changes
  const handleChange = (field, value) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Auto-generate slug
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .substring(0, 100);
  };

  const handleNameChange = (name) => {
    handleChange("name", name);
    if (!product.slug || product.slug === generateSlug(product.name)) {
      handleChange("slug", generateSlug(name));
    }
  };

  // Handle materials
  const addMaterial = () => {
    if (newMaterial.trim()) {
      setProduct((prev) => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()],
      }));
      setNewMaterial("");
    }
  };

  const removeMaterial = (index) => {
    setProduct((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  // Handle colors
  const addColor = () => {
    if (newColor.trim()) {
      setProduct((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()],
      }));
      setNewColor("");
    }
  };

  const removeColor = (index) => {
    setProduct((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  // Handle tags
  const addTag = () => {
    if (newTag.trim()) {
      const tagSlug = generateSlug(newTag);
      setProduct((prev) => ({
        ...prev,
        tags: [...prev.tags, { name: newTag.trim(), slug: tagSlug }],
      }));
      setNewTag("");
    }
  };

  const removeTag = (index) => {
    setProduct((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const selectExistingTag = (tag) => {
    if (!product.tags.find((t) => t.id === tag.id || t.name === tag.name)) {
      setProduct((prev) => ({
        ...prev,
        tags: [...prev.tags, { id: tag.id, name: tag.name, slug: tag.slug }],
      }));
    }
  };

  // Handle advantages
  const addAdvantage = () => {
    if (newAdvantage.title.trim() && newAdvantage.icon.trim()) {
      setProduct((prev) => ({
        ...prev,
        advantages: [...prev.advantages, { ...newAdvantage, sortOrder: prev.advantages.length }],
      }));
      setNewAdvantage({ title: "", description: "", icon: "default-icon" });
    } else {
      setErrors((prev) => ({
        ...prev,
        newAdvantage: "Le titre et l'icône sont requis pour ajouter un avantage",
      }));
    }
  };

  const removeAdvantage = (index) => {
    setProduct((prev) => ({
      ...prev,
      advantages: prev.advantages.filter((_, i) => i !== index).map((adv, i) => ({
        ...adv,
        sortOrder: i,
      })),
    }));
  };

  // Handle image uploads
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          images: "Seuls les fichiers JPG, PNG, WEBP et GIF sont acceptés",
        }));
        return false;
      }
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          images: "Chaque image ne doit pas dépasser 10MB",
        }));
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      alt: file.name.replace(/\.[^/.]+$/, ""),
      type: "GALLERY",
      isPrimary: product.images.length === 0 && index === 0,
      sortOrder: product.images.length + index,
      file,
    }));

    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (index) => {
    setProduct((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }
      return { ...prev, images: newImages };
    });
  };

  const setPrimaryImage = (index) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  // Handle pattern uploads
  const handlePatternUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ["application/pdf", "application/zip", "application/x-rar-compressed", "image/jpeg", "image/png"];

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          patterns: "Seuls les fichiers PDF, ZIP, RAR, JPG et PNG sont acceptés",
        }));
        return false;
      }
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          patterns: "Chaque fichier ne doit pas dépasser 50MB",
        }));
        return false;
      }
      return true;
    });

    const newPatterns = validFiles.map((file) => ({
      name: file.name.replace(/\.[^/.]+$/, ""),
      fileUrl: URL.createObjectURL(file),
      previewUrl: URL.createObjectURL(file),
      fileSize: file.size,
      fileType: file.type.split("/")[1] || "pdf",
      sizes: "[]",
      difficulty: "BEGINNER",
      isActive: true,
      file,
    }));

    setProduct((prev) => ({
      ...prev,
      patterns: [...prev.patterns, ...newPatterns],
    }));
    setErrors((prev) => ({ ...prev, patterns: "" }));
  };

  const removePattern = (index) => {
    setProduct((prev) => ({
      ...prev,
      patterns: prev.patterns.filter((_, i) => i !== index),
    }));
  };

  // Form submission - FIXED: Only submit on button click
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only submit if we're on the last step (preview)
    if (currentStep !== totalSteps) {
      nextStep();
      return;
    }

    setLoading(true);
    setErrors({});

    // Validate all steps before submission
    let allValid = true;
    for (let step = 1; step <= totalSteps - 1; step++) { // Exclude preview step from validation
      if (!validateStep(step)) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      setErrors((prev) => ({
        ...prev,
        submit: "Veuillez corriger les erreurs dans le formulaire avant de soumettre",
      }));
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      // Prepare product data
      const productData = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        createdBy: product.createdBy,
        shortDescription: product.shortDescription,
        price: product.price * 100, // Convert to cents
        discountPrice: product.discountPrice * 100, // Convert to cents
        difficulty: product.difficulty,
        estimatedTime: product.estimatedTime,
        materials: JSON.stringify(product.materials || []),
        colors: JSON.stringify(product.colors || []),
        dimensions: product.dimensions,
        instructions: product.instructions,
        featured: product.featured,
        isActive: product.isActive,
        stock: product.stock,
        sku: product.sku,
        weight: product.weight,
        categoryId: product.categoryId,
        advantages: JSON.stringify(product.advantages || []),
        images: JSON.stringify(product.images.map(({ url, file, ...meta }) => meta)),
        tags: JSON.stringify(product.tags || []),
        patterns: JSON.stringify(product.patterns.map(({ fileUrl, previewUrl, file, ...meta }) => meta)),
      };

      // Append all fields to FormData
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Append image files
      product.images.forEach((image) => {
        if (image.file) {
          formData.append("images", image.file);
        }
      });

      // Append pattern files
      product.patterns.forEach((pattern) => {
        if (pattern.file) {
          formData.append("patterns", pattern.file);
        }
      });

      // Debugging: Log FormData entries
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} =`, value);
      }

      const response = await axios.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setSuccessMessage("Produit créé avec succès!");
        setTimeout(() => {
          navigate("/admin/products");
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      const errorMessage =
        error.response?.data?.message || "Erreur lors de la création du produit";
      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Non spécifiée";
  };

  // Error message component
  const ErrorMessage = ({ message }) =>
    message && (
      <div className="flex items-center text-error-600 text-sm mt-1">
        <AlertCircle size={16} className="mr-1" />
        {message}
      </div>
    );

  // Step progress component
  const StepProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-background-900">
          Étape {currentStep} sur {totalSteps}
        </h2>
        <div className="text-sm text-background-500">
          {currentStep === 1 && "Informations de base"}
          {currentStep === 2 && "Prix et stock"}
          {currentStep === 3 && "Caractéristiques"}
          {currentStep === 4 && "Tags"}
          {currentStep === 5 && "Avantages"}
          {currentStep === 6 && "Images"}
          {currentStep === 7 && "Patterns et options"}
          {currentStep === 8 && "Aperçu et confirmation"}
        </div>
      </div>
      <div className="w-full bg-surface-200 rounded-full h-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/produits")}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour aux produits
          </button>
          <h1 className="text-3xl font-bold text-background-900">
            Créer un nouveau produit
          </h1>
          <p className="text-background-600 mt-2">
            Remplissez les informations pour créer un nouveau produit
          </p>
        </div>

        <StepProgress />

        {successMessage && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center">
            <CheckCircle className="text-success-600 mr-2" size={20} />
            <span className="text-success-700">{successMessage}</span>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center">
            <AlertCircle className="text-error-600 mr-2" size={20} />
            <span className="text-error-700">{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {currentStep === 1 && (
            <div className="bg-surface-50 rounded-xl p-6 shadow-sm border border-surface-200">
              <h2 className="text-xl font-semibold text-background-900 mb-6 flex items-center">
                <Package className="mr-3 text-primary-500" size={24} />
                Informations de base
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    required
                    value={product.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.name ? "border-error-500" : "border-surface-300"
                    }`}
                    placeholder="Ex: Collection Vintage Fleurs Sauvages"
                  />
                  <ErrorMessage message={errors.name} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="^[a-z0-9-]+$"
                    value={product.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono ${
                      errors.slug ? "border-error-500" : "border-surface-300"
                    }`}
                    placeholder="Ex: collection-vintage-fleurs-sauvages"
                  />
                  <ErrorMessage message={errors.slug} />
                  <p className="text-xs text-background-500 mt-1">
                    Version URL-friendly (lettres minuscules, chiffres et tirets)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={product.categoryId || ""}
                    onChange={(e) => handleChange("categoryId", e.target.value || null)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.categoryId ? "border-error-500" : "border-surface-300"
                    }`}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ErrorMessage message={errors.categoryId} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={product.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: VWC-005"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-background-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  required
                  minLength={10}
                  value={product.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.description ? "border-error-500" : "border-surface-300"
                  }`}
                  placeholder="Décrivez le produit en détail..."
                />
                <ErrorMessage message={errors.description} />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-background-700 mb-2">
                  Description courte
                </label>
                <textarea
                  value={product.shortDescription}
                  onChange={(e) => handleChange("shortDescription", e.target.value)}
                  maxLength={255}
                  rows={2}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brève description (max 255 caractères)"
                />
                <p className="text-xs text-background-500 mt-1">
                  {product.shortDescription.length}/255 caractères
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-surface-50 rounded-xl p-6 shadow-sm border border-surface-200">
              <h2 className="text-xl font-semibold text-background-900 mb-6 flex items-center">
                <Scale className="mr-3 text-primary-500" size={24} />
                Prix et Stock
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Prix original (XAF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.price}
                    onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.price ? "border-error-500" : "border-surface-300"
                    }`}
                  />
                  <ErrorMessage message={errors.price} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Prix promotionnel (XAF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.discountPrice}
                    onChange={(e) => handleChange("discountPrice", parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.discountPrice ? "border-error-500" : "border-surface-300"
                    }`}
                  />
                  <ErrorMessage message={errors.discountPrice} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Quantité en stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.stock ? "border-error-500" : "border-surface-300"
                    }`}
                  />
                  <ErrorMessage message={errors.stock} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Poids (grammes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={product.weight}
                    onChange={(e) => handleChange("weight", parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.weight ? "border-error-500" : "border-surface-300"
                    }`}
                  />
                  <ErrorMessage message={errors.weight} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-surface-50 rounded-xl p-6 shadow-sm border border-surface-200">
              <h2 className="text-xl font-semibold text-background-900 mb-6 flex items-center">
                <Scissors className="mr-3 text-primary-500" size={24} />
                Caractéristiques
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Niveau de difficulté
                  </label>
                  <select
                    value={product.difficulty}
                    onChange={(e) => handleChange("difficulty", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="BEGINNER">Débutant</option>
                    <option value="INTERMEDIATE">Intermédiaire</option>
                    <option value="ADVANCED">Avancé</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Temps estimé
                  </label>
                  <div className="relative">
                    <Clock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background-400"
                      size={20}
                    />
                    <input
                      type="text"
                      value={product.estimatedTime}
                      onChange={(e) => handleChange("estimatedTime", e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ex: 2-4 semaines"
                      maxLength={100}
                    />
                  </div>
                  <ErrorMessage message={errors.estimatedTime} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={product.dimensions}
                    onChange={(e) => handleChange("dimensions", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: 30x40cm"
                    maxLength={255}
                  />
                  <ErrorMessage message={errors.dimensions} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-background-700 mb-2">
                    Instructions
                  </label>
                  <input
                    type="text"
                    value={product.instructions}
                    onChange={(e) => handleChange("instructions", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Méthodes de point traditionnelles"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-background-700 mb-2">
                  Matériaux nécessaires
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMaterial())}
                    className="flex-1 px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Fils style vintage"
                  />
                  <button
                    type="button"
                    onClick={addMaterial}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material, index) => (
                    <span
                      key={index}
                      className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {material}
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="ml-2 text-primary-500 hover:text-primary-700"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-background-700 mb-2 flex items-center">
                  <Palette className="mr-2" size={16} />
                  Couleurs disponibles
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                    className="flex-1 px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Pastels atténués"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <span
                      key={index}
                      className="bg-accent-50 text-accent-700 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="ml-2 text-accent-500 hover:text-accent-700"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="bg-surface-50 rounded-xl p-6 shadow-sm border border-surface-200">
              <h2 className="text-xl font-semibold text-background-900 mb-6 flex items-center">
                <Tag className="mr-3 text-primary-500" size={24} />
                Tags
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-background-700 mb-3">
                  Tags existants
                </label>
                <div className="flex flex-wrap gap-2">
                  {existingTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => selectExistingTag(tag)}
                      className="bg-background-100 text-background-700 px-3 py-1 rounded-full text-sm hover:bg-background-200 transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                <ErrorMessage message={errors.tags} />
              </div>

              <div>
                <label className="block text-sm font-medium text-background-700 mb-2">
                  Ajouter un nouveau tag
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Vintage"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-secondary-50 text-secondary-700 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-secondary-500 hover:text-secondary-700"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="bg-surface-50 rounded-xl p-6 shadow-sm border border-surface-200">
              <h2 className="text-xl font-semibold text-background-900 mb-6 flex items-center">
                <Award className="mr-3 text-primary-500" size={24} />
                Avantages du produit
              </h2>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={newAdvantage.title}
                    onChange={(e) => setNewAdvantage((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre de l'avantage"
                    className="px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    maxLength={255}
                  />
                  <input
                    type="text"
                    value={newAdvantage.description}
                    onChange={(e) => setNewAdvantage((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    className="px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="text"
                    value={newAdvantage.icon}
                    onChange={(e) => setNewAdvantage((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="Icône (nom ou URL)"
                    className="px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addAdvantage}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Ajouter l'avantage
                </button>
              </div>
              <ErrorMessage message={errors.newAdvantage} />
              {product.advantages.map((_, idx) => (
                <ErrorMessage key={idx} message={errors[`advantages[${idx}].icon`]} />
              ))}

              <div className="space-y-3">
                {product.advantages.map((advantage, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-background-50 rounded-lg border"
                  >
                    <div>
                      <h4 className="font-medium text-background-900">{advantage.title}</h4>
                      {advantage.description && (
                        <p className="text-background-600 text-sm mt-1">{advantage.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdvantage(index)}
                      className="text-error-500 hover:text-error-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="bg-surface-50 rounded-xl p-6 shadow-sm border border-surface-200">
              <h2 className="text-xl font-semibold text-background-900 mb-6 flex items-center">
                <Image className="mr-3 text-primary-500" size={24} />
                Images du produit
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-background-700 mb-3">
                  Télécharger des images *
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    errors.images ? "border-error-300 bg-error-50" : "border-surface-300"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="text-background-400 mb-3" size={48} />
                    <span className="text-background-700 font-medium">
                      Cliquez pour télécharger ou glissez-déposez
                    </span>
                    <span className="text-background-500 text-sm mt-1">
                      JPG, PNG, WEBP, GIF jusqu'à 10MB
                    </span>
                  </label>
                </div>
                <ErrorMessage message={errors.images} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.alt || "Preview"}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        className={`p-2 rounded-full ${
                          image.isPrimary ? "bg-primary-500 text-white" : "bg-white text-background-700"
                        }`}
                        title="Définir comme image principale"
                      >
                        <Award size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 bg-white text-error-600 rounded-full"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                        Principale
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <>
              <div className="bg-surface-50 rounded-xl p-6 shadow-sm border border-surface-200">
                <h2 className="text-xl font-semibold text-background-900 mb-6 flex items-center">
                  <Download className="mr-3 text-primary-500" size={24} />
                  Patterns et fichiers
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-background-700 mb-3">
                    Télécharger des patterns
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      errors.patterns ? "border-error-300 bg-error-50" : "border-surface-300"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.zip,.rar,.jpg,.jpeg,.png"
                      onChange={handlePatternUpload}
                      className="hidden"
                      id="pattern-upload"
                    />
                    <label
                      htmlFor="pattern-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Download className="text-background-400 mb-3" size={48} />
                      <span className="text-background-700 font-medium">
                        Télécharger des patterns (PDF, ZIP, RAR, JPG, PNG)
                      </span>
                      <span className="text-background-500 text-sm mt-1">
                        Jusqu'à 50MB par fichier
                      </span>
                    </label>
                  </div>
                  <ErrorMessage message={errors.patterns} />
                </div>

                <div className="space-y-3">
                  {product.patterns.map((pattern, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-background-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Download className="text-primary-600" size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-background-900">{pattern.name}</h4>
                          <p className="text-background-500 text-sm">
                            {(pattern.fileSize / 1024 / 1024).toFixed(2)} MB •{" "}
                            {pattern.fileType.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePattern(index)}
                        className="text-error-500 hover:text-error-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-50 rounded-xl p-6 shadow-sm border border-surface-200">
                <h2 className="text-xl font-semibold text-background-900 mb-6">
                  Options
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={product.featured}
                      onChange={(e) => handleChange("featured", e.target.checked)}
                      className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-background-700">Produit en vedette</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={product.isActive}
                      onChange={(e) => handleChange("isActive", e.target.checked)}
                      className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-background-700">Produit actif</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {currentStep === 8 && (
            <div className="bg-surface-50 rounded-xl p-6 shadow-sm border border-surface-200">
              <h2 className="text-xl font-semibold text-background-900 mb-6 flex items-center">
                <Eye className="mr-3 text-primary-500" size={24} />
                Aperçu et Confirmation
              </h2>

              <div className="space-y-6">
                {/* Informations de base */}
                <div className="border-b border-surface-200 pb-6">
                  <h3 className="text-lg font-medium text-background-900 mb-4">Informations de base</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-background-600">Nom</p>
                      <p className="font-medium">{product.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">Slug</p>
                      <p className="font-medium">{product.slug}</p>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">Catégorie</p>
                      <p className="font-medium">{getCategoryName(product.categoryId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">SKU</p>
                      <p className="font-medium">{product.sku || "Non spécifié"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-background-600">Description courte</p>
                      <p className="font-medium">{product.shortDescription || "Non spécifiée"}</p>
                    </div>
                  </div>
                </div>

                {/* Prix et stock */}
                <div className="border-b border-surface-200 pb-6">
                  <h3 className="text-lg font-medium text-background-900 mb-4">Prix et Stock</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-background-600">Prix original</p>
                      <p className="font-medium">{product.price} XAF</p>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">Prix promotionnel</p>
                      <p className="font-medium">{product.discountPrice || 0} XAF</p>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">Stock</p>
                      <p className="font-medium">{product.stock} unités</p>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">Poids</p>
                      <p className="font-medium">{product.weight} g</p>
                    </div>
                  </div>
                </div>

                {/* Caractéristiques */}
                <div className="border-b border-surface-200 pb-6">
                  <h3 className="text-lg font-medium text-background-900 mb-4">Caractéristiques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-background-600">Difficulté</p>
                      <p className="font-medium">
                        {product.difficulty === "BEGINNER" && "Débutant"}
                        {product.difficulty === "INTERMEDIATE" && "Intermédiaire"}
                        {product.difficulty === "ADVANCED" && "Avancé"}
                        {product.difficulty === "EXPERT" && "Expert"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">Temps estimé</p>
                      <p className="font-medium">{product.estimatedTime || "Non spécifié"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">Dimensions</p>
                      <p className="font-medium">{product.dimensions || "Non spécifiées"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">Instructions</p>
                      <p className="font-medium">{product.instructions || "Non spécifiées"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">Matériaux</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.materials.length > 0 ? (
                          product.materials.map((material, index) => (
                            <span key={index} className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs">
                              {material}
                            </span>
                          ))
                        ) : (
                          <p className="text-background-500">Aucun matériau spécifié</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-background-600">Couleurs</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.colors.length > 0 ? (
                          product.colors.map((color, index) => (
                            <span key={index} className="bg-accent-50 text-accent-700 px-2 py-1 rounded text-xs">
                              {color}
                            </span>
                          ))
                        ) : (
                          <p className="text-background-500">Aucune couleur spécifiée</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="border-b border-surface-200 pb-6">
                  <h3 className="text-lg font-medium text-background-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.length > 0 ? (
                      product.tags.map((tag, index) => (
                        <span key={index} className="bg-secondary-50 text-secondary-700 px-3 py-1 rounded-full text-sm">
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-background-500">Aucun tag spécifié</p>
                    )}
                  </div>
                </div>

                {/* Avantages */}
                <div className="border-b border-surface-200 pb-6">
                  <h3 className="text-lg font-medium text-background-900 mb-4">Avantages</h3>
                  <div className="space-y-3">
                    {product.advantages.length > 0 ? (
                      product.advantages.map((advantage, index) => (
                        <div key={index} className="p-3 bg-background-50 rounded-lg border">
                          <h4 className="font-medium text-background-900">{advantage.title}</h4>
                          {advantage.description && (
                            <p className="text-background-600 text-sm mt-1">{advantage.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-background-500">Aucun avantage spécifié</p>
                    )}
                  </div>
                </div>

                {/* Images */}
                <div className="border-b border-surface-200 pb-6">
                  <h3 className="text-lg font-medium text-background-900 mb-4">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {product.images.length > 0 ? (
                      product.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.url}
                            alt={image.alt || "Preview"}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          {image.isPrimary && (
                            <div className="absolute top-1 left-1 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                              Principale
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-background-500 col-span-full">Aucune image téléchargée</p>
                    )}
                  </div>
                </div>

                {/* Patterns */}
                <div className="border-b border-surface-200 pb-6">
                  <h3 className="text-lg font-medium text-background-900 mb-4">Patterns</h3>
                  <div className="space-y-3">
                    {product.patterns.length > 0 ? (
                      product.patterns.map((pattern, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background-50 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Download className="text-primary-600" size={16} />
                            </div>
                            <div>
                              <h4 className="font-medium text-background-900">{pattern.name}</h4>
                              <p className="text-background-500 text-xs">
                                {(pattern.fileSize / 1024 / 1024).toFixed(2)} MB • {pattern.fileType.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-background-500">Aucun pattern téléchargé</p>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div>
                  <h3 className="text-lg font-medium text-background-900 mb-4">Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${product.featured ? 'bg-success-500' : 'bg-error-500'}`}></div>
                      <span className="text-background-700">
                        {product.featured ? "Produit en vedette" : "Produit normal"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${product.isActive ? 'bg-success-500' : 'bg-error-500'}`}></div>
                      <span className="text-background-700">
                        {product.isActive ? "Produit actif" : "Produit inactif"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-surface-200">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-surface-300 text-background-700 rounded-lg hover:bg-background-50 transition-colors"
                >
                  Précédent
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/produits")}
                className="px-6 py-3 border border-surface-300 text-background-700 rounded-lg hover:bg-background-50 transition-colors"
              >
                Annuler
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center"
                >
                  {currentStep === totalSteps - 1 ? "Voir l'aperçu" : "Suivant"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      Créer le produit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;