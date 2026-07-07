import "../styles/VerifyCode.css";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";

import { verifyCodeByEmail } from "../services/otpService";

function VerifyCode() {

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const handleVerify = async (event) => {

    event.preventDefault();

    setLoading(true);
    setError("");

    if (!email) {

      setError("No se encontró el correo asociado a la verificación.");

      setLoading(false);

      return;
    }

    try {

      const isValid = await verifyCodeByEmail(
        email,
        code
      );

      if (!isValid) {

        setError("El código de verificación es incorrecto.");

        setLoading(false);

        return;
      }

      navigate("/dashboard");

    } catch {

      setError("No se pudo verificar el código.");

    }

    setLoading(false);

  };

  return (

    <div className="verify-container">

      <div className="verify-card">

        <Link
          to="/"
          className="back-link"
        >
          ← Volver al inicio
        </Link>

        <div className="verify-logo">

          <img
            src={logo}
            alt="Logo FeelSafe"
            className="verify-logo-image"
          />

        </div>

        <h1>Verifica tu correo</h1>

        <p>

          Ingresa el código de verificación que fue enviado
          a tu correo electrónico para finalizar el registro.

        </p>

        <form
          className="verify-form"
          onSubmit={handleVerify}
        >

          <input
            type="text"
            placeholder="Código de verificación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >

            {
              loading
                ? "Verificando..."
                : "Verificar código"
            }

          </button>

        </form>

        {error && (

          <p className="verify-error">

            {error}

          </p>

        )}

        <button
          type="button"
          className="resend-link"
        >

          Reenviar código

        </button>

      </div>

    </div>

  );

}

export default VerifyCode;