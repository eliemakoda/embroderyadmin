import React, { useState, useEffect } from "react";
import axios from "axios";
const REACT_APP_API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

const ListeUtilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [vue, setVue] = useState("grille"); // 'grille' ou 'liste'
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState(null);
  const [modalOuvert, setModalOuvert] = useState(false);

  // Récupérer les utilisateurs depuis l'API
  const recupererUtilisateurs = async () => {
    try {
      setChargement(true);
      const reponse = await axios.get("/users");
      if (reponse.data.success) {
        setUtilisateurs(reponse.data.data);
      } else {
        setErreur("Erreur lors de la récupération des utilisateurs");
      }
    } catch (error) {
      setErreur("Erreur de connexion au serveur");
      console.error("Erreur API:", error);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    recupererUtilisateurs();
  }, []);

  // Ouvrir le modal avec les détails de l'utilisateur
  const ouvrirModal = (utilisateur) => {
    setUtilisateurSelectionne(utilisateur);
    setModalOuvert(true);
  };

  // Fermer le modal
  const fermerModal = () => {
    setModalOuvert(false);
    setUtilisateurSelectionne(null);
  };

  // Niveau de compétence traduit
  const traduireNiveauCompetence = (niveau) => {
    const niveaux = {
      BEGINNER: "Débutant",
      INTERMEDIATE: "Intermédiaire",
      ADVANCED: "Avancé",
      EXPERT: "Expert",
    };
    return niveaux[niveau] || niveau;
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-600 text-lg">{erreur}</p>
          <button
            onClick={recupererUtilisateurs}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête du tableau de bord */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600 mt-2">
              {utilisateurs.length} utilisateur
              {utilisateurs.length > 1 ? "s" : ""} trouvé
              {utilisateurs.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Boutons de changement de vue */}
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setVue("grille")}
              className={`p-2 rounded-md transition-colors ${
                vue === "grille"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setVue("liste")}
              className={`p-2 rounded-md transition-colors ${
                vue === "liste"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Vue Grille */}
        {vue === "grille" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {utilisateurs.map((utilisateur) => (
              <div
                key={utilisateur.id}
                onClick={() => ouvrirModal(utilisateur)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={`${REACT_APP_API_BASE_URL}${utilisateur.avatar}`}
                      crossOrigin="anonymous"
                      alt={`Avatar de ${utilisateur.name}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {utilisateur.name}
                        </h3>
                        {utilisateur.isVerified && (
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm truncate">
                        {utilisateur.email}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {traduireNiveauCompetence(utilisateur.skillLevel)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-gray-700 text-sm line-clamp-2">
                    {utilisateur.bio || "Aucune biographie fournie"}
                  </p>

                  <div className="mt-4 flex justify-between text-xs text-gray-500">
                    <span>{utilisateur._count.reviews} avis</span>
                    <span>{utilisateur._count.wishlist} favoris</span>
                    <span>{utilisateur._count.cart} panier</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vue Liste */}
        {vue === "liste" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {utilisateurs.map((utilisateur) => (
                  <tr
                    key={utilisateur.id}
                    onClick={() => ouvrirModal(utilisateur)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`${REACT_APP_API_BASE_URL}${utilisateur.avatar}`}
                          crossOrigin="anonymous"
                          alt={`Avatar de ${utilisateur.name}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="flex items-center space-x-1">
                            <div className="text-sm font-medium text-gray-900">
                              {utilisateur.name}
                            </div>
                            {utilisateur.isVerified && (
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {utilisateur.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {traduireNiveauCompetence(utilisateur.skillLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {utilisateur.isVerified ? "Vérifié" : "Non vérifié"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span>{utilisateur._count.reviews} avis</span>
                        <span>{utilisateur._count.wishlist} favoris</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {utilisateur.lastLogin
                        ? new Date(utilisateur.lastLogin).toLocaleDateString(
                            "fr-FR"
                          )
                        : "Jamais"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de détails */}
        {modalOuvert && utilisateurSelectionne && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Détails de l'Utilisateur
                  </h2>
                  <button
                    onClick={fermerModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="text-center mb-6">
                  <img
                    src={`${REACT_APP_API_BASE_URL}${utilisateurSelectionne.avatar}`}
                    crossOrigin="anonymous"
                    alt={`Avatar de ${utilisateurSelectionne.name}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 mx-auto mb-4"
                  />
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {utilisateurSelectionne.name}
                    </h3>
                    {utilisateurSelectionne.isVerified && (
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {utilisateurSelectionne.email}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biographie
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {utilisateurSelectionne.bio ||
                        "Aucune biographie fournie"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Niveau
                      </label>
                      <p className="text-gray-900">
                        {traduireNiveauCompetence(
                          utilisateurSelectionne.skillLevel
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut
                      </label>
                      <p className="text-gray-900">
                        {utilisateurSelectionne.isVerified
                          ? "Vérifié"
                          : "Non vérifié"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {utilisateurSelectionne._count.reviews}
                      </div>
                      <div className="text-sm text-gray-600">Avis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {utilisateurSelectionne._count.wishlist}
                      </div>
                      <div className="text-sm text-gray-600">Favoris</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {utilisateurSelectionne._count.cart}
                      </div>
                      <div className="text-sm text-gray-600">Panier</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'inscription
                    </label>
                    <p className="text-gray-900">
                      {new Date(
                        utilisateurSelectionne.createdAt
                      ).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={fermerModal}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeUtilisateurs;
