import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import AnimalsPage from "./pages/Animals";
import PatientDetailPage from "./pages/PatientDetail";
import AnimalFormPage from "./pages/AnimalForm";
import AppointmentsPage from "./pages/Appointments";
import AppointmentFormPage from "./pages/AppointmentForm";
import VaccinationsPage from "./pages/Vaccinations";
import MedicalRecordsPage from "./pages/MedicalRecords";
import SocialPostsPage from "./pages/SocialPosts";
import AppLayout from "./components/layout/AppLayout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid #9e18a6",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid #9e18a6",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/animals"
            element={
              <ProtectedRoute>
                <AnimalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/animals/new"
            element={
              <ProtectedRoute>
                <AnimalFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/animals/edit/:id"
            element={
              <ProtectedRoute>
                <AnimalFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/animals/:id"
            element={
              <ProtectedRoute>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/new"
            element={
              <ProtectedRoute>
                <AppointmentFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vaccinations"
            element={
              <ProtectedRoute>
                <VaccinationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vaccinations/upcoming"
            element={
              <ProtectedRoute>
                <VaccinationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vaccinations/overdue"
            element={
              <ProtectedRoute>
                <VaccinationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical-records"
            element={
              <ProtectedRoute>
                <MedicalRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-records/:animalId"
            element={
              <ProtectedRoute>
                <MedicalRecordsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/social-posts"
            element={
              <ProtectedRoute>
                <SocialPostsPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </BrowserRouter>
  );
}
