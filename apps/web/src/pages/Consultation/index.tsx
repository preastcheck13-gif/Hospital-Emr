import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  hospitalId: string;
}

export default function Consultation() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    visitType: 'OUTPATIENT',
    chiefComplaint: '',
    historyOfPresentIllness: '',
    physicalExamination: '',
    diagnosis: '',
    treatmentPlan: '',
    vitals: {
      temperature: '',
      bloodPressure: '',
      pulse: '',
      respiratoryRate: '',
      weight: '',
      height: ''
    }
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
      const payload = {
        ...formData,
        diagnosis: formData.diagnosis ? [{ description: formData.diagnosis }] : [],
        vitals: formData.vitals
      };

      await api.post('/consultations', payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Consultation failed');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Consultation</h1>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

          {!selectedPatient ? (
            <div className="space-y-4">
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
                          setSelectedPatient(patient);
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
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-900">Patient</h3>
                <p className="text-gray-600">
                  {selectedPatient.firstName} {selectedPatient.lastName} - {selectedPatient.hospitalId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visit Type</label>
                  <select
                    required
                    className="mt-1 block w-full border rounded p-2"
                    value={formData.visitType}
                    onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                  >
                    <option value="OUTPATIENT">Outpatient</option>
                    <option value="INPATIENT">Inpatient</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded p-2"
                    value={formData.vitals.temperature}
                    onChange={(e) => setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, temperature: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    className="mt-1 block w-full border rounded p-2"
                    value={formData.vitals.bloodPressure}
                    onChange={(e) => setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, bloodPressure: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pulse (bpm)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded p-2"
                    value={formData.vitals.pulse}
                    onChange={(e) => setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, pulse: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resp. Rate</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded p-2"
                    value={formData.vitals.respiratoryRate}
                    onChange={(e) => setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, respiratoryRate: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded p-2"
                    value={formData.vitals.weight}
                    onChange={(e) => setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, weight: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded p-2"
                    value={formData.vitals.height}
                    onChange={(e) => setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, height: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Chief Complaint</label>
                <textarea
                  required
                  className="mt-1 block w-full border rounded p-2"
                  rows={3}
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">History of Present Illness</label>
                <textarea
                  className="mt-1 block w-full border rounded p-2"
                  rows={3}
                  value={formData.historyOfPresentIllness}
                  onChange={(e) => setFormData({ ...formData, historyOfPresentIllness: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Physical Examination</label>
                <textarea
                  className="mt-1 block w-full border rounded p-2"
                  rows={3}
                  value={formData.physicalExamination}
                  onChange={(e) => setFormData({ ...formData, physicalExamination: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border rounded p-2"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Treatment Plan</label>
                <textarea
                  required
                  className="mt-1 block w-full border rounded p-2"
                  rows={3}
                  value={formData.treatmentPlan}
                  onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800">
                  Save Consultation
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
