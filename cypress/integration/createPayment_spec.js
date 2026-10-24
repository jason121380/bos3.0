describe('Creaate payment', () => {
  beforeEach(() => {
    cy.login('0916017308', '123456')
  })

  it('created payment', () => {
    cy.visit(`${Cypress.config().baseUrl}/payment/create`)
    cy.url().should('eq', `${Cypress.config().baseUrl}/payment/create`)

    cy.get('[data-testid=name]')
      .type('LINEPAY')
      .invoke('val')
      .then(val => {
        expect(val).equal('LINEPAY')
      })
    cy.get('[data-testid="fee-category"]').click()
    cy.contains('[role="option"]', '固定金額').click()
    cy.contains('固定金額')
      .invoke('text')
      .then(text => {
        expect(text).equal('固定金額')
      })

    cy.get('[data-testid="fee-固定金額"')
      .type('999')
      .invoke('val')
      .then(val => {
        expect(val).equal('999')
      })

    cy.get('[data-testid=payment-deductions]').click()
    cy.contains('[role="option"]', '薪水').click()

    cy.contains('薪水')
      .invoke('text')
      .then(text => {
        expect(text).equal('薪水')
      })

    cy.get('[data-testid=create-payment]').click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/payments`)
  })
})
