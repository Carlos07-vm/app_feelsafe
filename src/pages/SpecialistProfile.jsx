import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import "../styles/SpecialistProfile.css";

function SpecialistProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    especialidad: "",
    descripcion: "",
    telefono: "",
    ciudad: "",
  });

  // =====================================================
  // AUTENTICACIÓN Y CARGAR PERFIL
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!firebaseUser) {
          navigate("/specialist/login", {
            replace: true,
          });
          return;
        }

        setUser(firebaseUser);

        try {
          const specialistRef = doc(
            db,
            "specialists",
            firebaseUser.uid
          );

          const specialistSnap =
            await getDoc(specialistRef);

          if (!specialistSnap.exists()) {
            setError(
              "No existe el perfil del especialista."
            );

            setLoading(false);
            return;
          }

          const data = specialistSnap.data();

          setProfile({
            uid: firebaseUser.uid,
            ...data,
          });

          setForm({
            nombre:
              data.nombre ||
              firebaseUser.displayName ||
              "",

            especialidad:
              data.especialidad || "",

            descripcion:
              data.descripcion || "",

            telefono:
              data.telefono || "",

            ciudad:
              data.ciudad || "",
          });
        } catch (err) {
          console.error(
            "Error cargando perfil:",
            err
          );

          setError(
            "No se pudo cargar tu perfil."
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // CAMBIAR CAMPOS
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // GUARDAR PERFIL
  // =====================================================

  const handleSave = async (event) => {
    event.preventDefault();

    if (!user?.uid) {
      setError(
        "No hay un usuario autenticado."
      );
      return;
    }

    if (!form.nombre.trim()) {
      setError(
        "El nombre es obligatorio."
      );
      return;
    }

    if (!form.especialidad.trim()) {
      setError(
        "La especialidad es obligatoria."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const specialistRef = doc(
        db,
        "specialists",
        user.uid
      );

      const updatedData = {
        nombre: form.nombre.trim(),

        especialidad:
          form.especialidad.trim(),

        descripcion:
          form.descripcion.trim(),

        telefono:
          form.telefono.trim(),

        ciudad:
          form.ciudad.trim(),
      };

      await updateDoc(
        specialistRef,
        updatedData
      );

      setProfile((previous) => ({
        ...previous,
        ...updatedData,
      }));

      setMessage(
        "Perfil actualizado correctamente."
      );
    } catch (err) {
      console.error(
        "Error guardando perfil:",
        err
      );

      setError(
        "No se pudo guardar el perfil."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // ABRIR SELECTOR DE IMAGEN
  // =====================================================

  const handlePhotoClick = () => {
    if (uploadingPhoto) {
      return;
    }

    fileInputRef.current?.click();
  };

  // =====================================================
  // COMPRIMIR IMAGEN
  // =====================================================

  const compressImage = (
    file,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7
  ) => {
    return new Promise(
      (resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          const image = new Image();

          image.onload = () => {
            let width = image.width;
            let height = image.height;

            // ---------------------------------------------
            // CALCULAR NUEVAS DIMENSIONES
            // ---------------------------------------------

            if (
              width > maxWidth ||
              height > maxHeight
            ) {
              const widthRatio =
                maxWidth / width;

              const heightRatio =
                maxHeight / height;

              const ratio = Math.min(
                widthRatio,
                heightRatio
              );

              width = Math.round(
                width * ratio
              );

              height = Math.round(
                height * ratio
              );
            }

            // ---------------------------------------------
            // CREAR CANVAS
            // ---------------------------------------------

            const canvas =
              document.createElement(
                "canvas"
              );

            canvas.width = width;
            canvas.height = height;

            const context =
              canvas.getContext("2d");

            if (!context) {
              reject(
                new Error(
                  "No se pudo procesar la imagen."
                )
              );
              return;
            }

            // Fondo blanco para imágenes
            // que tengan transparencia.
            context.fillStyle = "#ffffff";

            context.fillRect(
              0,
              0,
              width,
              height
            );

            context.drawImage(
              image,
              0,
              0,
              width,
              height
            );

            // ---------------------------------------------
            // CONVERTIR A JPEG
            // ---------------------------------------------

            let currentQuality =
              quality;

            let base64 =
              canvas.toDataURL(
                "image/jpeg",
                currentQuality
              );

            // ---------------------------------------------
            // REDUCIR SI ES MUY GRANDE
            // ---------------------------------------------

            // Aproximadamente 500 KB máximo.
            const maxBase64Length =
              500 * 1024;

            while (
              base64.length >
                maxBase64Length &&
              currentQuality > 0.3
            ) {
              currentQuality -= 0.05;

              base64 =
                canvas.toDataURL(
                  "image/jpeg",
                  currentQuality
                );
            }

            // Si todavía es grande,
            // reducimos las dimensiones.
            if (
              base64.length >
              maxBase64Length
            ) {
              const smallerWidth =
                Math.round(width * 0.8);

              const smallerHeight =
                Math.round(height * 0.8);

              canvas.width =
                smallerWidth;

              canvas.height =
                smallerHeight;

              context.fillStyle =
                "#ffffff";

              context.fillRect(
                0,
                0,
                smallerWidth,
                smallerHeight
              );

              context.drawImage(
                image,
                0,
                0,
                smallerWidth,
                smallerHeight
              );

              base64 =
                canvas.toDataURL(
                  "image/jpeg",
                  0.6
                );
            }

            resolve(base64);
          };

          image.onerror = () => {
            reject(
              new Error(
                "No se pudo cargar la imagen."
              )
            );
          };

          image.src =
            event.target.result;
        };

        reader.onerror = () => {
          reject(
            new Error(
              "No se pudo leer el archivo."
            )
          );
        };

        reader.readAsDataURL(file);
      }
    );
  };

  // =====================================================
  // CAMBIAR FOTO
  // =====================================================

  const handlePhotoChange = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file || !user?.uid) {
      return;
    }

    // ---------------------------------------------
    // VALIDAR TIPO
    // ---------------------------------------------

    if (!file.type.startsWith("image/")) {
      setError(
        "Selecciona una imagen válida."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    // ---------------------------------------------
    // VALIDAR TAMAÑO ORIGINAL
    // ---------------------------------------------

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "La imagen original no puede superar los 10 MB."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setUploadingPhoto(true);
    setMessage("");
    setError("");

    try {
      // ---------------------------------------------
      // COMPRIMIR FOTO
      // ---------------------------------------------

      const compressedImage =
        await compressImage(file);

      if (!compressedImage) {
        throw new Error(
          "No se pudo comprimir la imagen."
        );
      }

      // ---------------------------------------------
      // VERIFICAR TAMAÑO FINAL
      // ---------------------------------------------

      const approximateSize =
        Math.round(
          (compressedImage.length * 3) /
            4
        );

      console.log(
        "Tamaño aproximado de imagen:",
        approximateSize,
        "bytes"
      );

      if (
        approximateSize >
        900 * 1024
      ) {
        throw new Error(
          "La imagen comprimida sigue siendo demasiado grande."
        );
      }

      // ---------------------------------------------
      // REFERENCIA AL DOCUMENTO
      // ---------------------------------------------

      const specialistRef = doc(
        db,
        "specialists",
        user.uid
      );

      // ---------------------------------------------
      // GUARDAR DIRECTAMENTE EN FIRESTORE
      // ---------------------------------------------

      await updateDoc(
        specialistRef,
        {
          fotoPerfil:
            compressedImage,
        }
      );

      // ---------------------------------------------
      // ACTUALIZAR INTERFAZ
      // ---------------------------------------------

      setProfile((previous) => ({
        ...previous,
        fotoPerfil:
          compressedImage,
      }));

      setMessage(
        "Foto de perfil actualizada correctamente."
      );
    } catch (err) {
      console.error(
        "Error guardando foto:",
        err
      );

      if (
        err?.code ===
        "permission-denied"
      ) {
        setError(
          "Firebase no permite actualizar la foto. Revisa las reglas de Firestore."
        );
      } else {
        setError(
          err?.message ||
            "No se pudo actualizar la foto."
        );
      }
    } finally {
      setUploadingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="specialist-profile-loading">
        <div>⏳</div>

        <p>
          Cargando perfil...
        </p>
      </div>
    );
  }

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="specialist-profile-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="specialist-profile-header">

        <div>

          <button
            type="button"
            className="profile-back-button"
            onClick={() =>
              navigate(
                "/specialist/dashboard"
              )
            }
          >
            ← Volver al panel
          </button>

          <span className="profile-label">
            PANEL DE PROFESIONALES
          </span>

          <h1>
            Mi perfil
          </h1>

          <p>
            Administra tu información
            profesional.
          </p>

        </div>

      </header>

      {/* =================================================
          CONTENIDO
      ================================================= */}

      <main className="specialist-profile-content">

        {/* =================================================
            FOTO
        ================================================= */}

        <section className="profile-photo-card">

          <div className="profile-photo">

            {profile?.fotoPerfil ? (
              <img
                src={
                  profile.fotoPerfil
                }
                alt={
                  profile.nombre ||
                  "Especialista"
                }
              />
            ) : (
              <span>
                {profile?.nombre
                  ?.charAt(0)
                  .toUpperCase() ||
                  "E"}
              </span>
            )}

          </div>

          <h2>
            {profile?.nombre ||
              "Especialista"}
          </h2>

          <p>
            {profile?.especialidad ||
              "Especialista FeelSafe"}
          </p>

          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={
              uploadingPhoto
            }
          >
            {uploadingPhoto
              ? "Guardando foto..."
              : "Cambiar foto"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={
              handlePhotoChange
            }
            hidden
          />

        </section>

        {/* =================================================
            FORMULARIO
        ================================================= */}

        <section className="profile-form-card">

          <div className="profile-form-header">

            <div>

              <span>
                INFORMACIÓN PROFESIONAL
              </span>

              <h2>
                Datos del especialista
              </h2>

            </div>

          </div>

          {/* =================================================
              MENSAJE
          ================================================= */}

          {message && (
            <div className="profile-success">
              ✓ {message}
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="profile-error">
              ⚠️ {error}
            </div>
          )}

          <form
            onSubmit={handleSave}
          >

            <div className="profile-form-grid">

              {/* NOMBRE */}

              <div className="profile-field">

                <label>
                  Nombre completo
                </label>

                <input
                  type="text"
                  name="nombre"
                  value={
                    form.nombre
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Nombre completo"
                />

              </div>

              {/* ESPECIALIDAD */}

              <div className="profile-field">

                <label>
                  Especialidad
                </label>

                <input
                  type="text"
                  name="especialidad"
                  value={
                    form.especialidad
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Ej. Psicología"
                />

              </div>

              {/* TELÉFONO */}

              <div className="profile-field">

                <label>
                  Teléfono
                </label>

                <input
                  type="tel"
                  name="telefono"
                  value={
                    form.telefono
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Número de teléfono"
                />

              </div>

              {/* CIUDAD */}

              <div className="profile-field">

                <label>
                  Ciudad
                </label>

                <input
                  type="text"
                  name="ciudad"
                  value={
                    form.ciudad
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Ciudad"
                />

              </div>

              {/* DESCRIPCIÓN */}

              <div className="profile-field profile-field-full">

                <label>
                  Descripción profesional
                </label>

                <textarea
                  name="descripcion"
                  value={
                    form.descripcion
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Escribe una breve descripción sobre tu experiencia y especialidad..."
                  rows="6"
                />

              </div>

            </div>

            {/* =================================================
                CORREO
            ================================================= */}

            <div className="profile-email">

              <span>
                Correo electrónico
              </span>

              <strong>
                {user?.email ||
                  "No disponible"}
              </strong>

              <small>
                El correo de acceso
                no se modifica desde
                este formulario.
              </small>

            </div>

            {/* =================================================
                BOTONES
            ================================================= */}

            <div className="profile-actions">

              <button
                type="button"
                className="profile-cancel"
                onClick={() =>
                  navigate(
                    "/specialist/dashboard"
                  )
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="profile-save"
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default SpecialistProfile;