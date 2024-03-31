describe('List CRUD', () => {

  const randomNumber = Math.floor(Math.random() * 1000)
  const listName = 'testlist' + randomNumber

  it('should create a list', () => {
    cy.visit('/')
    cy.get('[data-cy="username"]').type('greg2')
    cy.get('[data-cy="password"]').type('test')
    cy.get('[data-cy="login-btn"]').click()

    cy.wait(5000)
    
    cy.get('[data-cy="create-list-btn"]').click()
    
    cy.get('#list-name').type(listName)
    cy.get('#create-list').click()

    expect(cy.get(`#${listName}`).should('exist'))
  })

  it('should get a list', () => {
    
    cy.visit('/')
    cy.get('[data-cy="username"]').type('greg2')
    cy.get('[data-cy="password"]').type('test')
    cy.get('[data-cy="login-btn"]').click()

    cy.wait(2000)
    cy.get(`#${listName}`).click()

    cy.wait(1000)

    cy.get('#list-title').should('have.text', listName)
  });

  it('should edit a list title from nav', () => {
    const newTitle = 'newTitle' + randomNumber
    cy.visit('/')
    cy.get('[data-cy="username"]').type('greg2')
    cy.get('[data-cy="password"]').type('test')
    cy.get('[data-cy="login-btn"]').click()

    cy.wait(2000)
    cy.get(`[data-cp="option-btn-${listName}"]`).click()

    cy.get('[data-cp="option-menu-Rename"]').click()

    cy.focused().clear().type(newTitle)

    cy.focused().blur()

    cy.get(`#${newTitle}`).should('have.text', newTitle)

    // TODO asset response body has new title
  });

  // it('should delete a list', () => {
  //   // TODO - delete a list

  //       cy.visit('/')
  //   cy.get('[data-cy="username"]').type('greg2')
  //   cy.get('[data-cy="password"]').type('test')
  //   cy.get('[data-cy="login-btn"]').click()
  // });

  
})