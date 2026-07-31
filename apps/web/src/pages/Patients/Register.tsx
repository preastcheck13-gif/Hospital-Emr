import { useState } from 'react';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function RegisterPatient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', middleName: '', dateOfBirth: '', gender: 'MALE',
    phone: '', email: '', address: '', state: '', lga: '', nhisNumber: '',
    bloodGroup: '', genotype: '', religion: ''
  });
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post('/patients', formData);
      setSuccess(`Patient registered! ID: ${res.data.hospitalId}`);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Patient Registration</h1>

          {success && <div className="bg-green-50 text-green-700 p-3 rounded mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">First Name *</label>
                <input required className="mt-1 block w-full border rounded p-2"
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name *</label>
                <input required className="mt-1 block w-full border rounded p-2"
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Date of Birth *</label>
                <input type="date" required className="mt-1 block w-full border rounded p-2"
                  value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Gender *</label>
                <select className="mt-1 block w-full border rounded p-2"
                  value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input className="mt-1 block w-full border rounded p-2"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">NHIS Number</label>
                <input className="mt-1 block w-full border rounded p-2"
                  value={formData.nhisNumber} onChange={e => setFormData({...formData, nhisNumber: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Address</label>
              <textarea className="mt-1 block w-full border rounded p-2"
                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">State</label>
                <input className="mt-1 block w-full border rounded p-2"
                  value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">LGA</label>
                <input className="mt-1 block w-full border rounded p-2"
                  value={formData.lga} onChange={e => setFormData({...formData, lga: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Blood Group</label>
                <select className="mt-1 block w-full border rounded p-2"
                  value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                  <option value="">Select</option>
                  <option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option>
                  <option>O+</option><option>O-</option>
                  <option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Genotype</label>
                <select className="mt-1 block w-full border rounded p-2"
                  value={formData.genotype} onChange={e => setFormData({...formData, genotype: e.target.value})}>
                  <option value="">Select</option>
                  <option>AA</option><option>AS</option>
                  <option>SS</option><option>AC</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800">
              Register Patient
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
