// 保護員工列表的兩個批量功能（只有角色有「批量抽成設定」權限才出現）：
// 1. 「編輯設計師抽成」：送出的 FETCH_SET_USER_RAKE 必須是勾選的員工與畫面上的級距——全段只送 nonSegmented（segmented 為空）、
//    分段只送 segmented；分指定／不指定各自的級距；依「抽成歸屬」分頁各自一組級距；抽成 % 超過 0～100 時提示並歸 0。
//    抽成送錯會直接讓整批設計師薪資算錯。關閉或儲存後清空勾選、表單回到預設。
// 2. 「由人員身分設定檔導入」：選身分類別且至少勾一項才可確認，送出的 input 為所選身分、勾選項目與員工；後端回 false 提示失敗、錯誤顯示訊息。
// GraphQL 全由模擬 link 回應，不連後端、不改真實抽成。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, USER_ID } from '../../../__tests__/testkit.test'
import EmployeeManagementList from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const employee = (id, lastName, firstName, designerNo) => ({
  id,
  lastName,
  firstName,
  designerNo,
  avatar: null,
  status: 'ok',
  nickName: '',
  cellphone: '0911000111',
  merchantIdentity: { authorityName: '設計師' },
  isUserRakeSet: true,
  deductionWay: '依服務',
})
const EMPLOYEES = [employee('e1', '王', '小美', '01'), employee('e2', '林', '大明', '02')]

const fixtures = (extra = {}) => ({
  DESIGNER: { merchantDesigner: { id: USER_ID, merchantIdentity: { authorityName: '店長', authorityId: 'auth-1' } } },
  GET_MERCHANT_AUTHORITIES: {
    getMerchantAuthorities: [
      {
        id: 'auth-1',
        authorityName: '店長',
        authoritySettings: JSON.stringify([
          { pageTitle: '員工及薪資', authority: true, pageAuthority: [{ pageName: '批量抽成設定', authority: true }] },
        ]),
      },
    ],
  },
  GET_USERS_IN_EMPLOYEE_LIST: { users: { totalCount: 2, users: EMPLOYEES } },
  USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: {
    getAttributionForRake: [
      { label: '預設', value: '預設' },
      { label: '洗髮', value: '洗髮' },
      { label: '染髮', value: '染髮' },
    ],
  },
  FETCH_SET_USER_RAKE: { setUserRake: true },
  GET_MERCHANT_JOBTITLE: {
    merchantJobTitlePoint: [
      { id: 'job-1', jobTitle: '設計師' },
      { id: 'job-2', jobTitle: '助理' },
    ],
  },
  SET_PERFORMANCE_RULE_FROM_PERSONAL_PROFILE: { setPerformanceRuleFromPersonProfile: true },
  ...extra,
})

const setup = extra => renderPage(<EmployeeManagementList />, { fixtures: fixtures(extra), route: '/management/employee' })

const selectBoth = async () => {
  await screen.findByText('共 2 筆')
  fireEvent.click(await screen.findByLabelText('選取 王小美'))
  fireEvent.click(screen.getByLabelText('選取 林大明'))
}
const openRakeModal = async () => {
  await selectBoth()
  fireEvent.click(screen.getByRole('button', { name: '編輯設計師抽成' }))
  return screen.findByText('編輯設計師抽成', { selector: 'h2' })
}
const dialog = () => within(screen.getByRole('dialog'))
const fields = label => dialog().getAllByLabelText(label)
const type = (input, value) => fireEvent.change(input, { target: { value } })
// 級距列：以標題文字找到該列，列內的圖示依序為刪除（第 2 列起）、新增（最後一列）
const tierRows = title => dialog().getAllByText(title).map(node => node.closest('.p-4').parentElement)
const iconIn = (row, kind) => row.querySelector(`svg[class*="${kind}"]`)
const add = row => fireEvent.click(iconIn(row, 'plus'))
const remove = row => fireEvent.click(iconIn(row, 'trash'))
const save = () => fireEvent.click(dialog().getByRole('button', { name: '儲存' }))
const sent = calls => callsOf(calls, 'FETCH_SET_USER_RAKE')[0].variables.input
const tab = name => fireEvent.mouseDown(dialog().getByRole('tab', { name }), { button: 0 })
const toggleDesignation = () => fireEvent.click(dialog().getByLabelText('分指定/不指定'))

beforeEach(() => loginAs())
afterEach(cleanup)

describe('編輯設計師抽成：全段', () => {
  it('不分指定：輸入級距、新增一級後送出勾選的員工與全段級距（segmented 為空），成功後清空勾選', async () => {
    const { calls } = setup()
    await openRakeModal()
    type(fields('輸入業績')[0], '0')
    type(fields('輸入抽成(%)')[0], '35.5')
    add(tierRows('總業績從(含)')[0])
    type(fields('輸入業績')[1], '100000')
    type(fields('輸入抽成(%)')[1], '40')
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '抽成更新成功', variant: 'success' }))
    expect(sent(calls)).toEqual({
      userId: ['e1', 'e2'],
      nonSegmented: [
        {
          attribute: '預設',
          rakeData: { designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 0, rake: 35.5 }, { threshold: 100000, rake: 40 }] },
        },
      ],
      segmented: [],
    })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByLabelText('選取 王小美')).not.toBeChecked()
    // 表單回到預設：再開一次只有一列 0
    await openRakeModal()
    expect(fields('輸入業績')).toHaveLength(1)
    expect(fields('輸入抽成(%)')[0]).toHaveValue(0)
  })

  // 不分指定：按第 3 列的刪除就刪第 3 列（Jason 2026/10/22：刪除鈕改傳該列 index；修正前把 click 事件當索引，一律刪第 1 列）。
  it('不分指定：按第 3 列的刪除就刪掉第 3 列', async () => {
    const { calls } = setup()
    await openRakeModal()
    type(fields('輸入業績')[0], '1')
    add(tierRows('總業績從(含)')[0])
    type(fields('輸入業績')[1], '2')
    add(tierRows('總業績從(含)')[1])
    type(fields('輸入業績')[2], '3')
    remove(tierRows('總業績從(含)')[2])
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sent(calls).nonSegmented[0].rakeData.nonDistinguish.map(t => t.threshold)).toEqual([1, 2])
  })

  it('抽成 % 超出 0～100 或業績為負時提示並歸 0', async () => {
    const { calls } = setup()
    await openRakeModal()
    type(fields('輸入抽成(%)')[0], '100.5')
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0~100之間的數字', variant: 'warning' })
    type(fields('輸入業績')[0], '-5')
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0以上的數字', variant: 'warning' })
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sent(calls).nonSegmented[0].rakeData.nonDistinguish).toEqual([{ threshold: 0, rake: 0 }])
  })

  it('分指定／不指定：指定與不指定各自的級距（新增、刪除）', async () => {
    const { calls } = setup()
    await openRakeModal()
    toggleDesignation()
    expect(dialog().getByText('指定業績')).toBeInTheDocument()
    // 指定：兩級後刪第 2 級
    const designateRows = () => tierRows('總業績從(含)').slice(0, dialog().getAllByText('總業績從(含)').length)
    type(fields('輸入業績')[0], '1000')
    type(fields('輸入抽成(%)')[0], '30')
    add(designateRows()[0])
    type(fields('輸入業績')[1], '9999')
    remove(designateRows()[1])
    // 不指定（目前畫面第 2 列）：新增一級
    type(fields('輸入業績')[1], '2000')
    type(fields('輸入抽成(%)')[1], '20')
    add(designateRows()[1])
    type(fields('輸入業績')[2], '50000')
    type(fields('輸入抽成(%)')[2], '25')
    // 再新增一級後刪掉
    add(designateRows()[2])
    remove(designateRows()[3])
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sent(calls).nonSegmented).toEqual([
      {
        attribute: '預設',
        rakeData: {
          designate: [{ threshold: 1000, rake: 30 }],
          nonDesignate: [{ threshold: 2000, rake: 20 }, { threshold: 50000, rake: 25 }],
          nonDistinguish: [],
        },
      },
    ])
    expect(sent(calls).segmented).toEqual([])
  })

  it('抽成歸屬分頁：每個分頁各自一組級距；切回已有的分頁沿用原本的級距', async () => {
    const { calls } = setup()
    await openRakeModal()
    type(fields('輸入抽成(%)')[0], '30')
    tab('洗髮')
    await wait(() => expect(dialog().getByRole('tab', { name: '洗髮' })).toHaveAttribute('aria-selected', 'true'))
    expect(fields('輸入抽成(%)')[0]).toHaveValue(0)
    type(fields('輸入抽成(%)')[0], '50')
    tab('預設')
    await wait(() => expect(fields('輸入抽成(%)')[0]).toHaveValue(30))
    tab('洗髮')
    await wait(() => expect(fields('輸入抽成(%)')[0]).toHaveValue(50))
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sent(calls).nonSegmented).toEqual([
      { attribute: '預設', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 0, rake: 30 }] } },
      { attribute: '洗髮', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 0, rake: 50 }] } },
    ])
  })

  it('分指定時開新分頁：新分頁為指定／不指定級距；切到不分指定的分頁時改回不分指定', async () => {
    const { calls } = setup()
    await openRakeModal()
    // 「預設」維持不分指定，先到「洗髮」建立一組不分指定
    tab('洗髮')
    await wait(() => expect(dialog().getByRole('tab', { name: '洗髮' })).toHaveAttribute('aria-selected', 'true'))
    // 回「預設」改成分指定
    tab('預設')
    toggleDesignation()
    expect(dialog().getByText('不指定業績')).toBeInTheDocument()
    // 開「染髮」：新分頁帶入指定／不指定各一級
    tab('染髮')
    await wait(() => expect(dialog().getByRole('tab', { name: '染髮' })).toHaveAttribute('aria-selected', 'true'))
    expect(dialog().getByText('指定業績')).toBeInTheDocument()
    type(fields('輸入抽成(%)')[0], '33')
    // 回「預設」（分指定、有指定級距）：維持分指定
    tab('預設')
    expect(dialog().getByText('不指定業績')).toBeInTheDocument()
    // 切到「洗髮」（不分指定的級距）：改回不分指定
    tab('洗髮')
    await wait(() => expect(dialog().queryByText('不指定業績')).toBeNull())
    // 再切到「染髮」（有指定級距）：改回分指定
    tab('染髮')
    await wait(() => expect(dialog().getByText('不指定業績')).toBeInTheDocument())
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    const byAttr = Object.fromEntries(sent(calls).nonSegmented.map(d => [d.attribute, d.rakeData]))
    expect(byAttr['洗髮']).toEqual({ designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 0, rake: 0 }] })
    expect(byAttr['染髮']).toEqual({
      designate: [{ threshold: 0, rake: 33 }],
      nonDesignate: [{ threshold: 0, rake: 0 }],
      nonDistinguish: [],
    })
    expect(byAttr['預設'].nonDistinguish).toEqual([])
  })

  it('關閉：不送出，清空勾選', async () => {
    const { calls } = setup()
    await openRakeModal()
    type(fields('輸入抽成(%)')[0], '30')
    fireEvent.click(dialog().getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(0)
    expect(screen.getByLabelText('選取 王小美')).not.toBeChecked()
  })

  it('抽成歸屬載入中顯示骨架', async () => {
    renderPage(<EmployeeManagementList />, {
      fixtures: fixtures(),
      route: '/management/employee',
      delays: { USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: 300 },
    })
    await selectBoth()
    fireEvent.click(screen.getByRole('button', { name: '編輯設計師抽成' }))
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    expect(await screen.findByText('編輯設計師抽成', { selector: 'h2' })).toBeInTheDocument()
  })
})

describe('編輯設計師抽成：分段', () => {
  it('不分指定：下限、上限、抽成，新增與刪除後只送 segmented（nonSegmented 為空）', async () => {
    const { calls } = setup()
    await openRakeModal()
    fireEvent.click(dialog().getByRole('button', { name: '分段' }))
    // 分段時沒有歸屬分頁
    expect(dialog().queryByRole('tab', { name: '洗髮' })).toBeNull()
    type(fields('輸入業績')[0], '0')
    type(fields('輸入業績')[1], '50000')
    type(fields('輸入抽成(%)')[0], '30')
    add(tierRows('總業績從(含)')[0])
    type(fields('輸入業績')[2], '50000')
    type(fields('輸入業績')[3], '999999')
    type(fields('輸入抽成(%)')[1], '35')
    add(tierRows('總業績從(含)')[1])
    remove(tierRows('總業績從(含)')[2])
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sent(calls)).toEqual({
      userId: ['e1', 'e2'],
      nonSegmented: [],
      segmented: [
        {
          designate: [],
          nonDesignate: [],
          nonDistinguish: [
            { thresholdLowerLimit: 0, thresholdUpperLimit: 50000, rake: 30 },
            { thresholdLowerLimit: 50000, thresholdUpperLimit: 999999, rake: 35 },
          ],
        },
      ],
    })
  })

  it('分指定／不指定：各自的下限、上限、抽成；新增與刪除', async () => {
    const { calls } = setup()
    await openRakeModal()
    fireEvent.click(dialog().getByRole('button', { name: '分段' }))
    toggleDesignation()
    const designate = () => tierRows('指定業績從(含)')
    const nonDesignate = () => tierRows('不指定業績從(含)')
    type(fields('輸入業績')[0], '10')
    type(fields('輸入業績')[1], '20')
    type(fields('輸入抽成(%)')[0], '30')
    add(designate()[0])
    remove(designate()[1])
    type(fields('輸入業績')[2], '40')
    type(fields('輸入業績')[3], '50')
    type(fields('輸入抽成(%)')[1], '60')
    add(nonDesignate()[0])
    remove(nonDesignate()[1])
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sent(calls).segmented).toEqual([
      {
        designate: [{ thresholdLowerLimit: 10, thresholdUpperLimit: 20, rake: 30 }],
        nonDesignate: [{ thresholdLowerLimit: 40, thresholdUpperLimit: 50, rake: 60 }],
        nonDistinguish: [],
      },
    ])
    expect(sent(calls).nonSegmented).toEqual([])
  })
})

describe('編輯設計師抽成：數字欄位', () => {
  it('在任何級距欄位上滾動滑鼠滾輪都會先讓欄位失焦（避免滾輪改到業績或抽成）', async () => {
    setup()
    await openRakeModal()
    // 彈窗的焦點鎖在 jsdom 會把焦點拉回，因此以「對目前焦點元素呼叫 blur」驗證
    const blur = jest.spyOn(window.HTMLElement.prototype, 'blur')
    const wheelAll = () => {
      const inputs = dialog().getAllByRole('spinbutton')
      const blurred = inputs.filter(input => {
        blur.mockClear()
        input.focus()
        fireEvent.wheel(input)
        return blur.mock.instances[0] === input
      })
      expect(blurred).toEqual(inputs)
    }
    wheelAll()
    toggleDesignation()
    wheelAll()
    fireEvent.click(dialog().getByRole('button', { name: '分段' }))
    wheelAll()
    toggleDesignation()
    wheelAll()
  })
})

describe('由人員身分設定檔導入', () => {
  const openImport = async () => {
    await selectBoth()
    fireEvent.click(screen.getByRole('button', { name: '由人員身分設定檔導入' }))
    await screen.findByText('由人員身分設定檔導入', { selector: 'h2' })
  }
  const pickJob = async text => {
    const select = await screen.findByLabelText('選擇人員身份類別')
    await wait(() => expect(Array.from(select.options).some(o => o.textContent === text)).toBe(true))
    fireEvent.change(select, { target: { value: Array.from(select.options).find(o => o.textContent === text).value } })
  }
  const confirm = () => screen.getByRole('button', { name: '確認' })

  it('選身分類別且至少勾一項才可確認；送出所選身分、勾選項目與員工，成功後關閉並清空勾選', async () => {
    const { calls } = setup()
    await openImport()
    expect(confirm()).toBeDisabled()
    await pickJob('助理')
    expect(confirm()).toBeDisabled()
    fireEvent.click(screen.getByLabelText('扣項方式'))
    fireEvent.click(screen.getByLabelText('抽成方式'))
    expect(confirm()).toBeEnabled()
    fireEvent.click(confirm())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '設定成功' }))
    expect(callsOf(calls, 'SET_PERFORMANCE_RULE_FROM_PERSONAL_PROFILE')[0].variables.input).toEqual({
      jobTitlePointId: 'job-2',
      jobTitlePoint: false,
      deductionWay: true,
      rakeRule: true,
      userIds: ['e1', 'e2'],
    })
    await wait(() => expect(screen.queryByText('由人員身分設定檔導入', { selector: 'h2' })).toBeNull())
    expect(screen.getByLabelText('選取 王小美')).not.toBeChecked()
  })

  it('後端回 false 提示設定失敗、可再按；錯誤時顯示後端訊息', async () => {
    const { calls } = setup({ SET_PERFORMANCE_RULE_FROM_PERSONAL_PROFILE: { setPerformanceRuleFromPersonProfile: false } })
    await openImport()
    await pickJob('設計師')
    fireEvent.click(screen.getByLabelText('人員身份'))
    fireEvent.click(confirm())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '設定失敗' }))
    expect(confirm()).toBeEnabled()
    expect(callsOf(calls, 'SET_PERFORMANCE_RULE_FROM_PERSONAL_PROFILE')[0].variables.input.jobTitlePoint).toBe(true)
    cleanup()

    setup({ SET_PERFORMANCE_RULE_FROM_PERSONAL_PROFILE: new Error('身分設定檔不存在') })
    await openImport()
    await pickJob('設計師')
    fireEvent.click(screen.getByLabelText('人員身份'))
    fireEvent.click(confirm())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '身分設定檔不存在' }))
    expect(confirm()).toBeEnabled()
  })

  it('關閉後再開，選擇與勾選都清空', async () => {
    setup()
    await openImport()
    await pickJob('助理')
    fireEvent.click(screen.getByLabelText('扣項方式'))
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByText('由人員身分設定檔導入', { selector: 'h2' })).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: '由人員身分設定檔導入' }))
    await screen.findByText('由人員身分設定檔導入', { selector: 'h2' })
    expect(screen.getByLabelText('扣項方式')).not.toBeChecked()
    expect(confirm()).toBeDisabled()
  })
})
