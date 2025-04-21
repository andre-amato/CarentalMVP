import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateUserRequest, userApi } from '../api/apiClient';
import { useUser } from '../contexts/UserContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: loginError } = useUser();

  // Login form state
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    name: '',
    email: '',
    drivingLicense: {
      licenseNumber: '',
      expiryDate: '',
    },
  });
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !licenseNumber) {
      return;
    }

    setLoading(true);

    try {
      const success = await login(email, licenseNumber);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.drivingLicense.licenseNumber ||
      !newUser.drivingLicense.expiryDate
    ) {
      setRegisterError('All fields are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setRegisterError('Please enter a valid email address');
      return;
    }

    // Validate expiry date is in the future
    const expiryDate = new Date(newUser.drivingLicense.expiryDate);
    if (expiryDate <= new Date()) {
      setRegisterError('License expiry date must be in the future');
      return;
    }

    setLoading(true);

    try {
      await userApi.createUser(newUser);
      // Close modal and prepare for login
      setIsModalOpen(false);
      setEmail(newUser.email);
      setLicenseNumber(newUser.drivingLicense.licenseNumber);
      setRegisterError(null);
    } catch (err) {
      console.error('Registration failed:', err);
      setRegisterError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-md w-full p-8 bg-white shadow-lg rounded-lg'>
        <h1 className='text-3xl font-bold text-center mb-6'>Carental</h1>
        <h2 className='text-xl text-center mb-6'>Login to Your Account</h2>

        <form onSubmit={handleLogin}>
          <div className='mb-4'>
            <label
              className='block text-gray-700 text-sm font-bold mb-2'
              htmlFor='email'
            >
              E-mail
            </label>
            <input
              id='email'
              type='email'
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='your@email.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='mb-6'>
            <label
              className='block text-gray-700 text-sm font-bold mb-2'
              htmlFor='licenseNumber'
            >
              Driving License Number
            </label>
            <input
              id='licenseNumber'
              type='text'
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='ABC123'
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
            />
          </div>

          {loginError && (
            <div className='mb-4 p-2 bg-red-100 text-red-700 rounded'>
              {loginError}
            </div>
          )}

          <div className='flex items-center justify-between'>
            <button
              type='submit'
              className='w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            Don't have an account?{' '}
            <button
              onClick={() => setIsModalOpen(true)}
              className='text-blue-500 hover:text-blue-600 focus:outline-none'
              disabled={loading}
            >
              Create Account
            </button>
          </p>
        </div>

        {/* Registration Modal */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md'>
              <h2 className='text-xl font-bold mb-4'>Create New Account</h2>

              <form onSubmit={handleRegister}>
                <div className='mb-4'>
                  <label
                    className='block text-gray-700 text-sm font-bold mb-2'
                    htmlFor='name'
                  >
                    Full Name
                  </label>
                  <input
                    id='name'
                    type='text'
                    className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='John Doe'
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='mb-4'>
                  <label
                    className='block text-gray-700 text-sm font-bold mb-2'
                    htmlFor='newEmail'
                  >
                    Email
                  </label>
                  <input
                    id='newEmail'
                    type='email'
                    className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='your@email.com'
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='mb-4'>
                  <label
                    className='block text-gray-700 text-sm font-bold mb-2'
                    htmlFor='newLicenseNumber'
                  >
                    Driving License Number
                  </label>
                  <input
                    id='newLicenseNumber'
                    type='text'
                    className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='ABC123'
                    value={newUser.drivingLicense.licenseNumber}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        drivingLicense: {
                          ...newUser.drivingLicense,
                          licenseNumber: e.target.value,
                        },
                      })
                    }
                    required
                  />
                </div>

                <div className='mb-6'>
                  <label
                    className='block text-gray-700 text-sm font-bold mb-2'
                    htmlFor='expiryDate'
                  >
                    License Expiry Date
                  </label>
                  <input
                    id='expiryDate'
                    type='date'
                    className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newUser.drivingLicense.expiryDate}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        drivingLicense: {
                          ...newUser.drivingLicense,
                          expiryDate: e.target.value,
                        },
                      })
                    }
                    required
                  />
                </div>

                {registerError && (
                  <div className='mb-4 p-2 bg-red-100 text-red-700 rounded'>
                    {registerError}
                  </div>
                )}

                <div className='flex justify-end gap-2'>
                  <button
                    type='button'
                    className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
