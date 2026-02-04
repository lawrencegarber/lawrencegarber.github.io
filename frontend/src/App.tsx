import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { TopNav } from "./components/TopNav.tsx";
import { useAuth } from "./state/AuthContext.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { UploadPage } from "./pages/UploadPage.tsx";
import { CampaignDetailPage } from "./pages/CampaignDetailPage.tsx";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

function App() {
  const { token } = useAuth();

  return (
    <div className="app-shell">
      {token ? <TopNav /> : null}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/upload"
          element={
            <RequireAuth>
              <UploadPage />
            </RequireAuth>
          }
        />
        <Route
          path="/campaign/:id"
          element={
            <RequireAuth>
              <CampaignDetailPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
