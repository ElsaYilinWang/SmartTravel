describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should allow user to sign up', () => {
    cy.get('[data-testid="signup-link"]').click();
    cy.url().should('include', '/signup');

    cy.get('[data-testid="name-input"]').type('Test User');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="signup-form"]').submit();

    // Should redirect to dashboard after successful signup
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-name"]').should('contain', 'Test User');
  });

  it('should allow user to log in', () => {
    cy.get('[data-testid="login-link"]').click();
    cy.url().should('include', '/login');

    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-form"]').submit();

    // Should redirect to dashboard after successful login
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-name"]').should('contain', 'Test User');
  });

  it('should show error message for invalid login', () => {
    cy.get('[data-testid="login-link"]').click();
    
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-form"]').submit();

    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });
});
