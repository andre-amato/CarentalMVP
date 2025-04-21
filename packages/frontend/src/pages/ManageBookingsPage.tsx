import { format } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  Car,
  Clock,
  DollarSign,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { bookingApi } from '../api/apiClient';
import { useUser } from '../contexts/UserContext';
import { Booking } from '../types/types';

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

  // For upcoming bookings, add one day to end date for proper comparison
  const upcomingBookings =
    bookings?.filter((booking) => {
      // Add one day to the end date using timestamp approach
      const adjustedEndDate = new Date(
        new Date(booking.endDate).getTime() + 86400000
      );
      return adjustedEndDate >= currentDate;
    }) || [];

  // For past bookings, also add one day to end date
  const pastBookings =
    bookings?.filter((booking) => {
      // Add one day to the end date using timestamp approach
      const adjustedEndDate = new Date(
        new Date(booking.endDate).getTime() + 86400000
      );
      return adjustedEndDate < currentDate;
    }) || [];

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-8 md:py-12'>
        <div className='animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-teal-500'></div>
        <span className='ml-3 text-sm md:text-base text-teal-700 font-medium'>
          Loading your bookings...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 md:p-6 bg-red-50 border border-red-100 rounded-xl text-center my-4 md:my-8'>
        <div className='text-sm md:text-base text-red-600 font-medium'>
          An error occurred while loading your bookings. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className='text-xl md:text-2xl font-bold mb-4 md:mb-8 text-gray-800'>
        Manage Bookings
      </h1>

      {/* Upcoming Bookings */}
      <div className='mb-6 md:mb-10'>
        <div className='flex items-center mb-4 md:mb-6'>
          <div className='p-1.5 md:p-2 bg-teal-50 rounded-lg mr-2 md:mr-3'>
            <Calendar size={16} className='md:size-5 text-teal-600' />
          </div>
          <h2 className='text-lg md:text-xl font-medium text-gray-800'>
            Upcoming Bookings
          </h2>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
            {upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onDeleteClick={() => confirmDelete(booking)}
              />
            ))}
          </div>
        ) : (
          <div className='bg-white p-4 md:p-8 rounded-xl shadow-md border border-gray-100 text-center'>
            <div className='flex justify-center mb-3 md:mb-4'>
              <Car size={32} className='md:size-10 text-teal-500' />
            </div>
            <h4 className='text-lg md:text-xl font-medium mb-2 md:mb-3 text-gray-800'>
              No Upcoming Bookings
            </h4>
            <p className='text-sm md:text-base text-gray-600 mb-4 md:mb-6'>
              You don't have any upcoming car bookings scheduled.
            </p>
            <button
              onClick={() => (window.location.href = '/book')}
              className='w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-200 shadow-sm font-medium text-sm md:text-base'
            >
              Book a Car
            </button>
          </div>
        )}
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div className='mb-4 md:mb-8'>
          <div className='flex items-center mb-4 md:mb-6'>
            <div className='p-1.5 md:p-2 bg-gray-100 rounded-lg mr-2 md:mr-3'>
              <Clock size={16} className='md:size-5 text-gray-500' />
            </div>
            <h2 className='text-lg md:text-xl font-medium text-gray-700'>
              Past Bookings
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isPast={true} />
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmModalOpen && bookingToDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm'>
          <div className='bg-white rounded-xl p-4 md:p-6 w-full max-w-sm md:max-w-md shadow-xl'>
            <div className='flex items-center text-red-600 mb-3 md:mb-5'>
              <div className='p-1.5 md:p-2 bg-red-50 rounded-lg mr-2 md:mr-3'>
                <AlertCircle size={16} className='md:size-5 text-red-600' />
              </div>
              <h2 className='text-lg md:text-xl font-bold'>Cancel Booking</h2>
            </div>

            <p className='mb-2 text-sm md:text-base text-gray-700'>
              Are you sure you want to cancel your booking for:
            </p>

            <div className='p-3 md:p-4 my-3 md:my-4 bg-gray-50 rounded-lg border border-gray-100'>
              <p className='font-medium text-sm md:text-base text-gray-800 mb-2'>
                {bookingToDelete.carModel}
              </p>
              <p className='text-xs md:text-sm text-gray-600 flex items-center mb-1'>
                <Calendar size={14} className='mr-1.5 md:mr-2 text-teal-600' />
                {format(
                  new Date(
                    new Date(bookingToDelete.startDate).getTime() + 86400000
                  ),
                  'MMM d, yyyy'
                )}{' '}
                to{' '}
                {format(
                  new Date(
                    new Date(bookingToDelete.endDate).getTime() + 86400000 * 2
                  ),
                  'MMM d, yyyy'
                )}
              </p>
              <p className='text-xs md:text-sm text-gray-600 flex items-center'>
                <DollarSign
                  size={14}
                  className='mr-1.5 md:mr-2 text-teal-600'
                />
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(bookingToDelete.totalPrice)}
              </p>
            </div>

            <p className='text-xs md:text-sm text-gray-500 mb-4 md:mb-6'>
              This action cannot be undone.
            </p>

            <div className='flex justify-end gap-2 md:gap-3 mt-4 md:mt-6'>
              <button
                type='button'
                className='px-3 py-2 md:px-5 md:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition duration-200 text-xs md:text-sm'
                onClick={cancelDelete}
              >
                Keep Booking
              </button>
              <button
                type='button'
                className='px-3 py-2 md:px-5 md:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition duration-200 shadow-sm disabled:opacity-50 text-xs md:text-sm'
                onClick={handleDeleteBooking}
                disabled={deleteBookingMutation.isLoading}
              >
                {deleteBookingMutation.isLoading ? (
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
                    Cancelling...
                  </span>
                ) : (
                  'Cancel Booking'
                )}
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
  // Adjust dates with proper offsets - start date +1 day, end date +2 days
  const startDate = new Date(new Date(booking.startDate).getTime() + 86400000); // Add 24 hours (86400000 ms)
  const endDate = new Date(new Date(booking.endDate).getTime() + 86400000 * 2); // Add 48 hours (86400000 * 2 ms)

  // Calculate booking duration in days
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

  return (
    <div
      className={`bg-white rounded-xl shadow-md border overflow-hidden transition-all duration-200 ${
        isPast
          ? 'border-gray-100 opacity-75 hover:opacity-90'
          : 'border-l-4 border-l-teal-500 border-gray-100 hover:shadow-lg'
      }`}
    >
      <div
        className={`p-3 md:p-5 border-b border-gray-100 flex justify-between items-center ${
          isPast ? 'bg-gray-50' : 'bg-gradient-to-r from-teal-50 to-white'
        }`}
      >
        <div className='flex items-center'>
          <div
            className={`p-1.5 md:p-2 rounded-lg mr-2 md:mr-3 ${
              isPast ? 'bg-gray-100' : 'bg-teal-100'
            }`}
          >
            <Car
              size={16}
              className={`md:size-[18px] ${
                isPast ? 'text-gray-600' : 'text-teal-600'
              }`}
            />
          </div>
          <h3
            className={`font-medium text-sm md:text-base ${
              isPast ? 'text-gray-700' : 'text-gray-800'
            }`}
          >
            {booking.carModel}
          </h3>
        </div>

        {!isPast && onDeleteClick && (
          <button
            onClick={onDeleteClick}
            className='text-red-500 hover:text-red-700 p-1.5 md:p-2 hover:bg-red-50 rounded-full transition duration-200'
            title='Cancel booking'
          >
            <Trash2 size={16} className='md:size-[18px]' />
          </button>
        )}
      </div>

      <div className='p-3 md:p-5 space-y-2 md:space-y-3'>
        <div className='flex items-center'>
          <Calendar
            size={16}
            className={`md:size-[18px] ${
              isPast ? 'text-gray-400' : 'text-teal-600'
            } mr-2 md:mr-3`}
          />
          <div>
            <p
              className={`text-xs md:text-sm ${
                isPast ? 'text-gray-600' : 'text-gray-700 font-medium'
              }`}
            >
              {format(startDate, 'MMM d, yyyy')} -{' '}
              {format(endDate, 'MMM d, yyyy')}
            </p>
            <p className='text-xs text-gray-500'>
              {durationDays} {durationDays === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        <div className='flex items-center'>
          <DollarSign
            size={16}
            className={`md:size-[18px] ${
              isPast ? 'text-gray-400' : 'text-teal-600'
            } mr-2 md:mr-3`}
          />
          <p
            className={`text-xs md:text-sm ${
              isPast ? 'text-gray-600' : 'text-gray-700 font-medium'
            }`}
          >
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(booking.totalPrice)}
          </p>
        </div>

        <div className='flex items-center'>
          <Clock
            size={16}
            className={`md:size-[18px] ${
              isPast ? 'text-gray-400' : 'text-teal-600'
            } mr-2 md:mr-3`}
          />
          <div>
            <p
              className={`text-xs md:text-sm ${
                isPast ? 'text-gray-600' : 'text-gray-700'
              }`}
            >
              Booked on {format(new Date(booking.createdAt), 'MMM d, yyyy')}
            </p>
            {isPast && (
              <p className='text-xs text-gray-500 mt-0.5'>Completed</p>
            )}
          </div>
        </div>
      </div>

      {!isPast && (
        <div className='px-3 md:px-5 py-2 md:py-3 bg-gray-50 text-right'>
          <a
            href='/bookings'
            className='text-xs md:text-sm text-teal-600 font-medium hover:text-teal-700 transition duration-200'
          >
            View Details
          </a>
        </div>
      )}
    </div>
  );
};

export default ManageBookingsPage;
