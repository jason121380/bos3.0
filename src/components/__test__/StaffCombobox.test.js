// 保護 StaffCombobox（員工清單可打字搜尋，Jason 2026/10/30 決定）：取代原本的一般清單下拉，
// 原本的欄位 handler 讀 event.target.name／value，所以選取要回傳同一個 name 與員工 id、清除要回傳 ''（等同原本選「None」），
// 不然帳單／顧客彈窗的偏好設計師會送錯值或清不掉。
import React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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
})
