import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

import * as rtl from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { UserProvider } from '../contexts/UserContext';
import React from 'react';

const { screen } = rtl;

// Mock the API client
vi.mock('../api/apiClient', () => ({
  userApi: {
    createUser: vi.fn().mockResolvedValue({ userId: 'mock-user-id' }),
    getAllUsers: vi.fn().mockResolvedValue([]),
  },
}));

// Helper function to render the component
const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <UserProvider>
        <LoginPage />
      </UserProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderLoginPage();

    // Check if the form elements are rendered
    expect(screen.getByText('Login to Your Account')).toBeDefined();
    expect(screen.getByLabelText(/E-mail/i)).toBeDefined();
    expect(screen.getByLabelText(/Driving License Number/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Login/i })).toBeDefined();
  });

  it('opens registration modal when "Create Account" is clicked', async () => {
    renderLoginPage();
    const user = userEvent.setup();

    // Click on create account button
    await user.click(screen.getByText('Create Account'));

    // Check if the modal is open
    expect(screen.getByText('Create New Account')).toBeDefined();
    expect(screen.getByLabelText(/Full Name/i)).toBeDefined();
    expect(screen.getByLabelText(/License Expiry Date/i)).toBeDefined();
  });

  it('closes registration modal when "Cancel" is clicked', async () => {
    renderLoginPage();
    const user = userEvent.setup();

    // Open modal
    await user.click(screen.getByText('Create Account'));

    // Click cancel button
    await user.click(screen.getByRole('button', { name: /Cancel/i }));

    // Check if the modal is closed
    expect(screen.queryByText('Create New Account')).toBeNull();
  });
});
