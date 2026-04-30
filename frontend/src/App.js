import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PinLock from "./pages/PinLock";
import BranchSelector from "./pages/BranchSelector";
import SpecialistLogin from "./pages/SpecialistLogin";
import MyAgenda from "./pages/MyAgenda";
import Layout from "./components/Layout";
import DailyAgenda from "./pages/DailyAgenda";
import WeeklyAgenda from "./pages/WeeklyAgenda";
import NewAppointment from "./pages/NewAppointment";
import Catalog from "./pages/Catalog";

function Protected({ children }) {
  const { authed, branch } = useAuth();
  if (!authed) return <Navigate to="/" replace />;
  if (!branch) return <Navigate to="/sucursal" replace />;
  return children;
}

function AuthedOnly({ children }) {
  const { authed } = useAuth();
  if (!authed) return <Navigate to="/" replace />;
  return children;
}

function SpecialistProtected({ children }) {
  const { specialist } = useAuth();
  if (!specialist) return <Navigate to="/especialista" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PinLock />} />
      <Route path="/sucursal" element={<AuthedOnly><BranchSelector /></AuthedOnly>} />
      <Route path="/especialista" element={<SpecialistLogin />} />
      <Route path="/mi-agenda" element={<SpecialistProtected><MyAgenda /></SpecialistProtected>} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/agenda" element={<DailyAgenda />} />
        <Route path="/semana" element={<WeeklyAgenda />} />
        <Route path="/nueva-cita" element={<NewAppointment />} />
        <Route path="/catalogo" element={<Catalog />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#000",
              color: "#fff",
              border: "1px solid #000",
              borderRadius: 0,
              fontFamily: "Manrope, sans-serif",
              fontSize: "12px",
              letterSpacing: "0.05em",
            },
          }}
        />
      </AuthProvider>
    </div>
  );
}

export default App;
