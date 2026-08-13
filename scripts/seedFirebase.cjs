const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");

const serviceAccount = require(
  path.join(
    __dirname,
    "feelsafe-ba317-firebase-adminsdk-fbsvc-08e1286308.json"
  )
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const colecciones = [
  "usuarios",
  "registros_emocionales",
  "conversaciones",
  "mensajes_chat",
  "recomendaciones",
  "ejercicios_respiracion",
  "sesiones_respiracion",
  "recursos",
  "favoritos",
  "notificaciones",
  "configuraciones",
];

async function verificarBaseDatos() {
  try {
    console.log("Firebase Admin conectado correctamente.");
    console.log("Proyecto:", serviceAccount.project_id);
    console.log("");
    console.log("========================================");
    console.log("VERIFICACIÓN DE LA BASE DE DATOS");
    console.log("========================================");
    console.log("");

    for (const nombreColeccion of colecciones) {
      const snapshot = await db.collection(nombreColeccion).get();

      console.log(`Colección: ${nombreColeccion}`);
      console.log(`Documentos: ${snapshot.size}`);

      snapshot.forEach((doc) => {
        console.log(`  ID: ${doc.id}`);
        console.log(`  Datos:`, doc.data());
      });

      console.log("----------------------------------------");
    }

    console.log("");
    console.log("========================================");
    console.log("VERIFICACIÓN TERMINADA");
    console.log("========================================");
  } catch (error) {
    console.error("");
    console.error("ERROR AL VERIFICAR LA BASE DE DATOS:");
    console.error(error);
  }
}

verificarBaseDatos();