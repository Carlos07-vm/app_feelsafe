import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyCode } from "../services/otpService";

function VerifyCode() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const uid = location.state?.uid;

  const handleVerify = async () => {
    const ok = await verifyCode(uid, code);

    if (ok) {
      alert("Cuenta verificada correctamente 💜");
      navigate("/home");
    } else {
      alert("Código incorrecto");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Verifica tu correo</h2>

      <input
        placeholder="Ingresa código"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <br /><br />

      <button onClick={handleVerify}>
        Verificar
      </button>
    </div>
  );
}

export default VerifyCode;