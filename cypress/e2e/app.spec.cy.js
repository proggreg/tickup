// eslint-disable-next-line no-undef
describe('App', () => {

  const randomNumber = Math.floor(Math.random() * 1000);
  const listName = 'NewList' + randomNumber

  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-cy="username"]').type('greg5')
    cy.get('[data-cy="password"]').type('stupido1')
    cy.get('[data-cy="login-button"]').click()
  })
  
  // it('should visit homepage', () => {
  //   // expect the title be TickUp:Home
  //   cy.visit('/')
  //     .title()
  //     .should('eq', 'TickUp:Home');
  // });

  it('should login', () => {
    // expect the title be TickUp:Login
    // cy.visit('/login')

    // cy.get('[data-cy="username"]').type('greg5')
    // cy.get('[data-cy="password"]').type('stupido1')
    // cy.get('[data-cy="login-button"]').click()
    cy.get('[data-cy="sign-out-button"]').should('be.visible')
  });

  it('should create a new list', () => {
    cy.get('[data-cy="new-list-button"]').click()
    cy.get('[data-cy="new-list-input"]').type(listName)
    cy.get('[data-cy="create-list-button"]').click()
    cy.get(`[data-cy="list-item-${listName}"]`).should('exist')
  })

  it('should delete a list', () => {
    cy.get(`[data-cy="list-item-${listName}"]`).should('exist')
    cy.get(`[data-cy="list-options-${listName}"]`).click()
    cy.get(`[data-cy="list-option-Delete"]`).click()
    // cy.get(`[data-cy="delete-list-${listName}"]`).click()
    cy.get(`[data-cy="list-item-${listName}"]`).should('not.exist')
  })
});
