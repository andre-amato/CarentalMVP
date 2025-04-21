import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/apiClient';
import { useUser } from '../contexts/UserContext';
import { CreateUserRequest } from '../types/types';

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
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

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
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-green-100'>
      <div className='max-w-md w-full p-8 bg-white shadow-xl rounded-xl'>
        <div className='flex justify-center mb-6'>
          <img
            src='/logo.png'
            alt='Logo'
            className='h-20 rounded-xl border border-gray-200 shadow-sm'
          />
        </div>
        <h2 className='text-xl font-medium text-center mb-6 text-gray-700'>
          Login to Your Account
        </h2>

        <form onSubmit={handleLogin} className='space-y-5'>
          <div>
            <label
              className='block text-gray-700 text-sm font-medium mb-2'
              htmlFor='email'
            >
              E-mail
            </label>
            <input
              id='email'
              type='email'
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200'
              placeholder='your@email.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              className='block text-gray-700 text-sm font-medium mb-2'
              htmlFor='licenseNumber'
            >
              Driving License Number
            </label>
            <input
              id='licenseNumber'
              type='text'
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200'
              placeholder='ABC123'
              value={licenseNumber}
              onChange={(e) => {
                // Limit to 6 characters
                if (e.target.value.length <= 6) {
                  setLicenseNumber(e.target.value);
                }
              }}
              maxLength={6}
              required
            />
          </div>

          {loginError && (
            <div className='p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm'>
              {loginError}
            </div>
          )}

          <div>
            <button
              type='submit'
              className='w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-200 shadow-sm disabled:opacity-50'
              disabled={loading}
            >
              {loading ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            Don't have an account?{' '}
            <button
              onClick={() => setIsModalOpen(true)}
              className='text-teal-600 hover:text-teal-700 font-medium focus:outline-none transition duration-200'
              disabled={loading}
            >
              Create Account
            </button>
          </p>
        </div>

        {/* Registration Modal */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm'>
            <div className='bg-white rounded-xl p-6 w-full max-w-md shadow-2xl'>
              <h2 className='text-xl font-bold mb-5 text-gray-800'>
                Create New Account
              </h2>

              <form onSubmit={handleRegister} className='space-y-4'>
                <div>
                  <label
                    className='block text-gray-700 text-sm font-medium mb-2'
                    htmlFor='name'
                  >
                    Full Name
                  </label>
                  <input
                    id='name'
                    type='text'
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200'
                    placeholder='John Doe'
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    className='block text-gray-700 text-sm font-medium mb-2'
                    htmlFor='newEmail'
                  >
                    Email
                  </label>
                  <input
                    id='newEmail'
                    type='email'
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200'
                    placeholder='your@email.com'
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    className='block text-gray-700 text-sm font-medium mb-2'
                    htmlFor='newLicenseNumber'
                  >
                    Driving License Number
                  </label>
                  <input
                    id='newLicenseNumber'
                    type='text'
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200'
                    placeholder='ABC123'
                    value={newUser.drivingLicense.licenseNumber}
                    onChange={(e) => {
                      // Limit to 6 characters
                      if (e.target.value.length <= 6) {
                        setNewUser({
                          ...newUser,
                          drivingLicense: {
                            ...newUser.drivingLicense,
                            licenseNumber: e.target.value,
                          },
                        });
                      }
                    }}
                    maxLength={6}
                    required
                  />
                </div>

                <div>
                  <label
                    className='block text-gray-700 text-sm font-medium mb-2'
                    htmlFor='expiryDate'
                  >
                    License Expiry Date
                  </label>
                  <input
                    id='expiryDate'
                    type='date'
                    className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200'
                    value={newUser.drivingLicense.expiryDate}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      if (selectedDate >= today) {
                        setNewUser({
                          ...newUser,
                          drivingLicense: {
                            ...newUser.drivingLicense,
                            expiryDate: e.target.value,
                          },
                        });
                      }
                    }}
                    min={getTomorrowDate()}
                    required
                  />
                </div>

                {registerError && (
                  <div className='p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm'>
                    {registerError}
                  </div>
                )}

                <div className='flex justify-end gap-3 mt-6'>
                  <button
                    type='button'
                    className='px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition duration-200'
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition duration-200 shadow-sm disabled:opacity-50'
                    disabled={loading}
                  >
                    {loading ? (
                      <span className='flex items-center justify-center'>
                        <svg
                          className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      'Create Account'
                    )}
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
