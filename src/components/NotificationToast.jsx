import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaComments,
  FaHeart,
  FaBrain,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaArrowRight,
} from "react-icons/fa";
import "../styles/NotificationToast.css";

function ToastItem({ toast, onDismiss }) {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  const getIcon = () => {
    switch (toast.type) {
      case "message":
        return <FaComments />;
      case "reminder":
        return <FaBell />;
      case "quote":
        return <FaHeart />;
      case "wellness":
        return <FaBrain />;
      case "alert":
        return <FaExclamationTriangle />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getTagLabel = () => {
    switch (toast.type) {
      case "message":
        return "Mensaje";
      case "reminder":
        return "Recordatorio";
      case "quote":
        return "Inspiración";
      case "wellness":
        return "Pausa de Bienestar";
      case "alert":
        return "Alerta Emocional";
      default:
        return "Notificación";
    }
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 250);
  };

  const handleClick = () => {
    if (toast.onClick) {
      toast.onClick();
    } else if (toast.url) {
      navigate(toast.url);
    }
    handleClose();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration || 6000);

    return () => clearTimeout(timer);
  }, [toast.id]);

  return (
    <div
      className={`feelsafe-toast type-${toast.type || "info"} ${
        isClosing ? "toast-closing" : ""
      }`}
      onClick={handleClick}
      role="alert"
      aria-live="polite"
    >
      <div className="feelsafe-toast-body">
        <div className={`feelsafe-toast-icon-wrap type-${toast.type || "info"}`}>
          {getIcon()}
        </div>

        <div className="feelsafe-toast-text">
          <div className="feelsafe-toast-top">
            <span className="feelsafe-toast-tag">{getTagLabel()}</span>
            <span className="feelsafe-toast-time">Ahora</span>
          </div>
          <h4 className="feelsafe-toast-title">{toast.title || "FeelSafe"}</h4>
          <p className="feelsafe-toast-desc">{toast.body || toast.message}</p>
        </div>

        <button
          type="button"
          className="feelsafe-toast-close"
          onClick={handleClose}
          aria-label="Cerrar notificación"
        >
          <FaTimes />
        </button>
      </div>

      {toast.actionLabel && (
        <div className="feelsafe-toast-actions">
          <button
            type="button"
            className="feelsafe-toast-action-btn"
            onClick={handleClick}
          >
            <span>{toast.actionLabel}</span>
            <FaArrowRight size={10} />
          </button>
        </div>
      )}

      <div className="feelsafe-toast-progress">
        <div className="feelsafe-toast-progress-bar" />
      </div>
    </div>
  );
}

export default function NotificationToast({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="feelsafe-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
