// 保護：版面與舊頁面共用的小元件——換頁捲回頂端、插槽 portal、頁面標題／GA、批次操作列、密碼確認框、
// 業績虛實切換、客戶來源下拉、搜尋欄、更多選單、Markdown、假進度條、相容層測試 Provider。
// 這些元件在幾十個頁面重複使用：按鈕要呼叫原本的 handler、隱藏／顯示條件不能變，查詢失敗時的行為要明確。
import { act, cleanup, fireEvent, render, screen, wait } from '@testing-library/react'
import { gql, useQuery } from '@apollo/client'
import { createMemoryHistory } from 'history'
import React from 'react'
import { Router } from 'react-router-dom'

import { PAGE_CRASH_TEXT, renderPage } from '__tests__/testkit.test'
import CustomMockedProvider from 'components/CustomMockedProvider'
import GenericMoreButton from 'components/GenericMoreButton'
import Markdown from 'components/Markdown'
import NavItem from 'components/NavItem'
import PageErrorBoundary, { PageErrorFallback } from 'components/PageErrorBoundary'
import PageTitle from 'components/PageTitle'
import PasswordDialog from 'components/PasswordDialog'
import ProgressBar from 'components/ProgressBar'
import ReferToggleButton from 'components/ReferToggleButton'
import ScrollReset from 'components/ScrollReset'
import SearchField from 'components/SearchField'
import SlotPortal from 'components/SlotPortal'
import SourceSelect from 'components/SourceSelect'
import TableCheckoutBar from 'components/TableCheckoutBar'
import TableEditBar from 'components/TableEditBar'
import AdminPageHeader from 'components/AdminPageHeader'
import CalendarColorClip, { readableTextOn } from 'components/CalendarColorClip'
import AccountingSubjectsAutocomplete from 'components/AccountingSubjectsAutocomplete'

// react-markdown 是純 ESM 套件，CRA 的 Jest 不轉譯 node_modules；以替身確認 Markdown 原樣轉交 props
jest.mock('react-markdown', () => props => (
  <div data-testid="react-markdown" data-escape={String(props.escapeHtml)}>
    {props.source}
  </div>
))

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('ScrollReset', () => {
  it('換頁（pathname 改變）才捲回頂端，只改 query 不捲動', () => {
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const history = createMemoryHistory({ initialEntries: ['/a'] })
    render(
      <Router history={history}>
        <ScrollReset />
      </Router>
    )
    expect(scrollTo).toHaveBeenCalledTimes(1)
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    act(() => history.push('/a?tab=2'))
    expect(scrollTo).toHaveBeenCalledTimes(1)
    act(() => history.push('/b'))
    expect(scrollTo).toHaveBeenCalledTimes(2)
  })
})

describe('SlotPortal', () => {
  it('插槽已存在時直接畫進去；插槽較晚出現時等它出現再畫；插槽移除後不再顯示', async () => {
    const { rerender } = render(
      <div>
        <div id="slot-a" data-testid="slot-a" />
        <SlotPortal slotId="slot-a">
          <button type="button">切換店家</button>
        </SlotPortal>
      </div>
    )
    expect(screen.getByTestId('slot-a')).toContainElement(screen.getByRole('button', { name: '切換店家' }))

    rerender(
      <div>
        <SlotPortal slotId="slot-b">
          <button type="button">搜尋</button>
        </SlotPortal>
      </div>
    )
    expect(screen.queryByRole('button', { name: '搜尋' })).toBeNull()
    const late = document.createElement('div')
    late.id = 'slot-b'
    document.body.appendChild(late)
    await wait(() => expect(late).toContainElement(screen.getByRole('button', { name: '搜尋' })))
    late.remove()
    await wait(() => expect(screen.queryByRole('button', { name: '搜尋' })).toBeNull())
  })
})

describe('PageTitle／AdminPageHeader', () => {
  it('只顯示含中文的副標；忽略呼叫端指定的標題顏色但保留其他樣式；可加 className', () => {
    const { container, rerender } = render(<PageTitle title="帳單列表" subTitle="MANAGEMENT" style={{ color: 'blue', marginTop: 4 }} />)
    expect(screen.getByRole('heading', { name: '帳單列表' })).toBeInTheDocument()
    expect(screen.queryByText('MANAGEMENT')).toBeNull()
    expect(container.firstChild.style.color).toBe('')
    expect(container.firstChild.style.marginTop).toBe('4px')
    rerender(<PageTitle title="帳單列表" subTitle="櫃檯作業" className="extra" />)
    expect(screen.getByText('櫃檯作業')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('extra')
    rerender(<PageTitle title="帳單列表" subTitle={123} />)
    expect(container.textContent).toBe('帳單列表')
  })

  it('sx 只轉 backgroundColor 與 mb（數字×8px、字串原樣）；篩選鈕依 showFilter 標示按下；主要動作可為連結', () => {
    const history = createMemoryHistory({ initialEntries: ['/x'] })
    const { container, rerender } = render(
      <Router history={history}>
        <AdminPageHeader title="商品" sx={{ backgroundColor: 'red', mb: 2 }} onFilterClick={() => {}} showFilter primaryAction={{ label: '新增', to: '/products/create' }} />
      </Router>
    )
    expect(container.firstChild.style.backgroundColor).toBe('red')
    expect(container.firstChild.style.marginBottom).toBe('16px')
    expect(screen.getByRole('button', { name: '篩選' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('link', { name: '新增' }))
    expect(history.location.pathname).toBe('/products/create')
    rerender(
      <Router history={history}>
        <AdminPageHeader title="商品" sx={{ mb: '1rem' }} onFilterClick={() => {}} />
      </Router>
    )
    expect(container.firstChild.style.marginBottom).toBe('1rem')
    expect(container.firstChild.style.backgroundColor).toBe('')
    expect(screen.getByRole('button', { name: '篩選' })).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('NavItem 讓目前項目出現在側欄可視範圍', () => {
  const rect = (top, bottom) => ({ top, bottom, left: 0, right: 0, width: 0, height: bottom - top })
  const renderActive = (itemRect, inNav = true) => {
    const history = createMemoryHistory({ initialEntries: ['/orders'] })
    const proto = window.HTMLElement.prototype
    const original = proto.getBoundingClientRect
    proto.getBoundingClientRect = function () {
      return this.tagName === 'NAV' ? rect(100, 300) : itemRect
    }
    const link = <NavItem depth={1} title="帳單列表" href="/orders" />
    render(<Router history={history}>{inNav ? <nav data-testid="nav">{link}</nav> : link}</Router>)
    proto.getBoundingClientRect = original
    return inNav ? screen.getByTestId('nav') : null
  }

  it('項目在可視範圍上方：往上捲到項目上緣再留 8px', () => {
    // jsdom 的 scrollTop 可寫入；先設定原本的捲動位置
    const nav = renderActive(rect(40, 60))
    expect(nav.scrollTop).toBe(0 - (100 - 40 + 8))
  })

  it('項目在可視範圍下方：往下捲到項目下緣再留 8px；已在範圍內不捲動；不在 nav 內不處理', () => {
    expect(renderActive(rect(320, 350)).scrollTop).toBe(350 - 300 + 8)
    cleanup()
    expect(renderActive(rect(150, 170)).scrollTop).toBe(0)
    cleanup()
    expect(() => renderActive(rect(0, 10), false)).not.toThrow()
  })

  it('有 label 元件時畫在連結右側', () => {
    const history = createMemoryHistory({ initialEntries: ['/x'] })
    render(
      <Router history={history}>
        <NavItem depth={1} title="訂單佇列" href="/queue" label={() => <span>3</span>} />
      </Router>
    )
    expect(screen.getByRole('link', { name: '訂單佇列 3' })).toBeInTheDocument()
  })
})

describe('PageErrorBoundary', () => {
  it('錯誤畫面的重新整理鈕會重新載入頁面', () => {
    const realLocation = window.location
    delete window.location
    window.location = { reload: jest.fn() }
    render(<PageErrorFallback />)
    fireEvent.click(screen.getByRole('button', { name: '重新整理' }))
    expect(window.location.reload).toHaveBeenCalledTimes(1)
    window.location = realLocation
  })

  it('沒有錯誤時照常顯示內容', () => {
    render(
      <PageErrorBoundary resetKey="/a">
        <p>內容</p>
      </PageErrorBoundary>
    )
    expect(screen.getByText('內容')).toBeInTheDocument()
  })
})

describe('TableEditBar／TableCheckoutBar 批次操作列', () => {
  it('未勾選時隱藏；勾選後只顯示有給 handler 的動作，點擊呼叫原 handler', () => {
    const handlers = {
      onReinstatement: jest.fn(),
      onDelete: jest.fn(),
      onEditSaleStatus: jest.fn(),
      onEditDeduction: jest.fn(),
      onEdit: jest.fn(),
      onCancel: jest.fn(),
      onEditProductsCategory: jest.fn(),
      onEditRakeSetting: jest.fn(),
      onEditPersonnelProfile: jest.fn(),
      onDeleteCustomer: jest.fn(),
      onEditMembershipCategory: jest.fn(),
    }
    const { container, rerender } = render(<TableEditBar onDelete={handlers.onDelete} />)
    expect(container.firstChild).toHaveAttribute('hidden')
    rerender(<TableEditBar selected={[1, 2]} {...handlers} editBarOnClick />)
    expect(screen.getByRole('toolbar', { name: '批次操作' })).toHaveTextContent('已選 2 筆')
    const labels = {
      員工復職: 'onReinstatement',
      刪除: 'onDelete',
      編輯上架狀態: 'onEditSaleStatus',
      編輯項目扣項: 'onEditDeduction',
      編輯互助點數: 'onEdit',
      編輯商品類別: 'onEditProductsCategory',
      編輯設計師抽成: 'onEditRakeSetting',
      由人員身分設定檔導入: 'onEditPersonnelProfile',
      刪除客人: 'onDeleteCustomer',
      編輯會員卡類別: 'onEditMembershipCategory',
    }
    Object.entries(labels).forEach(([label, key]) => {
      fireEvent.click(screen.getByRole('button', { name: label }))
      expect(handlers[key]).toHaveBeenCalledTimes(1)
    })
    // 取消訂單在處理中（editBarOnClick）停用
    expect(screen.getByRole('button', { name: '取消訂單(預約)' })).toBeDisabled()
    rerender(<TableEditBar selected={[1]} onDelete={handlers.onDelete} />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('批次結帳列：顯示勾選筆數，結帳中停用並改文字', () => {
    const onMarkPaid = jest.fn()
    const { container, rerender } = render(<TableCheckoutBar onMarkPaid={onMarkPaid} />)
    expect(container.firstChild).toHaveAttribute('hidden')
    rerender(<TableCheckoutBar selected={[1, 2, 3]} onMarkPaid={onMarkPaid} />)
    expect(container).toHaveTextContent('3 selected')
    fireEvent.click(screen.getByRole('button', { name: '結帳' }))
    expect(onMarkPaid).toHaveBeenCalledTimes(1)
    rerender(<TableCheckoutBar selected={[1]} onMarkPaid={onMarkPaid} checkoutProcessing />)
    expect(screen.getByRole('button', { name: '結帳中...' })).toBeDisabled()
  })
})

describe('PasswordDialog', () => {
  it('輸入框為密碼欄；輸入、取消、確認都回呼；處理中兩鈕停用', () => {
    const onInput = jest.fn()
    const onCancel = jest.fn()
    const onConfirm = jest.fn()
    const { rerender } = render(
      <PasswordDialog open title="操作密碼" inputLabel="密碼" inputOnChange={onInput} handleOnCancel={onCancel} handleOnConfirm={onConfirm} />
    )
    expect(screen.getByText('操作密碼')).toBeInTheDocument()
    const input = screen.getByLabelText('密碼')
    expect(input).toHaveAttribute('type', 'password')
    fireEvent.change(input, { target: { value: '1234' } })
    expect(onInput).toHaveBeenCalledWith('1234')
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
    rerender(
      <PasswordDialog open isLoading title="操作密碼" inputLabel="密碼" inputOnChange={onInput} handleOnCancel={onCancel} handleOnConfirm={onConfirm} />
    )
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '確認' })).toBeDisabled()
  })

  // Jason 2026/10/22 fix all：原本寫成 PasswordDialog.prototype = {…}（不是 propTypes，型別檢查沒有作用，且列的是不存在的 props）
  it('propTypes 檢查實際使用的 props：型別不對時開發模式會警告', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <PasswordDialog open="no" title={1} inputLabel={2} isLoading="yes" handleOnCancel="x" handleOnConfirm="y" inputOnChange="z" />
    )
    const warned = spy.mock.calls.map(args => args.map(String).join(' ')).filter(text => /Failed (%s|prop) type/.test(text))
    ;['open', 'title', 'inputLabel', 'isLoading', 'handleOnCancel', 'handleOnConfirm', 'inputOnChange'].forEach(prop => {
      expect(warned.some(text => text.includes(`\`${prop}\``))).toBe(true)
    })
    spy.mockRestore()
  })
})

describe('ReferToggleButton 虛／實業績', () => {
  it('點選回傳 FAKE／TRUTH；再點已選的回傳 null；停用時不可點', () => {
    const onChange = jest.fn()
    const { rerender } = render(<ReferToggleButton value="FAKE" onChange={onChange} />)
    expect(screen.getByRole('button', { name: '虛業績' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: '實業績' }))
    expect(onChange).toHaveBeenLastCalledWith('TRUTH')
    fireEvent.click(screen.getByRole('button', { name: '虛業績' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
    rerender(<ReferToggleButton value="FAKE" onChange={onChange} disabled />)
    expect(screen.getByRole('button', { name: '實業績' })).toBeDisabled()
  })
})

describe('SearchField', () => {
  it('輸入回傳文字；按清除圖示回傳空字串', () => {
    const onChange = jest.fn()
    const { container } = render(<SearchField value="洗" onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('名稱/代號'), { target: { value: '洗髮' } })
    expect(onChange).toHaveBeenLastCalledWith('洗髮')
    const svgs = container.querySelectorAll('svg')
    fireEvent.click(svgs[svgs.length - 1])
    expect(onChange).toHaveBeenLastCalledWith('')
  })
})

describe('GenericMoreButton', () => {
  it('打開更多選單後點「報表匯出」呼叫匯出；選單隨之關閉', async () => {
    const onExport = jest.fn()
    render(<GenericMoreButton handleMenuItem={onExport} />)
    const trigger = screen.getByRole('button', { name: '更多選項' })
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    const item = await screen.findByRole('menuitem', { name: '報表匯出' })
    fireEvent.click(item)
    expect(onExport).toHaveBeenCalledTimes(1)
    await wait(() => expect(screen.queryByRole('menuitem')).toBeNull())
  })
})

describe('Markdown', () => {
  it('原樣轉交 props 給 react-markdown、掛載後執行語法高亮，並套用呼叫端 className', () => {
    const Prism = require('prismjs')
    const highlight = jest.spyOn(Prism, 'highlightAll').mockImplementation(() => {})
    const { container } = render(<Markdown escapeHtml={false} source="# 版本更新" className="extra" />)
    expect(screen.getByTestId('react-markdown')).toHaveTextContent('# 版本更新')
    expect(screen.getByTestId('react-markdown')).toHaveAttribute('data-escape', 'false')
    expect(container.firstChild).toHaveClass('extra')
    expect(highlight).toHaveBeenCalledTimes(1)
    cleanup()
    const { container: plain } = render(<Markdown source="文字" />)
    expect(plain.firstChild.className).not.toMatch(/extra/)
    highlight.mockRestore()
  })
})

describe('ProgressBar 假進度', () => {
  it('每 300ms 前進；載入中走得慢（每次 <2），載入完走得快（每次 <15）；上限 100；卸載後停止', () => {
    jest.useFakeTimers()
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    let progress = 0
    const setProgress = updater => {
      progress = updater(progress)
    }
    const { rerender, unmount } = render(<ProgressBar dataLoading setProgress={setProgress} progress={30} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30')
    act(() => jest.advanceTimersByTime(300))
    expect(progress).toBe(1)
    rerender(<ProgressBar dataLoading={false} setProgress={setProgress} progress={progress} />)
    act(() => jest.advanceTimersByTime(300))
    expect(progress).toBe(8.5)
    progress = 99
    act(() => jest.advanceTimersByTime(300))
    expect(progress).toBe(100)
    unmount()
    progress = 0
    act(() => jest.advanceTimersByTime(3000))
    expect(progress).toBe(0)
    Math.random.mockRestore()
  })
})

describe('SourceSelect 客戶來源', () => {
  it('查詢中不顯示；回來後列出來源、可加「無」選項，選取回呼 onChange', async () => {
    const onChange = jest.fn()
    const { container, settle } = renderPage(<SourceSelect onChange={onChange} value="" emptyOption className="x" />, {
      fixtures: { GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '路過'] } },
    })
    expect(container.querySelector('select')).toBeNull()
    await settle()
    const select = container.querySelector('select[name="source"]')
    expect([...select.options].map(o => o.textContent)).toEqual(['無', '朋友介紹', '路過'])
    fireEvent.change(select, { target: { value: '2' } })
    expect(onChange.mock.calls[0][0].target).toEqual({ value: '路過', name: 'source' })
  })

  it('沒有「無」選項時只列來源；value 為 null 視為空', async () => {
    const { container, settle } = renderPage(<SourceSelect onChange={() => {}} value={null} />, {
      fixtures: { GET_CUSTOMER_REFERENCE: { getCustomerReference: ['路過'] } },
    })
    await settle()
    expect([...container.querySelector('select').options].map(o => o.textContent).filter(Boolean)).toEqual(['路過'])
  })

  // 已修正（Jason 2026/10/22 fix all）：查詢失敗時 data 為 undefined，原本直接讀 data.getCustomerReference.map 而拋錯，
  // 整個內容區變成錯誤畫面（顧客新增／編輯表單都用它）；改為當成沒有來源選項
  it('查詢失敗時不拋錯：只剩「無」選項（沒有來源可選）', async () => {
    const { container, settle } = renderPage(<SourceSelect onChange={() => {}} emptyOption />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect([...container.querySelector('select[name="source"]').options].map(o => o.textContent).filter(Boolean)).toEqual(['無'])
  })
})

describe('CalendarColorClip', () => {
  it('readableTextOn：淺底色用深字、格式不對（含沒有 #、三碼色）一律白字；純黑底用白字', () => {
    expect(readableTextOn('#FFEB3B')).toBe('#111111')
    expect(readableTextOn('FFFFFF')).toBe('#111111')
    expect(readableTextOn('#000000')).toBe('#FFFFFF')
    expect(readableTextOn('#FFF')).toBe('#FFFFFF')
    expect(readableTextOn(undefined)).toBe('#FFFFFF')
  })

  it('畫面上殘留的 MuiChip-root class 會被移除', () => {
    const stale = document.createElement('div')
    stale.className = 'MuiChip-root keep'
    document.body.appendChild(stale)
    render(<CalendarColorClip />)
    expect(stale.className).toBe('keep')
    stale.remove()
  })
})

describe('CustomMockedProvider（測試用）', () => {
  const Q = gql`
    query DEMO_Q {
      hello
    }
  `
  const Probe = () => {
    const { data, error } = useQuery(Q)
    if (error) return <span>錯誤</span>
    return <span>{data ? data.hello : '載入中'}</span>
  }

  it('以 mocks 回應查詢；GraphQL 錯誤與沒有對應 mock 的網路錯誤都會記錄到 console.log', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    render(
      <CustomMockedProvider mocks={[{ request: { query: Q }, result: { data: { hello: '你好' } } }]}>
        <Probe />
      </CustomMockedProvider>
    )
    expect(await screen.findByText('你好')).toBeInTheDocument()
    cleanup()
    render(
      <CustomMockedProvider mocks={[{ request: { query: Q }, result: { errors: [{ message: '壞了' }] } }]}>
        <Probe />
      </CustomMockedProvider>
    )
    expect(await screen.findByText('錯誤')).toBeInTheDocument()
    expect(log.mock.calls.some(c => String(c[0]).includes('[GraphQL error]: Message: 壞了'))).toBe(true)
    cleanup()
    render(
      <CustomMockedProvider>
        <Probe />
      </CustomMockedProvider>
    )
    expect(await screen.findByText('錯誤')).toBeInTheDocument()
    expect(log.mock.calls.some(c => String(c[0]).includes('[Network error]'))).toBe(true)
    log.mockRestore()
  })
})

describe('AccountingSubjectsAutocomplete 會計科目', () => {
  const subjects = [
    { id: 'r1', name: '服務收入', number: 4100, inoutType: 'REVENUE', isUsing: true },
    { id: 'r2', name: '停用收入', number: 4200, inoutType: 'REVENUE', isUsing: false },
    { id: 'e1', name: '水電費', number: 6100, inoutType: 'EXPENDITURE', isUsing: true },
    { id: 'e2', name: '停用支出', number: 6200, inoutType: 'EXPENDITURE', isUsing: false },
  ]
  it('支出科目只列使用中的支出；選取值以名稱對應顯示「編號 名稱」', async () => {
    const { settle } = renderPage(<AccountingSubjectsAutocomplete inoutType="EXPENDITURE" open value={{ title: '水電費' }} />, {
      fixtures: { GET_ACCOUNTING_SUBJECTS: { accountingSubjects: subjects } },
    })
    await settle()
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['6100 水電費'])
    expect(screen.getByRole('combobox')).toHaveValue('6100 水電費')
  })

  it('查詢失敗：沒有選項也不壞', async () => {
    const { settle } = renderPage(<AccountingSubjectsAutocomplete inoutType="REVENUE" open />, { fallback: 'error' })
    await settle()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByRole('combobox')).toHaveValue('')
  })
})
