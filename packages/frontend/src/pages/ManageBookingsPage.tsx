import { format } from 'date-fns';
import { AlertCircle, Calendar, Car, DollarSign, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Booking, bookingApi } from '../api/apiClient';
import { useUser } from '../contexts/UserContext';

const ManageBookingsPage: React.FC = () => {
  const { currentUser } = useUser();
  const queryClient = useQueryClient();
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Fetch user's bookings
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery(
    ['bookings', currentUser?.id],
    () =>
      currentUser
        ? bookingApi.getBookingsByUserId(currentUser.id)
        : Promise.resolve([]),
    {
      enabled: !!currentUser,
    }
  );

  // Delete booking mutation
  const deleteBookingMutation = useMutation(
    (bookingId: string) => bookingApi.deleteBooking(bookingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookings']);
        setIsConfirmModalOpen(false);
      },
    }
  );

  // Open confirmation modal
  const confirmDelete = (booking: Booking) => {
    setBookingToDelete(booking);
    setIsConfirmModalOpen(true);
  };

  // Handle booking deletion
  const handleDeleteBooking = () => {
    if (bookingToDelete) {
      deleteBookingMutation.mutate(bookingToDelete.id);
    }
  };

  // Close confirmation modal
  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setBookingToDelete(null);
  };

  // Group bookings by status (upcoming vs past)
  const currentDate = new Date();
  const upcomingBookings =
    bookings?.filter((booking) => new Date(booking.endDate) >= currentDate) ||
    [];
  const pastBookings =
    bookings?.filter((booking) => new Date(booking.endDate) < currentDate) ||
    [];

  if (isLoading) {
    return <div className='text-center py-8'>Loading your bookings...</div>;
  }

  if (error) {
    return (
      <div className='text-center py-8 text-red-600'>
        An error occurred while loading your bookings. Please try again later.
      </div>
    );
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Manage Bookings</h1>

      {/* Upcoming Bookings */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold mb-4'>Upcoming Bookings</h2>

        {upcomingBookings.length > 0 ? (
          <div className='space-y-4'>
            {upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onDeleteClick={() => confirmDelete(booking)}
              />
            ))}
          </div>
        ) : (
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
            <p className='text-gray-600'>
              You don't have any upcoming bookings.
            </p>
            <button
              onClick={() => (window.location.href = '/book')}
              className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              Book a Car
            </button>
          </div>
        )}
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className='text-xl font-semibold mb-4'>Past Bookings</h2>

          <div className='space-y-4'>
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isPast={true} />
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmModalOpen && bookingToDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <div className='flex items-center text-red-600 mb-4'>
              <AlertCircle size={20} className='mr-2' />
              <h2 className='text-xl font-bold'>Cancel Booking</h2>
            </div>

            <p className='mb-4'>
              Are you sure you want to cancel your booking for the
              <span className='font-medium'> {bookingToDelete.carModel} </span>
              from {format(
                new Date(bookingToDelete.startDate),
                'MMM d, yyyy'
              )}{' '}
              to {format(new Date(bookingToDelete.endDate), 'MMM d, yyyy')}?
            </p>

            <div className='flex justify-end gap-2 mt-6'>
              <button
                type='button'
                className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'
                onClick={cancelDelete}
              >
                No, Keep It
              </button>
              <button
                type='button'
                className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
                onClick={handleDeleteBooking}
                disabled={deleteBookingMutation.isLoading}
              >
                {deleteBookingMutation.isLoading
                  ? 'Cancelling...'
                  : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface BookingCardProps {
  booking: Booking;
  isPast?: boolean;
  onDeleteClick?: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  isPast = false,
  onDeleteClick,
}) => {
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  // Calculate booking duration in days
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
        isPast ? 'border-gray-200 opacity-80' : 'border-gray-200'
      }`}
    >
      <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
        <div className='flex items-center'>
          <Car size={20} className='text-gray-500 mr-2' />
          <h3 className='font-medium'>{booking.carModel}</h3>
        </div>

        {!isPast && onDeleteClick && (
          <button
            onClick={onDeleteClick}
            className='text-red-500 hover:text-red-700 p-1'
            title='Cancel booking'
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className='p-4'>
        <div className='flex items-center mb-3'>
          <Calendar size={18} className='text-gray-500 mr-2' />
          <div>
            <p className='text-sm'>
              {format(startDate, 'MMM d, yyyy')} -{' '}
              {format(endDate, 'MMM d, yyyy')}
            </p>
            <p className='text-xs text-gray-500'>
              {durationDays} {durationDays === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        <div className='flex items-center'>
          <DollarSign size={18} className='text-gray-500 mr-2' />
          <p className='text-sm font-medium'>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(booking.totalPrice)}
          </p>
        </div>

        {isPast && (
          <div className='mt-3 text-xs text-gray-500'>
            Completed • Booked on{' '}
            {format(new Date(booking.createdAt), 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookingsPage;
