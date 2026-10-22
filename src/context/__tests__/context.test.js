// 保護：帳單頁共用的 context（教學模式、打帳單鍵入、設計師、預約）。
// TeachingModeState 目前刻意對外固定提供 teachingMode=false（原本依 localStorage 決定的值已註解掉）——帳單頁不再顯示教學提示；
// 切換函式仍會把相反值記進 localStorage，留給日後恢復教學模式時沿用。reducer 只認 TEACHING_MODE。
import { act, render } from '@testing-library/react'
import React, { useContext } from 'react'

import TeachingModeState from 'context/TeachingModeState'
import teachingModeContext from 'context/teachingModeContext'
import teachingModeReducer from 'context/teachingModeReducer'
import { TEACHING_MODE } from 'context/types'
import designerContext, * as designerExports from 'context/designerContext'
import keyInContext, * as keyInExports from 'context/keyInContext'
import reservationContext, * as reservationExports from 'context/useReservationContext'

describe('teachingModeReducer', () => {
  it('TEACHING_MODE 反轉教學模式，其他欄位保留', () => {
    expect(teachingModeReducer({ teachingMode: true, other: 1 }, { type: TEACHING_MODE })).toEqual({
      teachingMode: false,
      other: 1,
    })
  })

  it('不認得的 action 原樣回傳同一個 state', () => {
    const state = { teachingMode: true }
    expect(teachingModeReducer(state, { type: 'OTHER' })).toBe(state)
  })
})

describe('<TeachingModeState />', () => {
  let ctx
  const Probe = () => {
    ctx = useContext(teachingModeContext)
    return <span>child</span>
  }
  // setupTests 的 localStorage 假物件 setItem 會再 JSON.stringify 一次
  const stored = () => JSON.parse(JSON.parse(localStorage.getItem('teachingMode')))

  beforeEach(() => {
    localStorage.clear()
    ctx = undefined
  })

  it('沒有記錄時：對外固定提供 teachingMode=false；第一次切換記成 false、第二次記成 true', () => {
    const { getByText } = render(
      <TeachingModeState>
        <Probe />
      </TeachingModeState>
    )
    expect(getByText('child')).toBeInTheDocument()
    expect(ctx.teachingMode).toBe(false)
    // 沒記錄時內部預設為 true，切換後記錄 false
    act(() => ctx.setTeachingMode())
    expect(stored()).toBe(false)
    act(() => ctx.setTeachingMode())
    expect(stored()).toBe(true)
    // 對外仍固定 false（教學模式已停用）
    expect(ctx.teachingMode).toBe(false)
  })

  it('已記錄 false 時，切換會記成 true', () => {
    localStorage.setItem('teachingMode', false)
    render(
      <TeachingModeState>
        <Probe />
      </TeachingModeState>
    )
    act(() => ctx.setTeachingMode())
    expect(stored()).toBe(true)
  })
})

describe('其他 context', () => {
  it.each([
    ['designerContext', designerContext, designerExports],
    ['keyInContext', keyInContext, keyInExports],
    ['useReservationContext', reservationContext, reservationExports],
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
