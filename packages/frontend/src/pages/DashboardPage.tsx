import { format } from 'date-fns';
import { CalendarDays, Car, Clock, DollarSign } from 'lucide-react';
import React from 'react';
import { useQuery } from 'react-query';
import { bookingApi } from '../api/apiClient';
import { useUser } from '../contexts/UserContext';
import { Booking } from '../types/types';

const DashboardPage: React.FC = () => {
  const { currentUser } = useUser();

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

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500'></div>
        <span className='ml-3 text-teal-700 font-medium'>
          Loading your bookings...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 bg-red-50 border border-red-100 rounded-xl text-center my-8'>
        <div className='text-red-600 font-medium'>
          An error occurred while loading your bookings. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className='text-xl md:text-2xl font-bold mb-4 md:mb-8 text-gray-800'>
        My Dashboard
      </h1>

      <div className='mb-8'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
          <h3 className='text-lg font-medium text-gray-700 mb-3 sm:mb-0'>
            Your Bookings
          </h3>
          {bookings && bookings.length > 0 && (
            <button
              onClick={() => (window.location.href = '/book')}
              className='px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-200 shadow-sm text-sm font-medium w-full sm:w-auto'
            >
              Book Another Car
            </button>
          )}
        </div>

        {bookings && bookings.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
            {bookings.map((booking: Booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className='bg-white p-4 md:p-8 rounded-xl shadow-md border border-gray-100 text-center'>
            <div className='flex justify-center mb-4'>
              <Car size={36} className='text-teal-500' />
            </div>
            <h4 className='text-lg md:text-xl font-medium mb-2 md:mb-3 text-gray-800'>
              No Bookings Yet
            </h4>
            <p className='text-gray-600 mb-4 md:mb-6 text-sm md:text-base'>
              You don't have any car bookings. Start your journey today!
            </p>
            <button
              onClick={() => (window.location.href = '/book')}
              className='w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-200 shadow-sm font-medium'
            >
              Book a Car
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface BookingCardProps {
  booking: Booking;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  // Adjust dates with proper offsets - start date +1 day, end date +2 days
  const startDate = new Date(new Date(booking.startDate).getTime() + 86400000); // Add 24 hours (86400000 ms)
  const endDate = new Date(new Date(booking.endDate).getTime() + 86400000 * 2); // Add 48 hours (86400000 * 2 ms)

  // Calculate booking duration in days
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

  // Calculate daily price
  const dailyPrice = booking.totalPrice / durationDays;

  // Determine card accent color based on booking duration
  const getAccentColor = () => {
    if (durationDays <= 3) return 'border-l-teal-400';
    if (durationDays <= 7) return 'border-l-teal-500';
    return 'border-l-teal-600';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 ${getAccentColor()}`}
    >
      <div className='p-3 md:p-5 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white'>
        <h4 className='font-bold text-gray-800 flex items-center text-sm md:text-base'>
          <Car size={16} className='mr-2 text-teal-600' />
          {booking.carModel}
        </h4>
      </div>
      <div className='p-3 md:p-5 space-y-3 md:space-y-4'>
        <div className='flex items-center'>
          <div className='bg-teal-50 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3'>
            <CalendarDays size={16} className='text-teal-600' />
          </div>
          <div>
            <p className='text-xs md:text-sm font-medium text-gray-700'>
              {format(startDate, 'MMM d, yyyy')} -{' '}
              {format(endDate, 'MMM d, yyyy')}
            </p>
            <p className='text-xs text-gray-500 mt-0.5'>
              <span className='font-medium text-teal-600'>{durationDays}</span>{' '}
              {durationDays === 1 ? 'day' : 'days'} rental
            </p>
          </div>
        </div>

        <div className='flex items-center'>
          <div className='bg-teal-50 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3'>
            <Clock size={16} className='text-teal-600' />
          </div>
          <div>
            <p className='text-xs md:text-sm font-medium text-gray-700'>
              Booked on {format(new Date(booking.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className='flex items-center'>
          <div className='bg-teal-50 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3'>
            <DollarSign size={16} className='text-teal-600' />
          </div>
          <div>
            <p className='text-xs md:text-sm font-medium text-gray-700'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(booking.totalPrice)}
            </p>
            <p className='text-xs text-gray-500 mt-0.5'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(dailyPrice)}{' '}
              per day
            </p>
          </div>
        </div>
      </div>
      <div className='px-3 md:px-5 py-2 md:py-3 bg-gray-50 text-right'>
        <a
          href='/bookings'
          className='text-xs md:text-sm text-teal-600 font-medium hover:text-teal-700 transition duration-200'
        >
          View Details
        </a>
      </div>
    </div>
  );
};

export default DashboardPage;
