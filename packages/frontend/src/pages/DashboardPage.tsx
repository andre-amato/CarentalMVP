import { format } from 'date-fns';
import { CalendarDays, Clock, DollarSign } from 'lucide-react';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

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
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>

      <div className='mb-8'>
        <h3 className='text-lg font-semibold mb-4'>Your Bookings</h3>

        {bookings && bookings.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {bookings.map((booking: Booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
            <p className='text-gray-600'>You don't have any bookings yet.</p>
            <button
              onClick={() => (window.location.href = '/book')}
              className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
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

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
      <div className='p-4 border-b border-gray-200 bg-gray-50'>
        <h4 className='font-bold'>{booking.carModel}</h4>
      </div>
      <div className='p-4'>
        <div className='flex items-center mb-3'>
          <CalendarDays size={18} className='text-gray-500 mr-2' />
          <div>
            <p className='text-sm text-gray-600'>
              {format(startDate, 'MMM d, yyyy')} -{' '}
              {format(endDate, 'MMM d, yyyy')}
            </p>
            <p className='text-xs text-gray-500'>
              {durationDays} {durationDays === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        <div className='flex items-center mb-3'>
          <Clock size={18} className='text-gray-500 mr-2' />
          <p className='text-sm text-gray-600'>
            Booked on {format(new Date(booking.createdAt), 'MMM d, yyyy')}
          </p>
        </div>

        <div className='flex items-center'>
          <DollarSign size={18} className='text-gray-500 mr-2' />
          <div>
            <p className='text-sm font-semibold'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(booking.totalPrice)}
            </p>
            <p className='text-xs text-gray-500'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(dailyPrice)}{' '}
              per day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
