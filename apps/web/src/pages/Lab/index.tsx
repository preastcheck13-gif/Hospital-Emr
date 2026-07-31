import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface LabOrder {
  id: string;
  testType: string;
  testCode?: string;
  status: string;
  createdAt: string;
  sampleCollectedAt?: string;
  resultEnteredAt?: string;
  result?: any;
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

export default function LabOrders() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultForm, setResultForm] = useState<{ id: string; show: boolean; result: string }>({
    id: '',
    show: false,
    result: ''
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/lab/orders/pending');
      setOrders(data);
    } catch (error) {
      console.error('Failed to load lab orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (id: string) => {
    try {
      await api.put(`/lab/orders/${id}/collect`);
      loadOrders();
    } catch (error) {
      console.error('Sample collection failed', error);
    }
  };

  const handleProgress = async (id: string) => {
    try {
      await api.put(`/lab/orders/${id}/progress`);
      loadOrders();
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const handleResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/lab/orders/${resultForm.id}/result`, {
        result: { text: resultForm.result },
        verifiedBy: 'Lab Tech'
      });
      setResultForm({ id: '', show: false, result: '' });
      loadOrders();
    } catch (error) {
      console.error('Failed to save result', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COLLECTED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading lab orders...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lab Orders</h1>

      {resultForm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Enter Result</h2>
            <form onSubmit={handleResult}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Result</label>
                <textarea
                  required
                  className="mt-1 block w-full border rounded p-2"
                  rows={4}
                  value={resultForm.result}
                  onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-green-700 text-white py-2 px-4 rounded">
                  Save Result
                </button>
                <button
                  type="button"
                  onClick={() => setResultForm({ id: '', show: false, result: '' })}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.patient.firstName} {order.patient.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{order.patient.hospitalId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.testType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.testCode || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.consultation ? `${order.consultation.doctor.firstName} ${order.consultation.doctor.lastName}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleCollect(order.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Collect Sample
                    </button>
                  )}
                  {order.status === 'COLLECTED' && (
                    <button
                      onClick={() => handleProgress(order.id)}
                      className="text-purple-600 hover:text-purple-900 mr-3"
                    >
                      Start Test
                    </button>
                  )}
                  {order.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => setResultForm({ id: order.id, show: true, result: '' })}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Enter Result
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No pending lab orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
