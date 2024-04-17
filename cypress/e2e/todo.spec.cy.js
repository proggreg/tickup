describe('Todos CRUD', () => {

  const randomNumber = Math.floor(Math.random() * 1000);
  const todoName = 'NewTodo' + randomNumber
  beforeEach(() => {
    cy.login('greg5', 'stupido1')
  })
  it('should create a new todo', () => {
    cy.get('[data-cy="new-todo-input"]').type(todoName).type('{enter}')
    cy.get(`[data-cy="todo-name-${todoName}"]`).should('eq', todoName)
  })
  it('should edit the status of a todo', () => {
    cy.get('[data-cy="status-button"]').first().click()
    cy.get('[data-cy="todo-name"]').contains(todoName)
    cy.get('[data-cy="In Progress"]').click()
  })
  // it('should delete a todo', () => {})
  // it('should mark a todo as complete', () => {})
})