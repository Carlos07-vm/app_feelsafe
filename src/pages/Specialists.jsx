import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import MainLayout from "../layouts/MainLayout";

import { db } from "../services/firebase";

import "../styles/Specialists.css";


function Specialists() {

  const navigate = useNavigate();


  // =====================================================
  // ESTADOS
  // =====================================================

  const [specialists, setSpecialists] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);


  // =====================================================
  // OBTENER ESPECIALISTAS
  // =====================================================

  useEffect(() => {

    const specialistsRef =
      collection(
        db,
        "specialists"
      );


    const specialistsQuery =
      query(
        specialistsRef,

        where(
          "tipoCuenta",
          "==",
          "especialista"
        ),

        where(
          "estado",
          "==",
          "Activo"
        )
      );


    const unsubscribe =
      onSnapshot(

        specialistsQuery,

        (snapshot) => {

          const specialistsData =
            snapshot.docs.map(
              (document) => {

                const data =
                  document.data();


                /*
                 * =================================================
                 * UID REAL DE FIREBASE
                 * =================================================
                 *
                 * El document.id debe ser exactamente el UID
                 * del usuario especialista.
                 */

                const specialistUid =
                  document.id;


                const specialist = {

                  // ===============================================
                  // IDENTIFICADORES
                  // ===============================================

                  uid:
                    specialistUid,

                  id:
                    specialistUid,


                  // ===============================================
                  // DATOS ORIGINALES DE FIRESTORE
                  // ===============================================

                  ...data,


                  // ===============================================
                  // CAMPOS NORMALIZADOS
                  // ===============================================

                  name:
                    data.nombre ||
                    data.name ||
                    "Especialista",


                  specialty:
                    data.especialidad ||
                    data.specialty ||
                    "Profesional de la salud",


                  photo:
                    data.fotoPerfil ||
                    data.photoURL ||
                    data.foto ||
                    data.photo ||
                    "",


                  /*
                   * En SpecialistRegister guardamos:
                   *
                   * disponible: true
                   *
                   * Por eso comprobamos ambos nombres.
                   */

                  status:
                    data.disponibilidad ||
                    (
                      data.disponible === true
                        ? "Disponible"
                        : "No disponible"
                    ),


                  rating:
                    data.rating ||
                    "5.0",


                  description:
                    data.descripcion ||
                    data.description ||
                    "Especialista disponible para acompañarte.",


                  // ===============================================
                  // DATOS PARA LA CONVERSACIÓN
                  // ===============================================

                  especialistaId:
                    specialistUid,

                  especialistaNombre:
                    data.nombre ||
                    data.name ||
                    "Especialista",

                  especialistaFoto:
                    data.fotoPerfil ||
                    data.photoURL ||
                    data.foto ||
                    data.photo ||
                    "",

                };

                return specialist;

              }
            );


          setSpecialists(
            specialistsData
          );

          setLoading(false);

        },

        (error) => {

          console.error(
            "❌ Error obteniendo especialistas:",
            error
          );

          setLoading(false);

        }

      );


    return () => {

      unsubscribe();

    };

  }, []);


  // =====================================================
  // INICIAR CONVERSACIÓN
  // =====================================================

  const handleStartChat =
    (specialist) => {

      /*
       * ==================================================
       * SEGURIDAD
       * ==================================================
       */

      if (!specialist?.uid) {

        console.error(
          "❌ El especialista no tiene UID."
        );

        return;

      }


      console.log(
        "=========================================="
      );

      console.log(
        "ESPECIALISTA SELECCIONADO"
      );

      console.log(
        "=========================================="
      );

      console.log(
        "UID:",
        specialist.uid
      );

      console.log(
        "Nombre:",
        specialist.name
      );

      console.log(
        "Especialidad:",
        specialist.specialty
      );

      console.log(
        "=========================================="
      );


      /*
       * ==================================================
       * NAVEGAR AL CHAT
       * ==================================================
       */

      navigate(
        "/chat-room",
        {
          state: {

            specialist: {

              ...specialist,

              /*
               * Aseguramos que estos campos existan.
               */

              uid:
                specialist.uid,

              especialistaId:
                specialist.uid,

              name:
                specialist.name,

              nombre:
                specialist.name,

              photo:
                specialist.photo,

              foto:
                specialist.photo,

              especialistaNombre:
                specialist.name,

              especialistaFoto:
                specialist.photo,

            },

          },

        }
      );

    };


  // =====================================================
  // FILTRAR ESPECIALISTAS
  // =====================================================

  const filteredSpecialists =
    specialists.filter(
      (specialist) => {

        const name =
          specialist.name ||
          "";

        const specialty =
          specialist.specialty ||
          "";


        const searchText =
          search
            .toLowerCase()
            .trim();


        return (

          name
            .toLowerCase()
            .includes(
              searchText
            )

          ||

          specialty
            .toLowerCase()
            .includes(
              searchText
            )

        );

      }
    );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <MainLayout>

        <div className="specialists-loading">

          <div className="specialists-spinner"></div>

          <h3>
            Buscando especialistas...
          </h3>

          <p>
            Estamos cargando los profesionales
            disponibles.
          </p>

        </div>

      </MainLayout>

    );

  }


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <MainLayout>

      <div className="specialists-page">


        {/* ==========================================
            ENCABEZADO
        =========================================== */}

        <div className="specialists-header">

          <div>

            <span className="specialists-eyebrow">
              ACOMPAÑAMIENTO PROFESIONAL
            </span>

            <h1>
              👩‍⚕️ Especialistas disponibles
            </h1>

            <p>
              Encuentra un profesional con quien
              hablar en un espacio seguro,
              confidencial y libre de juicios.
            </p>

          </div>

        </div>


        {/* ==========================================
            BUSCADOR
        =========================================== */}

        <div className="search-box">

          <span>
            🔎
          </span>

          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        {/* ==========================================
            CONTADOR
        =========================================== */}

        <div className="specialists-count">

          <strong>
            {
              filteredSpecialists.length
            }
          </strong>

          <span>

            {
              filteredSpecialists.length === 1
                ? " especialista disponible"
                : " especialistas disponibles"
            }

          </span>

        </div>


        {/* ==========================================
            LISTA
        =========================================== */}

        {
          filteredSpecialists.length === 0 ? (

            <div className="no-specialists">

              <div className="no-specialists-icon">
                🔍
              </div>

              <h3>
                No encontramos especialistas
              </h3>

              <p>
                Intenta buscar con otro nombre
                o especialidad.
              </p>

            </div>

          ) : (

            <div className="specialists-grid">

              {
                filteredSpecialists.map(
                  (specialist) => (

                    <div
                      key={
                        specialist.uid
                      }
                      className="specialist-card"
                    >


                      {/* ================================
                          FOTO
                      ================================= */}

                      <div className="specialist-photo-container">

                        {
                          specialist.photo ? (

                            <img
                              src={
                                specialist.photo
                              }
                              alt={
                                specialist.name
                              }
                              className="specialist-photo"
                            />

                          ) : (

                            <div className="specialist-photo-placeholder">

                              {
                                specialist.name
                                  ?.charAt(0)
                                  .toUpperCase()
                              }

                            </div>

                          )
                        }


                        {/* ================================
                            ESTADO
                        ================================= */}

                        <span
                          className={`status ${
                            specialist.status ===
                            "Disponible"
                              ? "online"
                              : "offline"
                          }`}
                        >

                          <span className="status-dot"></span>

                          {
                            specialist.status
                          }

                        </span>

                      </div>


                      {/* ================================
                          INFORMACIÓN
                      ================================= */}

                      <div className="specialist-info">


                        <div className="specialist-top">

                          <h3>
                            {
                              specialist.name
                            }
                          </h3>

                        </div>


                        <p className="specialty">

                          {
                            specialist.specialty
                          }

                        </p>


                        <p className="description">

                          {
                            specialist.description
                          }

                        </p>


                        {/* ==============================
                            FOOTER
                        =============================== */}

                        <div className="card-footer">


                          <span className="rating">

                            ⭐{" "}

                            {
                              specialist.rating
                            }

                          </span>


                          <button
                            type="button"
                            onClick={() =>
                              handleStartChat(
                                specialist
                              )
                            }
                          >

                            💬 Iniciar conversación

                          </button>


                        </div>


                      </div>

                    </div>

                  )
                )
              }

            </div>

          )
        }

      </div>

    </MainLayout>

  );

}


export default Specialists;
