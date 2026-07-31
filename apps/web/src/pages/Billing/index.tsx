import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface Bill {
  id: string;
  billNumber: string;
  total: number;
  status: string;
  paymentMethod?: string;
  paidAt?: string;
  patient: {
    firstName: string;
    lastName: string;
    hospitalId: string;
  };
}

export default function Billing() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState<{ id: string; show: boolean; method: string }>({
    id: '',
    show: false,
    method: 'CASH'
  });

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const { data } = await api.get('/billing');
      setBills(data.bills || []);
    } catch (error) {
      console.error('Failed to load bills', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/billing/${paymentForm.id}/payment`, {
        paymentMethod: paymentForm.method,
        paidBy: 'Cashier'
      });
      setPaymentForm({ id: '', show: false, method: 'CASH' });
      loadBills();
    } catch (error) {
      console.error('Payment failed', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'VOIDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading bills...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>

      {paymentForm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handlePayment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  required
                  className="mt-1 block w-full border rounded p-2"
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="NHIS">NHIS</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-green-700 text-white py-2 px-4 rounded">
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentForm({ id: '', show: false, method: 'CASH' })}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {bill.billNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {bill.patient.firstName} {bill.patient.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{bill.patient.hospitalId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₦{Number(bill.total).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bill.paymentMethod || '-'}
                  {bill.paidAt && (
                    <div className="text-xs text-gray-500">
                      {new Date(bill.paidAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {bill.status === 'PENDING' && (
                    <button
                      onClick={() => setPaymentForm({ id: bill.id, show: true, method: 'CASH' })}
                      className="text-green-600 hover:text-green-900"
                    >
                      Record Payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
