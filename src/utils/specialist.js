export const publicSpecialistData = (uid, data = {}, authUser = {}) => {
  const photo = data.fotoPerfil || data.photoURL || data.foto || authUser.photoURL || "";

  return {
    uid,
    nombre: data.nombre || data.name || authUser.displayName || "Especialista",
    especialidad: data.especialidad || data.specialty || "Profesional de la salud",
    experiencia: Number(data.experiencia) || 0,
    ciudad: data.ciudad || "",
    descripcion: data.descripcion || data.description || "Especialista disponible para acompañarte.",
    fotoPerfil: photo,
    foto: photo,
    photoURL: photo,
    disponible: data.disponible === true,
    rating: data.rating || "5.0",
    estado: data.estado || "Pendiente",
    tipoCuenta: "especialista",
    rol: "especialista",
  };
};
