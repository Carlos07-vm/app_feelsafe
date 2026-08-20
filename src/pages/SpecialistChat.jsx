import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { useLocation, useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import { db } from "../services/firebase";
import { useApp } from "../context/AppContext";

import "../styles/SpecialistChat.css";


function SpecialistChat() {

  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useApp();


  // =====================================================
  // CONVERSACIÓN
  // =====================================================

  const conversation =
    location.state?.conversation;


  // =====================================================
  // ESTADOS
  // =====================================================

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);


  // =====================================================
  // INFORMACIÓN DE DEPURACIÓN
  // =====================================================

  useEffect(() => {

    console.log("======================================");
    console.log("💬 SPECIALIST CHAT");
    console.log("======================================");

    console.log(
      "Conversación:",
      conversation
    );

    console.log(
      "ID conversación:",
      conversation?.id
    );

    console.log(
      "Usuario:",
      conversation?.usuarioId
    );

    console.log(
      "Especialista:",
      conversation?.especialistaId
    );

    console.log(
      "Especialista autenticado:",
      user?.uid
    );

    console.log("======================================");

  }, [
    conversation,
    user?.uid,
  ]);


  // =====================================================
  // ESCUCHAR MENSAJES
  // =====================================================

  useEffect(() => {

    if (!conversation?.id) {

      console.error(
        "❌ No existe ID de conversación."
      );

      setMessages([]);
      setLoading(false);

      return;

    }


    console.log("======================================");
    console.log("📨 ESCUCHANDO MENSAJES");
    console.log("======================================");

    console.log(
      "Ruta:",
      `conversaciones_especialistas/${conversation.id}/mensajes`
    );

    console.log(
      "Usuario autenticado:",
      user?.uid
    );

    console.log("======================================");


    // ===================================================
    // REFERENCIA A MENSAJES
    // ===================================================

    const messagesRef =
      collection(
        db,
        "conversaciones_especialistas",
        conversation.id,
        "mensajes"
      );


    // ===================================================
    // SNAPSHOT
    // ===================================================

    const unsubscribe =
      onSnapshot(

        messagesRef,

        (snapshot) => {

          console.log("======================================");
          console.log(
            "📨 MENSAJES ENCONTRADOS:",
            snapshot.size
          );
          console.log("======================================");


          const loadedMessages =
            snapshot.docs.map(
              (messageDoc) => {

                const data =
                  messageDoc.data();


                console.log(
                  "📩 MENSAJE:",
                  messageDoc.id,
                  data
                );


                // =================================================
                // IDENTIFICAR REMITENTE
                // =================================================

                let sender = "user";


                if (
                  data.remitenteId ===
                  user?.uid
                ) {

                  sender =
                    "specialist";

                } else if (
                  data.remitenteId ===
                  conversation.usuarioId
                ) {

                  sender =
                    "user";

                } else if (
                  data.remitenteTipo ===
                  "especialista"
                ) {

                  sender =
                    "specialist";

                } else {

                  sender =
                    "user";

                }


                // =================================================
                // FECHA
                // =================================================

                let date = null;

                let time = "";


                if (
                  data.fecha &&
                  typeof data.fecha.toDate ===
                  "function"
                ) {

                  date =
                    data.fecha.toDate();


                  time =
                    date.toLocaleTimeString(
                      "es-NI",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );

                }


                // =================================================
                // MENSAJE PROCESADO
                // =================================================

                return {

                  id:
                    messageDoc.id,

                  text:
                    data.texto ||
                    data.text ||
                    "",

                  texto:
                    data.texto ||
                    data.text ||
                    "",

                  remitenteId:
                    data.remitenteId ||
                    "",

                  remitenteTipo:
                    data.remitenteTipo ||
                    "",

                  destinatarioId:
                    data.destinatarioId ||
                    "",

                  fecha:
                    data.fecha ||
                    null,

                  date,

                  time,

                  leido:
                    data.leido ?? false,

                  sender,

                  isSpecialist:
                    sender ===
                    "specialist",

                  isUser:
                    sender ===
                    "user",

                };

              }
            );


          // ===================================================
          // ORDENAR
          // ===================================================

          loadedMessages.sort(
            (a, b) => {

              const timeA =
                a.date
                  ? a.date.getTime()
                  : 0;


              const timeB =
                b.date
                  ? b.date.getTime()
                  : 0;


              return (
                timeA -
                timeB
              );

            }
          );


          console.log(
            "📋 MENSAJES PROCESADOS:",
            loadedMessages
          );


          setMessages(
            loadedMessages
          );

          setLoading(false);

        },

        (error) => {

          console.error(
            "======================================"
          );

          console.error(
            "❌ ERROR LEYENDO MENSAJES"
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
            "======================================"
          );

          setMessages([]);

          setLoading(false);

        }

      );


    // ===================================================
    // LIMPIAR LISTENER
    // ===================================================

    return () => {

      console.log(
        "🔌 Desconectando listener de mensajes..."
      );

      unsubscribe();

    };


  }, [
    conversation?.id,
    conversation?.usuarioId,
    user?.uid,
  ]);


  // =====================================================
  // MARCAR MENSAJES DEL USUARIO COMO LEÍDOS
  // =====================================================

  useEffect(() => {

    if (
      !conversation?.id ||
      !conversation?.usuarioId ||
      !user?.uid ||
      messages.length === 0
    ) {

      return;

    }


    const unreadMessages =
      messages.filter(
        (msg) => {

          return (

            msg.remitenteId ===
            conversation.usuarioId

            &&

            msg.leido === false

          );

        }
      );


    if (
      unreadMessages.length === 0
    ) {

      return;

    }


    console.log(
      "📖 Marcando mensajes como leídos:",
      unreadMessages.length
    );


    const markMessagesAsRead =
      async () => {

        try {

          // ===============================================
          // MARCAR CADA MENSAJE
          // ===============================================

          for (
            const msg
            of unreadMessages
          ) {

            const messageRef =
              doc(
                db,
                "conversaciones_especialistas",
                conversation.id,
                "mensajes",
                msg.id
              );


            await updateDoc(
              messageRef,
              {
                leido: true,
              }
            );

          }


          // ===============================================
          // ACTUALIZAR CONVERSACIÓN
          // ===============================================

          const conversationRef =
            doc(
              db,
              "conversaciones_especialistas",
              conversation.id
            );


          await updateDoc(
            conversationRef,
            {
              mensajesNoLeidos: 0,
            }
          );


          console.log(
            "✅ Mensajes marcados como leídos."
          );


        } catch (error) {

          console.error(
            "❌ Error marcando mensajes como leídos:",
            error
          );

        }

      };


    markMessagesAsRead();


  }, [
    conversation?.id,
    conversation?.usuarioId,
    user?.uid,
    messages,
  ]);


  // =====================================================
  // ENVIAR MENSAJE
  // =====================================================

  const handleSendMessage =
    async () => {

      const text =
        message.trim();


      // ================================================
      // VALIDACIONES
      // ================================================

      if (!text) {

        return;

      }


      if (!user?.uid) {

        console.error(
          "❌ El especialista no está autenticado."
        );

        return;

      }


      if (!conversation?.id) {

        console.error(
          "❌ No existe conversación."
        );

        return;

      }


      if (!conversation?.usuarioId) {

        console.error(
          "❌ No existe usuario destinatario."
        );

        return;

      }


      if (
        conversation.especialistaId !==
        user.uid
      ) {

        console.error(
          "❌ Esta conversación no pertenece al especialista."
        );

        console.error(
          "Especialista conversación:",
          conversation.especialistaId
        );

        console.error(
          "Especialista actual:",
          user.uid
        );

        return;

      }


      setSending(true);


      try {

        console.log("======================================");
        console.log("📤 ENVIANDO MENSAJE");
        console.log("======================================");

        console.log(
          "Conversación:",
          conversation.id
        );

        console.log(
          "Especialista:",
          user.uid
        );

        console.log(
          "Usuario:",
          conversation.usuarioId
        );

        console.log(
          "Texto:",
          text
        );

        console.log("======================================");


        // =================================================
        // REFERENCIA
        // =================================================

        const messagesRef =
          collection(
            db,
            "conversaciones_especialistas",
            conversation.id,
            "mensajes"
          );


        // =================================================
        // CREAR MENSAJE
        // =================================================

        await addDoc(
          messagesRef,
          {

            texto:
              text,

            remitenteId:
              user.uid,

            remitenteTipo:
              "especialista",

            destinatarioId:
              conversation.usuarioId,

            fecha:
              serverTimestamp(),

            leido:
              false,

          }
        );


        console.log(
          "✅ Mensaje creado correctamente."
        );


        // =================================================
        // ACTUALIZAR CONVERSACIÓN
        // =================================================

        const conversationRef =
          doc(
            db,
            "conversaciones_especialistas",
            conversation.id
          );


        await updateDoc(
          conversationRef,
          {

            ultimoMensaje:
              text,

            fechaUltimoMensaje:
              serverTimestamp(),

            // Especialista está leyendo
            mensajesNoLeidos:
              0,

            // Usuario tiene un nuevo mensaje
            mensajesNoLeidosUsuario:
              1,

          }
        );


        console.log(
          "✅ Conversación actualizada."
        );


        // =================================================
        // LIMPIAR INPUT
        // =================================================

        setMessage("");


      } catch (error) {

        console.error(
          "======================================"
        );

        console.error(
          "❌ ERROR ENVIANDO MENSAJE"
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
          "======================================"
        );

      } finally {

        setSending(false);

      }

    };


  // =====================================================
  // ENTER
  // =====================================================

  const handleKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        handleSendMessage();

      }

    };


  // =====================================================
  // SIN CONVERSACIÓN
  // =====================================================

  if (!conversation?.id) {

    return (

      <MainLayout>

        <div className="specialist-chat-error">

          <div className="specialist-error-icon">
            ⚠️
          </div>

          <h2>
            Conversación no encontrada
          </h2>

          <p>
            No se pudo identificar la conversación.
          </p>

          <button
            onClick={() =>
              navigate(
                "/specialist-conversations"
              )
            }
          >
            ← Volver a conversaciones
          </button>

        </div>

      </MainLayout>

    );

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <MainLayout>

        <div className="specialist-chat-loading">

          <div className="specialist-loading-icon">
            💬
          </div>

          <p>
            Cargando conversación...
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

      <div className="specialist-chat-page">


        {/* ============================================
            HEADER
        ============================================= */}

        <div className="specialist-chat-header">


          <button
            className="specialist-back-button"

            onClick={() =>
              navigate(
                "/specialist-conversations"
              )
            }

          >
            ←
          </button>


          {/* FOTO */}

          <div className="specialist-user-avatar">

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


          {/* INFORMACIÓN */}

          <div className="specialist-user-info">

            <h2>

              {
                conversation.usuarioNombre ||
                "Usuario"
              }

            </h2>

            <span>
              🟢 Conversación activa
            </span>

          </div>

        </div>


        {/* ============================================
            MENSAJES
        ============================================= */}

        <div className="specialist-messages">


          {messages.length === 0 ? (

            <div className="specialist-empty-chat">

              <div>
                💬
              </div>

              <h3>
                No hay mensajes
              </h3>

              <p>
                Todavía no hay mensajes en esta
                conversación.
              </p>

            </div>

          ) : (

            messages.map(
              (msg) => {

                const isSpecialist =
                  msg.sender ===
                  "specialist";


                return (

                  <div
                    key={
                      msg.id
                    }

                    className={`specialist-message-row ${
                      isSpecialist
                        ? "specialist-message-right"
                        : "specialist-message-left"
                    }`}
                  >

                    <div
                      className={`specialist-message-bubble ${
                        isSpecialist
                          ? "specialist-bubble"
                          : "user-bubble"
                      }`}
                    >

                      {/* TEXTO */}

                      <div className="specialist-message-text">

                        {
                          msg.text
                        }

                      </div>


                      {/* HORA */}

                      <div className="specialist-message-time">

                        {
                          msg.time
                        }


                        {isSpecialist && (

                          <span className="message-check">
                            ✓
                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                );

              }

            )

          )}

        </div>


        {/* ============================================
            INPUT
        ============================================= */}

        <div className="specialist-chat-input">


          <textarea

            value={
              message
            }

            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }

            onKeyDown={
              handleKeyDown
            }

            placeholder="Escribe una respuesta..."

            rows={1}

          />


          <button

            onClick={
              handleSendMessage
            }

            disabled={
              sending ||
              !message.trim()
            }

          >

            {
              sending
                ? "..."
                : "➤"
            }

          </button>


        </div>


      </div>

    </MainLayout>

  );

}


export default SpecialistChat;