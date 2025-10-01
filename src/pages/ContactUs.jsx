import React, { useState, useEffect } from "react";
import axios from "axios";

const GestionContacts = () => {
  const [messages, setMessages] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [vue, setVue] = useState("grille");
  const [messageSelectionne, setMessageSelectionne] = useState(null);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [filtreType, setFiltreType] = useState("TOUS");
  const [filtreContacte, setFiltreContacte] = useState("TOUS");

  const recupererMessages = async () => {
    try {
      setChargement(true);
      const reponse = await axios.get("/contact");
      setMessages(reponse.data);
    } catch (error) {
      setErreur("Erreur lors de la récupération des messages");
      console.error("Erreur API:", error);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    recupererMessages();
  }, []);

  const ouvrirModal = (message) => {
    setMessageSelectionne(message);
    setModalOuvert(true);
  };

  // Fermer le modal
  const fermerModal = () => {
    setModalOuvert(false);
    setMessageSelectionne(null);
  };

  // Marquer comme contacté
  const marquerCommeContacte = async (id) => {
    try {
      await axios.put(`/contact/${id}`, {
        isContacted: true,
      });
      setMessages(
        messages.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                isContacted: true,
                contactedAt: new Date().toISOString(),
              }
            : msg
        )
      );
      if (messageSelectionne?.id === id) {
        setMessageSelectionne({
          ...messageSelectionne,
          isContacted: true,
          contactedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  // Traduire le type de message
  const traduireTypeMessage = (type) => {
    const types = {
      COMPLAINT: "Plainte",
      QUESTION: "Question",
      SUGGESTION: "Suggestion",
      FEEDBACK: "Retour",
      OTHER: "Autre",
    };
    return types[type] || type;
  };

  // Obtenir la couleur selon le type
  const getCouleurType = (type) => {
    const couleurs = {
      COMPLAINT: "red",
      QUESTION: "blue",
      SUGGESTION: "green",
      FEEDBACK: "purple",
      OTHER: "gray",
    };
    return couleurs[type] || "gray";
  };

  // Filtrer les messages
  const messagesFiltres = messages.filter((message) => {
    const correspondType = filtreType === "TOUS" || message.type === filtreType;
    const correspondContacte =
      filtreContacte === "TOUS" ||
      (filtreContacte === "CONTACTE" && message.isContacted) ||
      (filtreContacte === "NON_CONTACTE" && !message.isContacted);

    return correspondType && correspondContacte;
  });

  // Statistiques
  const statistiques = {
    total: messages.length,
    nonContacte: messages.filter((m) => !m.isContacted).length,
    plaintes: messages.filter((m) => m.type === "COMPLAINT").length,
    questions: messages.filter((m) => m.type === "QUESTION").length,
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
            onClick={recupererMessages}
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
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec statistiques */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Centre de Messages
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les messages de contact des clients
          </p>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Messages
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistiques.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Non Contactés
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistiques.nonContacte}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Plaintes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistiques.plaintes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Questions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistiques.questions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de contrôle */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-4">
            {/* Filtre par type */}
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TOUS">Tous les types</option>
              <option value="COMPLAINT">Plaintes</option>
              <option value="QUESTION">Questions</option>
              <option value="SUGGESTION">Suggestions</option>
              <option value="FEEDBACK">Retours</option>
              <option value="OTHER">Autres</option>
            </select>

            {/* Filtre par statut de contact */}
            <select
              value={filtreContacte}
              onChange={(e) => setFiltreContacte(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="NON_CONTACTE">Non contactés</option>
              <option value="CONTACTE">Contactés</option>
            </select>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {messagesFiltres.map((message) => (
              <div
                key={message.id}
                onClick={() => ouvrirModal(message)}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border ${
                  message.isContacted ? "border-green-200" : "border-red-200"
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {message.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{message.email}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getCouleurType(
                        message.type
                      )}-100 text-${getCouleurType(message.type)}-800`}
                    >
                      {traduireTypeMessage(message.type)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Sujet
                    </h4>
                    <p className="text-gray-900 text-sm line-clamp-2">
                      {message.subject}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Message
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {message.message}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {new Date(message.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    <div className="flex items-center space-x-2">
                      {message.isContacted ? (
                        <span className="inline-flex items-center text-green-600">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Contacté
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          En attente
                        </span>
                      )}
                    </div>
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
                    Expéditeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sujet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messagesFiltres.map((message) => (
                  <tr
                    key={message.id}
                    onClick={() => ouvrirModal(message)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {message.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {message.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getCouleurType(
                          message.type
                        )}-100 text-${getCouleurType(message.type)}-800`}
                      >
                        {traduireTypeMessage(message.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {message.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.isContacted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Contacté
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de détails */}
        {modalOuvert && messageSelectionne && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Détails du Message
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

                <div className="space-y-6">
                  {/* Informations expéditeur */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {messageSelectionne.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {messageSelectionne.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getCouleurType(
                          messageSelectionne.type
                        )}-100 text-${getCouleurType(
                          messageSelectionne.type
                        )}-800`}
                      >
                        {traduireTypeMessage(messageSelectionne.type)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut
                      </label>
                      {messageSelectionne.isContacted ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Contacté
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          Non contacté
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sujet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sujet
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {messageSelectionne.subject}
                    </p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {messageSelectionne.message}
                    </p>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'envoi
                      </label>
                      <p className="text-gray-900">
                        {new Date(
                          messageSelectionne.createdAt
                        ).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {messageSelectionne.contactedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de contact
                        </label>
                        <p className="text-gray-900">
                          {new Date(
                            messageSelectionne.contactedAt
                          ).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    {!messageSelectionne.isContacted && (
                      <button
                        onClick={() =>
                          marquerCommeContacte(messageSelectionne.id)
                        }
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Marquer comme contacté
                      </button>
                    )}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionContacts;
