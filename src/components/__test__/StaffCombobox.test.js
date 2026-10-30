// 保護 StaffCombobox（員工清單可打字搜尋，Jason 2026/10/30 決定）：取代原本的一般清單下拉，
// 原本的欄位 handler 讀 event.target.name／value，所以選取要回傳同一個 name 與員工 id、清除要回傳 ''（等同原本選「None」），
// 不然帳單／顧客彈窗的偏好設計師會送錯值或清不掉。
import React from 'react'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import StaffCombobox from 'components/StaffCombobox'

afterEach(cleanup)

const USERS = [{ id: 'd1', name: '王小美' }, { id: 'd2', name: '李助理' }]

describe('StaffCombobox', () => {
  it('打字篩選後選取：回傳 { name, value: 員工 id }；帶入目前值顯示姓名', () => {
    const onChange = jest.fn()
    render(<StaffCombobox label="偏好設計師" name="PreferDesignerId" value="d1" users={USERS} onChange={onChange} />)
    const input = screen.getByLabelText('偏好設計師')
    expect(input).toHaveValue('王小美')
    fireEvent.change(input, { target: { value: '李' } })
    const list = within(screen.getByRole('listbox'))
    expect(list.queryByText('王小美')).toBeNull()
    fireEvent.click(list.getByText('李助理'))
    expect(onChange.mock.calls[0][0].target).toEqual({ name: 'PreferDesignerId', value: 'd2' })
  })

  it('清除鈕回傳空字串（原本的「None」）', () => {
    const onChange = jest.fn()
    render(<StaffCombobox label="偏好設計師" name="PreferDesignerId" value="d1" users={USERS} onChange={onChange} />)
    const input = screen.getByLabelText('偏好設計師')
    input.focus()
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(onChange.mock.calls[0][0].target).toEqual({ name: 'PreferDesignerId', value: '' })
  })

  it('沒有值顯示「請選擇…」；載入中顯示「載入中…」且清單沒有員工', () => {
    const { rerender } = render(<StaffCombobox label="偏好設計師" name="P" value="" users={USERS} onChange={() => {}} />)
    expect(screen.getByLabelText('偏好設計師')).toHaveAttribute('placeholder', '請選擇…')
    rerender(<StaffCombobox label="偏好設計師" name="P" value="loading" users={undefined} loading onChange={() => {}} />)
    const input = screen.getByLabelText('偏好設計師')
    expect(input).toHaveAttribute('placeholder', '載入中…')
    expect(input).toHaveValue('')
  })
  // 顧客端預約頁（Reservation/Basic）：原本 NativeSelect 再選一次目前的設計師也會呼叫 handler（記下設計師名稱、清空時段），
  // combobox 選同一項不觸發 onChange；這裡守住「點或按 Enter 選目前那一項」仍交給 handler，換成別人只送一次。
  it('再選一次目前的員工（點選或 Enter）照樣交給 handler；選別人只送一次', () => {
    const onChange = jest.fn()
    render(<StaffCombobox label="服務設計師" value="d1" users={USERS} onChange={onChange} />)
    const input = screen.getByLabelText('服務設計師')
    fireEvent.change(input, { target: { value: '王' } })
    fireEvent.click(within(screen.getByRole('listbox')).getByText('王小美'))
    expect(onChange.mock.calls.map(c => c[0].target)).toEqual([{ name: undefined, value: 'd1' }])
    // 清單收起、輸入框還原成已選的名字（不留搜尋字）
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(input).toHaveValue('王小美')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.change(input, { target: { value: '王' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange.mock.calls.map(c => c[0].target.value)).toEqual(['d1', 'd1'])
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.change(input, { target: { value: '李' } })
    fireEvent.click(within(screen.getByRole('listbox')).getByText('李助理'))
    expect(onChange.mock.calls.map(c => c[0].target.value)).toEqual(['d1', 'd1', 'd2'])
  })

  it('其他按鍵、清單收起時按 Enter、沒有已選員工時按 Enter：不額外送出', () => {
    const onChange = jest.fn()
    const { rerender } = render(<StaffCombobox label="服務設計師" value="d1" users={USERS} onChange={onChange} />)
    const input = screen.getByLabelText('服務設計師')
    fireEvent.keyDown(input, { key: 'ArrowLeft' })
    fireEvent.keyDown(input, { key: 'Enter' })
    rerender(<StaffCombobox label="服務設計師" value="" users={USERS} onChange={onChange} />)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('getLabel 決定清單與欄位文字、打字依它篩選；inputProps 合併到輸入框且不影響選取', () => {
    const onChange = jest.fn()
    const users = [{ id: 'd1', name: '王小美', nickName: 'Amy' }, { id: 'd2', name: '李大華', nickName: null }]
    render(<StaffCombobox label="服務設計師" value="d1" users={users} onChange={onChange} getLabel={u => u.nickName || u.name} inputProps={{ 'data-testid': 'designer-name' }} />)
    const input = screen.getByTestId('designer-name')
    expect(input).toHaveValue('Amy')
    fireEvent.change(input, { target: { value: '' } })
    expect(within(screen.getByRole('listbox')).getAllByRole('option').map(o => o.textContent)).toEqual(['Amy', '李大華'])
    fireEvent.change(input, { target: { value: '大' } })
    expect(within(screen.getByRole('listbox')).getAllByRole('option').map(o => o.textContent)).toEqual(['李大華'])
    act(() => input.focus())
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange.mock.calls.map(c => c[0].target.value)).toEqual(['d2'])
  })
})
