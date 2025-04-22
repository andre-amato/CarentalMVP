describe('Account creation and car booking flow', () => {
  it('should create account and validate car booking information with specific dates', () => {
    // Set a larger viewport for better visibility
    cy.viewport(1200, 800);

    cy.visit('/');

    // Open the Create Account modal
    cy.contains('button', 'Create Account').click();

    // Type into the Full Name field
    cy.get('input#name').should('be.visible').type('US1 - TEST');

    // Type into the Email field (unique by id)
    cy.get('input#newEmail').should('be.visible').type('US1045786@test.com');

    // Type into the Driving License field - the ID in your component is newLicenseNumber
    cy.get('input#newLicenseNumber').should('be.visible').type('123456');

    // Set a future expiry date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 520);
    const dateStr = tomorrow.toISOString().split('T')[0];

    cy.get('input#expiryDate').should('be.visible').type(dateStr);

    // Submit the form - this should be the button within the modal form
    cy.get('form').contains('button', 'Create Account').click();
    cy.get('form').contains('button', 'Login').click();

    cy.contains('My Dashboard').should('be.visible');

    // Navigate to Book a Car page
    cy.contains('button', 'Book a Car').click();

    // Verify date selection section
    cy.contains('Select Dates').should('be.visible');

    // Pick-up date - find the first datepicker input
    cy.contains('Pick-up Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('12/31/2026{enter}');

    // Drop-off date - find the second datepicker input
    cy.contains('Drop-off Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('01/01/2027{enter}');

    // Wait for the API to refresh prices
    cy.wait(1000);

    // Verify booking duration is displayed for 1 day
    cy.contains('Booking Duration:').should('be.visible');
    cy.contains('1 day').should('be.visible');

    // Verify the updated prices based on the backend data

    // Check Toyota Yaris
    cy.contains('Toyota Yaris').scrollIntoView();
    cy.wait(800);
    cy.contains('Toyota Yaris').should('be.visible');
    cy.contains('$53.65/day').should('be.visible');
    cy.contains('$53.65').should('be.visible');

    // Check Seat Ibiza
    cy.contains('Seat').scrollIntoView();
    cy.wait(800);
    cy.contains('Seat').should('be.visible');
    cy.contains('$46.85/day').should('be.visible');
    cy.contains('$46.85').should('be.visible');

    // Check Nissan Qashqai
    cy.contains('Nissan Qashqai').scrollIntoView();
    cy.wait(800);
    cy.contains('Nissan Qashqai').should('be.visible');
    cy.contains('$59.87/day').should('be.visible');
    cy.contains('$59.87').should('be.visible');

    // Check Jaguar e-pace
    cy.contains('Jaguar').scrollIntoView();
    cy.wait(800);
    cy.contains('Jaguar').should('be.visible');
    cy.contains('$70.27/day').should('be.visible');
    cy.contains('$70.27').should('be.visible');

    // Check Mercedes Vito
    cy.contains('Vito').scrollIntoView();
    cy.wait(800);
    cy.contains('Vito').should('be.visible');
    cy.contains('$64.97/day').should('be.visible');
    cy.contains('$64.97').should('be.visible');

    // Verify availability information
    cy.contains('Available: 3 units').should('be.visible');
    cy.contains('Available: 5 units').should('be.visible');
    cy.contains('Available: 2 units').should('be.visible');
    cy.contains('Available: 1 unit').should('be.visible');
  });
});
