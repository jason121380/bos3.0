import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { Rating } from '../rating'

test('原生 radio 命名、滑過預覽、點目前值清空且只通知一次', () => {
  const change = jest.fn()
  render(<Rating name="rating" defaultValue={2} onChange={change} aria-label="服務評分" />)
  expect(screen.getByRole('radiogroup', { name: '服務評分' })).toBeInTheDocument()
  const four = screen.getByRole('radio', { name: '4 星' })
  fireEvent.mouseEnter(four.parentElement)
  expect(four.parentElement).toHaveAttribute('data-filled', 'true')
  fireEvent.mouseLeave(four.closest('[role="radiogroup"]'))
  expect(four.parentElement).toHaveAttribute('data-filled', 'false')
  fireEvent.click(four)
  expect(four).toBeChecked()
  expect(change).toHaveBeenLastCalledWith(expect.anything(), 4)
  fireEvent.click(four)
  expect(four).not.toBeChecked()
  expect(change).toHaveBeenLastCalledWith(expect.anything(), null)
  expect(change).toHaveBeenCalledTimes(2)
})

test('方向鍵切換與邊界循環、Space 清空、受控值與 max／size', () => {
  const change = jest.fn()
  function Fixture() {
    const [value, setValue] = React.useState(3)
    return <Rating name="custom" value={value} max={4} size="large" onChange={(e, v) => { change(e, v); setValue(v) }} />
  }
  render(<Fixture />)
  expect(screen.getAllByRole('radio')).toHaveLength(4)
  const three = screen.getByRole('radio', { name: '3 星' })
  three.focus()
  fireEvent.keyDown(three, { key: 'ArrowRight' })
  expect(screen.getByRole('radio', { name: '4 星' })).toHaveFocus()
  expect(screen.getByRole('radio', { name: '4 星' })).toBeChecked()
  fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
  expect(screen.getByRole('radio', { name: '1 星' })).toBeChecked()
  fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' })
  expect(screen.getByRole('radio', { name: '4 星' })).toBeChecked()
  fireEvent.keyDown(document.activeElement, { key: ' ' })
  expect(change).toHaveBeenLastCalledWith(expect.anything(), null)
})

test.each(['disabled', 'readOnly'])('%s 保持顯示值且不送出變更', prop => {
  const change = jest.fn()
  render(<Rating value={2} {...{ [prop]: true }} onChange={change} />)
  const four = screen.getByRole('radio', { name: '4 星' })
  fireEvent.click(four)
  fireEvent.keyDown(four, { key: 'ArrowLeft' })
  expect(screen.getByRole('radio', { name: '2 星' })).toBeChecked()
  expect(change).not.toHaveBeenCalled()
})
