describe('US2 - Create a booking for a car, checking availability and drive license date', () => {
  it('should create account and validate car booking information with specific dates', () => {
    // Set a larger viewport for better visibility
    cy.viewport(1200, 800);

    cy.visit('/');

    // Open the Create Account modal
    cy.contains('button', 'Create Account').click();

    // Type into the Full Name field
    cy.get('input#name').should('be.visible').type('US2 - TEST');

    // Type into the Email field (unique by id)
    cy.get('input#newEmail').should('be.visible').type('US2@test.com');

    // Type into the Driving License field - the ID in your component is newLicenseNumber
    cy.get('input#newLicenseNumber').should('be.visible').type('123456');

    cy.get('input#expiryDate').should('be.visible').type('2030-12-01');
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

    // Second date check - June 2030
    // Scroll back to the top
    cy.contains('Select Dates').scrollIntoView();
    cy.wait(800);

    // Pick-up date - September 15, 2030
    cy.contains('Pick-up Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('09/15/2030{enter}');

    // Drop-off date - September 19, 2030
    cy.contains('Drop-off Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('09/19/2030{enter}');

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

    // Pick-up date - September 16, 2030
    cy.contains('Pick-up Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('09/16/2030{enter}');

    // Drop-off date - September 17, 2030
    cy.contains('Drop-off Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('09/17/2030{enter}');

    // Verify availability information is still correct
    cy.contains('Available: 3 units').should('be.visible');
    cy.contains('Available: 5 units').should('be.visible');
    cy.contains('Available: 2 units').should('be.visible');
    cy.contains('Available: 0 unit').should('be.visible');

    //Check if a driver can have other booking in the same periodof all cars in that date
    cy.contains('Vito').click();
    cy.contains('button', 'Confirm Booking').click();
    cy.contains('User already has a booking for this date range').should(
      'be.visible'
    );

    cy.reload();
    // Test license expiry date
    cy.contains('Pick-up Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('11/29/2030{enter}');

    cy.contains('Drop-off Date')
      .parent()
      .find('input')
      .should('be.visible')
      .clear()
      .type('12/15/2030{enter}');

    cy.contains('Vito').click();
    cy.contains('button', 'Confirm Booking').click();
    cy.contains(
      'Driving license must be valid for the entire booking period'
    ).should('be.visible');
  });
});
