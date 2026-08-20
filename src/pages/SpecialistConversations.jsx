import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import { db, auth } from "../services/firebase";

import "../styles/SpecialistConversations.css";


function SpecialistConversations() {

  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);

  const [conversations, setConversations] = useState([]);

  const [loading, setLoading] = useState(true);


  // =====================================================
  // AUTENTICACIÓN
  // =====================================================

  useEffect(() => {

    console.log("======================================");
    console.log("INICIANDO AUTENTICACIÓN DEL ESPECIALISTA");
    console.log("======================================");


    const unsubscribeAuth =
      onAuthStateChanged(auth, (firebaseUser) => {

        console.log("AUTH STATE:", firebaseUser);


        if (!firebaseUser) {

          console.log(
            "❌ No hay especialista autenticado."
          );

          setCurrentUser(null);
          setConversations([]);
          setLoading(false);

          return;

        }


        console.log("======================================");
        console.log("✅ ESPECIALISTA AUTENTICADO");
        console.log("UID:", firebaseUser.uid);
        console.log("EMAIL:", firebaseUser.email);
        console.log("======================================");


        setCurrentUser(firebaseUser);

      });


    return () => {
      unsubscribeAuth();
    };

  }, []);


  // =====================================================
  // ESCUCHAR CONVERSACIONES
  // =====================================================

  useEffect(() => {

    if (!currentUser?.uid) {

      console.log(
        "⏳ Esperando UID del especialista..."
      );

      return;

    }


    console.log("======================================");
    console.log("🔎 BUSCANDO CONVERSACIONES");
    console.log(
      "Especialista UID:",
      currentUser.uid
    );
    console.log("======================================");


    setLoading(true);


    const conversationsRef =
      collection(
        db,
        "conversaciones_especialistas"
      );


    /*
      IMPORTANTE:

      Solo buscamos conversaciones cuyo
      especialistaId sea exactamente el UID
      del especialista autenticado.
    */

    const conversationsQuery =
      query(
        conversationsRef,
        where(
          "especialistaId",
          "==",
          currentUser.uid
        )
      );


    const unsubscribe =
      onSnapshot(

        conversationsQuery,

        (snapshot) => {

          console.log("======================================");
          console.log(
            "📥 SNAPSHOT DE CONVERSACIONES"
          );

          console.log(
            "Cantidad:",
            snapshot.size
          );

          console.log(
            "Especialista buscado:",
            currentUser.uid
          );

          console.log("======================================");


          const loadedConversations =
            snapshot.docs.map(
              (conversationDoc) => {

                const data =
                  conversationDoc.data();


                console.log(
                  "📨 Conversación encontrada:",
                  conversationDoc.id
                );

                console.log(
                  data
                );


                return {

                  id:
                    conversationDoc.id,

                  ...data,

                };

              }
            );


          // =================================================
          // ORDENAR
          // =================================================

          loadedConversations.sort(
            (a, b) => {

              const timeA =
                a.fechaUltimoMensaje?.toMillis
                  ? a.fechaUltimoMensaje.toMillis()
                  : 0;


              const timeB =
                b.fechaUltimoMensaje?.toMillis
                  ? b.fechaUltimoMensaje.toMillis()
                  : 0;


              return timeB - timeA;

            }
          );


          console.log(
            "📋 LISTA FINAL:",
            loadedConversations
          );


          setConversations(
            loadedConversations
          );

          setLoading(false);

        },

        (error) => {

          console.error(
            "======================================"
          );

          console.error(
            "❌ ERROR LEYENDO CONVERSACIONES"
          );

          console.error(
            "Código:",
            error.code
          );

          console.error(
            "Mensaje:",
            error.message
          );

          console.error(
            error
          );

          console.error(
            "======================================"
          );


          setConversations([]);

          setLoading(false);

        }

      );


    return () => {

      console.log(
        "🔌 Cerrando listener de conversaciones"
      );

      unsubscribe();

    };

  }, [currentUser?.uid]);


  // =====================================================
  // ABRIR CONVERSACIÓN
  // =====================================================

  const openConversation =
    (conversation) => {

      console.log(
        "======================================"
      );

      console.log(
        "💬 ABRIENDO CONVERSACIÓN"
      );

      console.log(
        "ID:",
        conversation.id
      );

      console.log(
        "Usuario:",
        conversation.usuarioId
      );

      console.log(
        "Especialista:",
        conversation.especialistaId
      );

      console.log(
        "Último mensaje:",
        conversation.ultimoMensaje
      );

      console.log(
        "======================================"
      );


      navigate(
        "/specialist-chat",
        {
          state: {
            conversation,
          },
        }
      );

    };


  // =====================================================
  // HORA
  // =====================================================

  const formatDate =
    (timestamp) => {

      if (
        !timestamp ||
        typeof timestamp.toDate !== "function"
      ) {

        return "";

      }


      try {

        return timestamp
          .toDate()
          .toLocaleTimeString(
            "es-NI",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          );

      } catch {

        return "";

      }

    };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <MainLayout>

        <div className="specialist-loading">

          <div className="specialist-loading-icon">
            ⏳
          </div>

          <p>
            Cargando conversaciones...
          </p>

        </div>

      </MainLayout>

    );

  }


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <MainLayout>

      <div className="specialist-conversations-page">


        {/* =============================================
            HEADER
        ============================================== */}

        <div className="specialist-page-header">

          <div>

            <span className="specialist-label">
              PANEL DE PROFESIONALES
            </span>

            <h1>
              💬 Mis conversaciones
            </h1>

            <p>
              Atiende y acompaña a las personas
              que han decidido hablar contigo.
            </p>

          </div>


          <div className="conversation-counter">

            <strong>
              {conversations.length}
            </strong>

            <span>
              {conversations.length === 1
                ? " conversación"
                : " conversaciones"}
            </span>

          </div>

        </div>


        {/* =============================================
            SIN CONVERSACIONES
        ============================================== */}

        {conversations.length === 0 ? (

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

              Especialista conectado:

              {" "}

              {currentUser?.uid || "ninguno"}

            </small>

          </div>

        ) : (

          <div className="conversations-list">

            {conversations.map(
              (conversation) => (

                <div
                  key={conversation.id}
                  className="conversation-card"
                  onClick={() =>
                    openConversation(
                      conversation
                    )
                  }
                >


                  {/* FOTO */}

                  <div className="conversation-avatar">

                    {conversation.usuarioFoto ? (

                      <img
                        src={
                          conversation.usuarioFoto
                        }
                        alt={
                          conversation.usuarioNombre ||
                          "Usuario"
                        }
                      />

                    ) : (

                      <span>
                        👤
                      </span>

                    )}

                  </div>


                  {/* CONTENIDO */}

                  <div className="conversation-content">


                    <div className="conversation-top">

                      <h3>

                        {
                          conversation.usuarioNombre ||
                          "Usuario"
                        }

                      </h3>


                      <span className="conversation-time">

                        {formatDate(
                          conversation.fechaUltimoMensaje
                        )}

                      </span>

                    </div>


                    <div className="conversation-bottom">

                      <p>

                        {
                          conversation.ultimoMensaje ||
                          "Nueva conversación"
                        }

                      </p>


                      {Number(
                        conversation.mensajesNoLeidos
                      ) > 0 && (

                        <span className="unread-badge">

                          {
                            conversation.mensajesNoLeidos
                          }

                        </span>

                      )}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </MainLayout>

  );

}


export default SpecialistConversations;