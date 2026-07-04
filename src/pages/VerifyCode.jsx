import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyCodeByEmail } from "../services/otpService";

function VerifyCode() {
  const [code, setCode] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const handleVerify = async () => {
    if (!email) {
      alert("No se encontró el correo.");
      return;
    }

    const ok = await verifyCodeByEmail(email, code);

    if (ok) {
      alert("Cuenta verificada");
      navigate("/dashboard");
    } else {
      alert("Código incorrecto");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Verifica tu correo</h2>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Código"
      />

      <br />
      <br />

      <button onClick={handleVerify}>
        Verificar
      </button>
    </div>
  );
}

export default VerifyCode;