import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";

function Profile() {

  const { user } = useApp();

  return (
    <MainLayout>

      <h1 className="page-title">
        👤 Mi Perfil
      </h1>

      <div className="profile-card">

        <div className="avatar">
          💜
        </div>

        <h2>{user.name}</h2>

        <p>
          Estado actual: {user.mood}
        </p>

        <p>
          Bienestar: {user.wellbeing}%
        </p>

      </div>

    </MainLayout>
  );
}

export default Profile;