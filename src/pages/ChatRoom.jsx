import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { useLocation, useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";

import { db } from "../services/firebase";
import { useApp } from "../context/AppContext";

import "../styles/ChatRoom.css";

function ChatRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useApp();

  const specialist = location.state?.specialist;

  const [conversationId, setConversationId] = useState(null);
  const [conversationData, setConversationData] = useState(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // =====================================================
  // VALIDAR
  // =====================================================

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    if (!specialist?.uid) {
      console.error("❌ No se recibió especialista.");

      setLoading(false);

      return;
    }

    // MUY IMPORTANTE
    // Un especialista no debe entrar al ChatRoom del usuario.

    if (user.uid === specialist.uid) {
      console.error(
        "❌ ERROR: el usuario autenticado y el especialista tienen el mismo UID."
      );

      console.error(
        "Debes iniciar sesión con la cuenta del usuario."
      );

      setLoading(false);

      return;
    }
  }, [user?.uid, specialist?.uid]);

  // =====================================================
  // BUSCAR / CREAR CONVERSACIÓN
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const loadConversation = async () => {
      if (!user?.uid || !specialist?.uid) {
        return;
      }

      // Evitar conversación consigo mismo
      if (user.uid === specialist.uid) {
        console.error(
          "❌ No se puede crear una conversación consigo mismo."
        );

        setLoading(false);

        return;
      }

      try {
        const conversationsRef = collection(
          db,
          "conversaciones_especialistas"
        );

        const q = query(
          conversationsRef,
          where("usuarioId", "==", user.uid),
          where("especialistaId", "==", specialist.uid)
        );

        const snapshot = await getDocs(q);
        if (!isMounted) return;

        if (!snapshot.empty) {
          const existingDoc = snapshot.docs[0];
          const data = existingDoc.data();

          // Asegurar que la foto del usuario esté sincronizada en la conversación
          const currentPhoto = user.photoURL || user.foto || user.fotoPerfil || "";
          const currentName = user.displayName || user.nombre || user.email || "Usuario";
          if (currentPhoto && data.usuarioFoto !== currentPhoto) {
            updateDoc(doc(db, "conversaciones_especialistas", existingDoc.id), {
              usuarioFoto: currentPhoto,
              usuarioNombre: currentName,
            }).catch(() => {});
          }

          setConversationId(existingDoc.id);
          setConversationData({
            id: existingDoc.id,
            ...data,
            usuarioFoto: currentPhoto || data.usuarioFoto || "",
          });

          setLoading(false);
          return;
        }

        // =================================================
        // CREAR NUEVA
        // =================================================

        const conversationRef = doc(
          collection(
            db,
            "conversaciones_especialistas"
          )
        );

        const newConversation = {
          usuarioId: user.uid,

          usuarioNombre:
            user.displayName ||
            user.nombre ||
            user.email ||
            "Usuario",

          usuarioFoto:
            user.photoURL || user.foto || user.fotoPerfil || "",

          especialistaId: specialist.uid,

          especialistaNombre:
            specialist.nombre ||
            specialist.name ||
            "Especialista",

          especialistaFoto:
            specialist.fotoPerfil ||
            specialist.foto ||
            specialist.photo ||
            "",

          ultimoMensaje: "",

          fechaUltimoMensaje:
            serverTimestamp(),

          mensajesNoLeidos: 0,

          mensajesNoLeidosUsuario: 0,

          estado: "Activa",

          fechaInicio:
            serverTimestamp(),
        };

        await setDoc(
          conversationRef,
          newConversation
        );
        if (!isMounted) return;

        console.log(
          "✅ NUEVA CONVERSACIÓN:",
          conversationRef.id
        );

        setConversationId(
          conversationRef.id
        );

        setConversationData({
          id: conversationRef.id,
          ...newConversation,
        });

        if (isMounted) setLoading(false);
      } catch (error) {
        console.error(
          "❌ ERROR BUSCANDO CONVERSACIÓN:",
          error
        );

        if (isMounted) setLoading(false);
      }
    };

    loadConversation();
    return () => {
      isMounted = false;
    };
  }, [
    user?.uid,
    specialist?.uid,
  ]);

  // =====================================================
  // ESCUCHAR MENSAJES EN TIEMPO REAL
  // =====================================================

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    if (!user?.uid) {
      return;
    }

    const messagesRef = collection(
      db,
      "conversaciones_especialistas",
      conversationId,
      "mensajes"
    );

    const unsubscribe = onSnapshot(
      messagesRef,
      (snapshot) => {
        const data = snapshot.docs.map(
          (messageDoc) => {
            const item = messageDoc.data();

            let sender = "unknown";

            // =========================================
            // IDENTIFICAR POR UID
            // =========================================

            if (
              item.remitenteId === user.uid
            ) {
              sender = "user";
            } else if (
              item.remitenteId ===
              specialist?.uid
            ) {
              sender = "specialist";
            }

            // =========================================
            // COMPATIBILIDAD
            // =========================================

            if (
              sender === "unknown"
            ) {
              if (
                item.remitenteTipo ===
                "usuario"
              ) {
                sender = "user";
              }

              if (
                item.remitenteTipo ===
                "especialista"
              ) {
                sender = "specialist";
              }
            }

            return {
              id: messageDoc.id,

              text:
                item.texto ||
                item.text ||
                "",

              sender,

              remitenteId:
                item.remitenteId || "",

              remitenteTipo:
                item.remitenteTipo || "",

              destinatarioId:
                item.destinatarioId || "",

              fecha:
                item.fecha || null,

              time:
                item.fecha?.toDate
                  ? item.fecha
                      .toDate()
                      .toLocaleTimeString(
                        "es-NI",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                  : "Ahora",

              leido:
                item.leido ?? false,
            };
          }
        );

        // =========================================
        // ORDENAR
        // =========================================

        data.sort((a, b) => {
          const fechaA =
            a.fecha?.toDate
              ? a.fecha.toDate().getTime()
              : 0;

          const fechaB =
            b.fecha?.toDate
              ? b.fecha.toDate().getTime()
              : 0;

          return fechaA - fechaB;
        });

        setMessages(data);
      },
      (error) => {
        console.error(
          "❌ ERROR ESCUCHANDO MENSAJES:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [
    conversationId,
    user?.uid,
    specialist?.uid,
  ]);

  // =====================================================
  // ENVIAR MENSAJE
  // =====================================================

  const handleSendMessage = async () => {
    const text = message.trim().slice(0, 2000);

    if (!text || sending) {
      return;
    }

    if (!user?.uid) {
      console.error(
        "❌ No hay usuario autenticado."
      );

      return;
    }

    if (!conversationId) {
      console.error(
        "❌ No existe conversación."
      );

      return;
    }

    if (!specialist?.uid) {
      console.error(
        "❌ No existe especialista."
      );

      return;
    }

    // Evitar enviar si son el mismo UID

    if (user.uid === specialist.uid) {
      console.error(
        "❌ El usuario y especialista son la misma cuenta."
      );

      return;
    }

    setSending(true);

    try {
      const messagesRef = collection(
        db,
        "conversaciones_especialistas",
        conversationId,
        "mensajes"
      );

      // ===============================================
      // CREAR MENSAJE
      // ===============================================

      await addDoc(
        messagesRef,
        {
          texto: text,

          remitenteId: user.uid,

          remitenteTipo: "usuario",

          destinatarioId:
            specialist.uid,

          fecha:
            serverTimestamp(),

          leido: false,
        }
      );

      // ===============================================
      // ACTUALIZAR CONVERSACIÓN
      // ===============================================

      const conversationRef = doc(
        db,
        "conversaciones_especialistas",
        conversationId
      );

      await updateDoc(
        conversationRef,
        {
          ultimoMensaje: text,
          ultimoEmisorId: user.uid,
          fechaUltimoMensaje:
            serverTimestamp(),

          // Para el especialista
          mensajesNoLeidos: 1,

          // Para el usuario
          mensajesNoLeidosUsuario: 0,
        }
      );

      console.log(
        "✅ MENSAJE ENVIADO"
      );

      setMessage("");
    } catch (error) {
      console.error(
        "❌ ERROR ENVIANDO MENSAJE:",
        error
      );
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <MainLayout>
        <div className="chat-loading">
          <div className="loading-spinner">
            ⏳
          </div>

          <p>
            Cargando conversación...
          </p>
        </div>
      </MainLayout>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (!specialist) {
    return (
      <MainLayout>
        <div className="chat-error">
          <div>⚠️</div>

          <h2>
            Especialista no encontrado
          </h2>

          <p>
            Regresa a la lista de especialistas.
          </p>

          <button
            onClick={() =>
              navigate("/specialists")
            }
          >
            ← Volver
          </button>
        </div>
      </MainLayout>
    );
  }

  // =====================================================
  // MISMO UID
  // =====================================================

  if (
    user?.uid === specialist?.uid
  ) {
    return (
      <MainLayout>
        <div className="chat-error">
          <div>⚠️</div>

          <h2>
            Sesión de especialista
          </h2>

          <p>
            Esta cuenta está iniciada como especialista.
          </p>

          <p>
            Para utilizar el chat como usuario,
            cierra sesión e inicia sesión con la
            cuenta del usuario.
          </p>

          <button
            onClick={() =>
              navigate("/specialist/dashboard")
            }
          >
            ← Volver al panel
          </button>
        </div>
      </MainLayout>
    );
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <MainLayout>
      <div className="chat-room">

        <ChatHeader
          specialist={specialist}
        />

        <MessageList
          messages={messages}
        />

        <ChatInput
          message={message}
          setMessage={setMessage}
          onSend={handleSendMessage}
          disabled={sending}
        />

      </div>
    </MainLayout>
  );
}

export default ChatRoom;
