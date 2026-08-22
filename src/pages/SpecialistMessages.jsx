import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { useNavigate } from "react-router-dom";

import SpecialistLayout from "../layouts/SpecialistLayout";

import { db, auth } from "../services/firebase";

import "../styles/SpecialistConversations.css";

function SpecialistMessages() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =====================================================
  // AUTENTICACIÓN
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("=================================");
        console.log("ESPECIALISTA AUTENTICADO");
        console.log("UID:", firebaseUser.uid);
        console.log("EMAIL:", firebaseUser.email);
        console.log("=================================");

        setCurrentUser(firebaseUser);
      } else {
        console.log("NO HAY USUARIO AUTENTICADO");

        setCurrentUser(null);
        setConversations([]);
        setLoading(false);

        navigate("/specialist/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // CARGAR CONVERSACIONES
  // =====================================================

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    console.log("=================================");
    console.log("BUSCANDO CONVERSACIONES");
    console.log("ESPECIALISTA:", currentUser.uid);
    console.log("=================================");

    setLoading(true);
    setError(null);

    const conversationsRef = collection(
      db,
      "conversaciones_especialistas"
    );

    const conversationsQuery = query(
      conversationsRef,
      where("especialistaId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        console.log(
          "CONVERSACIONES ENCONTRADAS:",
          snapshot.size
        );

        const loadedConversations = snapshot.docs.map(
          (conversationDoc) => {
            const data = conversationDoc.data();

            console.log(
              "CONVERSACIÓN:",
              conversationDoc.id,
              data
            );

            return {
              id: conversationDoc.id,
              ...data,
            };
          }
        );

        // Ordenar por fecha
        loadedConversations.sort((a, b) => {
          const dateA = a.fechaUltimoMensaje?.toDate
            ? a.fechaUltimoMensaje.toDate().getTime()
            : 0;

          const dateB = b.fechaUltimoMensaje?.toDate
            ? b.fechaUltimoMensaje.toDate().getTime()
            : 0;

          return dateB - dateA;
        });

        setConversations(loadedConversations);
        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          "ERROR CARGANDO CONVERSACIONES:",
          firebaseError
        );

        setError(firebaseError.message);
        setConversations([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // =====================================================
  // ABRIR CONVERSACIÓN
  // =====================================================

 const openConversation = (conversation) => {
  console.log("=================================");
  console.log("ABRIENDO CONVERSACIÓN");
  console.log("ID:", conversation.id);
  console.log("Usuario:", conversation.usuarioId);
  console.log("Especialista:", conversation.especialistaId);
  console.log("=================================");

  navigate(`/specialist-chat/${conversation.id}`, {
    state: {
      conversation,
    },
  });
};

  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatDate = (timestamp) => {
    if (
      !timestamp ||
      typeof timestamp.toDate !== "function"
    ) {
      return "";
    }

    try {
      return timestamp.toDate().toLocaleTimeString("es-NI", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SpecialistLayout>
        <div className="specialist-loading">
          <div className="specialist-loading-icon">
            ⏳
          </div>

          <p>Cargando conversaciones...</p>
        </div>
      </SpecialistLayout>
    );
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <SpecialistLayout>
      <div className="specialist-conversations-page">

        {/* ENCABEZADO */}

        <div className="specialist-page-header">
          <div>
            <span className="specialist-label">
              PANEL DE PROFESIONALES
            </span>

            <h1>💬 Mis mensajes</h1>

            <p>
              Aquí puedes ver y responder las
              conversaciones de tus usuarios.
            </p>
          </div>

          <div className="conversation-counter">
            <strong>{conversations.length}</strong>

            <span>conversaciones</span>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="no-conversations"
            style={{
              border: "1px solid #ffcccc",
            }}
          >
            <div className="no-conversations-icon">
              ⚠️
            </div>

            <h2>
              No se pudieron cargar los mensajes
            </h2>

            <p>{error}</p>
          </div>
        )}

        {/* SIN CONVERSACIONES */}

        {!error && conversations.length === 0 && (
          <div className="no-conversations">

            <div className="no-conversations-icon">
              💬
            </div>

            <h2>
              Aún no tienes conversaciones
            </h2>

            <p>
              Cuando un usuario te escriba,
              la conversación aparecerá aquí.
            </p>

            <small
              style={{
                display: "block",
                marginTop: "15px",
                opacity: 0.6,
              }}
            >
              Especialista conectado:{" "}
              {currentUser?.uid}
            </small>

          </div>
        )}

        {/* LISTA DE CONVERSACIONES */}

        {!error && conversations.length > 0 && (
          <div className="conversations-list">

            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="conversation-card"
                onClick={() =>
                  openConversation(conversation)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    openConversation(conversation);
                  }
                }}
              >

                {/* FOTO */}

                <div className="conversation-avatar">

                  {conversation.usuarioFoto ? (
                    <img
                      src={conversation.usuarioFoto}
                      alt={
                        conversation.usuarioNombre ||
                        "Usuario"
                      }
                    />
                  ) : (
                    <span>👤</span>
                  )}

                </div>

                {/* INFORMACIÓN */}

                <div className="conversation-content">

                  <div className="conversation-top">

                    <h3>
                      {conversation.usuarioNombre ||
                        "Usuario"}
                    </h3>

                    <span className="conversation-time">
                      {formatDate(
                        conversation.fechaUltimoMensaje
                      )}
                    </span>

                  </div>

                  <div className="conversation-bottom">

                    <p>
                      {conversation.ultimoMensaje ||
                        "Nueva conversación"}
                    </p>

                    {conversation.mensajesNoLeidos > 0 && (
                      <span className="unread-badge">
                        {conversation.mensajesNoLeidos}
                      </span>
                    )}

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}
      </div>
    </SpecialistLayout>
  );
}

export default SpecialistMessages;