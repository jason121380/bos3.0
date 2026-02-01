// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

// -- This is a parent command --
Cypress.Commands.add('login', (cellphone, password) => {
  cy.visit(`${Cypress.config().baseUrl}/auth/login`)
  cy.get('[data-testid=cellphone]').type(cellphone).should('have.value', cellphone)
  cy.get('[data-testid=password]').type(password).should('have.value', password)
  cy.get('[data-testid=login-btn]').click()
  cy.url().should('eq', `${Cypress.config().baseUrl}/order/create`)
})

Cypress.Commands.add('dateRange', ({ start, end }) => {
  const startDataMonth = start.split('/')[0]
  const starteDatYear = start.split('/')[2]
  cy.get('[data-testid="startDate"]').click()
  cy.get(
    '.MuiPickersBasePicker-container > .MuiToolbar-root > button:nth-child(1) > .MuiButton-label > .MuiTypography-root'
  ).click()
  cy.get('.MuiPickersYearSelection-container > .MuiPickersYear-root')
    .contains(starteDatYear)
    .click()
  cy.contains(`${startDataMonth}月`).click()
  cy.get(
    ':nth-child(2) > :nth-child(4) > .MuiButtonBase-root > .MuiIconButton-label > .MuiTypography-root'
  ).click()
  cy.get('.MuiDialogActions-root').contains('確認').click()

  cy.get('[data-testid="startDate"]')
    .invoke('text')
    .then(text => {
      expect(text).equal(start)
    })

  const endDataMonth = start.split('/')[0]
  const endDateYear = start.split('/')[2]

  cy.get('[data-testid="endDate"]').click()
  cy.get(
    '.MuiPickersBasePicker-container > .MuiToolbar-root > button:nth-child(1) > .MuiButton-label > .MuiTypography-root'
  ).click()
  cy.get('.MuiPickersYearSelection-container > .MuiPickersYear-root').contains(endDateYear).click()
  cy.contains(`${endDataMonth}月`).click()
  cy.get(
    ':nth-child(2) > :nth-child(4) > .MuiButtonBase-root > .MuiIconButton-label > .MuiTypography-root'
  ).click()
  cy.get('.MuiDialogActions-root').contains('確認').click()
  cy.get('[data-testid="endDate"]')
    .invoke('text')
    .then(text => {
      expect(text).equal(end)
    })
})
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
