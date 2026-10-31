// 保護：帳單頁共用的 context（打帳單鍵入、設計師、預約）。
import { render } from '@testing-library/react'
import React from 'react'

import designerContext, * as designerExports from 'context/designerContext'
import keyInContext, * as keyInExports from 'context/keyInContext'
import reservationContext, * as reservationExports from 'context/ReservationContext'

describe('其他 context', () => {
  it.each([
    ['designerContext', designerContext, designerExports],
    ['keyInContext', keyInContext, keyInExports],
    ['ReservationContext', reservationContext, reservationExports],
  ])('%s 匯出的 Provider／Consumer 就是同一個 context 的', (name, context, exports) => {
    expect(exports.Provider).toBe(context.Provider)
    expect(exports.Consumer).toBe(context.Consumer)
    const { getByText } = render(
      <exports.Provider value="值">
        <exports.Consumer>{v => <span>{`收到${v}`}</span>}</exports.Consumer>
      </exports.Provider>
    )
    expect(getByText('收到值')).toBeInTheDocument()
  })
})
