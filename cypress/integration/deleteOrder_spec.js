describe('Delete order', () => {
  beforeEach(() => {
    cy.login('0916017308', '123456')
  })

  it('should create order successful', () => {
    cy.get('[data-input-testid=bill-date]')
      .type('{selectall}')
      .type('2020/12/09 00:00')
      .invoke('val')
      .then(sometext => {
        expect(sometext).equal('2020/12/09 00:00')
      })
    // 鎖定日期暫時隱藏 所以先註解 以防測試錯誤
    // cy.get('[data-testid=lock-date]').click().check()

    cy.get('[data-testid=customer]').type('0912345678')
    cy.get('[data-testid=Jaaa]').click()
    cy.get('[data-testid=customer] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('Jaaa/0912345678')
      })

    cy.get('[data-testid=customer] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('Jaaa/0912345678')
      })

    cy.get('[data-testid=assign-designer-false]').click()

    cy.get('[data-testid=designer]').first().type('Tim')
    cy.get('[data-testid="designer-Tim"]').click()

    cy.get('[data-testid=designer] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('Tim')
      })

    // ========= Service ================
    // ========= First service  =========
    cy.get('[data-testid=panelService]').dblclick()
    cy.get('[data-testid=service-0]').type('102 進階髮浴')

    cy.get('[data-testid=102]').click()
    cy.get('[data-testid=service-0] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('102 進階髮浴')
      })
    cy.get('[data-testid=service-0-price]')
      .type('123')
      .invoke('val')
      .then(val => {
        expect(val).equal('123')
      })
    cy.get('[data-testid=service-0-add]').click()

    // ========= Second service  =========

    cy.get('[data-testid=service-1]').type('401')

    cy.get('[data-testid=401]').click()

    cy.get('[data-testid=service-1] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('401 JULIEART 基礎 頭皮養護')
      })

    cy.get('[data-testid=service-1-price]')
      .type('456')
      .invoke('val')
      .then(val => {
        expect(val).equal('456')
      })

    cy.get('[data-testid=service-1_helper-employee-0]').type('Erica')

    cy.get('[data-testid="service-1_helper-employee-0- Erica"]').click()
    cy.get('[data-testid=service-1_helper-employee-0] input')
      .invoke('val')
      .then(val => {
        expect(val).equal(' Erica')
      })

    cy.get(
      '[data-testid=service-1_helper-employee-0] > .MuiAutocomplete-endAdornment > .MuiAutocomplete-clearIndicator'
    ).click()

    cy.get('[data-testid=service-1_helper-employee-0-assign]').dblclick().uncheck()

    cy.get('[data-testid=service-1_helper-employee-1]').type('Nikki')
    cy.get('[data-testid="service-1_helper-employee-1- Nikki"]').click()
    cy.get('[data-testid=service-1_helper-employee-1] input')
      .invoke('val')
      .then(val => {
        expect(val).equal(' Nikki')
      })

    cy.get(
      '[data-testid=service-1_helper-employee-1] > .MuiAutocomplete-endAdornment > .MuiAutocomplete-clearIndicator'
    ).click()

    cy.get('[data-testid=service-1_helper-employee-1-assign]').dblclick().uncheck()

    cy.get('[data-testid=service-1-thirdParty]').type('FUNNOW')
    cy.get('[data-testid=FUNNOW]').click()
    cy.get('[data-testid=service-1-thirdParty] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('FUNNOW')
      })

    cy.get(
      '[data-testid=service-1-thirdParty] > .MuiAutocomplete-endAdornment > .MuiAutocomplete-clearIndicator'
    ).click()

    cy.get('[data-testid=service-1-clear]').click()
    cy.get('[data-testid=service-1-delete]').click()

    // =============== Merchant Sell  =============
    // =============== First Merchant Sell  =============

    cy.get('[data-testid=merchantSell]').click()

    cy.get('[data-testid=merchantSsell-0-employee]').type('Tim')

    cy.get('[data-testid="merchantSsell-0-employee-Tim"]').click()
    cy.get('[data-testid=merchantSsell-0-employee] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('Tim')
      })

    cy.get('[data-testid=merchantSsell-0-product]').type('150')
    cy.get('[data-testid="merchantSsell-0-product-N系列乳油木輕質油 150ml"]').click()
    cy.get('[data-testid=merchantSsell-0-product] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('N系列乳油木輕質油 150ml')
      })

    cy.get('[data-testid=merchantSsell-0-price]')
      .type('100')
      .invoke('val')
      .then(val => {
        expect(val).equal('100')
      })
    cy.get('[data-testid=merchantSsell-0-count]')
      .type('100')
      .invoke('val')
      .then(val => {
        expect(val).equal('100')
      })
    cy.get('[data-testid=merchantSsell-0-add]').click()

    // ========= Second merchant sell ============

    cy.get('[data-testid=merchantSsell-1-employee]').type('Tim')

    cy.get('[data-testid="merchantSsell-1-employee-Tim"]').click()
    cy.get('[data-testid=merchantSsell-1-employee] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('Tim')
      })
    cy.get(
      '[data-testid=merchantSsell-1-employee] > .MuiAutocomplete-endAdornment > .MuiAutocomplete-clearIndicator'
    ).click()

    cy.get('[data-testid=merchantSsell-1-product]').type('150')
    cy.get('[data-testid="merchantSsell-1-product-N系列乳油木輕質油 150ml"]').click()
    cy.get('[data-testid=merchantSsell-1-product] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('N系列乳油木輕質油 150ml')
      })

    cy.get('[data-testid=merchantSsell-1-price]')
      .type('100')
      .invoke('val')
      .then(val => {
        expect(val).equal('100')
      })
    cy.get('[data-testid=merchantSsell-1-count]')
      .type('100')
      .invoke('val')
      .then(val => {
        expect(val).equal('100')
      })

    cy.get('[data-testid=merchantSsell-1-clear]').click()
    cy.get('[data-testid=merchantSsell-1-delete]').click()

    // =========== The coupon sell section ===========
    // =========== First coupon sell section ===========

    cy.get('[data-testid=couponSells]').click()

    cy.get('[data-testid=couponSells-0-coupon]').type('護髮3次')
    cy.get('[data-testid="couponSells-0-coupon-護髮3次"]').click()
    cy.get('[data-testid=couponSells-0-coupon] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('護髮3次')
      })

    cy.get('[data-testid=couponSells-0-count]')
      .type('100')
      .invoke('val')
      .then(val => {
        expect(val).equal('100')
      })

    cy.get('[data-testid=couponSells-0-price]')
      .type('100')
      .invoke('val')
      .then(val => {
        expect(val).equal('100')
      })
    cy.get('[data-testid=couponSells-0-add]').click()
    // =========== Second coupon sell section ===========

    cy.get('[data-testid=couponSells-1-coupon]').type('護髮3次')
    cy.get('[data-testid="couponSells-1-coupon-護髮3次"]').click()
    cy.get('[data-testid=couponSells-1-coupon] input')
      .invoke('val')
      .then(val => {
        expect(val).equal('護髮3次')
      })

    cy.get('[data-testid=couponSells-1-count]')
      .type('100')
      .invoke('val')
      .then(val => {
        expect(val).equal('100')
      })

    cy.get('[data-testid=couponSells-1-price]')
      .type('100')
      .invoke('val')
      .then(val => {
        expect(val).equal('100')
      })

    cy.get('[data-testid=couponSells-1-clear]').click()
    cy.get('[data-testid=couponSells-1-delete]').click()

    // =========== The Coupon use ===============

    cy.get('[data-testid=panelCouponUse]').click()
    cy.get('[data-testid=coupon-use]').type('護髮3次')
    cy.get('[data-testid=coupon-use] input').invoke('val').should('eq', '護髮3次')
    cy.get('[data-testid="coupon-use-護髮3次(1/20)"]', { timeout: 10000 }).first().click()
    cy.get('[data-testid=coupon-use] input').invoke('val').should('eq', '護髮3次(1/20)')

    // =========== Other payments ===============
    cy.get('[data-testid=panelPayment]').click()
    cy.get('[data-testid=payment]').type('LINEPAY')
    cy.get('[data-testid=payment] input').invoke('val').should('eq', 'LINEPAY')
    cy.get('[data-testid="payment-LINEPAY"]').first().click()
    cy.get('[data-testid="LINEPAY金額"]').type('100').invoke('val').should('eq', '100')

    // =========== Checkout =====================
    cy.get('[data-testid=checkout]').click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/management/orders`)
  })

  it('should delete order', () => {
    cy.visit(`${Cypress.config().baseUrl}/management/orders`)
    cy.url().should('eq', `${Cypress.config().baseUrl}/management/orders`)

    cy.dateRange({
      start: '12/09/2020',
      end: '12/09/2020',
    })

    cy.get('[data-testid=order-checkbox-0]').check()
    cy.get('[data-testid=order-checkbox-0]').should('be.checked')
    cy.get('[data-testid=cancelOrder]').click()

    cy.get('[data-testid=delete-password]').type('0000').invoke('val').should('eq', '0000')

    cy.get('[data-testid="confirm"]').click()
  })
})
