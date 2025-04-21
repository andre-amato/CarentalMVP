import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { UserProvider } from '../contexts/UserContext';
import React from 'react';

// Mock the API client
vi.mock('../api/apiClient', () => ({
  userApi: {
    createUser: vi.fn().mockResolvedValue({ userId: 'mock-user-id' }),
    getAllUsers: vi.fn().mockResolvedValue([]),
  },
}));

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
  it('renders login form correctly', () => {
    renderLoginPage();

    // Check if the form elements are rendered
    expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Driving License Number/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('opens registration modal when "Create Account" is clicked', () => {
    renderLoginPage();

    // Click on create account button
    fireEvent.click(screen.getByText('Create Account'));

    // Check if the modal is open
    expect(screen.getByText('Create New Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/License Expiry Date/i)).toBeInTheDocument();
  });

  it('closes registration modal when "Cancel" is clicked', () => {
    renderLoginPage();

    // Open modal
    fireEvent.click(screen.getByText('Create Account'));

    // Click cancel button
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // Check if the modal is closed
    expect(screen.queryByText('Create New Account')).not.toBeInTheDocument();
  });
});
