describe('Delete payment', () => {
  beforeEach(() => {
    cy.login('0916017308', '123456')
  })

  it('should delete payment', () => {
    cy.visit(`${Cypress.config().baseUrl}/payments`)
    cy.url().should('eq', `${Cypress.config().baseUrl}/payments`)

    cy.get(`[data-testid=payment-selector-1]`).check()

    cy.get(`[data-testid=payment-selector-1]`).should('be.checked')

    cy.get('[data-testid=delete]').click()
  })
})
