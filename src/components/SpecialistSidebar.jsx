import SpecialistLayout from "./SpecialistLayout";

// Componente mantenido por retrocompatibilidad que envuelve SpecialistLayout
function SpecialistSidebar({ children }) {
  return <SpecialistLayout>{children}</SpecialistLayout>;
}

export default SpecialistSidebar;