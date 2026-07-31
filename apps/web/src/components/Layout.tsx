import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN', 'RECORDS', 'ACCOUNTS'] },
    { path: '/patients/register', label: 'Register Patient', roles: ['SUPER_ADMIN', 'ADMIN', 'NURSE', 'RECORDS'] },
    { path: '/appointments', label: 'Appointments', roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECORDS'] },
    { path: '/appointments/book', label: 'Book Appointment', roles: ['SUPER_ADMIN', 'ADMIN', 'NURSE', 'RECORDS', 'DOCTOR'] },
    { path: '/consultation', label: 'Consultation', roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR'] },
    { path: '/prescriptions', label: 'Prescriptions', roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PHARMACIST'] },
    { path: '/lab', label: 'Lab Orders', roles: ['SUPER_ADMIN', 'ADMIN', 'LAB_TECHNICIAN', 'DOCTOR'] },
    { path: '/billing', label: 'Billing', roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS', 'DOCTOR'] }
  ];

  const userRole = user?.role || '';

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-green-700 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">TGPH EMR</h1>
          {user && (
            <div className="mt-4 text-sm">
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-green-200">{user.role}</p>
            </div>
          )}
        </div>
        <nav className="mt-8">
          {menuItems
            .filter(item => item.roles.includes(userRole))
            .map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-2 hover:bg-green-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
