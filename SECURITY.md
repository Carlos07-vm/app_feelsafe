# Seguridad y despliegue

## Antes de publicar

1. Revoca y reemplaza cualquier clave Gemini que haya estado en un archivo `.env` expuesto.
2. Configura `GEMINI_API_KEY` y `FIREBASE_WEB_API_KEY` únicamente como variables de entorno del servidor en Vercel.
3. Configura las variables `VITE_FIREBASE_*` y `VITE_FIREBASE_VAPID_KEY` en el proyecto de Vercel.
4. No agregues `.env` al repositorio. `.gitignore` ya lo excluye.

## Gemini

El navegador llama a `/api/gemini`; la clave nunca se envía al cliente. El endpoint valida el token de sesión de Firebase, limita el tamaño del mensaje, limita el historial, aplica límite básico por IP y devuelve respuestas controladas.

Para una aplicación pública con alto tráfico, sustituye el límite en memoria por un limitador compartido.

## Firestore

Publica las reglas e índices desde la raíz del proyecto:

```bash
firebase deploy --only firestore
```

Las reglas permiten que cada usuario acceda solo a sus datos, que los chats pertenezcan a sus participantes y que los especialistas solo operen cuando estén verificados y aprobados.

## Especialistas

El registro crea perfiles con `estado: "Pendiente"` y `disponible: false`. Tras comprobar identidad y documentación, un administrador debe cambiar el estado de `specialists/{uid}` y `specialists_public/{uid}` a `Activo`. La cuenta también debe tener el correo verificado.

## Datos locales

Los contadores y preferencias del navegador usan claves con el UID del usuario. No se utiliza una copia local de la sesión como fuente de autenticación; Firebase Auth es la fuente de verdad.

## Validación local

```bash
npm install
npm run lint
npm run build
```

En el entorno de preparación no había Node/npm, por lo que esos comandos deben ejecutarse antes de desplegar.
