describe('The booking page', () => {
  beforeEach(() => {
    cy.visit(
      'http://localhost:3000/customer/reservation/23a222fb-9d9b-4434-89d2-35e05fe5e5b9?usingLineLogin=0'
    )
  })
  it('type booking information ', () => {})

  describe('Assigned booking action without friend', () => {
    it('select assigned designer', () => {
      cy.get('[data-testid=calendar]').type(
        '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}12/15/2020'
      )
      cy.get('[data-testid=calendar]').should('have.value', '12/15/2020')
      cy.get('[data-testid=designer-assigned]').click()
      cy.get('[data-testid=designer-name]').select('Qoo 1221')
      cy.get('[data-testid=service-time]').select('10:00')
      cy.get('[data-testid=service-time]').should('have.value', '10:00')
      cy.get('[data-testid=reference]').select('其他').should('have.value', '其他')
      cy.get('[data-testid=customer-name-0]').type('JoJo').should('have.value', 'JoJo')
      cy.get('[data-testid=customer-cellphone-0]')
        .type('0987654321')
        .should('have.value', '0987654321')
      cy.get('[data-testid=add-friend]').click()
      cy.get('[data-testid=remove-friend]').click()
      cy.get('[data-testid=booking-submit]').click({ force: true })
    })
  })
  describe('Not assigned booking action without friend', () => {
    it('not select designer', () => {
      cy.get('[data-testid=calendar]').type(
        '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}12/15/2020'
      )
      cy.get('[data-testid=designer-not-assigned]').click()
      cy.get('[data-testid=service-time]').select('10:00')
      cy.get('[data-testid=service-time]').should('have.value', '10:00')
      cy.get('[data-testid=reference]').select('其他').should('have.value', '其他')
      cy.get('[data-testid=customer-name-0]').type('Dio').should('have.value', 'Dio')
      cy.get('[data-testid=customer-cellphone-0]')
        .type('0912345678')
        .should('have.value', '0912345678')
      cy.get('[data-testid=booking-category-0]')
        .select('剪（測）')
        .should('have.value', '80255b56-5172-4cb1-ba59-acc85c387d23')
      cy.get('[data-testid=add-friend]').click()
      cy.get('[data-testid=remove-friend]').click()
      cy.get('[data-testid=booking-submit]').click({ force: true })
    })
  })
  describe('Assigned booking action with friend', () => {
    it('select assigned designer', () => {
      cy.get('[data-testid=calendar]').type(
        '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}12/15/2020'
      )
      cy.get('[data-testid=designer-assigned]').click()
      cy.get('[data-testid=designer-name]').select('Qoo 1221')
      cy.get('[data-testid=service-time]').select('10:00')
      cy.get('[data-testid=service-time]').should('have.value', '10:00')
      cy.get('[data-testid=reference]').select('其他').should('have.value', '其他')
      cy.get('[data-testid=customer-name-0]').type('JoJo').should('have.value', 'JoJo')
      cy.get('[data-testid=customer-cellphone-0]')
        .type('0987654321')
        .should('have.value', '0987654321')
      cy.get('[data-testid=add-friend]').click()
      cy.get('[data-testid=customer-name-1]').type('JoJo2').should('have.value', 'JoJo2')
      cy.get('[data-testid=customer-cellphone-1]')
        .type('0977888653')
        .should('have.value', '0977888653')
      cy.get('[data-testid=booking-submit]').click({ force: true })
    })
  })
  describe('Not assigned booking action with friend', () => {
    it('not select designer', () => {
      cy.get('[data-testid=calendar]').type(
        '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}12/15/2020'
      )
      cy.get('[data-testid=designer-not-assigned]').click()
      cy.get('[data-testid=service-time]').select('10:00')
      cy.get('[data-testid=service-time]').should('have.value', '10:00')
      cy.get('[data-testid=reference]').select('其他').should('have.value', '其他')
      cy.get('[data-testid=customer-name-0]').type('Dio').should('have.value', 'Dio')
      cy.get('[data-testid=customer-cellphone-0]')
        .type('0912345678')
        .should('have.value', '0912345678')
      cy.get('[data-testid=booking-category-0]')
        .select('剪（測）')
        .should('have.value', '80255b56-5172-4cb1-ba59-acc85c387d23')
      cy.get('[data-testid=add-friend]').click()
      cy.get('[data-testid=customer-name-1]').type('Dio2').should('have.value', 'Dio2')
      cy.get('[data-testid=customer-cellphone-1]')
        .type('0977888653')
        .should('have.value', '0977888653')
      cy.get('[data-testid=booking-category-1]')
        .select('剪（測）')
        .should('have.value', '80255b56-5172-4cb1-ba59-acc85c387d23')
      cy.get('[data-testid=booking-submit]').click({ force: true })
    })
  })
})
