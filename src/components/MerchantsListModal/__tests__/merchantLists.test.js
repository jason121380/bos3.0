// 保護：跨店報表（排行榜、整體業績、設計師業績）、活動規則與個人頁釘選表用的「選擇店家」。
// 下拉只顯示已選店家（點輸入框或「選擇店家」開樹狀窗、「全選」一次全選）；樹狀窗：全部／群組（含巢狀群組）／未分組店家，
// 勾群組＝選取群組底下所有店家、半選狀態、點店家切換選取、搜尋時標紅框並展開「全部」、展開全部／收合、清除選取；
// 「確認」才寫回，「關閉」／Esc 丟棄這次的勾選。回傳給頁面的是店家 id 陣列。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import React from 'react'

import { callsOf, renderPage } from '__tests__/testkit.test'
import MerchantListAutocpmplete from 'components/MerchantListAutocpmplete'
import MerchantListAutocpmpleteForManagement from 'components/MerchantListAutocpmpleteForManagement'
import MerchantListAutocpmpleteForPinnedTable from 'components/MerchantListAutocpmpleteForPinnedTable'

afterEach(cleanup)

const m = (id, name) => ({ id, name })
const M1 = m('m1', '甲店')
const M2 = m('m2', '乙店')
const M3 = m('m3', '丙店')
const M4 = m('m4', '丁店')
const merchantList = {
  allMerchants: [M1, M2, M3, M4],
  groups: [
    { no: 'G1', name: '北區', merchants: [M1, M2], groups: [] },
    // 三層：總部 → 南區 → 高雄（群組底下的店家要一路往下收集）
    { no: null, name: '總部', merchants: [], groups: [{ no: 'G2', name: '南區', merchants: [], groups: [{ no: 'G3', name: '高雄', merchants: [M3], groups: [] }] }] },
  ],
  merchants: [M4],
}
const json = JSON.stringify(merchantList)

const dialog = () => screen.getByRole('dialog', { name: '店家列表' })
const treeLabel = text => within(dialog()).getByText(text)
const toggleNode = text => fireEvent.click(treeLabel(text))
// 群組列：Checkbox 與 TreeItem 並排在同一個 div
const groupCheckbox = text => treeLabel(text).closest('li').parentElement.querySelector('input[type="checkbox"]')
const itemsIn = text => [...treeLabel(text).closest('li').querySelectorAll('ul [role="treeitem"]')]
const selectedNames = () => [...dialog().querySelectorAll('li.onSelect')].map(li => li.textContent)
const lastIds = fn => fn.mock.calls[fn.mock.calls.length - 1][0]
const chips = () => screen.queryAllByRole('button', { name: /^移除 / }).map(b => b.getAttribute('aria-label').replace('移除 ', ''))

describe('MerchantListAutocpmplete 選擇店家（跨店報表）', () => {
  const setup = async () => {
    const onValueChange = jest.fn()
    const utils = renderPage(<MerchantListAutocpmplete onValueChange={onValueChange} />, { fixtures: { GET_USER_MERCHANTS: { getUserMerchant: json } } })
    await utils.settle()
    return { ...utils, onValueChange }
  }

  it('一開始沒有選店家；全選回傳所有店家 id 並顯示成標籤；移除標籤更新回傳', async () => {
    const { onValueChange } = await setup()
    expect(onValueChange).toHaveBeenCalledWith([])
    fireEvent.click(screen.getByText('全選'))
    expect(lastIds(onValueChange)).toEqual(['m1', 'm2', 'm3', 'm4'])
    expect(chips()).toEqual(['甲店', '乙店', '丙店', '丁店'])
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 乙店' }))
    expect(lastIds(onValueChange)).toEqual(['m1', 'm3', 'm4'])
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('點輸入框或「選擇店家」開樹狀窗；點欄位外框或圖示不開', async () => {
    await setup()
    const input = screen.getByRole('combobox')
    // 點欄位外框（不是輸入框）不開
    fireEvent.click(input.parentElement)
    expect(screen.queryByRole('dialog')).toBeNull()
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    input.parentElement.appendChild(path)
    fireEvent.click(path)
    expect(screen.queryByRole('dialog')).toBeNull()
    // 輸入框一取得焦點就移開（不讓手機跳出鍵盤），點擊才開窗
    fireEvent.focusIn(input)
    fireEvent.click(input)
    expect(dialog()).toBeInTheDocument()
    fireEvent.click(within(dialog()).getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    expect(dialog()).toBeInTheDocument()
  })

  it('樹狀窗：展開「全部」點店家切換選取；確認後寫回；關閉則丟棄這次的勾選', async () => {
    const { onValueChange } = await setup()
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    expect(treeLabel('全部(4)')).toBeInTheDocument()
    expect(treeLabel('G1 - 北區(2)')).toBeInTheDocument()
    expect(treeLabel('- 總部(1)')).toBeInTheDocument()
    toggleNode('全部(4)')
    expect(itemsIn('全部(4)').map(li => li.textContent)).toEqual(['甲店', '乙店', '丙店', '丁店'])
    fireEvent.click(within(itemsIn('全部(4)')[0]).getByText('甲店'))
    fireEvent.click(within(itemsIn('全部(4)')[2]).getByText('丙店'))
    fireEvent.click(within(itemsIn('全部(4)')[2]).getByText('丙店'))
    fireEvent.click(within(itemsIn('全部(4)')[1]).getByText('乙店'))
    expect(selectedNames()).toEqual(['甲店', '乙店'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '確認' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(lastIds(onValueChange)).toEqual(['m1', 'm2'])

    // 再開：帶入已選；勾了丁店後按關閉 → 不寫回
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    toggleNode('全部(4)')
    expect(selectedNames()).toEqual(['甲店', '乙店'])
    fireEvent.click(within(itemsIn('全部(4)')[3]).getByText('丁店'))
    fireEvent.click(within(dialog()).getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(lastIds(onValueChange)).toEqual(['m1', 'm2'])
  })

  it('勾群組＝選取底下所有店家（含巢狀群組）；部分選取時半選；再取消勾選移除；全部勾選框', async () => {
    const { onValueChange } = await setup()
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    const north = groupCheckbox('G1 - 北區(2)')
    const hq = groupCheckbox('- 總部(1)')
    const all = groupCheckbox('全部(4)')
    fireEvent.click(north)
    expect(north).toBeChecked()
    expect(all.indeterminate).toBe(true)
    fireEvent.click(hq)
    expect(hq).toBeChecked()
    // 展開總部 → 南區群組；南區已全選
    toggleNode('- 總部(1)')
    expect(groupCheckbox('G2 - 南區(1)')).toBeChecked()
    // 只選北區其中一家 → 北區半選
    toggleNode('G1 - 北區(2)')
    fireEvent.click(within(itemsIn('G1 - 北區(2)')[0]).getByText('甲店'))
    expect(north.indeterminate).toBe(true)
    fireEvent.click(north)
    fireEvent.click(north)
    expect(north).not.toBeChecked()
    expect(north.indeterminate).toBe(false)
    fireEvent.click(all)
    expect(all).toBeChecked()
    fireEvent.click(within(dialog()).getByRole('button', { name: '確認' }))
    expect(lastIds(onValueChange)).toEqual(['m1', 'm2', 'm3', 'm4'])
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    fireEvent.click(groupCheckbox('全部(4)'))
    expect(groupCheckbox('全部(4)')).not.toBeChecked()
    fireEvent.click(within(dialog()).getByRole('button', { name: '確認' }))
    expect(lastIds(onValueChange)).toEqual([])
  })

  it('搜尋店家：符合的店家加紅框並自動展開「全部」；清除搜尋文字；清除選取；展開全部再按一次收合；Esc 關閉', async () => {
    await setup()
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    fireEvent.click(groupCheckbox('G1 - 北區(2)'))
    fireEvent.change(within(dialog()).getByPlaceholderText('搜尋店家'), { target: { value: '甲' } })
    const outlined = itemsIn('全部(4)').filter(li => li.className.includes('outline'))
    expect(outlined.map(li => li.textContent)).toEqual(['甲店'])
    fireEvent.change(within(dialog()).getByPlaceholderText('搜尋店家'), { target: { value: '不存在' } })
    expect(itemsIn('全部(4)').some(li => li.className.includes('outline'))).toBe(false)
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除搜尋文字' }))
    expect(within(dialog()).getByPlaceholderText('搜尋店家')).toHaveValue('')
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除選取' }))
    expect(groupCheckbox('G1 - 北區(2)')).not.toBeChecked()
    fireEvent.click(within(dialog()).getByRole('button', { name: '展開全部' }))
    expect(treeLabel('G2 - 南區(1)')).toBeInTheDocument()
    expect(treeLabel('全部(4)').closest('li')).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(within(dialog()).getByRole('button', { name: '展開全部' }))
    expect(treeLabel('全部(4)').closest('li')).toHaveAttribute('aria-expanded', 'false')
    toggleNode('全部(4)')
    toggleNode('全部(4)')
    expect(treeLabel('全部(4)').closest('li')).toHaveAttribute('aria-expanded', 'false')
    fireEvent.keyDown(dialog(), { key: 'Escape' })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('沒有群組、沒有未分組店家、沒有店家時樹狀窗仍可開；沒給 onValueChange 不拋錯', async () => {
    const { settle } = renderPage(<MerchantListAutocpmplete />, {
      fixtures: { GET_USER_MERCHANTS: { getUserMerchant: JSON.stringify({ allMerchants: [], groups: [], merchants: [] }) } },
    })
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    expect(treeLabel('全部(0)')).toBeInTheDocument()
    expect(within(dialog()).queryAllByRole('treeitem')).toHaveLength(1)
  })

  // 已知缺口（待 Jason 決定）：查詢失敗時 data 為 undefined，元件直接 JSON.parse(data.getUserMerchant) 而拋錯，整頁變成錯誤畫面
  it('目前行為：店家清單查詢失敗時拋錯', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const { settle, findByText } = renderPage(<MerchantListAutocpmplete />, { fallback: 'error' })
    await settle()
    expect(await findByText('這個頁面發生錯誤')).toBeInTheDocument()
    console.error.mockRestore()
  })
})

describe('MerchantListAutocpmpleteForManagement 選擇店家（活動）', () => {
  it('一般：查詢可管理店家；selectIds 預先選取；確認後回傳 id', async () => {
    const onValueChange = jest.fn()
    const { settle, calls } = renderPage(<MerchantListAutocpmpleteForManagement selectIds={['m2']} onValueChange={onValueChange} />, {
      fixtures: { GET_USER_MERCHANTS_FOR_MANAGEMENT: { advancedManagerMerchants: json } },
    })
    await settle()
    expect(callsOf(calls, 'GET_USER_MERCHANTS_FOR_MANAGEMENT')).toHaveLength(1)
    await wait(() => expect(lastIds(onValueChange)).toEqual(['m2']))
    expect(chips()).toEqual(['乙店'])
    fireEvent.focusIn(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('全選'))
    expect(lastIds(onValueChange)).toEqual(['m1', 'm2', 'm3', 'm4'])
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 甲店' }))
    expect(lastIds(onValueChange)).toEqual(['m2', 'm3', 'm4'])
    fireEvent.click(screen.getByRole('combobox'))
    toggleNode('全部(4)')
    fireEvent.click(within(itemsIn('全部(4)')[3]).getByText('丁店'))
    fireEvent.click(within(dialog()).getByRole('button', { name: '確認' }))
    expect(lastIds(onValueChange)).toEqual(['m2', 'm3'])
    fireEvent.click(screen.getByRole('combobox').parentElement)
    expect(screen.queryByRole('dialog')).toBeNull()
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    screen.getByRole('combobox').parentElement.appendChild(path)
    fireEvent.click(path)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('活動規則（inRule＋eventId）：改查參加活動的店家；唯讀時沒有全選與選擇店家、點輸入框不開', async () => {
    const onValueChange = jest.fn()
    const { settle, calls } = renderPage(
      <MerchantListAutocpmpleteForManagement inRule eventId="ev1" isReadOnly selectIds={['m1', 'm4']} onValueChange={onValueChange} />,
      { fixtures: { GET_EVENT_JOIN_MERCHANTS: { eventJoinedMerchants: json } } }
    )
    await settle()
    expect(callsOf(calls, 'GET_EVENT_JOIN_MERCHANTS')[0].variables).toEqual({ eventId: 'ev1' })
    expect(callsOf(calls, 'GET_USER_MERCHANTS_FOR_MANAGEMENT')).toHaveLength(0)
    await wait(() => expect(lastIds(onValueChange)).toEqual(['m1', 'm4']))
    expect(screen.queryByText('全選')).toBeNull()
    expect(screen.queryByRole('button', { name: '選擇店家' })).toBeNull()
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('預設值：沒給 selectIds／onValueChange 時不選任何店家、不拋錯；查詢失敗時清單為空', async () => {
    const { settle } = renderPage(<MerchantListAutocpmpleteForManagement />, { fallback: 'error' })
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    expect(treeLabel('全部(0)')).toBeInTheDocument()
    cleanup()
    const { settle: s2 } = renderPage(<MerchantListAutocpmpleteForManagement />, {
      fixtures: { GET_USER_MERCHANTS_FOR_MANAGEMENT: { advancedManagerMerchants: json } },
    })
    await s2()
    expect(chips()).toEqual([])
  })
})

describe('MerchantListAutocpmpleteForPinnedTable 選擇店家（個人頁釘選表）', () => {
  function Harness({ initial = [], isClick = false, onValueChange }) {
    const [selectIds, setSelectIds] = React.useState(initial)
    const [values, setValues] = React.useState([])
    return (
      <>
        <output data-testid="modal-values">{values.join(',')}</output>
        <MerchantListAutocpmpleteForPinnedTable
          values={values}
          setValues={setValues}
          selectIds={selectIds}
          isClick={isClick}
          onValueChange={ids => {
            onValueChange(ids)
            setSelectIds(ids)
          }}
        />
      </>
    )
  }
  const setup = async props => {
    const onValueChange = jest.fn()
    const utils = renderPage(<Harness onValueChange={onValueChange} {...props} />, {
      fixtures: { GET_USER_GROUPS_WOCS: { getUserGroupWOCS: json } },
    })
    await utils.settle()
    return { ...utils, onValueChange }
  }

  it('已選店家顯示成標籤；全選與移除標籤直接回傳 id', async () => {
    const { onValueChange } = await setup({ initial: ['m3'] })
    expect(chips()).toEqual(['丙店'])
    fireEvent.click(screen.getByText('全選'))
    expect(lastIds(onValueChange)).toEqual(['m1', 'm2', 'm3', 'm4'])
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 丁店' }))
    expect(lastIds(onValueChange)).toEqual(['m1', 'm2', 'm3'])
  })

  it('開窗時把已選帶入暫存、關窗清空；點店家、勾群組都改暫存；確認才回傳', async () => {
    const { onValueChange } = await setup({ initial: ['m1'] })
    fireEvent.focusIn(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByTestId('modal-values')).toHaveTextContent('m1')
    toggleNode('全部(4)')
    expect(selectedNames()).toEqual(['甲店'])
    fireEvent.click(within(itemsIn('全部(4)')[0]).getByText('甲店'))
    fireEvent.click(within(itemsIn('全部(4)')[3]).getByText('丁店'))
    expect(screen.getByTestId('modal-values')).toHaveTextContent('m4')
    const north = groupCheckbox('G1 - 北區(2)')
    fireEvent.click(north)
    expect(north).toBeChecked()
    toggleNode('- 總部(1)')
    expect(groupCheckbox('- 總部(1)')).not.toBeChecked()
    fireEvent.click(within(dialog()).getByRole('button', { name: '確認' }))
    expect(lastIds(onValueChange)).toEqual(['m4', 'm1', 'm2'])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByTestId('modal-values')).toHaveTextContent('')
  })

  it('勾選再取消群組、半選、全部勾選框、搜尋紅框、清除選取、展開全部、關閉不回傳', async () => {
    const { onValueChange } = await setup()
    onValueChange.mockClear()
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    const north = groupCheckbox('G1 - 北區(2)')
    fireEvent.click(north)
    toggleNode('G1 - 北區(2)')
    fireEvent.click(within(itemsIn('G1 - 北區(2)')[1]).getByText('乙店'))
    expect(north.indeterminate).toBe(true)
    fireEvent.click(north)
    fireEvent.click(north)
    expect(north).not.toBeChecked()
    const all = groupCheckbox('全部(4)')
    fireEvent.click(all)
    expect(all).toBeChecked()
    fireEvent.click(all)
    expect(all).not.toBeChecked()
    fireEvent.change(within(dialog()).getByPlaceholderText('搜尋店家'), { target: { value: '丁' } })
    expect(itemsIn('全部(4)').filter(li => li.className.includes('outline')).map(li => li.textContent)).toEqual(['丁店'])
    // 未分組的丁店也標紅框
    fireEvent.change(within(dialog()).getByPlaceholderText('搜尋店家'), { target: { value: '' } })
    fireEvent.change(within(dialog()).getByPlaceholderText('搜尋店家'), { target: { value: 'x' } })
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除搜尋文字' }))
    fireEvent.click(all)
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除選取' }))
    expect(all).not.toBeChecked()
    fireEvent.click(within(dialog()).getByRole('button', { name: '展開全部' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '展開全部' }))
    toggleNode('- 總部(1)')
    toggleNode('- 總部(1)')
    fireEvent.click(within(dialog()).getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    fireEvent.keyDown(dialog(), { key: 'Escape' })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('儲存中（isClick）時全選、選擇店家停用；點標籤區其他地方或圖示不開窗；沒給 selectIds／onValueChange 時不拋錯', async () => {
    await setup({ isClick: true })
    expect(screen.getByRole('button', { name: '選擇店家' })).toBeDisabled()
    expect(screen.getByText('全選')).toHaveAttribute('aria-disabled', 'true')
    cleanup()
    await setup()
    fireEvent.click(screen.getByRole('combobox').parentElement)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    screen.getByRole('combobox').parentElement.appendChild(path)
    fireEvent.click(path)
    expect(screen.queryByRole('dialog')).toBeNull()
    cleanup()
    const Bare = () => {
      const [values, setValues] = React.useState([])
      return <MerchantListAutocpmpleteForPinnedTable values={values} setValues={setValues} />
    }
    const { settle } = renderPage(<Bare />, {
      fixtures: { GET_USER_GROUPS_WOCS: { getUserGroupWOCS: JSON.stringify({ allMerchants: [], groups: [], merchants: [] }) } },
    })
    await settle()
    expect(() => fireEvent.click(screen.getByText('全選'))).not.toThrow()
    fireEvent.click(screen.getByRole('button', { name: '選擇店家' }))
    expect(treeLabel('全部(0)')).toBeInTheDocument()
  })
})
