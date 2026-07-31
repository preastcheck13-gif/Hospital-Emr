import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  appointmentDate: string;
  department: string;
  type: string;
  status: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    hospitalId: string;
    gender: string;
  };
  doctor?: {
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Failed to load appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (id: string) => {
    try {
      await api.put(`/appointments/${id}/checkin`);
      loadAppointments();
    } catch (error) {
      console.error('Check-in failed', error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.put(`/appointments/${id}/complete`);
      loadAppointments();
    } catch (error) {
      console.error('Completion failed', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'CHECKED_IN': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <button
          onClick={() => navigate('/appointments/book')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          Book Appointment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{appointment.patient.hospitalId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(appointment.appointmentDate).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.doctor ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {appointment.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleCheckin(appointment.id)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                    >
                      Check-in
                    </button>
                  )}
                  {(appointment.status === 'CHECKED_IN' || appointment.status === 'IN_PROGRESS') && (
                    <button
                      onClick={() => handleComplete(appointment.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
