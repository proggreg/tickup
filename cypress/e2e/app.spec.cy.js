// eslint-disable-next-line no-undef


describe('App', () => {

  const randomNumber = Math.floor(Math.random() * 1000);
  const listName = 'NewList' + randomNumber

  beforeEach(() => {
    cy.login('greg5', 'stupido1')
    
  })
  

  // it('should login', () => {
  //   cy.get('[data-cy="sign-out-button"]').should('be.visible')
  // });

  it('should create a new list', () => {
    cy.get('[data-cy="new-list-button"]').click()
    cy.get('[data-cy="new-list-input"]').type(listName)
    cy.get('[data-cy="create-list-button"]').click()
    cy.get(`[data-cy="list-item-${listName}"]`).should('exist')
    cy.log('created list:', listName)
  })

  it('should delete a list', () => {
    cy.get(`[data-cy="list-item-${listName}"]`).should('exist')
    cy.get(`[data-cy="list-options-${listName}"]`).click()
    cy.get(`[data-cy="list-option-Delete"]`).click() 
    cy.wait(2000)
    // TODO - fix this
    cy.get('[data-cy="snackbar"]').then(() => {
      debugger
    }).should('text', 'List deleted')
    cy.get(`[data-cy="list-item-${listName}"]`).should('not.exist')
    // cy.get(`[data-cy="list-item-${listName}"]`).should('not.throw')
    cy.log('deleted list:', listName)
  })
});
