describe('template spec', () => {
  it('Create List From Nav', () => {
    cy.visit('/')
    const randomNumber = Math.floor(Math.random() * 1000)
    const listName = 'testlist' + randomNumber
    
    cy.get('[data-cy="username"]').type('greg2')
    cy.get('[data-cy="password"]').type('test')
    cy.get('[data-cy="login-btn"]').click()

    cy.wait(5000)
    
    cy.get('[data-cy="create-list-btn"]').click()
    
    cy.get('#list-name').type(listName)
    cy.get('#create-list').click()

    expect(cy.get(`#${listName}`).should('exist'))
  })
})