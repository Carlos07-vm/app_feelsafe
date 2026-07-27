import "../styles/Auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
   sendEmailVerification,
   signOut,
  
        } from "firebase/auth";
import { auth, db } from "../services/firebase";
import {
   doc,
   setDoc,
   serverTimestamp,
   } from "firebase/firestore";
import logo from "../assets/logo.jpeg";


function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    setError("");

     const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Ingresa tu nombre completo.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
      }


     if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try{
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

      await updateProfile(
        userCredential.user,
        {
          displayName: cleanName,
        }
      );
      
      await sendEmailVerification(userCredential.user);

      
   
      await setDoc(
         doc(db, "users", userCredential.user.uid),
         {
           uid: userCredential.user.uid,
           nombre: cleanName,
           correo: cleanEmail,
           foto: "",
          proveedor: "Correo",
          telefono: "",
          fechaNacimiento: "",
          genero: "",
          estado: "Pendiente",
          emailVerificado: false,
          fechaRegistro: serverTimestamp(),

            }
          );

          await signOut(auth);

      navigate("/verify-email",{
          state:{
            email: cleanEmail,
          },
        });
        

        }catch (err) {
       switch (err.code) {

        case "auth/email-already-in-use":
          setError(
            "El correo electrónico ya está en uso."
          );
          break;

           case "auth/invalid-email":
          setError(
           "El correo electrónico no es válido."
          );
          break;

           case "auth/weak-password":
          setError(
            "La contraseña es muy débil."
          );
          break;

          default:
                 setError("Ocurrió un error inesperado. Inténtalo nuevamente.");


       }
    }

     finally {
       setLoading(false);
  }
};

 
  return (

    <div className="auth-container">

      <div className="auth-card">

        {/* Volver */}

        <Link
          to="/"
          className="back-link"
        >
          ← Volver al inicio
        </Link>

        {/* Logo */}

        <div className="auth-logo">

          <img
            src={logo}
            alt="Logo FeelSafe"
            className="auth-logo-image"
          />

        </div>

        <h1>Crear cuenta</h1>

        <p>
          Comienza tu camino hacia una mejor salud emocional.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />


          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Repetir la contraseña"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />
         


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creando cuenta..."
              : "Crear cuenta"}
          </button>

        </form>

        {error && (

          <p className="auth-error">

            {error}

          </p>

        )}

        <p className="auth-link">

          ¿Ya tienes una cuenta?

          <Link to="/login">

            {" "}Iniciar sesión

          </Link>

        </p>

      </div>

    </div>

  );
}

export default Register;