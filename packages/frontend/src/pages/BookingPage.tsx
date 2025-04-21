import { addDays, differenceInDays, format, isBefore, isEqual } from 'date-fns';
import {
  Calendar,
  Car as CarIcon,
  Check,
  DollarSign,
  Truck,
} from 'lucide-react';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { bookingApi, carApi } from '../api/apiClient';
import { useUser } from '../contexts/UserContext';

const TypedDatePicker = DatePicker as unknown as React.FC<any>;
const BookingPage: React.FC = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for date selection
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(addDays(new Date(), 3));

  // State for car selection
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  // Handle date changes
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (
      date &&
      endDate &&
      (isBefore(endDate, date) || isEqual(endDate, date))
    ) {
      setEndDate(addDays(date, 1));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  // Format dates for API
  const formatDateForApi = (date: Date | null): string => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  // Fetch available cars based on selected dates
  const {
    data: availableCars,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['availableCars', formatDateForApi(startDate), formatDateForApi(endDate)],
    () =>
      startDate && endDate
        ? carApi.getAvailableCars(
            formatDateForApi(startDate),
            formatDateForApi(endDate)
          )
        : Promise.resolve([]),
    {
      enabled: !!(startDate && endDate),
      onSuccess: () => {
        setSelectedCarId(null); // Reset selection when dates change
      },
    }
  );

  // Create booking mutation
  const createBookingMutation = useMutation(
    (data: {
      userId: string;
      carId: string;
      startDate: string;
      endDate: string;
    }) => bookingApi.createBooking(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookings']);
        navigate('/dashboard', { state: { bookingSuccess: true } });
      },
    }
  );

  // Handle booking submission
  const handleBooking = () => {
    if (!currentUser || !selectedCarId || !startDate || !endDate) {
      return;
    }

    createBookingMutation.mutate({
      userId: currentUser.id,
      carId: selectedCarId,
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    });
  };

  // Find selected car details
  const selectedCar = availableCars?.find((car) => car.id === selectedCarId);

  // Calculate booking duration
  const bookingDuration =
    startDate && endDate ? differenceInDays(endDate, startDate) : 0;

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Book a Car</h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Date Selection */}
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <h2 className='text-lg font-semibold mb-4 flex items-center'>
            <Calendar size={20} className='mr-2' />
            Select Dates
          </h2>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Pick-up Date
              </label>
              <TypedDatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()}
                className='w-full p-2 border border-gray-300 rounded'
                dateFormat='MMMM d, yyyy'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Drop-off Date
              </label>
              <TypedDatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate ? addDays(startDate, 1) : undefined}
                className='w-full p-2 border border-gray-300 rounded'
                dateFormat='MMMM d, yyyy'
              />
            </div>

            {startDate && endDate && (
              <div className='mt-4 p-3 bg-blue-50 rounded text-sm'>
                <p className='font-medium'>Booking Duration:</p>
                <p>
                  {bookingDuration} {bookingDuration === 1 ? 'day' : 'days'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Car Selection */}
        <div className='lg:col-span-2'>
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
            <h2 className='text-lg font-semibold mb-4 flex items-center'>
              <CarIcon size={20} className='mr-2' />
              Available Cars
            </h2>

            {isLoading ? (
              <div className='text-center py-6'>Loading available cars...</div>
            ) : error ? (
              <div className='text-center py-6 text-red-600'>
                Error loading cars. Please try again.
              </div>
            ) : availableCars && availableCars.length > 0 ? (
              <div className='space-y-4'>
                {availableCars.map((car) => (
                  <div
                    key={car.id}
                    className={`p-4 border rounded-lg flex items-center cursor-pointer transition-colors ${
                      selectedCarId === car.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedCarId(car.id)}
                  >
                    <div className='flex-shrink-0 mr-4'>
                      {car.brand.toLowerCase().includes('truck') ||
                      car.model.toLowerCase().includes('truck') ||
                      car.brand.toLowerCase().includes('vito') ? (
                        <Truck size={36} className='text-gray-600' />
                      ) : (
                        <CarIcon size={36} className='text-gray-600' />
                      )}
                    </div>

                    <div className='flex-grow'>
                      <h3 className='font-medium'>
                        {car.brand} {car.model}
                      </h3>
                      <div className='flex flex-wrap text-sm text-gray-600 mt-1'>
                        <span className='mr-4'>
                          Available: {car.availableStock}{' '}
                          {car.availableStock === 1 ? 'unit' : 'units'}
                        </span>
                        <span>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(car.dailyPrice)}
                          /day
                        </span>
                      </div>
                    </div>

                    <div className='flex-shrink-0 ml-2'>
                      <div className='font-semibold text-blue-600'>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(car.totalPrice)}
                      </div>
                      <div className='text-xs text-gray-500'>Total</div>
                    </div>

                    {selectedCarId === car.id && (
                      <div className='ml-2 text-blue-500'>
                        <Check size={20} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-6 text-gray-500'>
                No cars available for the selected dates. Please try different
                dates.
              </div>
            )}
          </div>

          {/* Booking Summary */}
          {selectedCar && (
            <div className='mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
              <h2 className='text-lg font-semibold mb-4 flex items-center'>
                <DollarSign size={20} className='mr-2' />
                Booking Summary
              </h2>

              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span>Car:</span>
                  <span className='font-medium'>
                    {selectedCar.brand} {selectedCar.model}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span>Dates:</span>
                  <span>
                    {startDate && endDate
                      ? `${format(startDate, 'MMM d, yyyy')} - ${format(
                          endDate,
                          'MMM d, yyyy'
                        )}`
                      : ''}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span>Duration:</span>
                  <span>
                    {bookingDuration} {bookingDuration === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span>Daily Rate:</span>
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(selectedCar.dailyPrice)}
                  </span>
                </div>

                <div className='pt-3 border-t border-gray-200 flex justify-between font-semibold'>
                  <span>Total Price:</span>
                  <span className='text-blue-600'>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(selectedCar.totalPrice)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={createBookingMutation.isLoading}
                className='mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
              >
                {createBookingMutation.isLoading
                  ? 'Processing...'
                  : 'Confirm Booking'}
              </button>

              {createBookingMutation.isError && (
                <div className='mt-3 p-2 bg-red-100 text-red-700 text-sm rounded'>
                  Booking failed. Please try again.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
