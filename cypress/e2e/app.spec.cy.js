describe('App', () => {
  it('should visit homepage', () => {
    // expect the title be TickUp:Home
    cy.visit('/')
      .title()
      .should('eq', 'TickUp:Home');
  });
});
