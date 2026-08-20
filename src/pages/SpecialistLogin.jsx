import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import "../styles/SpecialistLogin.css";

function SpecialistLogin() {

  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    if (!correo || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {

      setLoading(true);

      // =====================================
      // INICIAR SESIÓN EN FIREBASE
      // =====================================

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          correo.trim(),
          password
        );

      const user = userCredential.user;

      console.log(
        "Usuario autenticado:",
        user.uid
      );

      // =====================================
      // BUSCAR ESPECIALISTA
      // =====================================

      const specialistRef = doc(
        db,
        "specialists",
        user.uid
      );

      const specialistSnap =
        await getDoc(specialistRef);

      // =====================================
      // COMPROBAR PERFIL
      // =====================================

      if (!specialistSnap.exists()) {

        setError(
          "Esta cuenta no tiene un perfil de especialista."
        );

        await auth.signOut();

        return;
      }

      const specialistData =
        specialistSnap.data();

      // =====================================
      // COMPROBAR TIPO DE CUENTA
      // =====================================

      if (
        specialistData.tipoCuenta !==
        "especialista"
      ) {

        setError(
          "Esta cuenta no corresponde a un especialista."
        );

        await auth.signOut();

        return;
      }

      // =====================================
      // COMPROBAR ESTADO
      // =====================================

      if (
        specialistData.estado ===
        "Suspendido"
      ) {

        setError(
          "Tu cuenta de especialista está suspendida."
        );

        await auth.signOut();

        return;
      }

      // =====================================
      // ACTUALIZAR ÚLTIMO ACCESO
      // =====================================

      await updateDoc(
        specialistRef,
        {
          ultimoAcceso:
            serverTimestamp(),
        }
      );

      console.log(
        "Inicio de sesión correcto"
      );

      // =====================================
      // IR AL DASHBOARD
      // =====================================

      navigate(
        "/specialist/dashboard"
      );

    } catch (error) {

      console.error(
        "Error login:",
        error
      );

      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        setError(
          "Correo o contraseña incorrectos."
        );

      } else if (
        error.code ===
        "auth/user-not-found"
      ) {

        setError(
          "No existe una cuenta con este correo."
        );

      } else if (
        error.code ===
        "auth/wrong-password"
      ) {

        setError(
          "La contraseña es incorrecta."
        );

      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {

        setError(
          "Demasiados intentos. Intenta nuevamente más tarde."
        );

      } else {

        setError(
          "No se pudo iniciar sesión."
        );
      }

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="specialist-login">

      {/* =================================
          PANEL IZQUIERDO
      ================================= */}

      <div className="specialist-login-left">

        <div className="specialist-login-brand">

          <div className="login-brand-icon">
            ♡
          </div>

          <div>

            <strong>
              FeelSafe
            </strong>

            <span>
              Especialistas
            </span>

          </div>

        </div>


        <div className="specialist-login-content">

          <span className="login-badge">
            ✦ Panel profesional
          </span>

          <h1>
            Tu experiencia puede
            <span>
              cambiar una vida.
            </span>
          </h1>

          <p>
            Ingresa a tu espacio profesional
            para acompañar y orientar a las
            personas que confían en FeelSafe.
          </p>

        </div>

      </div>


      {/* =================================
          LOGIN
      ================================= */}

      <div className="specialist-login-right">

        <div className="specialist-login-card">

          <div className="login-heading">

            <span>
              BIENVENIDO DE NUEVO
            </span>

            <h1>
              Iniciar sesión
            </h1>

            <p>
              Accede a tu cuenta profesional.
            </p>

          </div>


          {error && (

            <div className="login-error">

              ⚠️

              <span>
                {error}
              </span>

            </div>

          )}


          <form onSubmit={handleSubmit}>

            <div className="login-form-group">

              <label>
                Correo electrónico
              </label>

              <input
                type="email"
                placeholder="especialista@email.com"
                value={correo}
                onChange={(e) =>
                  setCorreo(e.target.value)
                }
              />

            </div>


            <div className="login-form-group">

              <div className="password-label">

                <label>
                  Contraseña
                </label>

                <button
                  type="button"
                  onClick={() => {
                    alert(
                      "La recuperación de contraseña la agregaremos en el siguiente paso."
                    );
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>

              </div>

              <input
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>


            <button
              type="submit"
              className="specialist-login-button"
              disabled={loading}
            >

              {loading
                ? "Verificando..."
                : "Iniciar sesión"}

            </button>

          </form>


          <div className="specialist-login-footer">

            <span>
              ¿Todavía no tienes una cuenta?
            </span>

            <button
              onClick={() =>
                navigate(
                  "/specialist/register"
                )
              }
            >
              Crear cuenta profesional
            </button>

          </div>

        </div>

      </div>

    </div>

  );
}

export default SpecialistLogin;