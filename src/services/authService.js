export const login = async (email, password) => {
  return {
    success: true,
    message: `Sesión iniciada para ${email}`,
  };
};

export const register = async (name, email, password) => {
  return {
    success: true,
    message: `Cuenta creada para ${name}`,
  };
};
