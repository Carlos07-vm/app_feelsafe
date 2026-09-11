# Crear el APK desde GitHub

## 1. Subir el proyecto

Sube el contenido de esta carpeta a la raíz de un repositorio de GitHub. No subas archivos `.env` ni claves de servicio de Firebase.

## 2. Configurar Firebase Android

En Firebase Console crea una aplicación Android con este package name:

```text
com.feelsafe.app
```

Descarga `google-services.json` y colócalo en la raíz del repositorio. El workflow lo copiará automáticamente a `android/app/` durante la compilación.

## 3. Configurar GitHub Secrets

En `Settings > Secrets and variables > Actions` crea estos secretos:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_VAPID_KEY`
- `VITE_GEMINI_API_URL`: URL pública de Vercel terminada en `/api/gemini`

`GEMINI_API_KEY` no se coloca en GitHub Actions. Debe permanecer como variable privada del proyecto de Vercel.

## 4. Ejecutar la compilación

En GitHub abre `Actions`, selecciona `Build FeelSafe APK` y pulsa `Run workflow`. Cuando termine, descarga el artefacto `feelsafe-apk`.

El archivo generado es `app-debug.apk`. Sirve para instalarlo y probarlo en Android. Para publicarlo en Google Play se necesita una versión release firmada.
