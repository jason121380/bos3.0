import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { TablePagination } from '../table'
import { NativeSelect, NativeSelectOption } from '../native-select'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'
import { Switch } from '../switch'
import { CheckboxField } from '../checkbox'
import { Avatar } from '../avatar'
import { Accordion, AccordionSummary, AccordionDetails } from '../accordion'
import { toast, Toaster } from '../toast'
import { cn } from '../utils'
import { Field, Input } from '../input'

afterEach(cleanup)

describe('TablePagination', () => {
  // 遷移時頁面直接沿用 MUI TablePagination 的 handler，簽名必須相同：onPageChange(event, newPage)
  it('以 MUI 相同的 (event, newPage) 呼叫 onPageChange', () => {
    const onPageChange = jest.fn()
    render(<TablePagination count={45} page={1} rowsPerPage={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByLabelText('下一頁'))
    fireEvent.click(screen.getByLabelText('上一頁'))
    expect(onPageChange.mock.calls.map(c => c[1])).toEqual([2, 0])
  })

  it('第一頁不可往前、最後一頁不可往後，避免查詢超出範圍的頁碼', () => {
    const { rerender } = render(<TablePagination count={45} page={0} rowsPerPage={10} onPageChange={() => {}} />)
    expect(screen.getByLabelText('上一頁')).toBeDisabled()
    rerender(<TablePagination count={45} page={4} rowsPerPage={10} onPageChange={() => {}} />)
    expect(screen.getByLabelText('下一頁')).toBeDisabled()
    expect(screen.getByText('41–45 / 共 45 筆')).toBeInTheDocument()
  })
})

describe('toast', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  // STYLE.md §6：成功 3 秒自動消失；錯誤必須讓使用者看到並手動關閉
  it('成功訊息 3 秒後消失，錯誤訊息不會自動消失', () => {
    render(<Toaster />)
    act(() => {
      toast.success('已儲存')
      toast.error('儲存失敗')
    })
    act(() => jest.advanceTimersByTime(3000))
    expect(screen.queryByText('已儲存')).toBeNull()
    expect(screen.getByText('儲存失敗')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('關閉'))
    expect(screen.queryByText('儲存失敗')).toBeNull()
  })
})

describe('Field / Input（RHF error 等效）', () => {
  // MUI TextField 的錯誤 helper 以 `${id}-helper-text` 連到 input 的 aria-describedby；RHF 換 ui 後螢幕報讀器須仍找得到同一段錯誤文字
  it('error 以 htmlFor 衍生 helper id，Input 呈現 aria-invalid', () => {
    render(
      <Field label="代號" htmlFor="demo-no" error="代號為必填">
        <Input id="demo-no" invalid aria-describedby="demo-no-helper-text" />
      </Field>
    )
    const helper = screen.getByText('代號為必填')
    expect(helper).toHaveAttribute('id', 'demo-no-helper-text')
    expect(screen.getByLabelText('代號')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('代號')).toHaveAttribute('aria-describedby', 'demo-no-helper-text')
  })

  it('無 error 時不產生 helper id（既有 Field 用法 DOM 行為不變）', () => {
    render(
      <Field label="名稱" htmlFor="demo-name" hint="說明">
        <Input id="demo-name" />
      </Field>
    )
    expect(screen.getByText('說明')).not.toHaveAttribute('id')
    expect(screen.getByLabelText('名稱')).not.toHaveAttribute('aria-invalid')
  })
})

describe('cn', () => {
  // 自訂字級（text-body）與文字色（text-text）必須能並存，否則元件會掉字級或掉顏色
  it('保留字級與顏色兩類 class', () => {
    expect(cn('text-body text-text', 'text-label')).toBe('text-text text-label')
  })
})

describe('formatNumber', () => {
  // 改版只能改顯示：加千分位，但小數位必須與舊畫面完全相同（不可四捨五入），非數字原樣顯示
  it('只加千分位，不改變小數與非數字', () => {
    const { formatNumber } = require('../format')
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(-1234.567)).toBe('-1,234.567')
    expect(formatNumber(0.30000000000000004)).toBe('0.30000000000000004')
    expect(formatNumber('1880')).toBe('1,880')
    expect([undefined, null, ''].map(formatNumber)).toEqual([undefined, null, ''])
  })
})

// ---- 第二輪元件：替換 MUI 時 handler 一字不改，所以「回傳給 handler 的值與簽名」必須和 MUI 相同 ----

describe('NativeSelect', () => {
  // 舊頁面的 Select 值常是布林、數字或空字串；handler 讀 event.target.value 後直接存進 state 或送 API，型別不能變成字串
  it('onChange 拿回選項的原始型別（布林、數字），並帶 name', () => {
    const onChange = jest.fn()
    render(
      <NativeSelect aria-label="狀態" name="status" value={true} onChange={onChange}>
        <NativeSelectOption value={true}>啟用</NativeSelectOption>
        <NativeSelectOption value={false}>停用</NativeSelectOption>
        <NativeSelectOption value={0}>全部</NativeSelectOption>
      </NativeSelect>
    )
    const select = screen.getByLabelText('狀態')
    fireEvent.change(select, { target: { value: '1' } })
    fireEvent.change(select, { target: { value: '2' } })
    expect(onChange.mock.calls.map(c => c[0].target.value)).toEqual([false, 0])
    expect(onChange.mock.calls[0][0].target.name).toBe('status')
  })

  // MUI 以字串比對非物件值：state 是數字 1、選項是 '1' 時仍要顯示為已選，否則換元件後畫面會像沒選
  it('與 MUI 相同，數字與字串值視為相同選項；空字串且無對應選項時顯示 placeholder', () => {
    const { rerender } = render(
      <NativeSelect aria-label="類別" value={1} onChange={() => {}}>
        <NativeSelectOption value="1">剪髮</NativeSelectOption>
      </NativeSelect>
    )
    expect(screen.getByLabelText('類別').selectedOptions[0].textContent).toBe('剪髮')
    rerender(
      <NativeSelect aria-label="類別" value="" placeholder="請選擇" onChange={() => {}}>
        <NativeSelectOption value="1">剪髮</NativeSelectOption>
      </NativeSelect>
    )
    expect(screen.getByLabelText('類別').selectedOptions[0].textContent).toBe('請選擇')
  })
})

describe('ToggleGroup', () => {
  // MUI exclusive 群組再按一次已選項目會回傳 null；多數頁面的 handler 依此判斷「不改變」，行為必須一致
  it('exclusive：選新值回傳該值，再按已選項目回傳 null', () => {
    const onChange = jest.fn()
    render(
      <ToggleGroup exclusive value={1} onChange={onChange}>
        <ToggleGroupItem value={1}>日</ToggleGroupItem>
        <ToggleGroupItem value={2}>月</ToggleGroupItem>
      </ToggleGroup>
    )
    fireEvent.click(screen.getByText('月'))
    fireEvent.click(screen.getByText('日'))
    expect(onChange.mock.calls.map(c => c[1])).toEqual([2, null])
    expect(screen.getByText('日')).toHaveAttribute('aria-pressed', 'true')
  })

  it('非 exclusive：回傳加入或移除後的新陣列', () => {
    const onChange = jest.fn()
    render(
      <ToggleGroup value={['a']} onChange={onChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    )
    fireEvent.click(screen.getByText('B'))
    fireEvent.click(screen.getByText('A'))
    expect(onChange.mock.calls.map(c => c[1])).toEqual([['a', 'b'], []])
  })
})

describe('Switch / CheckboxField', () => {
  // MUI Switch、Checkbox 的 handler 常寫成 (e, checked) => …，第二個參數必須是勾選後的狀態
  it('onChange 以 (event, checked) 呼叫', () => {
    const onSwitch = jest.fn()
    const onCheck = jest.fn()
    render(
      <>
        <Switch label="報到模式" checked={false} onChange={onSwitch} />
        <CheckboxField label="連續新增" checked={false} onChange={onCheck} />
      </>
    )
    fireEvent.click(screen.getByLabelText('報到模式'))
    fireEvent.click(screen.getByLabelText('連續新增'))
    expect(onSwitch.mock.calls[0][1]).toBe(true)
    expect(onCheck.mock.calls[0][1]).toBe(true)
  })
})

describe('TablePagination（第二輪）', () => {
  // 舊頁面把 ref 傳給分頁、handler 用 parseInt(event.target.value)；兩者都要能直接沿用
  it('ref 指向外框；每頁筆數回傳數字', () => {
    const ref = React.createRef()
    const onRows = jest.fn()
    render(
      <TablePagination ref={ref} count={100} page={0} rowsPerPage={10} rowsPerPageOptions={[10, 25]} onPageChange={() => {}} onRowsPerPageChange={onRows} />
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    fireEvent.change(screen.getByLabelText('每頁筆數'), { target: { value: '1' } })
    expect(onRows.mock.calls[0][0].target.value).toBe(25)
  })
})

describe('Avatar', () => {
  // 員工、顧客常沒有照片或圖片網址失效；不能顯示破圖
  it('圖片載入失敗時改顯示 children（姓名首字）', () => {
    render(<Avatar src="https://example.invalid/x.png" alt="王小美">王</Avatar>)
    fireEvent.error(screen.getByAltText('王小美'))
    expect(screen.getByText('王')).toBeInTheDocument()
  })
})

describe('Accordion', () => {
  const setup = (expanded, onClick = jest.fn()) =>
    render(
      <Accordion expanded={expanded}>
        <AccordionSummary onClick={onClick} data-testid="sum">服務項目</AccordionSummary>
        <AccordionDetails>
          <input data-testid="price" defaultValue="500" />
        </AccordionDetails>
      </Accordion>
    )

  // 打帳單各區塊收合時，裡面的欄位值與 ref 不能遺失（MUI 的 Accordion 也是收合不卸載），否則使用者填到一半收起來再打開會被清空
  it('收合時內容只是隱藏、仍然掛載，值保留；展開後可見', () => {
    const { rerender } = setup(false)
    const input = screen.getByTestId('price')
    expect(input).toBeInTheDocument()
    expect(input.parentElement).toHaveStyle('display: none')
    fireEvent.change(input, { target: { value: '800' } })
    rerender(
      <Accordion expanded>
        <AccordionSummary data-testid="sum">服務項目</AccordionSummary>
        <AccordionDetails>
          <input data-testid="price" defaultValue="500" />
        </AccordionDetails>
      </Accordion>
    )
    expect(screen.getByTestId('price').value).toBe('800')
    expect(screen.getByTestId('price').parentElement).not.toHaveStyle('display: none')
  })

  // 展開狀態由外層決定：點標題只通知，不自己切換（與 MUI 受控模式相同）
  it('點標題只呼叫 onClick，不自行展開；aria-expanded 反映外層傳入的 expanded', () => {
    const onClick = jest.fn()
    setup(false, onClick)
    const sum = screen.getByTestId('sum')
    expect(sum).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(sum)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(sum).toHaveAttribute('aria-expanded', 'false')
  })

  it('焦點在標題上按 Enter 或空白鍵等同點擊（鍵盤操作與原生按鈕一致）', () => {
    const onClick = jest.fn()
    setup(false, onClick)
    const sum = screen.getByTestId('sum')
    fireEvent.keyDown(sum, { key: 'Enter' })
    fireEvent.keyDown(sum, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(2)
  })
})
