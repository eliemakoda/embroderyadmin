import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  Star,
  Clock,
  Package,
  Tag,
} from "lucide-react";
const REACT_APP_API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const navigate = useNavigate();

  // Fetch des produits
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/products");
      if (response.data.success) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
      }
    } catch (err) {
      setError("Erreur lors du chargement des produits");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtrage des produits
  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some((tag) =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Suppression d'un produit
  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await axios.delete(`/products/${productToDelete.id}`);
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      setError("Erreur lors de la suppression du produit");
      console.error("Error deleting product:", err);
    }
  };

  // Ouverture de la modal de détails
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Redirection pour l'édition
  const handleEdit = (productId) => {
    navigate(`/admin/produits/editer/${productId}`);
  };

  // Redirection pour l'ajout
  const handleAdd = () => {
    navigate("/admin/product/add");
  };

  // Formatage du prix
  const formatPrice = (price) => {
    return `${price} XAF`;
  };

  // Rendu des étoiles pour la notation
  const renderRating = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < rating
                ? "fill-secondary-500 text-secondary-500"
                : "text-background-300"
            }
          />
        ))}
        <span className="text-sm text-background-700 ml-1">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-4 text-error-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="bg-surface-50 rounded-xl p-6 shadow-sm border border-surface-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-background-900">Produits</h1>
            <p className="text-background-600 mt-1">
              {filteredProducts.length} produit
              {filteredProducts.length !== 1 ? "s" : ""} trouvé
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Barre de recherche */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
              />
            </div>

            {/* Bouton d'ajout */}
            <button
              onClick={handleAdd}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Contrôles de vue et filtres */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-6 border-t border-surface-200">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-background-600 hover:text-primary-600 px-3 py-2 rounded-lg transition-colors">
              <Filter size={20} />
              <span>Filtrer</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <span className="text-background-600 text-sm">Affichage :</span>
            <div className="bg-surface-100 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-background-500 hover:text-background-700"
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-background-500 hover:text-background-700"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-surface-50 rounded-xl border border-surface-200">
          <Package className="mx-auto text-background-300" size={48} />
          <h3 className="mt-4 text-lg font-medium text-background-900">
            Aucun produit trouvé
          </h3>
          <p className="text-background-600 mt-2">
            {searchTerm
              ? "Essayez de modifier vos critères de recherche"
              : "Commencez par ajouter votre premier produit"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={(product) => {
                setProductToDelete(product);
                setShowDeleteModal(true);
              }}
              formatPrice={formatPrice}
              renderRating={renderRating}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface-50 rounded-xl border border-surface-200 overflow-hidden">
          {filteredProducts.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={(product) => {
                setProductToDelete(product);
                setShowDeleteModal(true);
              }}
              formatPrice={formatPrice}
              renderRating={renderRating}
            />
          ))}
        </div>
      )}

      {/* Modal de détails */}
      {showModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          formatPrice={formatPrice}
          renderRating={renderRating}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          product={productToDelete}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }}
        />
      )}
    </div>
  );
};

// Composant Carte Produit (Vue Grille)
const ProductCard = ({
  product,
  onViewDetails,
  onEdit,
  onDelete,
  formatPrice,
  renderRating,
}) => {
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  return (
    <div className="bg-surface-50 rounded-xl border border-surface-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-background-100">
        {primaryImage ? (
          <img
            src={`${REACT_APP_API_BASE_URL}${primaryImage.url}`}
            crossOrigin="anonymous"
            alt={primaryImage.alt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-background-300">
            <Package size={48} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.featured && (
            <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
              En vedette
            </span>
          )}
          {product.pricing.hasDiscount && (
            <span className="bg-success-500 text-white text-xs px-2 py-1 rounded-full">
              -{product.pricing.discountPercentage}%
            </span>
          )}
        </div>

        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails(product)}
              className="bg-white text-background-700 p-2 rounded-full shadow-lg hover:text-primary-600 transition-colors"
            >
              <Eye size={20} />
            </button>
            <button
              onClick={() => onEdit(product.id)}
              className="bg-white text-background-700 p-2 rounded-full shadow-lg hover:text-accent-600 transition-colors"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="bg-white text-background-700 p-2 rounded-full shadow-lg hover:text-error-600 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-background-900 line-clamp-2 flex-1">
            {product.name}
          </h3>
          {renderRating(product.rating)}
        </div>

        <p className="text-background-600 text-sm mb-3 line-clamp-2">
          {product.shortDescription}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {product.pricing.hasDiscount ? (
              <>
                <span className="text-lg font-bold text-background-900">
                  {formatPrice(product.pricing.discountPrice)}
                </span>
                <span className="text-background-400 line-through text-sm">
                  {formatPrice(product.pricing.originalPrice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-background-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <div className="flex items-center text-background-500 text-sm">
            <Clock size={16} className="mr-1" />
            {product.estimatedTime}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full flex items-center"
            >
              <Tag size={12} className="mr-1" />
              {tag.name}
            </span>
          ))}
          {product.tags.length > 3 && (
            <span className="bg-background-100 text-background-600 text-xs px-2 py-1 rounded-full">
              +{product.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-background-500">
          <span
            className={`px-2 py-1 rounded-full ${
              product.difficulty === "BEGINNER"
                ? "bg-success-100 text-success-700"
                : product.difficulty === "INTERMEDIATE"
                ? "bg-warning-100 text-warning-700"
                : "bg-error-100 text-error-700"
            }`}
          >
            {product.difficulty === "BEGINNER"
              ? "Débutant"
              : product.difficulty === "INTERMEDIATE"
              ? "Intermédiaire"
              : "Avancé"}
          </span>
          <span
            className={`px-2 py-1 rounded-full ${
              product.stockInfo.inStock
                ? "bg-success-100 text-success-700"
                : "bg-error-100 text-error-700"
            }`}
          >
            {product.stockInfo.inStock
              ? `${product.stock} en stock`
              : "Rupture"}
          </span>
        </div>
      </div>
    </div>
  );
};

// Composant Élément de Liste (Vue Liste)
const ProductListItem = ({
  product,
  onViewDetails,
  onEdit,
  onDelete,
  formatPrice,
  renderRating,
}) => {
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  return (
    <div className="border-b border-surface-200 last:border-b-0 hover:bg-surface-100 transition-colors">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Image */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-background-100">
            {primaryImage ? (
              <img
                src={`${REACT_APP_API_BASE_URL}${primaryImage.url}`}
                crossOrigin="anonymous"
                alt={primaryImage.alt || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-background-300">
                <Package size={24} />
              </div>
            )}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-background-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-background-600 text-sm line-clamp-2 mb-2">
                  {product.shortDescription}
                </p>
              </div>
              {renderRating(product.rating)}
            </div>

            <div className="flex items-center space-x-4 text-sm text-background-600 mb-3">
              <span className="flex items-center">
                <Clock size={16} className="mr-1" />
                {product.estimatedTime}
              </span>
              <span
                className={`px-2 py-1 rounded-full ${
                  product.difficulty === "BEGINNER"
                    ? "bg-success-100 text-success-700"
                    : product.difficulty === "INTERMEDIATE"
                    ? "bg-warning-100 text-warning-700"
                    : "bg-error-100 text-error-700"
                }`}
              >
                {product.difficulty === "BEGINNER"
                  ? "Débutant"
                  : product.difficulty === "INTERMEDIATE"
                  ? "Intermédiaire"
                  : "Avancé"}
              </span>
              <span
                className={`px-2 py-1 rounded-full ${
                  product.stockInfo.inStock
                    ? "bg-success-100 text-success-700"
                    : "bg-error-100 text-error-700"
                }`}
              >
                {product.stockInfo.inStock
                  ? `${product.stock} en stock`
                  : "Rupture"}
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag.id}
                  className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full flex items-center"
                >
                  <Tag size={12} className="mr-1" />
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* Prix et actions */}
          <div className="flex-shrink-0 text-right">
            <div className="mb-3">
              {product.pricing.hasDiscount ? (
                <>
                  <div className="text-lg font-bold text-background-900">
                    {formatPrice(product.pricing.discountPrice)}
                  </div>
                  <div className="text-background-400 line-through text-sm">
                    {formatPrice(product.pricing.originalPrice)}
                  </div>
                </>
              ) : (
                <div className="text-lg font-bold text-background-900">
                  {formatPrice(product.price)}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onViewDetails(product)}
                className="p-2 text-background-500 hover:text-primary-600 transition-colors"
                title="Voir les détails"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => onEdit(product.id)}
                className="p-2 text-background-500 hover:text-accent-600 transition-colors"
                title="Modifier"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(product)}
                className="p-2 text-background-500 hover:text-error-600 transition-colors"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de détails du produit
const ProductDetailModal = ({
  product,
  onClose,
  formatPrice,
  renderRating,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  const tabs = [
    { id: "details", label: "Détails" },
    { id: "specifications", label: "Spécifications" },
    { id: "reviews", label: "Avis" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface-50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-2xl font-bold text-background-900">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {/* En-tête du produit */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* Image */}
              <div className="lg:w-1/3">
                <div className="aspect-square rounded-lg overflow-hidden bg-background-100">
                  {primaryImage ? (
                    <img
                      src={`${REACT_APP_API_BASE_URL}${primaryImage.url}`}
                      crossOrigin="anonymous"
                      alt={primaryImage.alt || product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-background-300">
                      <Package size={48} />
                    </div>
                  )}
                </div>
              </div>

              {/* Informations principales */}
              <div className="lg:w-2/3">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-background-900 mb-2">
                      {product.name}
                    </h3>
                    {renderRating(product.rating)}
                  </div>
                  <div className="text-right">
                    {product.pricing.hasDiscount ? (
                      <>
                        <div className="text-2xl font-bold text-background-900">
                          {formatPrice(product.pricing.discountPrice)}
                        </div>
                        <div className="text-background-400 line-through">
                          {formatPrice(product.pricing.originalPrice)}
                        </div>
                        <div className="text-success-600 font-semibold">
                          Économisez {formatPrice(product.pricing.savings)} (
                          {product.pricing.discountPercentage}%)
                        </div>
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-background-900">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-background-700 mb-4">
                  {product.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-background-700">
                      Difficulté:
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full ${
                        product.difficulty === "BEGINNER"
                          ? "bg-success-100 text-success-700"
                          : product.difficulty === "INTERMEDIATE"
                          ? "bg-warning-100 text-warning-700"
                          : "bg-error-100 text-error-700"
                      }`}
                    >
                      {product.difficulty === "BEGINNER"
                        ? "Débutant"
                        : product.difficulty === "INTERMEDIATE"
                        ? "Intermédiaire"
                        : "Avancé"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-background-700">
                      Temps estimé:
                    </span>
                    <span className="ml-2 text-background-600">
                      {product.estimatedTime}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-background-700">
                      Stock:
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full ${
                        product.stockInfo.inStock
                          ? "bg-success-100 text-success-700"
                          : "bg-error-100 text-error-700"
                      }`}
                    >
                      {product.stockInfo.inStock
                        ? `${product.stock} disponibles`
                        : "Rupture de stock"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-background-700">
                      SKU:
                    </span>
                    <span className="ml-2 text-background-600">
                      {product.sku}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation par onglets */}
            <div className="border-b border-surface-200 mb-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-background-500 hover:text-background-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenu des onglets */}
            <div className="tab-content">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-background-900 mb-2">
                      Description
                    </h4>
                    <p className="text-background-700">{product.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-background-900 mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          <Tag size={14} className="mr-1" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-background-900 mb-3">
                      Caractéristiques
                    </h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="font-medium text-background-700">
                          Dimensions
                        </dt>
                        <dd className="text-background-600">
                          {product.dimensions}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-background-700">
                          Poids
                        </dt>
                        <dd className="text-background-600">
                          {product.weight}g
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-background-700">
                          Couleurs
                        </dt>
                        <dd className="text-background-600">
                          {product.colors}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-semibold text-background-900 mb-3">
                      Matériaux
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-background-600">
                      {/* {JSON.parse(product.materials).map((material, index) => (
                        <li key={index}>{material}</li>
                      ))} */}
                      <li>{product.colors}</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {product.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border border-surface-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-background-900">
                              {review.author}
                            </span>
                            {renderRating(review.rating)}
                          </div>
                          <p className="text-background-700">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-background-500">
                      Aucun avis pour ce produit
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de confirmation de suppression
const DeleteConfirmationModal = ({ product, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface-50 rounded-xl max-w-md w-full p-6 animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100 mb-4">
            <Trash2 className="h-6 w-6 text-error-600" />
          </div>

          <h3 className="text-lg font-bold text-background-900 mb-2">
            Confirmer la suppression
          </h3>

          <p className="text-background-600 mb-6">
            Êtes-vous sûr de vouloir supprimer le produit{" "}
            <strong>"{product?.name}"</strong> ? Cette action est irréversible.
          </p>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-surface-300 text-background-700 rounded-lg hover:bg-background-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
