import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterPatient from './pages/Patients/Register';
import AppointmentsList from './pages/Appointments/List';
import BookAppointment from './pages/Appointments/Book';
import Consultation from './pages/Consultation';
import Prescriptions from './pages/Prescriptions';
import LabOrders from './pages/Lab';
import Billing from './pages/Billing';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/patients/register" element={
          <ProtectedRoute>
            <RegisterPatient />
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute>
            <AppointmentsList />
          </ProtectedRoute>
        } />
        <Route path="/appointments/book" element={
          <ProtectedRoute>
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/consultation" element={
          <ProtectedRoute>
            <Consultation />
          </ProtectedRoute>
        } />
        <Route path="/prescriptions" element={
          <ProtectedRoute>
            <Prescriptions />
          </ProtectedRoute>
        } />
        <Route path="/lab" element={
          <ProtectedRoute>
            <LabOrders />
          </ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
