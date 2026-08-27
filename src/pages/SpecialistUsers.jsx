import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import SpecialistLayout from "../components/SpecialistLayout";

import "../styles/SpecialistUsers.css";

function SpecialistUsers() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // AUTENTICACIÓN
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/specialist/login", {
          replace: true,
        });

        return;
      }

      setCurrentUser(user);
    });

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
    setError("");

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
      async (snapshot) => {
        try {
          const users = await Promise.all(
            snapshot.docs.map(async (conversationDoc) => {
              const data = conversationDoc.data();

              const userId = data.usuarioId;

              let usuarioNombre =
                data.usuarioNombre ||
                "Usuario";

              let usuarioFoto =
                data.usuarioFoto ||
                "";

              // =================================================
              // BUSCAR PERFIL REAL EN "usuarios"
              // =================================================

              if (userId) {
                try {
                  const userRef = doc(
                    db,
                    "usuarios",
                    userId
                  );

                  const userSnapshot =
                    await getDoc(userRef);

                  if (userSnapshot.exists()) {
                    const userData =
                      userSnapshot.data();

                    console.log(
                      "👤 PERFIL DEL USUARIO:",
                      userId,
                      userData
                    );

                    usuarioNombre =
                      userData.nombre ||
                      userData.displayName ||
                      userData.nombreCompleto ||
                      usuarioNombre;

                    usuarioFoto =
                      userData.foto ||
                      userData.fotoPerfil ||
                      userData.photoURL ||
                      usuarioFoto ||
                      "";
                  } else {
                    console.warn(
                      "⚠️ No existe perfil en usuarios:",
                      userId
                    );
                  }
                } catch (profileError) {
                  console.error(
                    "❌ Error obteniendo usuario:",
                    profileError
                  );
                }
              }

              return {
                id: userId || conversationDoc.id,

                conversationId:
                  conversationDoc.id,

                usuarioId: userId,

                usuarioNombre,

                usuarioFoto,

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
              };
            })
          );

          // =================================================
          // EVITAR USUARIOS DUPLICADOS
          // =================================================

          const usersMap = new Map();

          users.forEach((user) => {
            if (!usersMap.has(user.id)) {
              usersMap.set(user.id, user);
            }
          });

          const finalUsers =
            Array.from(usersMap.values());

          // =================================================
          // ORDENAR
          // =================================================

          finalUsers.sort((a, b) => {
            const dateA =
              a.fecha?.toDate
                ? a.fecha.toDate().getTime()
                : 0;

            const dateB =
              b.fecha?.toDate
                ? b.fecha.toDate().getTime()
                : 0;

            return dateB - dateA;
          });

          setConversations(finalUsers);
          setLoading(false);
        } catch (error) {
          console.error(
            "❌ Error procesando usuarios:",
            error
          );

          setError(
            "No se pudieron cargar los usuarios."
          );

          setLoading(false);
        }
      },
      (firebaseError) => {
        console.error(
          "❌ Error cargando conversaciones:",
          firebaseError
        );

        setError(
          firebaseError.message ||
            "No se pudieron cargar los usuarios."
        );

        setConversations([]);
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

    return conversations.filter((user) =>
      user.usuarioNombre
        ?.toLowerCase()
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
      `/specialist-chat/${user.conversationId}`,
      {
        state: {
          conversation: user,
        },
      }
    );
  };

  // =====================================================
  // FECHA
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
      <SpecialistLayout>
        <div className="specialist-users-loading">
          <div>⏳</div>

          <p>
            Cargando usuarios...
          </p>
        </div>
      </SpecialistLayout>
    );
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <SpecialistLayout>
      <div className="specialist-users-page">

        {/* HEADER */}

        <header className="specialist-users-header">

          <div>
            <span>
              PANEL DE PROFESIONALES
            </span>

            <h1>
              👥 Usuarios
            </h1>

            <p>
              Usuarios que han iniciado
              una conversación contigo.
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

            <span>🔎</span>

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

        {/* ERROR */}

        {error && (
          <div className="users-empty">

            <div>⚠️</div>

            <h2>
              No se pudieron cargar los usuarios
            </h2>

            <p>
              {error}
            </p>

          </div>
        )}

        {/* SIN USUARIOS */}

        {!error &&
          filteredUsers.length === 0 && (
            <div className="users-empty">

              <div>👥</div>

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
          )}

        {/* LISTA */}

        {!error &&
          filteredUsers.length > 0 && (
            <section className="users-list">

              {filteredUsers.map((user) => (
                <article
                  key={user.id}
                  className="specialist-user-card"
                  onClick={() =>
                    openConversation(user)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      openConversation(user);
                    }
                  }}
                >

                  {/* FOTO */}

                  <div className="specialist-user-avatar">

                    {user.usuarioFoto ? (
                      <img
                        src={user.usuarioFoto}
                        alt={
                          user.usuarioNombre ||
                          "Usuario"
                        }
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span>
                        {user.usuarioNombre
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
                        {user.usuarioNombre}
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
              ))}

            </section>
          )}

      </div>
    </SpecialistLayout>
  );
}

export default SpecialistUsers;