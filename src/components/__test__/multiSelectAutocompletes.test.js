// 保護：活動規則、報表篩選共用的多選下拉（歸屬、活動、付款方式、卡券、帳單來源）與會員卡清單、儲值／扣除切換、快捷組合彈窗。
// 重點：選項來自正確的查詢、選取後回傳給頁面的是 id／value 陣列（後端吃的格式）、已選值以 id 對回選項、
// 卡券依編號排序並可用編號或名稱篩選、沒有權限的儲值動作不顯示；查詢失敗或沒給 value 時不拋錯、當成沒有選項（Jason 2026/10/22 fix all）。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import React from 'react'

import { PAGE_CRASH_TEXT, renderPage } from '__tests__/testkit.test'
import BelongAutocomplete from 'components/BelongAutocomplete'
import MainEventAutocomplete from 'components/MainEventAutocomplete'
import MembershipCardList from 'components/MembershipCardList'
import PaywayAutocomplete from 'components/PaywayAutocomplete'
import ShortcutDialog from 'components/ShortcutDialog'
import SourcesAutocomplete from 'components/SourcesAutocomplete'
import TicketsAutocomplete from 'components/TicketsAutocomplete'
import WalletDepositToggleButton from 'components/WalletDepositToggleButton'

afterEach(cleanup)

const openCombo = () => fireEvent.click(screen.getByRole('combobox'))
const optionTexts = () => screen.queryAllByRole('option').map(o => o.textContent)

describe('BelongAutocomplete 歸屬', () => {
  it('fetchData：自行查詢歸屬，選項為名稱；勾選回傳名稱陣列', async () => {
    const onChange = jest.fn()
    const { settle, calls } = renderPage(<BelongAutocomplete fetchData value={['店內']} onChange={onChange} />, {
      fixtures: {
        USE_FETCH_GET_ATTRIBUTIONS: {
          getAttribution: [
            { name: '店內', value: 'IN' },
            { name: '外場', value: 'OUT' },
          ],
        },
      },
    })
    await settle()
    expect(calls.map(c => c.operationName)).toContain('USE_FETCH_GET_ATTRIBUTIONS')
    openCombo()
    expect(optionTexts()).toEqual(['店內', '外場'])
    fireEvent.click(screen.getByRole('option', { name: '外場' }))
    expect(onChange).toHaveBeenLastCalledWith(['店內', '外場'])
  })

  it('沒有 fetchData：用呼叫端給的選項、不查詢；isloading 時停用；唯讀時不開選單', async () => {
    const { settle, calls } = renderPage(<BelongAutocomplete optionData={['A 區']} value={[]} />)
    await settle()
    expect(calls).toHaveLength(0)
    openCombo()
    expect(optionTexts()).toEqual(['A 區'])
    cleanup()
    renderPage(<BelongAutocomplete optionData={['A 區']} value={[]} isloading />)
    expect(screen.getByRole('combobox')).toBeDisabled()
    cleanup()
    renderPage(<BelongAutocomplete optionData={['A 區']} value={['A 區']} isReadOnly />)
    openCombo()
    expect(optionTexts()).toEqual([])
  })

  // 已修正（Jason 2026/10/22 fix all）：optionData 原本只在掛載時讀一次，呼叫端的選項較晚才到時下拉仍是空的；改為跟著 optionData 更新
  it('掛載後才傳入的 optionData 會更新選項', async () => {
    const Wrapper = () => {
      const [data, setData] = React.useState([])
      return (
        <>
          <button type="button" onClick={() => setData(['晚到'])}>
            載入選項
          </button>
          <BelongAutocomplete optionData={data} value={[]} />
        </>
      )
    }
    renderPage(<Wrapper />)
    fireEvent.click(screen.getByRole('button', { name: '載入選項' }))
    openCombo()
    expect(optionTexts()).toEqual(['晚到'])
  })
})

describe('MainEventAutocomplete 活動', () => {
  const fixtures = {
    GET_MAIN_EVENTS_FOR_AUTOCOMPLETE: {
      mainEvents: [
        { id: 'e1', nameDefault: '母親節' },
        { id: 'e2', nameDefault: '週年慶' },
      ],
    },
  }

  it('已選 id 對回活動名稱；勾選回傳 id 陣列；清除回傳空陣列', async () => {
    const onChange = jest.fn()
    const { settle } = renderPage(<MainEventAutocomplete value={['e2']} onChange={onChange} />, { fixtures })
    await settle()
    expect(screen.getByText('週年慶')).toBeInTheDocument()
    openCombo()
    expect(optionTexts()).toEqual(['母親節', '週年慶'])
    fireEvent.click(screen.getByRole('option', { name: '母親節' }))
    expect(onChange).toHaveBeenLastCalledWith(['e2', 'e1'])
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  // 已修正（Jason 2026/10/22 fix all）：沒給 value 時預設值原本是參數上的 []，每次渲染都是新陣列，查詢回來後 effect（依賴 value）
  // 每次渲染都 setState，形成無限重新渲染；改用模組層的空陣列常數
  it('沒給 value：查詢回來前選單停用；回來後列出活動、不選任何活動（不會無限重新渲染）', async () => {
    const { settle } = renderPage(<MainEventAutocomplete />, { fixtures, delays: { GET_MAIN_EVENTS_FOR_AUTOCOMPLETE: 30 } })
    expect(screen.getByRole('combobox')).toBeDisabled()
    await settle()
    expect(screen.getByRole('combobox')).not.toBeDisabled()
    expect(screen.queryByRole('button', { name: /移除/ })).toBeNull()
    openCombo()
    expect(optionTexts()).toEqual(['母親節', '週年慶'])
  })

  // 已修正（Jason 2026/10/22 fix all）：查詢失敗時 data 為 undefined，原本直接 .filter 而拋錯（整個內容區變成錯誤畫面）；改為當成沒有活動
  it('查詢失敗時不拋錯，沒有選項', async () => {
    const { settle } = renderPage(<MainEventAutocomplete value={['e1']} />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    openCombo()
    expect(optionTexts()).toEqual([])
  })
})

describe('PaywayAutocomplete 付款方式', () => {
  const fixtures = {
    GET_PAY_WAYS: {
      payWays: [
        { value: 'CASH', label: '現金' },
        { value: 'CARD', label: '信用卡' },
      ],
    },
  }

  it('已選 value 對回標籤；勾選回傳 value 陣列；再次點選取消勾選', async () => {
    const onChange = jest.fn()
    const { settle } = renderPage(<PaywayAutocomplete value={['CASH']} onChange={onChange} />, { fixtures })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual(['現金', '信用卡'])
    expect(screen.getByRole('option', { name: '現金' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('option', { name: '信用卡' }))
    expect(onChange).toHaveBeenLastCalledWith(['CASH', 'CARD'])
    fireEvent.click(screen.getByRole('option', { name: '現金' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  // 已修正（Jason 2026/10/22 fix all）：value 沒給或查詢失敗時原本直接 .includes／.filter 而拋錯；改為當成沒選／沒有選項
  it('沒給 value 時不拋錯、不選任何方式；查詢失敗時沒有選項', async () => {
    const { settle } = renderPage(<PaywayAutocomplete />, { fixtures })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    openCombo()
    expect(optionTexts()).toEqual(['現金', '信用卡'])
    expect(screen.getByRole('option', { name: '現金' })).toHaveAttribute('aria-selected', 'false')
    cleanup()
    const { settle: s2 } = renderPage(<PaywayAutocomplete value={['CASH']} />, { fallback: 'error' })
    await s2()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    openCombo()
    expect(optionTexts()).toEqual([])
  })
})

describe('TicketsAutocomplete 卡券', () => {
  const fixtures = {
    GET_TICKETS_FOR_AUTOCOMPLETE: {
      ticketsForList: [
        { id: 't2', no: 'B02', name: '護髮十次' },
        { id: 't1', no: 'A01', name: '洗髮五次' },
        { id: 't3', no: null, name: '沒有編號' },
        { id: 't4', no: ' ', name: '空白編號' },
      ],
    },
  }

  // 已修正（Jason 2026/10/22 fix all）：排序原本寫成 a.no - b.no，英數編號（A01、B02）相減得 NaN、維持後端順序；
  // 改為字串自然排序（utils/compareNo），空白編號排最後
  it('沒有編號的卡券不列出；空白編號仍列出但不加前綴、排最後；英數編號依自然順序', async () => {
    const { settle } = renderPage(<TicketsAutocomplete value={[]} />, { fixtures })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual(['A01 - 洗髮五次', 'B02 - 護髮十次', '空白編號'])
  })

  it('沒給 value 時不拋錯；查詢失敗時沒有選項（Jason 2026/10/22 fix all）', async () => {
    const { settle } = renderPage(<TicketsAutocomplete />, { fixtures })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    openCombo()
    expect(optionTexts()).toHaveLength(3)
    cleanup()
    const { settle: s2 } = renderPage(<TicketsAutocomplete value={['t1']} />, { fallback: 'error' })
    await s2()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    openCombo()
    expect(optionTexts()).toEqual([])
  })

  it('純數字編號依數值排序（2 排在 10 前面）', async () => {
    const { settle } = renderPage(<TicketsAutocomplete value={[]} />, {
      fixtures: {
        GET_TICKETS_FOR_AUTOCOMPLETE: {
          ticketsForList: [
            { id: 'a', no: '10', name: '十號' },
            { id: 'b', no: '2', name: '二號' },
          ],
        },
      },
    })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual(['2 - 二號', '10 - 十號'])
  })

  it('輸入編號或名稱篩選（不分大小寫）；勾選回傳 id 陣列；已選 id 顯示成名稱', async () => {
    const onChange = jest.fn()
    const { settle } = renderPage(<TicketsAutocomplete value={['t2']} onChange={onChange} />, { fixtures })
    await settle()
    expect(screen.getByText('護髮十次')).toBeInTheDocument()
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'a01' } })
    expect(optionTexts()).toEqual(['A01 - 洗髮五次'])
    fireEvent.change(input, { target: { value: '護髮' } })
    expect(optionTexts()).toEqual(['B02 - 護髮十次'])
    fireEvent.change(input, { target: { value: '洗髮' } })
    fireEvent.click(screen.getByRole('option', { name: 'A01 - 洗髮五次' }))
    expect(onChange).toHaveBeenLastCalledWith(['t2', 't1'])
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })
})

describe('SourcesAutocomplete 帳單來源', () => {
  it('查詢中沒有選項；回來後列出來源，勾選回傳來源陣列', async () => {
    const onChange = jest.fn()
    const { settle } = renderPage(<SourcesAutocomplete value={[]} onChange={onChange} className="src" />, {
      fixtures: { GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '路過'] } },
    })
    openCombo()
    expect(optionTexts()).toEqual([])
    await settle()
    expect(optionTexts()).toEqual(['朋友介紹', '路過'])
    fireEvent.click(screen.getByRole('option', { name: '路過' }))
    expect(onChange).toHaveBeenLastCalledWith(['路過'])
  })

  it('查詢失敗：沒有選項也不壞；沒給 onChange 時勾選不拋錯', async () => {
    const { settle } = renderPage(<SourcesAutocomplete value={[]} />, { fallback: 'error' })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual([])
    cleanup()
    const { settle: settle2 } = renderPage(<SourcesAutocomplete value={[]} />, {
      fixtures: { GET_CUSTOMER_REFERENCE: { getCustomerReference: ['路過'] } },
    })
    await settle2()
    openCombo()
    expect(() => fireEvent.click(screen.getByRole('option', { name: '路過' }))).not.toThrow()
  })
})

describe('其他預設 onChange', () => {
  it('歸屬、活動、付款方式、卡券沒給 onChange 時勾選不拋錯', async () => {
    const cases = [
      [<BelongAutocomplete optionData={['A 區']} value={[]} />, {}, 'A 區'],
      [<MainEventAutocomplete value={[]} />, { GET_MAIN_EVENTS_FOR_AUTOCOMPLETE: { mainEvents: [{ id: 'e1', nameDefault: '母親節' }] } }, '母親節'],
      [<PaywayAutocomplete value={[]} />, { GET_PAY_WAYS: { payWays: [{ value: 'CASH', label: '現金' }] } }, '現金'],
      [<TicketsAutocomplete value={[]} />, { GET_TICKETS_FOR_AUTOCOMPLETE: { ticketsForList: [{ id: 't1', no: 'A', name: '卡' }] } }, 'A - 卡'],
    ]
    for (const [ui, fixtures, name] of cases) {
      const { settle } = renderPage(ui, { fixtures })
      await settle()
      openCombo()
      expect(() => fireEvent.click(screen.getByRole('option', { name }))).not.toThrow()
      cleanup()
    }
  })
})

describe('MembershipCardList 會員卡清單', () => {
  it('按鈕切換浮層；列出卡名、效期（null 顯示無效期）與備註', async () => {
    renderPage(
      <MembershipCardList
        data={[
          { membershipName: '金卡', expiryDay: new Date(2027, 0, 5), remark: '生日送' },
          { membershipName: '銀卡', expiryDay: null, remark: '' },
        ]}
      />
    )
    const button = screen.getByRole('button', { name: '會員卡清單' })
    fireEvent.click(button)
    const panel = await screen.findByRole('dialog', { name: '會員卡清單' })
    expect(within(panel).getByText('金卡')).toBeInTheDocument()
    expect(panel).toHaveTextContent('效期: 2027/01/05')
    expect(panel).toHaveTextContent('效期: 無效期')
    expect(panel).toHaveTextContent('備註: 生日送')
    fireEvent.click(button)
    await wait(() => expect(screen.queryByRole('dialog', { name: '會員卡清單' })).toBeNull())
    fireEvent.click(button)
    expect(await screen.findByRole('dialog', { name: '會員卡清單' })).toBeInTheDocument()
  })
})

describe('WalletDepositToggleButton 儲值／扣除', () => {
  it('只顯示有權限的動作；點選回傳動作；再點已選的不會變成空值', () => {
    const onChange = jest.fn()
    renderPage(<WalletDepositToggleButton value="ADD" onChange={onChange} identity={{ allowDepositAddition: true, allowDepositDeduction: true }} />)
    fireEvent.click(screen.getByRole('button', { name: '扣除' }))
    expect(onChange).toHaveBeenLastCalledWith('MINUS')
    onChange.mockClear()
    fireEvent.click(screen.getByRole('button', { name: '儲值' }))
    expect(onChange).not.toHaveBeenCalled()
    cleanup()
    renderPage(<WalletDepositToggleButton value="" onChange={onChange} identity={{ allowDepositAddition: false, allowDepositDeduction: true }} />)
    expect(screen.queryByRole('button', { name: '儲值' })).toBeNull()
    cleanup()
    renderPage(
      <WalletDepositToggleButton value="" onChange={onChange} disabled identity={{ allowDepositAddition: true, allowDepositDeduction: false }} />
    )
    expect(screen.queryByRole('button', { name: '扣除' })).toBeNull()
    expect(screen.getByRole('button', { name: '儲值' })).toBeDisabled()
  })
})

describe('ShortcutDialog 快捷組合', () => {
  it('開啟時才查詢；載入中顯示轉圈；點組合帶入並關閉', async () => {
    const onClose = jest.fn()
    const onPick = jest.fn()
    const shortcut = { id: 's1', name: '洗剪燙', services: [{ id: 'sv1' }], products: [], tickets: [], memberships: [] }
    const Wrapper = () => {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            快捷
          </button>
          <ShortcutDialog open={open} handleOnClose={onClose} handleShortcutChange={onPick} />
        </>
      )
    }
    const { settle, calls } = renderPage(<Wrapper />, {
      fixtures: { GET_SHORTCUTS_FOR_ORDERCREATE: { shortcuts: [shortcut] } },
      delays: { GET_SHORTCUTS_FOR_ORDERCREATE: 30 },
    })
    await settle()
    expect(calls).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: '快捷' }))
    const dialog = screen.getByRole('dialog', { name: '快捷組合' })
    expect(dialog.querySelector('.animate-spin')).not.toBeNull()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '洗剪燙' }))
    expect(onPick).toHaveBeenCalledWith(shortcut)
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(onClose).toHaveBeenCalledTimes(2)
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('沒有快捷組合時顯示無資料', async () => {
    const { settle } = renderPage(<ShortcutDialog open handleOnClose={() => {}} handleShortcutChange={() => {}} />, {
      fixtures: { GET_SHORTCUTS_FOR_ORDERCREATE: { shortcuts: [] } },
    })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })
})
