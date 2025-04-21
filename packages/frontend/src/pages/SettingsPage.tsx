import { format } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Mail,
  ShieldAlert,
  UserCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const SettingsPage: React.FC = () => {
  const { currentUser, deleteAccount } = useUser();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    setIsDeleting(true);
    setError(null);

    try {
      const success = await deleteAccount();
      if (success) {
        navigate('/', { replace: true });
      } else {
        setError('Failed to delete account. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className='flex justify-center items-center py-8 md:py-12'>
        <div className='animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-teal-500'></div>
        <span className='ml-3 text-sm md:text-base text-teal-700 font-medium'>
          Loading your profile...
        </span>
      </div>
    );
  }

  return (
    <div>
      <h1 className='text-xl md:text-2xl font-bold mb-4 md:mb-8 text-gray-800'>
        Settings
      </h1>

      {/* User Profile */}
      <div className='bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-100 mb-4 md:mb-8'>
        <h2 className='text-base md:text-lg font-medium mb-4 md:mb-6 flex items-center text-gray-800'>
          Your Profile
        </h2>

        <div className='space-y-4 md:space-y-6'>
          <div className='flex items-start p-3 md:p-4 bg-gray-50 rounded-lg'>
            <UserCircle
              size={18}
              className='text-teal-600 mr-2 md:mr-3 mt-0.5 md:size-5'
            />
            <div>
              <h3 className='text-xs md:text-sm font-medium text-gray-500'>
                Name
              </h3>
              <p className='mt-0.5 md:mt-1 font-medium text-gray-800 text-sm md:text-base'>
                {currentUser.name}
              </p>
            </div>
          </div>

          <div className='flex items-start p-3 md:p-4 bg-gray-50 rounded-lg'>
            <Mail
              size={18}
              className='text-teal-600 mr-2 md:mr-3 mt-0.5 md:size-5'
            />
            <div>
              <h3 className='text-xs md:text-sm font-medium text-gray-500'>
                Email
              </h3>
              <p className='mt-0.5 md:mt-1 font-medium text-gray-800 text-sm md:text-base'>
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className='flex items-start p-3 md:p-4 bg-gray-50 rounded-lg'>
            <CreditCard
              size={18}
              className='text-teal-600 mr-2 md:mr-3 mt-0.5 md:size-5'
            />
            <div>
              <h3 className='text-xs md:text-sm font-medium text-gray-500'>
                Driving License
              </h3>
              <p className='mt-0.5 md:mt-1 font-medium text-gray-800 text-sm md:text-base'>
                {currentUser.drivingLicense.licenseNumber}
              </p>
              <div className='flex items-center mt-0.5 md:mt-1 text-xs md:text-sm text-gray-500'>
                <Calendar
                  size={12}
                  className='mr-1 text-teal-500 md:size-3.5'
                />
                Expires on{' '}
                {format(
                  new Date(currentUser.drivingLicense.expiryDate),
                  'MMMM d, yyyy'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className='bg-white p-4 md:p-6 rounded-xl shadow-md border-l-4 border-l-red-500 border border-gray-100 mb-4 md:mb-8'>
        <h2 className='text-base md:text-lg font-medium mb-4 md:mb-6 flex items-center text-gray-800'>
          <div className='p-1.5 md:p-2 bg-red-50 rounded-lg mr-2 md:mr-3'>
            <ShieldAlert size={18} className='text-red-600 md:size-5' />
          </div>
          Danger Zone
        </h2>

        <p className='text-sm md:text-base text-gray-600 mb-4 md:mb-6'>
          Deleting your account will permanently remove all your data, including
          booking history. This action cannot be undone.
        </p>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className='w-full sm:w-auto px-4 py-2 md:px-5 md:py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm md:text-base'
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm'>
          <div className='bg-white rounded-xl p-4 md:p-6 w-full max-w-sm md:max-w-md shadow-xl'>
            <div className='flex items-center text-red-600 mb-3 md:mb-5'>
              <div className='p-1.5 md:p-2 bg-red-50 rounded-lg mr-2 md:mr-3'>
                <AlertCircle size={18} className='text-red-600 md:size-5' />
              </div>
              <h2 className='text-lg md:text-xl font-bold'>Delete Account</h2>
            </div>

            <p className='mb-3 md:mb-4 text-sm md:text-base text-gray-700'>
              Are you absolutely sure you want to delete your account? This will
              permanently erase all your data and cannot be reversed.
            </p>

            <div className='p-3 md:p-4 my-3 md:my-5 bg-red-50 rounded-lg border border-red-100'>
              <div className='flex items-center'>
                <UserCircle
                  size={16}
                  className='mr-2 text-red-600 md:size-[18px]'
                />
                <p className='font-medium text-sm md:text-base text-gray-800'>
                  {currentUser.name}
                </p>
              </div>
              <div className='flex items-center mt-2'>
                <Mail size={16} className='mr-2 text-red-600 md:size-[18px]' />
                <p className='text-sm md:text-base text-gray-700'>
                  {currentUser.email}
                </p>
              </div>
            </div>

            <p className='text-xs md:text-sm text-gray-500 mb-4 md:mb-6'>
              This action cannot be undone. Please proceed with caution.
            </p>

            {error && (
              <div className='mb-3 md:mb-4 p-2 md:p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-xs md:text-sm'>
                {error}
              </div>
            )}

            <div className='flex justify-end gap-2 md:gap-3 mt-4 md:mt-6'>
              <button
                type='button'
                className='px-3 py-2 md:px-5 md:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition duration-200 text-xs md:text-sm'
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type='button'
                className='px-3 py-2 md:px-5 md:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition duration-200 shadow-sm disabled:opacity-50 text-xs md:text-sm'
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-1.5 h-3 w-3 md:h-4 md:w-4 text-white'
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
                    Deleting...
                  </span>
                ) : (
                  'Delete My Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
