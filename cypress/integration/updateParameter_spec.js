describe('Update parameter page', () => {
  beforeEach(() => {
    cy.login('0916017308', '123456')
  })

  // it('Update parameter', () => {
  //   cy.visit(`${Cypress.config().baseUrl}/parameter`)
  //   cy.url().should('eq', `${Cypress.config().baseUrl}/parameter`)

  //   cy.get('[data-testid="percentage"] input').should('not.empty')
  //   cy.get('[data-testid="percentage"] input').focus().type('1').type('{enter}')
  //   cy.contains('1')
  //     .invoke('text')
  //     .then(text => {
  //       expect(text).equal('1')
  //     })

  //   cy.get('[data-testid="percentage"] input').focus().type('{backspace}')
  //   cy.contains('材料').should('exist')

  //   cy.get('[data-testid="price"] input').focus().type('100').type('{enter}')
  //   cy.contains('100')
  //     .invoke('text')
  //     .then(text => {
  //       expect(text).equal('100')
  //     })
  //   cy.get('[data-testid="price"] input').focus().type('{backspace}')
  //   cy.contains('100').should('not.exist')

  //   cy.get('[data-testid="commission"] input').focus().type('全抽').type('{enter}')
  //   cy.contains('全抽')
  //     .invoke('text')
  //     .then(text => {
  //       expect(text).equal('全抽')
  //     })
  //   cy.get('[data-testid="commission"] input').focus().type('{backspace}')
  //   cy.contains('全抽').should('not.exist')

  //   const labels = [
  //     'designer',
  //     'assiant',
  //     'partTime',
  //     'student',
  //     'manicurist',
  //     'accounting',
  //     'manager',
  //     'storeManager',
  //     'assistantManager',
  //     'director',
  //   ]
  //   labels.forEach(label => {
  //     cy.get(`[data-testid=${label}]`)
  //       .type('{selectall}')
  //       .type('100')
  //       .type('{backspace}{backspace}{backspace}')
  //       .invoke('val')
  //       .then(val => {
  //         expect(val).equal('0')
  //       })
  //   })

  //   cy.get('[data-testid=parameter]').click()
  // })
})
