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
    <div className='flex h-screen bg-gradient-to-br from-teal-50 to-green-100'>
      {/* Sidebar */}
      <div className='w-64 bg-white shadow-xl'>
        <div className='p-5 border-b border-gray-100'>
          <img
            src='/logo.png'
            alt='Logo'
            className='h-12 rounded-xl border border-gray-200 shadow-sm ml-12'
          />
          <p className='text-sm text-gray-600 mt-3 text-center'>
            Welcome, {currentUser.name}
          </p>
        </div>
        <nav className='mt-6'>
          <ul className='space-y-1'>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-5 py-3 mx-2 rounded-lg transition duration-200 ${
                    location.pathname === item.path
                      ? 'bg-teal-50 text-teal-600 border-r-4 border-teal-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`mr-3 ${
                      location.pathname === item.path
                        ? 'text-teal-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className='px-2 mt-6'>
              <button
                onClick={logout}
                className='flex items-center w-full px-5 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-200'
              >
                <span className='mr-3 text-gray-500'>
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
        <div className='p-6 max-w-7xl mx-auto'>
          <div className='bg-white rounded-xl shadow-md p-6'>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
