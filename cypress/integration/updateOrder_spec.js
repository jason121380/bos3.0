describe('Edit order page', () => {
  beforeEach(() => {
    cy.login('0916017308', '123456')
  })

  describe('Edit Order', () => {
    it('should update order successfully', () => {
      cy.url().should('eq', `${Cypress.config().baseUrl}/order/create`)
      cy.visit(`${Cypress.config().baseUrl}/management/orders`)

      // Select start date on 12/09/2020
      cy.dateRange({
        start: '12/09/2020',
        end: '12/09/2020',
      })

      // go to order
      cy.get('[data-testid="order-0"]').click()
      cy.get('[data-testid=customer] input ').invoke('val').should('not.empty')

      // edit order
      cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click()
      cy.get(':nth-child(1) > .MuiButtonBase-root > .MuiButton-label > .MuiTypography-root').click()
      cy.get(':nth-child(121)').contains('2020').click()
      cy.get('.MuiPickersMonthSelection-container > :nth-child(12)').contains('12月').click()
      cy.get(':nth-child(2) > :nth-child(5) > .MuiButtonBase-root').click()
      cy.get('.MuiDialogActions-root > :nth-child(2)').click()
      cy.get('[data-input-testid=bill-date]')
        .invoke('val')
        .then(val => {
          const newVal = val.substr(0, 10)
          expect(newVal).equal('2020/12/10')
        })
      // ========= Lock date ================
      // 打帳單鎖定日期隱藏 先註解防止測試錯誤
      // cy.get('[data-testid=lock-date]').click().check()

      // ========= Update customer ================

      cy.get('[data-testid=customer]').type('0977766666')
      cy.get(
        '[data-testid=customer] > .MuiAutocomplete-endAdornment > .MuiAutocomplete-clearIndicator'
      ).click()
      cy.get('[data-testid=customer]').type('0977766666')

      cy.get('[data-testid=f]', { timeout: 10000 }).click()
      cy.get('[data-testid=customer] input')
        .invoke('val')
        .then(val => {
          expect(val).equal('f/0977766666')
        })

      // ========= Assign designer ================
      cy.get('[data-testid=assign-designer-true]').click()

      // ========= Update designer ================
      cy.get(
        '[data-testid=designer] > .MuiAutocomplete-endAdornment > .MuiAutocomplete-clearIndicator'
      ).click({ force: true })

      cy.get('[data-testid=designer] input').invoke('val').should('eq', 'Tim')
      cy.get('[data-testid=designer] input').first().type('Tim')

      cy.get('[data-testid="designer-Tim"]').click()
      cy.get('[data-testid=designer] input').invoke('val').should('eq', 'Tim')
      // ========= Service ================
      // ========= First service  =========
      // cy.get('[data-testid=panelService]').click()
      cy.get('[data-testid=service-0] input').type('501 燙髮')

      cy.get('[data-testid=501]').click()
      cy.get('[data-testid=service-0] input')
        .invoke('val')
        .then(val => {
          expect(val).equal('501 燙髮')
        })
      cy.get('[data-testid=service-0-price]')
        .invoke('val')
        .then(val => {
          expect(val).equal('2500')
        })

      cy.get('[data-testid=service-0-add]').click()

      // ========= Second service  =========
      cy.get('[data-testid=service-1] input').type('901').invoke('val').should('eq', '901')

      cy.get('[data-testid=901]', { timeout: 10000 }).click()
      cy.get('[data-testid=service-1] input')
        .invoke('val')
        .then(val => {
          expect(val).equal('901 [主打] 男 - 韓系短髮')
        })
      cy.get('[data-testid=service-1-price]')
        .invoke('val')
        .then(val => {
          expect(val).equal('600')
        })

      cy.get('[data-testid=service-1-clear]').click()
      cy.get('[data-testid=service-1-delete]').click()

      // =============== Merchant Sell  =============
      // =============== First Merchant Sell  =============
      // cy.get('[data-testid=merchantSell]').click()
      cy.get(
        '[data-testid=merchantSsell-0-employee] > .MuiAutocomplete-endAdornment > .MuiAutocomplete-clearIndicator'
      ).click({ force: true })
      cy.get('[data-testid=merchantSsell-0-employee] input').type('Tim')

      cy.get('[data-testid="merchantSsell-0-employee-Tim"]').click()
      cy.get('[data-testid=merchantSsell-0-employee] input')
        .invoke('val')
        .then(val => {
          expect(val).equal('Tim')
        })

      cy.get('[data-testid=merchantSsell-0-product] input').type('750')
      cy.get('[data-testid="merchantSsell-0-product-N系列乳油木保濕洗髮精 750ml"]').click()
      cy.get('[data-testid=merchantSsell-0-product] input')
        .invoke('val')
        .then(val => {
          expect(val).equal('N系列乳油木保濕洗髮精 750ml')
        })

      cy.get('[data-testid=merchantSsell-0-price]')
        .invoke('val')
        .then(val => {
          expect(val).equal('2200')
        })
      cy.get('[data-testid=merchantSsell-0-count]')
        .clear()
        .type('2')
        .invoke('val')
        .then(val => {
          expect(val).equal('2')
        })
      cy.get('[data-testid=merchantSsell-0-add]').click()
      // ========= Second merchant sell ============
      cy.get('[data-testid=merchantSsell-1-employee] input').type('Miya')

      cy.get('[data-testid="merchantSsell-1-employee- Miya"]').click()
      cy.get('[data-testid=merchantSsell-1-employee] input')
        .invoke('val')
        .then(val => {
          expect(val).equal(' Miya')
        })

      cy.get('[data-testid=merchantSsell-1-product] input').type('300')
      cy.get('[data-testid="merchantSsell-1-product-N系列炫彩護髮乳(藍紫色) 300g"]').click()
      cy.get('[data-testid=merchantSsell-1-product] input')
        .invoke('val')
        .then(val => {
          expect(val).equal('N系列炫彩護髮乳(藍紫色) 300g')
        })

      cy.get('[data-testid=merchantSsell-1-price]')
        .invoke('val')
        .then(val => {
          expect(val).equal('920')
        })
      cy.get('[data-testid=merchantSsell-1-count]')
        .clear()
        .type('3')
        .invoke('val')
        .should('eq', '3')
      cy.get('[data-testid=merchantSsell-1-clear]').click()
      cy.get('[data-testid=merchantSsell-1-delete]').click()

      // =========== The coupon sell section ===========
      // =========== First coupon sell section ===========
      // cy.get('[data-testid=couponSells]').click()
      cy.get('[data-testid=couponSells-0-coupon]').type('護髮3次')
      cy.get(
        '[data-testid=couponSells-0-coupon] > .MuiAutocomplete-endAdornment > .MuiAutocomplete-clearIndicator'
      ).click()
      cy.get('[data-testid="couponSells-0-coupon-護髮3次"]').click()
      cy.get('[data-testid=couponSells-0-coupon] input')
        .invoke('val')
        .then(val => {
          expect(val).equal('護髮3次')
        })

      cy.get('[data-testid=couponSells-0-count]')
        .clear()
        .type('100')
        .invoke('val')
        .should('eq', '100')

      cy.get('[data-testid=couponSells-0-price]')
        .clear()
        .type('100')
        .invoke('val')
        .then(val => {
          expect(val).equal('100')
        })
      cy.get('[data-testid=couponSells-0-add]').click()

      // =========== Second coupon sell section ===========

      cy.get('[data-testid=couponSells-1-coupon]').type('護髮3次')
      cy.get('[data-testid="couponSells-1-coupon-護髮3次"]', { timeout: 10000 }).click()
      cy.get('[data-testid=couponSells-1-coupon] input')
        .invoke('val')
        .then(val => {
          expect(val).equal('護髮3次')
        })

      cy.get('[data-testid=couponSells-1-count]').clear().type('50')

      cy.get('[data-testid=couponSells-1-count]')
        .invoke('val')
        .then(val => {
          expect(val).equal('50')
        })

      cy.get('[data-testid=couponSells-1-price]').clear().type('50')

      cy.get('[data-testid=couponSells-1-price]')
        .invoke('val')
        .then(val => {
          expect(val).equal('50')
        })

      cy.get('[data-testid=couponSells-1-clear]').click()
      cy.get('[data-testid=couponSells-1-delete]').click()

      // =========== Other payments ===============
      // cy.get('[data-testid=panelPayment]').click()

      cy.get('[data-testid=payment] input').type('123')
      cy.get('[data-testid=payment] input').invoke('val').should('eq', '123')
      cy.get('[data-testid="payment-123"]').first().click()

      cy.get('[data-testid="123金額"]').clear().type('500')
      cy.get('[data-testid="123金額"]').invoke('val').should('eq', '500')

      // =========== Checkout =====================
      cy.get('[data-testid=checkout]').click()
    })
  })
})
