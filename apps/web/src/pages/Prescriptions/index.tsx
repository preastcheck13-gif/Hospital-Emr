import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

interface Prescription {
  id: string;
  status: string;
  prescribedAt: string;
  dispensedAt?: string;
  patient: {
    firstName: string;
    lastName: string;
    hospitalId: string;
  };
  consultation?: {
    doctor: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const { data } = await api.get('/prescriptions/pending');
      setPrescriptions(data);
    } catch (error) {
      console.error('Failed to load prescriptions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReady = async (id: string) => {
    try {
      await api.put(`/prescriptions/${id}/ready`);
      loadPrescriptions();
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const handleDispense = async (id: string) => {
    try {
      await api.put(`/prescriptions/${id}/dispense`, { dispensedBy: 'Pharmacist' });
      loadPrescriptions();
    } catch (error) {
      console.error('Dispense failed', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'READY': return 'bg-blue-100 text-blue-800';
      case 'DISPENSED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading prescriptions...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        <button
          onClick={() => navigate('/consultation')}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          New Consultation
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescribed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prescriptions.map((prescription) => (
              <tr key={prescription.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {prescription.patient.firstName} {prescription.patient.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{prescription.patient.hospitalId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prescription.consultation ? `${prescription.consultation.doctor.firstName} ${prescription.consultation.doctor.lastName}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(prescription.prescribedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                    {prescription.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {prescription.status === 'PENDING' && (
                    <button
                      onClick={() => handleReady(prescription.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Mark Ready
                    </button>
                  )}
                  {prescription.status === 'READY' && (
                    <button
                      onClick={() => handleDispense(prescription.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Dispense
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {prescriptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No pending prescriptions
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
