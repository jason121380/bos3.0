import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Autocomplete, createFilterOptions } from '../combobox'

afterEach(cleanup)

// renderInput 內的 TextField 只是 props 載體（新元件不渲染 MUI），用最小替身即可
const TextField = () => null

const options = [
  { id: 'a', name: '洗髮' },
  { id: 'b', name: '剪髮' },
  { id: 'c', name: '染髮' },
]
const getOptionLabel = option => option.name

function setup(props = {}, fieldProps = {}) {
  const onChange = props.onChange || jest.fn()
  render(
    <Autocomplete
      options={options}
      value={null}
      getOptionLabel={getOptionLabel}
      onChange={onChange}
      renderInput={params => <TextField {...params} label="服務" placeholder="請選擇" {...fieldProps} />}
      {...props}
    />
  )
  return { onChange, input: screen.getByPlaceholderText('請選擇') }
}

describe('ui/combobox Autocomplete（與 MUI Autocomplete 相容的介面）', () => {
  // 遷移時頁面只換 import：onChange 簽名必須維持 (event, value)
  it('輸入文字會篩選，點選後以 (event, option) 呼叫 onChange', () => {
    const { onChange, input } = setup()
    fireEvent.change(input, { target: { value: '剪' } })
    expect(screen.queryByText('洗髮')).toBeNull()
    fireEvent.click(screen.getByText('剪髮'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][1]).toEqual(options[1])
  })

  // 標籤依 STYLE「標籤在上」：renderInput 的 label 渲染在欄位上方，並與輸入框關聯
  it('renderInput 的 label 成為上方標籤，且可用標籤找到輸入框', () => {
    setup()
    expect(screen.getByLabelText('服務')).toBe(screen.getByPlaceholderText('請選擇'))
  })

  // 帳單頁以 inputRef 串接 Enter 跳欄，ref 必須拿到真正的 input
  it('TextField 的 inputRef 取得實際輸入框元素', () => {
    const inputRef = React.createRef()
    const { input } = setup({}, { inputRef })
    expect(inputRef.current).toBe(input)
  })

  // 鍵盤操作：autoHighlight 時 ↓ 開啟、Enter 選第一個
  it('autoHighlight：方向鍵開啟後 Enter 選取第一個選項', () => {
    const { onChange, input } = setup({ autoHighlight: true })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange.mock.calls[0][1]).toEqual(options[0])
  })

  // MUI 事件順序：TextField onKeyDown 先於內部選取；設 defaultMuiPrevented 可擋下選取（帳單焦點鏈依賴）
  it('呼叫端 onKeyDown 先執行，且 defaultMuiPrevented 會阻止內部選取', () => {
    const order = []
    const onChange = jest.fn(() => order.push('select'))
    const onKeyDown = jest.fn(event => {
      order.push('caller')
      if (event.key === 'Enter') event.defaultMuiPrevented = true
    })
    const { input } = setup({ onChange, autoHighlight: true }, { onKeyDown })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(order[0]).toBe('caller')
    expect(onChange).not.toHaveBeenCalled()
  })

  // 失焦不可自動選走 highlight 的選項（除非 autoSelect），否則使用者 Tab 離開會被偷改值
  it('沒有 autoSelect 時失焦不會選取 highlight 的選項', () => {
    const { onChange, input } = setup({ autoHighlight: true })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.blur(input)
    expect(onChange).not.toHaveBeenCalled()
  })

  // 值與選項是不同物件時，依 isOptionEqualToValue 顯示已選文字（GraphQL 回傳的物件常不是同一個參考）
  it('依 isOptionEqualToValue 顯示目前值的文字', () => {
    const { input } = setup({ value: { id: 'c' }, isOptionEqualToValue: (o, v) => o.id === v.id })
    expect(input.value).toBe('染髮')
  })

  // 多選：renderOption 取得 selected 旗標；點選切換加入／移除；disableCloseOnSelect 時選單保持開啟
  it('multiple：renderOption 收到 selected，點選切換且選單不關閉', () => {
    const onChange = jest.fn()
    render(
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={options}
        value={[options[0]]}
        getOptionLabel={getOptionLabel}
        onChange={onChange}
        renderOption={(props, option, { selected }) => (
          <li {...props}>{`${option.name}${selected ? '（已選）' : ''}`}</li>
        )}
        renderInput={params => <TextField {...params} placeholder="設計師" />}
      />
    )
    fireEvent.keyDown(screen.getByPlaceholderText('設計師'), { key: 'ArrowDown' })
    expect(screen.getByText('洗髮（已選）')).toBeInTheDocument()
    fireEvent.click(screen.getByText('剪髮'))
    expect(onChange.mock.calls[0][1]).toEqual([options[0], options[1]])
    expect(screen.getByText('染髮')).toBeInTheDocument()
  })

  // 非受控（沒傳 value）時元件自己記住選取值；實機在顧客入金排行榜發現：選了卻沒有顯示已選項目
  it('沒傳 value 的多選仍會顯示已選項目，並可用 Backspace 移除', () => {
    const onChange = jest.fn()
    render(
      <Autocomplete
        multiple
        options={options}
        getOptionLabel={getOptionLabel}
        onChange={onChange}
        renderInput={params => <TextField {...params} placeholder="設計師" />}
      />
    )
    const input = screen.getByPlaceholderText('設計師')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.click(screen.getByText('剪髮'))
    expect(screen.getByRole('button', { name: '移除 剪髮' })).toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(screen.queryByRole('button', { name: '移除 剪髮' })).toBeNull()
    expect(onChange.mock.calls.map(c => c[1])).toEqual([[options[1]], []])
  })

  // freeSolo：沒有選到任何選項時，Enter 送出輸入文字
  it('freeSolo：Enter 以輸入文字呼叫 onChange', () => {
    const { onChange, input } = setup({ freeSolo: true })
    fireEvent.change(input, { target: { value: '自訂服務' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange.mock.calls[0][1]).toBe('自訂服務')
  })

  // 自訂 filterOptions 收到的是使用者輸入的文字（頁面以代號／名稱比對）
  it('filterOptions 收到輸入文字並決定顯示的選項', () => {
    const filterOptions = jest.fn((opts, { inputValue }) => opts.filter(o => o.id === inputValue))
    const { input } = setup({ filterOptions })
    fireEvent.change(input, { target: { value: 'c' } })
    expect(filterOptions).toHaveBeenLastCalledWith(options, expect.objectContaining({ inputValue: 'c' }))
    expect(screen.getByText('染髮')).toBeInTheDocument()
    expect(screen.queryByText('剪髮')).toBeNull()
  })

  it('createFilterOptions 支援 matchFrom start 與 stringify', () => {
    const filter = createFilterOptions({ matchFrom: 'start', stringify: o => o.id + o.name })
    expect(filter(options, { inputValue: 'b', getOptionLabel })).toEqual([options[1]])
  })

  // 打帳單的服務項目下拉以同一個 toggle 接 onOpen／onClose（受控 open）：點一次輸入框只能呼叫一次 onOpen，
  // 否則開了又關、選單出不來（同 MUI：只在狀態改變時呼叫）
  it('受控 open：點輸入框只呼叫一次 onOpen', () => {
    const onOpen = jest.fn()
    const Harness = () => {
      const [open, setOpen] = React.useState(false)
      const toggle = () => {
        onOpen()
        setOpen(o => !o)
      }
      return (
        <Autocomplete
          open={open}
          onOpen={toggle}
          onClose={toggle}
          options={options}
          value={null}
          getOptionLabel={getOptionLabel}
          onChange={() => {}}
          renderInput={params => <TextField {...params} placeholder="請選擇" />}
        />
      )
    }
    render(<Harness />)
    fireEvent.click(screen.getByPlaceholderText('請選擇'))
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(screen.getByText('剪髮')).toBeInTheDocument()
  })

  // iPhone 觸控點選項（Jason 回報打帳單點選項沒反應）：touchend 先於 click，downshift 不認得 Portal 掛上的選單而送出失焦關選單；
  // 手指按在選單上時要忽略這次失焦，讓 click 完成選取
  it('觸控點選項：touchend 與輸入框失焦都不會在 click 之前關掉選單', () => {
    const { onChange, input } = setup()
    fireEvent.click(input)
    const option = screen.getByText('剪髮')
    fireEvent.pointerDown(option)
    fireEvent.touchStart(option)
    fireEvent.touchEnd(option)
    fireEvent.blur(input)
    fireEvent.click(screen.getByText('剪髮'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][1]).toEqual(options[1])
  })

  // 打帳單等頁把佔位字放在 InputProps（ServicesAutoComplete 等元件的 inputProps 會併入 InputProps）；
  // MUI 會把它傳到輸入框，若落在外框 div，使用者看不到「服務名稱/代號」之類的提示
  it('InputProps.placeholder 顯示在輸入框上，不落在外框', () => {
    render(
      <Autocomplete
        options={options}
        value={null}
        getOptionLabel={getOptionLabel}
        onChange={jest.fn()}
        renderInput={params => <TextField {...params} InputProps={{ ...params.InputProps, placeholder: '服務名稱/代號' }} />}
      />
    )
    const input = screen.getByPlaceholderText('服務名稱/代號')
    expect(input.tagName).toBe('INPUT')
  })
})
