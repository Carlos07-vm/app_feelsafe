import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';

function NativeBackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let listener = null;

    const init = async () => {
      try {
        listener = await CapApp.addListener('backButton', () => {
          // 1. Si hay modales o sidebar móvil abiertos, cerrarlos primero
          const openModals = document.querySelectorAll(
            '.breathing-close-btn, .sound-close-btn, .meditation-close-btn, .challenge-close-btn, .modal-close-btn, .sidebar.open .sidebar-close-mobile button, .specialist-sidebar.open .specialist-sidebar-close button'
          );
          if (openModals.length > 0) {
            openModals[openModals.length - 1].click();
            return;
          }

          // 2. Rutas raíz donde atrás sale de la app
          const rootRoutes = ['/', '/dashboard', '/login', '/specialist/dashboard'];
          if (rootRoutes.includes(location.pathname)) {
            CapApp.exitApp();
          } else {
            // Regresar a la pantalla anterior
            navigate(-1);
          }
        });
      } catch (err) {
        // Entorno web común sin Capacitor
      }
    };

    init();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, [navigate, location.pathname]);

  return null;
}

export default NativeBackButtonHandler;