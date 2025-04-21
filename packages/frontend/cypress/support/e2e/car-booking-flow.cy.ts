// cypress/e2e/car-booking-flow.cy.ts
describe('Car Rental Booking Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test to start fresh
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should allow user to login, book a car, and manage bookings', () => {
    // Login with a seeded user account
    cy.get('#email').type('john@example.com');
    cy.get('#licenseNumber').type('ABC123');
    cy.get('button[type="submit"]').click();

    // Verify we're on the dashboard page
    cy.url().should('include', '/dashboard');
    cy.contains('Good morning, John Doe');

    // Navigate to booking page
    cy.contains('Book a Car').click();
    cy.url().should('include', '/book');

    // Select dates
    const today = new Date();
    const startDate = today.getDate() + 2; // Start date is 2 days from today
    const endDate = today.getDate() + 5; // End date is 5 days from today

    // Set date range
    cy.get('input[placeholder="Pick-up Date"]').click();
    cy.get(`.react-datepicker__day--0${startDate}`).click();

    cy.get('input[placeholder="Drop-off Date"]').click();
    cy.get(`.react-datepicker__day--0${endDate}`).click();

    // Wait for car list to load
    cy.contains('Available Cars').should('be.visible');

    // Select first available car
    cy.get('[data-testid="car-option"]').first().click();

    // Confirm booking
    cy.contains('Confirm Booking').click();

    // Should redirect to dashboard with success message
    cy.url().should('include', '/dashboard');
    cy.contains('Booking Confirmed').should('be.visible');

    // Navigate to manage bookings
    cy.contains('Manage Bookings').click();
    cy.url().should('include', '/bookings');

    // Verify booking appears in the list
    cy.contains('Upcoming Bookings').should('be.visible');
    cy.get('[data-testid="booking-card"]').should('have.length.at.least', 1);

    // Cancel the booking
    cy.get('[data-testid="cancel-booking-btn"]').first().click();
    cy.contains('Cancel Booking').should('be.visible');
    cy.contains('Yes, Cancel Booking').click();

    // Verify booking was cancelled
    cy.contains('Booking cancelled successfully').should('be.visible');
  });

  it('should allow user to create a new account', () => {
    // Open registration modal
    cy.contains('Create Account').click();

    // Fill in registration form
    cy.get('#name').type('Test User');
    cy.get('#newEmail').type('test@example.com');
    cy.get('#newLicenseNumber').type('TEST123');

    // Set expiry date to one year from now
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const formattedDate = nextYear.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    cy.get('#expiryDate').type(formattedDate);

    // Submit form
    cy.contains('Create Account').click();

    // Login with new account
    cy.get('#email').should('have.value', 'test@example.com');
    cy.get('#licenseNumber').should('have.value', 'TEST123');
    cy.get('button[type="submit"]').click();

    // Verify we're on the dashboard page
    cy.url().should('include', '/dashboard');
    cy.contains('Good morning, Test User');
  });
});
