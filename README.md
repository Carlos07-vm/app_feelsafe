## FeelSafe

Sistema Inteligente para el Bienestar Emocional
Proyecto desarrollado utilizando React, Firebase y Gemini AI con el objetivo de brindar apoyo al bienestar emocional mediante inteligencia artificial, seguimiento del estado de ánimo y recursos educativos.

## Descripción

FeelSafe es una aplicación web enfocada en promover el bienestar emocional de los usuarios.

El sistema permite registrar emociones, consultar estadísticas personales, interactuar con un asistente basado en Inteligencia Artificial, acceder a recursos educativos y administrar el perfil del usuario mediante autenticación segura con Firebase.

La plataforma busca convertirse en una herramienta preventiva para el cuidado de la salud emocional utilizando tecnologías modernas.

## Objetivo General

Desarrollar una aplicación web escalable y segura que permita monitorear el bienestar emocional de los usuarios mediante herramientas digitales interactivas, conexión con profesionales e Inteligencia Artificial.

## Objetivos Específicos:
 Registrar y cuantificar el estado de ánimo diario del usuario, calculando rachas y porcentajes de bienestar.
 Mostrar estadísticas emocionales dinámicas en un panel de control intuitivo.
 Integrar un asistente inteligente capaz de brindar primeros auxilios psicológicos y orientación 24/7.
 Gestionar un sistema de citas y mensajería en tiempo real entre pacientes y especialistas.
 Proporcionar un Centro SOS para contacto inmediato con redes de apoyo en caso de crisis.
 Garantizar la seguridad de la información mediante una arquitectura de roles y permisos estricta.

## Funcionalidades Principales

## Módulo de Usuarios (Pacientes)
 **Autenticación Segura:** Registro e inicio de sesión por correo, Google y Facebook, con verificación de email.
 **Dashboard en Tiempo Real:** Panel interactivo que refleja el porcentaje de bienestar, rachas y últimas notas al instante.
 **Seguimiento Emocional (Mood Tracker):** Registro diario con selector de emociones, intensidad y notas personales.
 **ChatBot IA:** Conversaciones fluidas con el asistente Gemini AI para apoyo emocional inmediato.
 **Centro SOS:** Panel de emergencia con integración nativa para llamadas directas y WhatsApp.
 **Recursos Educativos:** Acceso a ejercicios de respiración, artículos y guías de relajación.
 **Personalización:** Soporte nativo para **Modo Oscuro** y **Multiidioma** (Diccionario dinámico).

## Módulo de Especialistas
 **Dashboard Clínico:** Panel exclusivo para gestionar pacientes y revisar progreso.
 **Agenda y Citas:** Sistema de programación de sesiones.
 **Mensajería Instantánea:** Chat en tiempo real con los pacientes asignados.

## Seguridad y Control de Accesos (RBAC)
 **Admin:** Control total de la plataforma y moderación.
 **Usuario:** Acceso restringido únicamente a su información personal mediante reglas de Firestore.
 **Auditor:** Acceso de sólo lectura a métricas globales para control de calidad.

## Tecnologías Utilizadas

## Frontend:
**React.js 18+** (Librería principal)
 **Vite** (Entorno de desarrollo y empaquetador)
 **CSS3 / CSS Modules** (Diseño responsivo, animaciones y temas oscuro/claro)
 **React Router DOM** (Gestión de rutas públicas y privadas  protegidas)
 **Framer Motion** (Transiciones y animaciones fluidas)
 **React Icons** (Iconografía vectorial)

## Backend y Servicios:
 **Firebase Authentication** (Gestión de identidades)
 **Cloud Firestore** (Base de datos NoSQL con suscripciones onSnapshot)
 **Firebase Storage** (Almacenamiento de archivos y avatares)
 **Google Gemini AI API** (Motor del asistente virtual)

## Funcionalidades

 Registro de usuarios
 Inicio de sesión
 Inicio de sesión con Google
 Inicio de sesión con Facebook
 Verificación de correo electrónico
 Dashboard interactivo
 Seguimiento del estado de ánimo
 Chat con Inteligencia Artificial
 Recursos educativos
 Perfil del usuario
 Cambio de fotografía
 Estadísticas emocionales
 Configuración del sistema
 Hablar con especialistas


## Requisitos

Antes de ejecutar este proyecto, asegúrate de tener instalado:
 **Node.js** (v20.0.0 o superior)
 **npm** o **yarn**
 Cuenta activa en [Firebase Console]
 Clave API válida de [Google Gemini Studio]

## Instalación

 Clonar el repositorio
 git clone https://github.com/Carlos07-vm/app_feelsafe.git
 Entrar al proyecto
 cd app_feelsafe
 Instalar dependencias
 npm install

## Ejecutar

npm run dev

## Estructura del proyecto

app_feelsafe/
│
├── src/
│   ├── assets/        # Imágenes y recursos estáticos
│   ├── components/    # Componentes reutilizables (Botones, Tarjetas, Inputs)
│   ├── constants/     # Diccionarios de idiomas (i18n) y datos estáticos
│   ├── context/       # Proveedores de estado global (AppContext, AuthContext)
│   ├── layouts/       # Estructuras de página (MainLayout, Sidebar)
│   ├── pages/         # Vistas principales de la aplicación (Dashboard, Emotions, Chat)
│   ├── services/      # Lógica de conexión a Firebase y Gemini AI
│   ├── styles/        # Archivos CSS modulares
│   ├── App.jsx        # Configuración de Rutas (React Router)
│   └── main.jsx       # Punto de entrada de React
│
├── public/            # Archivos públicos y favicon
├── .env.example       # Plantilla de variables de entorno
├── package.json       # Dependencias y scripts
├── vite.config.js     # Configuración del empaquetador
└── README.md          # Documentación del proyecto

## Autor

Desarrollado por el equipo Tiny Coders.

## Licencia

Este proyecto fue desarrollado con fines académicos y de innovación tecnológica.