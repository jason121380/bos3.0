describe('Edit payment', () => {
  beforeEach(() => {
    cy.login('0916017308', '123456')
  })

  it('should updated payment', () => {
    cy.visit(`${Cypress.config().baseUrl}/payments`)
    cy.url().should('eq', `${Cypress.config().baseUrl}/payments`)

    cy.get('[data-testid="payment-edit-1"]').click()

    cy.url().should($url => {
      expect($url).to.have.string(`${Cypress.config().baseUrl}/payment/edit`)
    })

    cy.contains('名稱').invoke('text').should('eq', '名稱')

    cy.get('[data-testid=name]').invoke('val').should('not.empty')

    cy.get('[data-testid=name]').type('{selectall}').type('123').invoke('val').should('eq', '123')

    cy.get('[data-testid="fee-category"]').select('百分比(%)')
    cy.contains('百分比(%)')
      .invoke('text')
      .then(text => {
        expect(text).equal('百分比(%)')
      })

    cy.get('[data-testid="fee-百分比(%)"').invoke('val').should('not.empty')

    cy.get('[data-testid="fee-百分比(%)"')
      .type('{selectall}')
      .type('123')
      .invoke('val')
      .should('not.empty')

    cy.get('[data-testid=payment-deductions]').select('業績')

    cy.contains('業績').invoke('text').should('eq', '業績')

    cy.get('[data-testid="update-payment"]').click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/payments`)
  })
})
