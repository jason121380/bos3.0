import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import CompareFilter from '../CompareFilter'

jest.mock('components/DateSelector', () => ({ dateChange }) => <button onClick={() => dateChange(['2026-10-01', '2026-10-23'])}>選擇測試日期</button>)
afterEach(cleanup)

test('比較條件的日期、人員與確認保持原回呼；Esc 不關閉且沒有額外關閉鈕', () => {
  const handleSetData = jest.fn()
  const setOpenModal = jest.fn()
  const handleGetCompareData = jest.fn()
  render(
    <CompareFilter
      open
      setOpenModal={setOpenModal}
      compareInputData={[{ dateRange: [], designerIds: [], displayReference: 'performance' }]}
      userList={[{ userId: 'u1', userName: '測試設計師', userNickName: null, userNo: '01' }]}
      filterOptions={options => options}
      handleSetData={handleSetData}
      handleGetCompareData={handleGetCompareData}
    />
  )
  fireEvent.click(screen.getByRole('button', { name: '選擇測試日期' }))
  expect(handleSetData).toHaveBeenCalledWith('dateRange', 0, ['2026-10-01', '2026-10-23'])
  fireEvent.click(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: /測試設計師/ }))
  expect(handleSetData).toHaveBeenCalledWith('designerIds', 0, ['u1'])
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  expect(setOpenModal).not.toHaveBeenCalled()
  expect(screen.queryByRole('button', { name: '關閉' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '確定' }))
  expect(setOpenModal).toHaveBeenCalledWith(false)
  expect(handleGetCompareData).toHaveBeenCalledTimes(1)
})
