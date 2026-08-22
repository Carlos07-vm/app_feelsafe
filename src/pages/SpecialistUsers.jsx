import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import "../styles/SpecialistUsers.css";

function SpecialistUsers() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // =====================================================
  // AUTENTICACIÓN
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          navigate("/specialist/login", {
            replace: true,
          });

          return;
        }

        setCurrentUser(user);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // CARGAR USUARIOS
  // =====================================================

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    setLoading(true);

    const conversationsRef = collection(
      db,
      "conversaciones_especialistas"
    );

    const conversationsQuery = query(
      conversationsRef,
      where(
        "especialistaId",
        "==",
        currentUser.uid
      )
    );

    const unsubscribe = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const usersMap = new Map();

        snapshot.docs.forEach(
          (conversationDoc) => {
            const data =
              conversationDoc.data();

            const userId =
              data.usuarioId ||
              conversationDoc.id;

            if (!usersMap.has(userId)) {
              usersMap.set(userId, {
                id: userId,
                conversationId:
                  conversationDoc.id,

                nombre:
                  data.usuarioNombre ||
                  "Usuario",

                foto:
                  data.usuarioFoto ||
                  "",

                ultimoMensaje:
                  data.ultimoMensaje ||
                  "",

                mensajesNoLeidos:
                  Number(
                    data.mensajesNoLeidos || 0
                  ),

                fecha:
                  data.fechaUltimoMensaje ||
                  null,
              });
            }
          }
        );

        setConversations(
          Array.from(usersMap.values())
        );

        setLoading(false);
      },
      (error) => {
        console.error(
          "Error cargando usuarios:",
          error
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // =====================================================
  // FILTRAR
  // =====================================================

  const filteredUsers = useMemo(() => {
    const text =
      search.trim().toLowerCase();

    if (!text) {
      return conversations;
    }

    return conversations.filter(
      (user) =>
        user.nombre
          .toLowerCase()
          .includes(text)
    );
  }, [conversations, search]);

  // =====================================================
  // ABRIR CHAT
  // =====================================================

  const openConversation = (user) => {
    if (!user.conversationId) {
      return;
    }

    navigate(
      `/specialist-chat/${user.conversationId}`
    );
  };

  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatDate = (timestamp) => {
    if (
      !timestamp ||
      typeof timestamp.toDate !==
        "function"
    ) {
      return "";
    }

    try {
      return timestamp
        .toDate()
        .toLocaleDateString("es-NI", {
          day: "2-digit",
          month: "short",
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
      <div className="specialist-users-loading">
        <div>⏳</div>

        <p>
          Cargando usuarios...
        </p>
      </div>
    );
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="specialist-users-page">

      {/* HEADER */}

      <header className="specialist-users-header">

        <div>

          <button
            className="users-back-button"
            onClick={() =>
              navigate(
                "/specialist/dashboard"
              )
            }
          >
            ← Volver al panel
          </button>

          <span>
            PANEL DE PROFESIONALES
          </span>

          <h1>
            👥 Usuarios
          </h1>

          <p>
            Usuarios que han iniciado una
            conversación contigo.
          </p>

        </div>

        <div className="users-total">
          <strong>
            {conversations.length}
          </strong>

          <small>
            usuarios
          </small>
        </div>

      </header>

      {/* BUSCADOR */}

      <section className="users-toolbar">

        <div className="users-search">

          <span>
            🔎
          </span>

          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

      </section>

      {/* LISTA */}

      {filteredUsers.length === 0 ? (

        <div className="users-empty">

          <div>
            👥
          </div>

          <h2>
            {search
              ? "No encontramos usuarios"
              : "Todavía no tienes usuarios"}
          </h2>

          <p>
            {search
              ? "Prueba con otro nombre."
              : "Cuando un usuario inicie una conversación contigo aparecerá aquí."}
          </p>

        </div>

      ) : (

        <section className="users-list">

          {filteredUsers.map(
            (user) => (

              <article
                key={user.id}
                className="specialist-user-card"
                onClick={() =>
                  openConversation(user)
                }
              >

                {/* AVATAR */}

                <div className="specialist-user-avatar">

                  {user.foto ? (
                    <img
                      src={user.foto}
                      alt={user.nombre}
                    />
                  ) : (
                    <span>
                      {user.nombre
                        ?.charAt(0)
                        .toUpperCase() ||
                        "U"}
                    </span>
                  )}

                </div>

                {/* INFORMACIÓN */}

                <div className="specialist-user-info">

                  <div className="specialist-user-top">

                    <h3>
                      {user.nombre}
                    </h3>

                    <span>
                      {formatDate(
                        user.fecha
                      )}
                    </span>

                  </div>

                  <p>
                    {user.ultimoMensaje ||
                      "Nueva conversación"}
                  </p>

                </div>

                {/* NO LEÍDOS */}

                {user.mensajesNoLeidos >
                  0 && (
                  <span className="user-unread">
                    {user.mensajesNoLeidos}
                  </span>
                )}

                <span className="user-arrow">
                  →
                </span>

              </article>
            )
          )}

        </section>
      )}

    </div>
  );
}

export default SpecialistUsers;