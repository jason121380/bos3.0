// http://localhost:3000/management/reservation/calendar

describe('Reservation calendar', () => {
  beforeEach(() => {
    cy.login('0916017308', '123456')

    cy.visit(`${Cypress.config().baseUrl}/management/reservation/calendar`)
    cy.url().should('eq', `${Cypress.config().baseUrl}/management/reservation/calendar`)
  })

  it('should goes to yesterday', () => {
    cy.get('[data-testid=yesterday]').click()
  })
  // it('should goes to tomorroe', () => {})

  // it('should jump to today', () => {})

  // it('should jump to jump to the date', () => {})

  // it('should close booking time', () => {})

  // it('should open booking time', () => {})

  // it('should add an order', () => {})
})
