import { addDays, differenceInDays, format, isBefore, isEqual } from 'date-fns';
import {
  Calendar,
  Car as CarIcon,
  Check,
  Clock,
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
import { CarAvaiableBooking } from '../types/types';

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

  // Format dates for API - adjusted to send end date as 1 day before
  const formatDateForApi = (
    date: Date | null,
    isEndDate: boolean = false
  ): string => {
    if (!date) return '';

    // If it's an end date, subtract 1 day for the API call
    const adjustedDate = isEndDate ? addDays(date, -1) : date;
    return format(adjustedDate, 'yyyy-MM-dd');
  };

  // Calculate adjusted end date for API calls
  const getAdjustedEndDate = (end: Date | null): Date | null => {
    if (!end) return null;

    // For API calls, we subtract one day from the displayed end date
    return end;
  };

  // Fetch available cars based on selected dates
  const {
    data: availableCars,
    isLoading,
    error,
    refetch,
  } = useQuery(
    [
      'availableCars',
      formatDateForApi(startDate),
      formatDateForApi(endDate, true),
    ],
    () =>
      startDate && endDate
        ? carApi.getAvailableCars(
            formatDateForApi(startDate),
            formatDateForApi(endDate, true)
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
      endDate: formatDateForApi(endDate, true), // Use adjusted end date for API
    });
  };

  // Find selected car details
  const selectedCar = availableCars?.find((car) => car.id === selectedCarId);

  // Calculate booking duration for API purposes
  const bookingDuration =
    startDate && endDate ? differenceInDays(endDate, startDate) : 0;

  // Calculate display duration manually to ensure correctness
  const displayDuration =
    startDate && endDate
      ? Math.round(
          (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
        )
      : 0;

  // Handle car selection with validation for 0 stock
  const handleCarSelection = (car: CarAvaiableBooking) => {
    // Only allow selection if stock is greater than 0
    if (car.stock > 0) {
      setSelectedCarId(car.id);
    }
  };

  return (
    <div>
      <h1 className='text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800'>
        Book a Car
      </h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6'>
        {/* Date Selection */}
        <div className='bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-100'>
          <h2 className='text-base md:text-lg font-medium mb-4 md:mb-6 flex items-center text-gray-800'>
            <div className='p-1.5 md:p-2 bg-teal-50 rounded-lg mr-2 md:mr-3'>
              <Calendar size={18} className='text-teal-600' />
            </div>
            Select Dates
          </h2>

          <div className='space-y-4 md:space-y-5'>
            <div>
              <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2'>
                Pick-up Date
              </label>
              <TypedDatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()}
                className='w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                dateFormat='MMMM d, yyyy'
              />
            </div>

            <div>
              <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2'>
                Drop-off Date
              </label>
              <TypedDatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate ? addDays(startDate, 1) : undefined}
                className='w-full p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                dateFormat='MMMM d, yyyy'
              />
            </div>

            {startDate && endDate && (
              <div className='mt-4 md:mt-5 p-3 md:p-4 bg-teal-50 rounded-lg text-xs md:text-sm border border-teal-100'>
                <div className='flex items-center'>
                  <Clock size={16} className='text-teal-600 mr-2' />
                  <div>
                    <p className='font-medium text-gray-800'>
                      Booking Duration:
                    </p>
                    <p className='text-teal-700'>
                      {displayDuration} {displayDuration === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Car Selection */}
        <div className='lg:col-span-2'>
          <div className='bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-100'>
            <h2 className='text-base md:text-lg font-medium mb-4 md:mb-6 flex items-center text-gray-800'>
              <div className='p-1.5 md:p-2 bg-teal-50 rounded-lg mr-2 md:mr-3'>
                <CarIcon size={18} className='text-teal-600' />
              </div>
              Available Cars
            </h2>

            {isLoading ? (
              <div className='flex justify-center items-center py-8 md:py-12'>
                <div className='animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-t-2 border-b-2 border-teal-500'></div>
                <span className='ml-3 text-sm md:text-base text-teal-700 font-medium'>
                  Loading available cars...
                </span>
              </div>
            ) : error ? (
              <div className='p-4 md:p-6 bg-red-50 border border-red-100 rounded-lg text-center my-4 md:my-8'>
                <div className='text-sm md:text-base text-red-600 font-medium'>
                  Error loading cars. Please try again.
                </div>
              </div>
            ) : availableCars && availableCars.length > 0 ? (
              <div className='space-y-3 md:space-y-4'>
                {availableCars.map((car) => (
                  <div
                    key={car.id}
                    className={`p-3 md:p-5 border rounded-lg flex items-center transition-all duration-200 ${
                      car.stock === 0
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : selectedCarId === car.id
                        ? 'border-teal-500 bg-teal-50 shadow-sm cursor-pointer'
                        : 'border-gray-200 hover:border-teal-300 hover:shadow-sm cursor-pointer'
                    }`}
                    onClick={() => car.stock > 0 && handleCarSelection(car)}
                  >
                    <div className='flex-shrink-0 mr-3 md:mr-4'>
                      <div
                        className={`p-2 md:p-3 rounded-full ${
                          selectedCarId === car.id
                            ? 'bg-teal-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        {car.brand.toLowerCase().includes('truck') ||
                        car.model.toLowerCase().includes('truck') ||
                        car.brand.toLowerCase().includes('vito') ? (
                          <Truck
                            size={24}
                            className={`${
                              selectedCarId === car.id
                                ? 'text-teal-600'
                                : 'text-gray-600'
                            }`}
                          />
                        ) : (
                          <CarIcon
                            size={24}
                            className={`${
                              selectedCarId === car.id
                                ? 'text-teal-600'
                                : 'text-gray-600'
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    <div className='flex-grow min-w-0'>
                      <h3
                        className={`font-medium text-sm md:text-base ${
                          selectedCarId === car.id
                            ? 'text-teal-800'
                            : 'text-gray-800'
                        } truncate`}
                      >
                        {car.brand} {car.model}
                      </h3>
                      <div className='flex flex-wrap text-xs md:text-sm text-gray-600 mt-1'>
                        <span className='mr-3 md:mr-4 flex items-center'>
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-1 ${
                              car.stock > 1
                                ? 'bg-green-500'
                                : car.stock === 1
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          ></span>
                          Available: {car.stock}{' '}
                          {car.stock === 1 ? 'unit' : 'units'}
                        </span>
                        <span>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(car.averageDailyPrice)}
                          /day
                        </span>
                      </div>
                    </div>

                    <div className='flex-shrink-0 ml-2 text-right'>
                      <div
                        className={`font-semibold text-sm md:text-base ${
                          selectedCarId === car.id
                            ? 'text-teal-600'
                            : 'text-gray-800'
                        }`}
                      >
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(car.totalPrice)}
                      </div>
                      <div className='text-xs text-gray-500'>Total</div>
                    </div>

                    {selectedCarId === car.id && car.stock > 0 && (
                      <div className='ml-2 md:ml-3 bg-teal-500 text-white p-1 rounded-full'>
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 md:py-12 bg-gray-50 rounded-lg border border-gray-100'>
                <CarIcon size={32} className='mx-auto text-gray-400 mb-3' />
                <h3 className='font-medium text-sm md:text-base text-gray-700 mb-2'>
                  No Cars Available
                </h3>
                <p className='text-xs md:text-sm text-gray-500 max-w-md mx-auto'>
                  No cars available for the selected dates. Please try different
                  dates.
                </p>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          {selectedCar && (
            <div className='mt-4 md:mt-6 bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-100'>
              <h2 className='text-base md:text-lg font-medium mb-4 md:mb-6 flex items-center text-gray-800'>
                <div className='p-1.5 md:p-2 bg-teal-50 rounded-lg mr-2 md:mr-3'>
                  <DollarSign size={18} className='text-teal-600' />
                </div>
                Booking Summary
              </h2>

              <div className='space-y-3 md:space-y-4'>
                <div className='flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-lg'>
                  <span className='text-xs md:text-sm text-gray-600'>Car:</span>
                  <span className='font-medium text-sm md:text-base text-gray-800'>
                    {selectedCar.brand} {selectedCar.model}
                  </span>
                </div>

                <div className='flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-lg'>
                  <span className='text-xs md:text-sm text-gray-600'>
                    Dates:
                  </span>
                  <span className='text-xs md:text-sm text-gray-800'>
                    {startDate && endDate
                      ? `${format(startDate, 'MMM d, yyyy')} - ${format(
                          endDate,
                          'MMM d, yyyy'
                        )}`
                      : ''}
                  </span>
                </div>

                <div className='flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-lg'>
                  <span className='text-xs md:text-sm text-gray-600'>
                    Duration:
                  </span>
                  <span className='text-xs md:text-sm text-gray-800'>
                    {bookingDuration} {bookingDuration === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <div className='flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-lg'>
                  <span className='text-xs md:text-sm text-gray-600'>
                    Daily Rate:
                  </span>
                  <span className='text-xs md:text-sm text-gray-800'>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(selectedCar.averageDailyPrice)}
                  </span>
                </div>

                <div className='p-3 md:p-4 bg-teal-50 rounded-lg border border-teal-100 flex justify-between items-center font-medium'>
                  <span className='text-xs md:text-sm text-gray-800'>
                    Total Price:
                  </span>
                  <span className='text-sm md:text-lg text-teal-700'>
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
                className='mt-4 md:mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 md:py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-200 shadow-sm disabled:opacity-50 text-sm md:text-base'
              >
                {createBookingMutation.isLoading ? (
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
                    Processing...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </button>

              {createBookingMutation.isError && (
                <div className='mt-3 md:mt-4 p-2 md:p-3 bg-red-50 text-red-700 text-xs md:text-sm rounded-lg border border-red-100'>
                  {(() => {
                    const error = createBookingMutation.error as any;
                    return (
                      error?.response?.data?.message ||
                      'Booking failed. Please try again.'
                    );
                  })()}
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
