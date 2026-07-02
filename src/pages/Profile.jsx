import MainLayout from "../layouts/MainLayout";
import { useApp } from "../context/AppContext";

function Profile() {
  const { user } = useApp();

  return (
    <MainLayout>
      <div className="profile-page">
        <h1 className="page-title">👤 Mi Perfil</h1>

        <div className="profile-card">
          <div className="avatar">{user.profile.avatar}</div>

          <h2>{user.profile.name}</h2>
          <p>Edad: {user.profile.age}</p>
          <p>Estado actual: {user.currentMood}</p>
          <p>Bienestar: {user.wellbeing}%</p>
          <p>Racha: {user.streak} días seguidos</p>

          {user.notes?.length > 0 && (
            <div className="profile-notes">
              <h3>Última nota</h3>
              <p>{user.notes[user.notes.length - 1].text}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Profile;
