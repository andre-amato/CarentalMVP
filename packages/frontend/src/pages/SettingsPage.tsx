// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { format } from 'date-fns';
import { UserCircle, AlertCircle, ShieldAlert } from 'lucide-react';

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
    return <div className='text-center py-8'>Loading your profile...</div>;
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Settings</h1>

      {/* User Profile */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6'>
        <h2 className='text-lg font-semibold mb-4 flex items-center'>
          <UserCircle size={20} className='mr-2' />
          Your Profile
        </h2>

        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium text-gray-500'>Name</h3>
            <p className='mt-1'>{currentUser.name}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-500'>Email</h3>
            <p className='mt-1'>{currentUser.email}</p>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-500'>
              Driving License
            </h3>
            <p className='mt-1'>{currentUser.drivingLicense.licenseNumber}</p>
            <p className='text-sm text-gray-500'>
              Expires on{' '}
              {format(
                new Date(currentUser.drivingLicense.expiryDate),
                'MMMM d, yyyy'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-red-200 mb-6'>
        <h2 className='text-lg font-semibold mb-4 flex items-center text-red-600'>
          <ShieldAlert size={20} className='mr-2' />
          Danger Zone
        </h2>

        <p className='text-gray-600 mb-4'>
          Deleting your account will permanently remove all your data, including
          booking history. This action cannot be undone.
        </p>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <div className='flex items-center text-red-600 mb-4'>
              <AlertCircle size={20} className='mr-2' />
              <h2 className='text-xl font-bold'>Delete Account</h2>
            </div>

            <p className='mb-4'>
              Are you absolutely sure you want to delete your account? This will
              permanently erase all your data and cannot be reversed.
            </p>

            {error && (
              <div className='mb-4 p-2 bg-red-100 text-red-700 rounded'>
                {error}
              </div>
            )}

            <div className='flex justify-end gap-2 mt-6'>
              <button
                type='button'
                className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type='button'
                className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
