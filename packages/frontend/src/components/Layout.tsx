import { Calendar, Car, Home, LogOut, Settings } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { currentUser, logout } = useUser();

  if (!currentUser) {
    return null;
  }

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: <Home size={20} /> },
    { path: '/book', label: 'Book a Car', icon: <Car size={20} /> },
    {
      path: '/bookings',
      label: 'Manage Bookings',
      icon: <Calendar size={20} />,
    },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar */}
      <div className='w-64 bg-white shadow-md'>
        <div className='p-4 border-b'>
          <h2 className='text-xl font-semibold text-gray-800'>Carental</h2>
          <p className='text-sm text-gray-600 mt-1'>
            Hello, {currentUser.name}
          </p>
        </div>
        <nav className='mt-4'>
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className='mb-1'>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className='mr-3'>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className='mb-1'>
              <button
                onClick={logout}
                className='flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50'
              >
                <span className='mr-3'>
                  <LogOut size={20} />
                </span>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className='flex-1 overflow-auto'>
        <div className='p-6'>{children}</div>
      </div>
    </div>
  );
};

export default Layout;
