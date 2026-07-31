import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Stats {
  patientsToday: number;
  appointmentsToday: number;
  consultationsToday: number;
  pendingBills: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    patientsToday: 0,
    appointmentsToday: 0,
    consultationsToday: 0,
    pendingBills: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setStats({
      patientsToday: 12,
      appointmentsToday: 25,
      consultationsToday: 18,
      pendingBills: 5
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-700 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">The Great Physician Hospital</h1>
          <button onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Today's Patients</h3>
            <p className="text-3xl font-bold text-green-700">{stats.patientsToday}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Appointments</h3>
            <p className="text-3xl font-bold text-blue-700">{stats.appointmentsToday}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Consultations</h3>
            <p className="text-3xl font-bold text-purple-700">{stats.consultationsToday}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Pending Bills</h3>
            <p className="text-3xl font-bold text-red-700">{stats.pendingBills}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/patients/register" className="bg-white p-6 rounded-lg shadow hover:shadow-lg">
            <h3 className="font-bold text-lg">Patient Registration</h3>
            <p className="text-gray-600">Register new patient</p>
          </a>

          <a href="/appointments/book" className="bg-white p-6 rounded-lg shadow hover:shadow-lg">
            <h3 className="font-bold text-lg">Book Appointment</h3>
            <p className="text-gray-600">Schedule patient visit</p>
          </a>

          <a href="/consultation" className="bg-white p-6 rounded-lg shadow hover:shadow-lg">
            <h3 className="font-bold text-lg">Consultation</h3>
            <p className="text-gray-600">Doctor consultation notes</p>
          </a>
        </div>
      </div>
    </div>
  );
}
