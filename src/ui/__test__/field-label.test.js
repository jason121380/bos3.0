import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Field, Input, Textarea } from '../input'
import { NativeSelect, NativeSelectOption } from '../native-select'
import { Switch } from '../switch'
import { Autocomplete } from '../combobox'

// 保護什麼：Field 標籤與欄位的綁定（Jason 2026/10/31「點標籤文字，游標就跳到欄位」）。
// - 點標籤後焦點在欄位上；讀屏名稱（getByLabelText）是標籤文字。
// - 子欄位既有的 id 不被改寫（鐵則 3），標籤改指向它。
// - Switch 點標籤只切換一次（不重複觸發 onChange）；下拉／搜尋下拉點標籤只聚焦、不展開選單。
// - 一個 Field 內有多個欄位時，只有第一個拿到 Field 產生的 id（不產生重複 id）。

afterEach(cleanup)

const label = text => screen.getByText(text).closest('label')

describe('ui/input Field：點標籤聚焦欄位', () => {
  it('Input：沒有 id 時由 Field 產生，點標籤聚焦', () => {
    render(
      <Field label="姓名">
        <Input name="name" />
      </Field>
    )
    const input = screen.getByLabelText('姓名')
    expect(input.tagName).toBe('INPUT')
    expect(input.id).toMatch(/^field-control-/)
    expect(label('姓名')).toHaveAttribute('for', input.id)
    expect(input).toHaveAttribute('aria-labelledby', label('姓名').id)
    fireEvent.click(label('姓名'))
    expect(document.activeElement).toBe(input)
  })

  it('Input：既有 id 不改，標籤指向它', () => {
    render(
      <Field label="電話">
        <Input id="phone" />
      </Field>
    )
    const input = screen.getByLabelText('電話')
    expect(input.id).toBe('phone')
    expect(label('電話')).toHaveAttribute('for', 'phone')
    fireEvent.click(label('電話'))
    expect(document.activeElement).toBe(input)
  })

  it('Input：自己有 aria-label 時保留，點標籤仍聚焦', () => {
    render(
      <Field label="備註">
        <Input aria-label="帳單備註" />
      </Field>
    )
    const input = screen.getByLabelText('帳單備註')
    expect(input).not.toHaveAttribute('aria-labelledby')
    fireEvent.click(label('備註'))
    expect(document.activeElement).toBe(input)
  })

  it('Field 有 htmlFor：沿用呼叫端的指向，不登記子欄位', () => {
    render(
      <Field label="Email" htmlFor="mail">
        <Input id="mail" />
      </Field>
    )
    expect(label('Email')).toHaveAttribute('for', 'mail')
    expect(label('Email')).not.toHaveAttribute('id')
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-labelledby')
  })

  it('沒有標籤：不產生 id、不加 aria-labelledby', () => {
    render(
      <Field>
        <Input placeholder="無標籤" />
      </Field>
    )
    const input = screen.getByPlaceholderText('無標籤')
    expect(input).not.toHaveAttribute('id')
    expect(input).not.toHaveAttribute('aria-labelledby')
  })

  it('Textarea：點標籤聚焦', () => {
    render(
      <Field label="內容">
        <Textarea />
      </Field>
    )
    const textarea = screen.getByLabelText('內容')
    expect(textarea.tagName).toBe('TEXTAREA')
    fireEvent.click(label('內容'))
    expect(document.activeElement).toBe(textarea)
  })

  it('同一個 Field 內兩個欄位：各自拿到不同的 id，標籤指向第一個', () => {
    render(
      <Field label="區間">
        <Input placeholder="起" />
        <Input placeholder="迄" />
      </Field>
    )
    const first = screen.getByPlaceholderText('起')
    const second = screen.getByPlaceholderText('迄')
    expect(first.id).toMatch(/^field-control-/)
    expect(second.id).toMatch(/^field-control-/)
    expect(second.id).not.toBe(first.id)
    expect(label('區間')).toHaveAttribute('for', first.id)
    fireEvent.click(label('區間'))
    expect(document.activeElement).toBe(first)
  })

  it('Math.random 被固定時 id 仍不重複', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0)
    render(
      <>
        <Field label="甲欄">
          <Input />
        </Field>
        <Field label="乙欄">
          <Input />
        </Field>
      </>
    )
    expect(screen.getByLabelText('甲欄').id).not.toBe(screen.getByLabelText('乙欄').id)
    expect(label('甲欄').id).not.toBe(label('乙欄').id)
    Math.random.mockRestore()
  })

  it('同一次更新把欄位換成另一個：標籤改指向新欄位', () => {
    const { rerender } = render(
      <Field label="換欄">
        <Input key="a" placeholder="舊" />
      </Field>
    )
    rerender(
      <Field label="換欄">
        <Input key="b" placeholder="新" />
      </Field>
    )
    const next = screen.getByPlaceholderText('新')
    expect(label('換欄')).toHaveAttribute('for', next.id)
    fireEvent.click(label('換欄'))
    expect(document.activeElement).toBe(next)
  })

  it('第一個欄位的 id 改變：標籤跟著改、仍指向第一個', () => {
    const { rerender } = render(
      <Field label="改號">
        <Input id="x1" />
        <Input id="y1" />
      </Field>
    )
    expect(label('改號')).toHaveAttribute('for', 'x1')
    rerender(
      <Field label="改號">
        <Input id="x2" />
        <Input id="y1" />
      </Field>
    )
    expect(label('改號')).toHaveAttribute('for', 'x2')
  })

  it('第一個欄位卸載後，標籤不再指向不存在的 id；之後掛上的欄位接手', () => {
    const { rerender } = render(
      <Field label="條件">
        <Input placeholder="甲" />
      </Field>
    )
    expect(label('條件')).toHaveAttribute('for')
    rerender(<Field label="條件">{null}</Field>)
    expect(label('條件')).not.toHaveAttribute('for')
    rerender(
      <Field label="條件">
        <Input placeholder="乙" />
      </Field>
    )
    const next = screen.getByPlaceholderText('乙')
    expect(label('條件')).toHaveAttribute('for', next.id)
  })

  it('標籤後來才出現：欄位改為指向新標籤', () => {
    const { rerender } = render(
      <Field>
        <Input placeholder="後補" />
      </Field>
    )
    rerender(
      <Field label="後補標籤">
        <Input placeholder="後補" />
      </Field>
    )
    const input = screen.getByPlaceholderText('後補')
    expect(label('後補標籤')).toHaveAttribute('for', input.id)
    fireEvent.click(label('後補標籤'))
    expect(document.activeElement).toBe(input)
  })

  it('Switch：點標籤聚焦並只切換一次（onChange 一次）', () => {
    const onChange = jest.fn()
    render(
      <Field label="是否上架">
        <Switch checked={false} onChange={onChange} />
      </Field>
    )
    const control = screen.getByRole('switch', { name: '是否上架' })
    fireEvent.click(label('是否上架'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][1]).toBe(true)
    expect(document.activeElement).toBe(control)
  })

  it('Switch：既有 id（inputProps.id）不改', () => {
    render(
      <Field label="啟用">
        <Switch inputProps={{ id: 'enable-switch' }} />
      </Field>
    )
    expect(screen.getByRole('switch', { name: '啟用' }).id).toBe('enable-switch')
    expect(label('啟用')).toHaveAttribute('for', 'enable-switch')
  })

  it('Switch：既有 id（id prop）不改；沒有 Field 時照舊', () => {
    render(
      <>
        <Field label="通知">
          <Switch id="notify-switch" />
        </Field>
        <Switch id="plain-switch" aria-label="獨立開關" />
      </>
    )
    expect(screen.getByRole('switch', { name: '通知' }).id).toBe('notify-switch')
    expect(screen.getByRole('switch', { name: '獨立開關' }).id).toBe('plain-switch')
  })

  it('NativeSelect：點標籤只聚焦、不展開選單；既有 id 不改', () => {
    const onChange = jest.fn()
    render(
      <Field label="付款方式">
        <NativeSelect id="pay" value="cash" onChange={onChange}>
          <NativeSelectOption value="cash">現金</NativeSelectOption>
          <NativeSelectOption value="card">信用卡</NativeSelectOption>
        </NativeSelect>
      </Field>
    )
    const button = screen.getByRole('combobox', { name: '付款方式' })
    expect(button.id).toBe('pay')
    expect(label('付款方式')).not.toHaveAttribute('for')
    fireEvent.click(label('付款方式'))
    expect(document.activeElement).toBe(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('Combobox：點標籤只聚焦輸入框、不展開選單', () => {
    const TextField = () => null
    render(
      <Field label="設計師">
        <Autocomplete
          options={[{ name: '小美' }]}
          value={null}
          getOptionLabel={o => o.name}
          onChange={() => {}}
          renderInput={params => <TextField {...params} placeholder="選擇設計師" />}
        />
      </Field>
    )
    const input = screen.getByPlaceholderText('選擇設計師')
    expect(input).toHaveAttribute('aria-labelledby', label('設計師').id)
    fireEvent.click(label('設計師'))
    expect(document.activeElement).toBe(input)
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('小美')).toBeNull()
  })

  it('Combobox：自己有 aria-label 時不指向不存在的標籤 id，也不改用 Field 標籤', () => {
    const TextField = () => null
    render(
      <Field label="篩選">
        <Autocomplete
          options={[]}
          value={null}
          getOptionLabel={o => o.name}
          onChange={() => {}}
          renderInput={params => <TextField {...params} inputProps={{ ...params.inputProps, 'aria-label': '篩選設計師' }} />}
        />
      </Field>
    )
    const input = screen.getByLabelText('篩選設計師')
    expect(input).not.toHaveAttribute('aria-labelledby')
    fireEvent.click(label('篩選'))
    expect(document.activeElement).toBe(input)
  })

  it('目標元素不在畫面上時點標籤不拋錯', () => {
    render(
      <Field label="已移除">
        <NativeSelect id="gone" value="">
          <NativeSelectOption value="">無</NativeSelectOption>
        </NativeSelect>
      </Field>
    )
    const button = screen.getByRole('combobox', { name: '已移除' })
    button.removeAttribute('id')
    expect(() => fireEvent.click(label('已移除'))).not.toThrow()
  })
})
