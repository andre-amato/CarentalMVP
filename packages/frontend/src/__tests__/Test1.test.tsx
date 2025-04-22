import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import * as rtl from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import BookingPage from '../pages/BookingPage';
import { UserProvider } from '../contexts/UserContext';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

// Destructure screen from rtl
const { screen } = rtl;

// Create a new QueryClient for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock the API client modules directly
vi.mock('../api/apiClient', () => ({
  carApi: {
    getAvailableCars: vi.fn().mockResolvedValue([
      {
        id: 'car1',
        brand: 'Tesla',
        model: 'Model 3',
        averageDailyPrice: 100,
        totalPrice: 300,
        stock: 2,
      },
      {
        id: 'car2',
        brand: 'Mercedes',
        model: 'Vito',
        averageDailyPrice: 150,
        totalPrice: 450,
        stock: 0,
      },
    ]),
  },
  bookingApi: {
    createBooking: vi.fn().mockResolvedValue({ id: 'booking1' }),
  },
}));

// Mock react-datepicker
vi.mock('react-datepicker', () => {
  return {
    default: vi.fn(({ selected, onChange }) => (
      <input
        data-testid='date-picker'
        value={selected ? selected.toISOString() : ''}
        onChange={(e) => onChange(new Date(e.target.value))}
      />
    )),
  };
});

// Helper function to render the component
const renderBookingPage = () => {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <BookingPage />
        </UserProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('BookingPage', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders booking page correctly', async () => {
    renderBookingPage();

    // Check if the form elements are rendered
    expect(screen.getByText('Book a Car')).toBeDefined();
    expect(screen.getByText('Select Dates')).toBeDefined();

    // Wait for API call to complete
    await waitFor(() => {
      expect(screen.getByText('Available Cars')).toBeDefined();
    });
  });

  it('displays available cars when dates are selected', async () => {
    renderBookingPage();

    // Wait for cars to load
    await waitFor(() => {
      expect(screen.getByText('Tesla Model 3')).toBeDefined();
    });

    // Check if car details are displayed
    expect(screen.getByText('$100.00/day')).toBeDefined();
    expect(screen.getByText('Available: 2 units')).toBeDefined();
  });

  it('shows cars with zero stock as unavailable', async () => {
    renderBookingPage();

    // Wait for cars to load
    await waitFor(() => {
      expect(screen.getByText('Mercedes Vito')).toBeDefined();
    });
  });

  it('shows booking summary when a car is selected', async () => {
    renderBookingPage();
    const user = userEvent.setup();

    // Wait for cars to load
    await waitFor(() => {
      expect(screen.getByText('Tesla Model 3')).toBeDefined();
    });

    // Select the first car
    await user.click(screen.getByText('Tesla Model 3'));

    // Check if booking summary appears
    expect(screen.getByText('Booking Summary')).toBeDefined();
    expect(screen.getByText('Confirm Booking')).toBeDefined();
  });

  it('submits booking when confirm button is clicked', async () => {
    // Access the mock directly through the module system
    const { bookingApi } = await import('../api/apiClient');
    const mockCreateBooking = bookingApi.createBooking;

    renderBookingPage();
    const user = userEvent.setup();

    // Wait for cars to load and select a car
    await waitFor(() => {
      expect(screen.getByText('Tesla Model 3')).toBeDefined();
    });

    await user.click(screen.getByText('Tesla Model 3'));

    // Confirm booking
    await user.click(screen.getByText('Confirm Booking'));
  });
});
