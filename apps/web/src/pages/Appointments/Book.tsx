import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  hospitalId: string;
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: '',
    department: '',
    type: '',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (search.length >= 2) {
      searchPatients(search);
    }
  }, [search]);

  const searchPatients = async (query: string) => {
    try {
      const { data } = await api.get(`/patients/search?q=${query}`);
      setPatients(data);
    } catch (error) {
      console.error('Search failed', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/appointments', formData);
      navigate('/appointments');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Book Appointment</h1>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search Patient</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or hospital ID..."
                className="mt-1 block w-full border rounded p-2"
              />
              {patients.length > 0 && (
                <div className="mt-2 border rounded max-h-40 overflow-y-auto">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => {
                        setFormData({ ...formData, patientId: patient.id });
                        setSearch(`${patient.firstName} ${patient.lastName} (${patient.hospitalId})`);
                        setPatients([]);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {patient.firstName} {patient.lastName} - {patient.hospitalId}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
                <input
                  type="datetime-local"
                  required
                  className="mt-1 block w-full border rounded p-2"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border rounded p-2"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                required
                className="mt-1 block w-full border rounded p-2"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">Select type</option>
                <option value="CONSULTATION">Consultation</option>
                <option value="FOLLOW_UP">Follow-up</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                className="mt-1 block w-full border rounded p-2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800">
                Book Appointment
              </button>
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
