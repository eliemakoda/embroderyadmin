import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Grid3X3,
  List,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  X,
  AlertTriangle
} from 'lucide-react';
const REACT_APP_API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

const ComposantListeTutoriels = () => {
  const [tutoriels, setTutoriels] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [vue, setVue] = useState('grille'); // 'grille' ou 'liste'
  const [recherche, setRecherche] = useState('');
  const [filtreDifficulte, setFiltreDifficulte] = useState('tous');
  const [tutorielSelectionne, setTutorielSelectionne] = useState(null);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [modalSuppression, setModalSuppression] = useState(null);

  const navigate = useNavigate();

  // Récupérer les tutoriels depuis l'API
  useEffect(() => {
    chargerTutoriels();
  }, []);

  const chargerTutoriels = async () => {
    try {
      setChargement(true);
      const reponse = await axios.get('/tutorials');
      if (reponse.data.success) {
        setTutoriels(reponse.data.data.tutorials);
      }
    } catch (erreur) {
      setErreur('Erreur lors du chargement des tutoriels');
      console.error('Erreur API:', erreur);
    } finally {
      setChargement(false);
    }
  };

  // Filtrer les tutoriels
  const tutorielsFiltres = tutoriels.filter(tutoriel => {
    const correspondRecherche = tutoriel.title.toLowerCase().includes(recherche.toLowerCase()) ||
                              tutoriel.description.toLowerCase().includes(recherche.toLowerCase());
    const correspondDifficulte = filtreDifficulte === 'tous' || tutoriel.difficulty === filtreDifficulte;
    return correspondRecherche && correspondDifficulte;
  });

  // Gérer la suppression
  const confirmerSuppression = (tutoriel) => {
    setModalSuppression(tutoriel);
  };

  const supprimerTutoriel = async () => {
    if (!modalSuppression) return;

    try {
      await axios.delete(`/tutorials/${modalSuppression.id}`);
      setTutoriels(tutoriels.filter(t => t.id !== modalSuppression.id));
      setModalSuppression(null);
    } catch (erreur) {
      console.error('Erreur suppression:', erreur);
      setErreur('Erreur lors de la suppression');
    }
  };

  // Gérer la visualisation des détails
  const ouvrirDetails = (tutoriel) => {
    setTutorielSelectionne(tutoriel);
    setModalOuvert(true);
  };

  // Formater la durée
  const formaterDuree = (minutes) => {
    return `${minutes} min`;
  };

  // Obtenir la couleur de difficulté
  const getCouleurDifficulte = (difficulte) => {
    switch (difficulte) {
      case 'BEGINNER': return 'success';
      case 'INTERMEDIATE': return 'warning';
      case 'ADVANCED': return 'error';
      default: return 'info';
    }
  };

  // Traduire la difficulté
  const traduireDifficulte = (difficulte) => {
    const traductions = {
      'BEGINNER': 'Débutant',
      'INTERMEDIATE': 'Intermédiaire',
      'ADVANCED': 'Avancé'
    };
    return traductions[difficulte] || difficulte;
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center">
        <div className="animate-spin-slow w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 py-8">
      {/* En-tête */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 font-display">
              Tutoriels d'Embroidery
            </h1>
            <p className="mt-2 text-surface-600">
              Découvrez nos {tutoriels.length} tutoriels pour maîtriser l'art de la broderie
            </p>
          </div>
          
          <button
            onClick={() => navigate('/tutorials/create')}
            className="mt-4 lg:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Tutoriel
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-surface-50 rounded-xl shadow-sm border border-surface-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Barre de recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un tutoriel..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors duration-200"
              />
            </div>

            {/* Filtres et vue */}
            <div className="flex items-center gap-4">
              {/* Filtre difficulté */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
                <select
                  value={filtreDifficulte}
                  onChange={(e) => setFiltreDifficulte(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none transition-colors duration-200"
                >
                  <option value="tous">Tous les niveaux</option>
                  <option value="BEGINNER">Débutant</option>
                  <option value="INTERMEDIATE">Intermédiaire</option>
                  <option value="ADVANCED">Avancé</option>
                </select>
              </div>

              {/* Toggle vue */}
              <div className="flex bg-surface-100 rounded-lg p-1">
                <button
                  onClick={() => setVue('grille')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    vue === 'grille'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setVue('liste')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    vue === 'liste'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Affichage des résultats */}
        {erreur && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
            {erreur}
          </div>
        )}

        {tutorielsFiltres.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-surface-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-surface-900 mb-2">
              Aucun tutoriel trouvé
            </h3>
            <p className="text-surface-600">
              Essayez de modifier vos critères de recherche ou créez un nouveau tutoriel.
            </p>
          </div>
        ) : vue === 'grille' ? (
          <VueGrille
            tutoriels={tutorielsFiltres}
            onVoirDetails={ouvrirDetails}
            onModifier={(id) => navigate(`/tutoriels/modifier/${id}`)}
            onSupprimer={confirmerSuppression}
            formaterDuree={formaterDuree}
            getCouleurDifficulte={getCouleurDifficulte}
            traduireDifficulte={traduireDifficulte}
          />
        ) : (
          <VueListe
            tutoriels={tutorielsFiltres}
            onVoirDetails={ouvrirDetails}
            onModifier={(id) => navigate(`/tutoriels/modifier/${id}`)}
            onSupprimer={confirmerSuppression}
            formaterDuree={formaterDuree}
            getCouleurDifficulte={getCouleurDifficulte}
            traduireDifficulte={traduireDifficulte}
          />
        )}
      </div>

      {/* Modal de détails */}
      {modalOuvert && tutorielSelectionne && (
        <ModalDetails
          tutoriel={tutorielSelectionne}
          onFermer={() => setModalOuvert(false)}
          formaterDuree={formaterDuree}
          traduireDifficulte={traduireDifficulte}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {modalSuppression && (
        <ModalConfirmationSuppression
          tutoriel={modalSuppression}
          onConfirmer={supprimerTutoriel}
          onAnnuler={() => setModalSuppression(null)}
        />
      )}
    </div>
  );
};

// Composant pour la vue grille
const VueGrille = ({ tutoriels, onVoirDetails, onModifier, onSupprimer, formaterDuree, getCouleurDifficulte, traduireDifficulte }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutoriels.map((tutoriel) => (
        <div
          key={tutoriel.id}
          className="bg-surface-50 rounded-xl shadow-sm border border-surface-200 overflow-hidden hover:shadow-md transition-shadow duration-200 animate-fade-in"
        >
          {/* En-tête de la carte */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getCouleurDifficulte(tutoriel.difficulty)}-100 text-${getCouleurDifficulte(tutoriel.difficulty)}-800`}>
                {traduireDifficulte(tutoriel.difficulty)}
              </span>
              <div className="flex items-center gap-1">
                {tutoriel.featured && (
                  <Star className="w-4 h-4 text-secondary-500 fill-current" />
                )}
                {tutoriel.product && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-accent-100 text-accent-800">
                    Kit
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-surface-900 mb-2 line-clamp-2">
              {tutoriel.title}
            </h3>
            <p className="text-surface-600 text-sm mb-4 line-clamp-2">
              {tutoriel.description}
            </p>

            {/* Métadonnées */}
            <div className="flex items-center justify-between text-sm text-surface-500 mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formaterDuree(tutoriel.duration)}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {tutoriel.viewCount} vues
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-200">
              <button
                onClick={() => onVoirDetails(tutoriel)}
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-1" />
                Voir détails
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onModifier(tutoriel.id)}
                  className="p-2 text-surface-500 hover:text-accent-600 transition-colors duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSupprimer(tutoriel)}
                  className="p-2 text-surface-500 hover:text-error-600 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant pour la vue liste
const VueListe = ({ tutoriels, onVoirDetails, onModifier, onSupprimer, formaterDuree, getCouleurDifficulte, traduireDifficulte }) => {
  return (
    <div className="bg-surface-50 rounded-xl shadow-sm border border-surface-200 overflow-hidden">
      {tutoriels.map((tutoriel, index) => (
        <div
          key={tutoriel.id}
          className={`flex flex-col md:flex-row md:items-center justify-between p-6 ${
            index !== tutoriels.length - 1 ? 'border-b border-surface-200' : ''
          } animate-fade-in`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getCouleurDifficulte(tutoriel.difficulty)}-100 text-${getCouleurDifficulte(tutoriel.difficulty)}-800`}>
                {traduireDifficulte(tutoriel.difficulty)}
              </span>
              {tutoriel.featured && (
                <Star className="w-4 h-4 text-secondary-500 fill-current" />
              )}
              {tutoriel.product && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-accent-100 text-accent-800">
                  Avec kit
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-surface-900 mb-1">
              {tutoriel.title}
            </h3>
            <p className="text-surface-600 mb-3 line-clamp-1">
              {tutoriel.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-surface-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formaterDuree(tutoriel.duration)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {tutoriel.viewCount} vues
              </div>
              <span>Créé par {tutoriel.admin.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => onVoirDetails(tutoriel)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-1" />
              Détails
            </button>
            <button
              onClick={() => onModifier(tutoriel.id)}
              className="p-2 text-surface-500 hover:text-accent-600 transition-colors duration-200"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSupprimer(tutoriel)}
              className="p-2 text-surface-500 hover:text-error-600 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Modal de détails
const ModalDetails = ({ tutoriel, onFermer, formaterDuree, traduireDifficulte }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* En-tête du modal */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-2xl font-bold text-surface-900 font-display">
            {tutoriel.title}
          </h2>
          <button
            onClick={onFermer}
            className="p-2 hover:bg-surface-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Contenu du modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Métadonnées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-surface-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-surface-600">Difficulté</span>
              <p className="text-surface-900">{traduireDifficulte(tutoriel.difficulty)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-surface-600">Durée</span>
              <p className="text-surface-900">{formaterDuree(tutoriel.duration)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-surface-600">Vues</span>
              <p className="text-surface-900">{tutoriel.viewCount}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-2">Description</h3>
            <p className="text-surface-600 leading-relaxed">{tutoriel.description}</p>
          </div>

          {/* Contenu détaillé */}
          {tutoriel.content && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-surface-900 mb-2">Contenu détaillé</h3>
              <p className="text-surface-600 leading-relaxed">{tutoriel.content}</p>
            </div>
          )}

          {/* Étapes */}
          {tutoriel.steps && tutoriel.steps.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 mb-4">
                Étapes ({tutoriel.steps.length})
              </h3>
              <div className="space-y-4">
                {tutoriel.steps.map((step) => (
                  <div key={step.id} className="flex gap-4 p-4 bg-surface-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-surface-900 mb-1">{step.title}</h4>
                      <p className="text-surface-600 text-sm">{step.description}</p>
                      {step.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={`${REACT_APP_API_BASE_URL}${step.imageUrl}`}
                            alt={step.title}
                            crossOrigin='anonymous'
                            className="w-32 h-20 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal de confirmation de suppression
const ModalConfirmationSuppression = ({ tutoriel, onConfirmer, onAnnuler }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-error-600" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900">
            Confirmer la suppression
          </h3>
        </div>

        <p className="text-surface-600 mb-6">
          Êtes-vous sûr de vouloir supprimer le tutoriel <strong>"{tutoriel.title}"</strong> ? 
          Cette action est irréversible.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onAnnuler}
            className="px-4 py-2 text-sm font-medium text-surface-700 hover:text-surface-900 transition-colors duration-200"
          >
            Annuler
          </button>
          <button
            onClick={onConfirmer}
            className="px-4 py-2 text-sm font-medium text-white bg-error-600 hover:bg-error-700 rounded-lg transition-colors duration-200"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposantListeTutoriels;