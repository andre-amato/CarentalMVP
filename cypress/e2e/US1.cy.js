describe('US1 - As a customer I want to see the availability of cars on concrete time slots So I can be informed of pricing and stock', () => {
  it('should create account and validate car booking information with specific dates', () => {
    // Set a larger viewport for better visibility
    cy.viewport(1200, 800);

    cy.visit('/');

    // Open the Create Account modal
    cy.contains('button', 'Create Account').click();

    // Type into the Full Name field
    cy.get('input#name').should('be.visible').type('US1 - TEST');

    // Type into the Email field (unique by id)
    cy.get('input#newEmail').should('be.visible').type('US1@test.com');

    // Type into the Driving License field - the ID in your component is newLicenseNumber
    cy.get('input#newLicenseNumber').should('be.visible').type('123456');

    // Set a future expiry date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 6000);
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

    // First date check - Check with the current dates and their values
    cy.contains('Available Cars').should('be.visible');

    // Second date check - June 2028
    // Scroll back to the top
    cy.contains('Select Dates').scrollIntoView();
    cy.wait(800);

    // Pick-up date - find the first datepicker input
    cy.contains('Pick-up Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('06/01/2028{enter}');

    // Drop-off date - find the second datepicker input
    cy.contains('Drop-off Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('06/05/2028{enter}');

    // Wait for the API to refresh prices
    cy.wait(2000);

    // Verify booking duration is displayed for 4 days
    cy.contains('Booking Duration:').should('be.visible');
    cy.contains('4 days').should('be.visible');

    // Check the updated prices for the new date range
    cy.contains('Toyota Yaris').scrollIntoView();
    cy.wait(800);
    cy.contains('Toyota Yaris').should('be.visible');
    cy.contains('$98.43/day').should('be.visible');
    cy.contains('$393.72').should('be.visible');

    cy.contains('Seat').scrollIntoView();
    cy.wait(800);
    cy.contains('Seat').should('be.visible');
    cy.contains('$85.12/day').should('be.visible');
    cy.contains('$340.48').should('be.visible');

    cy.contains('Nissan Qashqai').scrollIntoView();
    cy.wait(800);
    cy.contains('Nissan Qashqai').should('be.visible');
    cy.contains('$101.46/day').should('be.visible');
    cy.contains('$405.84').should('be.visible');

    cy.contains('Jaguar').scrollIntoView();
    cy.wait(800);
    cy.contains('Jaguar').should('be.visible');
    cy.contains('$120.54/day').should('be.visible');
    cy.contains('$482.16').should('be.visible');

    cy.contains('Vito').scrollIntoView();
    cy.wait(800);
    cy.contains('Vito').should('be.visible');
    cy.contains('$109.16/day').should('be.visible');
    cy.contains('$436.64').should('be.visible');

    // Third date check - September 2028 to September 2029
    // Scroll back to the top
    cy.contains('Select Dates').scrollIntoView();
    cy.wait(800);

    // Pick-up date - September 20, 2028
    cy.contains('Pick-up Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('09/20/2028{enter}');

    // Drop-off date - September 25, 2028
    cy.contains('Drop-off Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('09/25/2028{enter}');

    // Wait for the API to refresh prices
    cy.wait(2000);

    // Verify booking duration is displayed for 5 days
    cy.contains('Booking Duration:').should('be.visible');
    cy.contains('5 days').should('be.visible');

    // Check the updated prices for the new date range
    cy.contains('Toyota Yaris').scrollIntoView();
    cy.wait(800);
    cy.contains('Toyota Yaris').should('be.visible');
    cy.contains('$76.89/day').should('be.visible');
    cy.contains('$384.45').should('be.visible');

    cy.contains('Seat').scrollIntoView();
    cy.wait(800);
    cy.contains('Seat').should('be.visible');
    cy.contains('$65.73/day').should('be.visible');
    cy.contains('$328.65').should('be.visible');

    cy.contains('Nissan Qashqai').scrollIntoView();
    cy.wait(800);
    cy.contains('Nissan Qashqai').should('be.visible');
    cy.contains('$82.94/day').should('be.visible');
    cy.contains('$414.70').should('be.visible');

    cy.contains('Jaguar').scrollIntoView();
    cy.wait(800);
    cy.contains('Jaguar').should('be.visible');
    cy.contains('$91.35/day').should('be.visible');
    cy.contains('$456.75').should('be.visible');

    cy.contains('Vito').scrollIntoView();
    cy.wait(800);
    cy.contains('Vito').should('be.visible');
    cy.contains('$89.64/day').should('be.visible');
    cy.contains('$448.20').should('be.visible');

    // Fourth date check - Transitioning season date range (September 15-19, 2028)
    // Scroll back to the top
    cy.contains('Select Dates').scrollIntoView();
    cy.wait(800);

    // Pick-up date - September 15, 2028
    cy.contains('Pick-up Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('09/15/2028{enter}');

    // Drop-off date - September 19, 2028
    cy.contains('Drop-off Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('09/19/2028{enter}');

    // Wait for the API to refresh prices
    cy.wait(2000);

    // Verify booking duration is displayed for 4 days
    cy.contains('Booking Duration:').should('be.visible');
    cy.contains('4 days').should('be.visible');

    // Check the updated prices for the transitioning season date range
    cy.contains('Toyota Yaris').scrollIntoView();
    cy.wait(800);
    cy.contains('Toyota Yaris').should('be.visible');
    cy.contains('$82.27/day').should('be.visible');
    cy.contains('$329.10').should('be.visible');

    cy.contains('Seat').scrollIntoView();
    cy.wait(800);
    cy.contains('Seat').should('be.visible');
    cy.contains('$70.58/day').should('be.visible');
    cy.contains('$282.31').should('be.visible');

    cy.contains('Nissan Qashqai').scrollIntoView();
    cy.wait(800);
    cy.contains('Nissan Qashqai').should('be.visible');
    cy.contains('$87.57/day').should('be.visible');
    cy.contains('$350.28').should('be.visible');

    cy.contains('Jaguar').scrollIntoView();
    cy.wait(800);
    cy.contains('Jaguar').should('be.visible');
    cy.contains('$98.65/day').should('be.visible');
    cy.contains('$394.59').should('be.visible');

    cy.contains('Vito').scrollIntoView();
    cy.wait(800);
    cy.contains('Vito').should('be.visible');
    cy.contains('$94.52/day').should('be.visible');
    cy.contains('$378.08').should('be.visible');

    // Verify availability information is still correct
    cy.contains('Available: 3 units').should('be.visible');
    cy.contains('Available: 5 units').should('be.visible');
    cy.contains('Available: 2 units').should('be.visible');
    cy.contains('Available: 1 unit').should('be.visible');

    //Check availability of all cars in that date
    cy.contains('Jaguar').click();
    cy.contains('button', 'Confirm Booking').click();
    cy.contains('button', 'Book Another Car').click();

    // Pick-up date - September 15, 2028
    cy.contains('Pick-up Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('09/15/2028{enter}');

    // Drop-off date - September 19, 2028
    cy.contains('Drop-off Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('09/19/2028{enter}');

    // Verify availability information is still correct
    cy.contains('Available: 3 units').should('be.visible');
    cy.contains('Available: 5 units').should('be.visible');
    cy.contains('Available: 2 units').should('be.visible');
    cy.contains('Available: 0 unit').should('be.visible');
  });
});
