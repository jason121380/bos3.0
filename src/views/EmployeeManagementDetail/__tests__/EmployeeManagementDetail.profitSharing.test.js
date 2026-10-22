// 保護「員工資料 › 抽成設定」：抽成算錯會直接讓該員工薪資算錯。
// - 帶入員工已存的抽成：全段／分段、分指定／不指定由已存資料判斷；舊資料的空白歸屬視為「預設」。
// - 儲存：全段只送 nonSegmented、分段只送 segmented（FETCH_SET_USER_RAKE），同時送服務扣項方式（SET_USER_DEDUCTION_WAY）與
//   互助點數設定依據（FETCH_UPDATE_USER_IDENTITY），成功後重抓員工並回員工列表；未選扣項方式／互助依據時擋下並提示。
// - 「人員設定」卡片只有角色有該權限才出現。級距輸入：清空視為 0、抽成超出 0～100 提示並歸 0。
// GraphQL 全由模擬 link 回應，不連後端、不改真實抽成。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import { renderDetail, DESIGNER, EMP_ID, editEmployeeSection } from './employeeDetailKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const FIXTURES = {
  MERCHANT_JOBTITLE_POINT: {
    merchantJobTitlePoint: [
      { id: 'job-1', jobTitle: '資深設計師' },
      { id: 'job-2', jobTitle: '助理' },
    ],
  },
  MERCHANT_COMMISSION_WAY: { merchantCommissionWay: [{ id: 'c1', name: '依服務' }, { id: 'c2', name: '依業績' }] },
  USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: {
    getAttributionForRake: [
      { label: '預設', value: '預設' },
      { label: '洗髮', value: '洗髮' },
      { label: '染髮', value: '染髮' },
    ],
  },
  FETCH_SET_USER_RAKE: { setUserRake: true },
  SET_USER_DEDUCTION_WAY: { setUserDeductionWay: true },
  FETCH_UPDATE_USER_IDENTITY: { updateUserIdentity: { status: 'ok', designerId: EMP_ID, MerchantJobTitlePointId: 'job-1' } },
}

const withRake = (userRake, extra = {}) => ({ ...DESIGNER, userRake: { userId: EMP_ID, isSegmented: false, ...userRake }, ...extra })
const setup = ({ designer = DESIGNER, section, fixtures = {} } = {}) =>
  renderDetail('profitSharing', { designer, section, fixtures: { ...FIXTURES, ...fixtures } })

const ready = () => screen.findByText('抽成方式設定')
const card = () => within(screen.getByText('抽成方式設定').closest('.ui-root').parentElement)
const fields = label => card().getAllByLabelText(label)
const type = (input, value) => fireEvent.change(input, { target: { value } })
// 級距列：分指定與分段的列是 div.w-full.flex-wrap；全段不分指定的列是標題所在的 div.flex
const tierRows = title => card().getAllByText(title).map(node => node.closest('div.w-full.flex-wrap') || node.closest('div.flex'))
const iconIn = (row, kind) => row.querySelector(`svg[class*="${kind}"]`)
const add = row => fireEvent.click(iconIn(row, 'plus'))
const remove = row => fireEvent.click(iconIn(row, 'trash'))
const save = () => fireEvent.click(screen.getByRole('button', { name: '儲存並返回列表' }))
const sentRake = calls => callsOf(calls, 'FETCH_SET_USER_RAKE')[0].variables.input
const tab = name => fireEvent.mouseDown(card().getByRole('tab', { name }), { button: 0 })
const selectByText = (select, text) =>
  fireEvent.change(select, { target: { value: Array.from(select.options).find(o => o.textContent === text).value } })
const labeled = label => screen.getByText(label, { selector: 'label' }).parentElement.querySelector('select')

beforeEach(() => loginAs())
afterEach(cleanup)

describe('抽成設定：帶入與儲存', () => {
  it('帶入全段不分指定（空白歸屬視為預設）、扣項方式與互助依據；儲存三支設定後回員工列表', async () => {
    const { calls } = setup()
    await ready()
    expect(fields('輸入抽成(%)')[0]).toHaveValue(30)
    expect(card().getByRole('tab', { name: '預設' })).toHaveAttribute('aria-selected', 'true')
    const deduction = labeled('服務扣項方式')
    expect(deduction.options[deduction.selectedIndex].textContent).toBe('依服務')
    const job = labeled('互助點數設定依據')
    expect(job.options[job.selectedIndex].textContent).toBe('資深設計師')
    selectByText(deduction, '依業績')
    selectByText(job, '助理')
    const before = callsOf(calls, 'DESIGNER').length
    save()
    await wait(() => expect(currentLocation()).toBe('/management/employee'))
    expect(sentRake(calls)).toEqual({
      userId: EMP_ID,
      nonSegmented: [{ attribute: '預設', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 0, rake: 30 }] } }],
      segmented: [],
    })
    expect(callsOf(calls, 'SET_USER_DEDUCTION_WAY')[0].variables.input).toEqual({ userId: EMP_ID, deductionWay: '依業績' })
    expect(callsOf(calls, 'FETCH_UPDATE_USER_IDENTITY')[0].variables.input).toEqual({ designerId: EMP_ID, MerchantJobTitlePointId: 'job-2' })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '更新成功', variant: 'success' })
    expect(callsOf(calls, 'DESIGNER').length).toBeGreaterThan(before)
  })

  it('未選服務扣項方式（或選無扣項）、未選互助依據時擋下並提示，不送出', async () => {
    const { calls } = setup({ designer: { ...DESIGNER, deductionWay: null } })
    await ready()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇服務扣項方式', variant: 'error' }))
    selectByText(labeled('服務扣項方式'), '無扣項')
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledTimes(2))
    selectByText(labeled('服務扣項方式'), '依服務')
    selectByText(labeled('互助點數設定依據'), 'None')
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇互助點數設定依據', variant: 'error' }))
    expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(0)
  })

  it('任一設定失敗時顯示錯誤訊息、停在本頁', async () => {
    setup({ fixtures: { SET_USER_DEDUCTION_WAY: new Error('扣項方式不存在') } })
    await ready()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '扣項方式不存在', variant: 'error' }))
    expect(currentLocation()).toBe(`/management/employee/${EMP_ID}/profitSharing`)
  })

  it('角色沒有「人員設定」權限時不顯示人員設定卡片', async () => {
    const { settle } = setup({ section: editEmployeeSection({ 人員設定: false }) })
    await ready()
    await settle()
    expect(screen.queryByText('人員設定')).toBeNull()
  })

  it('員工沒有任何抽成資料時帶入一級 0% 的全段不分指定', async () => {
    const { calls } = setup({ designer: withRake({ nonSegmented: [], segmented: [] }) })
    await ready()
    expect(fields('輸入抽成(%)')).toHaveLength(1)
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sentRake(calls).nonSegmented).toEqual([
      { attribute: '預設', rakeData: { nonDistinguish: [{ threshold: 0, rake: 0 }], designate: [], nonDesignate: [] } },
    ])
  })
})

describe('抽成設定：全段級距', () => {
  it('不分指定：清空視為 0、新增一級、抽成超出範圍歸 0', async () => {
    const { calls } = setup()
    await ready()
    type(fields('輸入業績')[0], '')
    add(tierRows('總業績從(含)')[0])
    type(fields('輸入業績')[1], '80000')
    type(fields('輸入抽成(%)')[1], '120')
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0~100之間的數字', variant: 'warning' })
    type(fields('輸入抽成(%)')[1], '')
    type(fields('輸入抽成(%)')[1], '42.5')
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sentRake(calls).nonSegmented[0].rakeData.nonDistinguish).toEqual([
      { threshold: 0, rake: 30 },
      { threshold: 80000, rake: 42.5 },
    ])
  })

  // 已知缺口（待 Jason 決定）：ProfitSharing/renderNonSegmentedTiers.js:46 刪除鈕把 click 事件當成索引，splice 一律刪掉第 1 級
  // （員工列表批量彈窗 rakeSettingNonSegmentedTiers.js:46 相同）；建議改為 onClick={() => handleDeleteSetDeductionNum(index)}。
  it('不分指定：按第 2 級的刪除目前刪掉的是第 1 級（鎖住現況）', async () => {
    const { calls } = setup()
    await ready()
    add(tierRows('總業績從(含)')[0])
    type(fields('輸入業績')[1], '50000')
    remove(tierRows('總業績從(含)')[1])
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sentRake(calls).nonSegmented[0].rakeData.nonDistinguish).toEqual([{ threshold: 50000, rake: 0 }])
  })

  it('帶入分指定的全段級距；指定、不指定各自新增、刪除與輸入', async () => {
    const designer = withRake({
      nonSegmented: [
        {
          attribute: '預設',
          rakeData: { designate: [{ threshold: 0, rake: 40 }], nonDesignate: [{ threshold: 0, rake: 35 }], nonDistinguish: [] },
        },
      ],
      segmented: [],
    })
    const { calls } = setup({ designer })
    await ready()
    expect(card().getByLabelText('分指定/不指定')).toBeChecked()
    expect(fields('輸入抽成(%)').map(f => f.value)).toEqual(['40', '35'])
    const rows = () => tierRows('總業績從(含)')
    add(rows()[0])
    type(fields('輸入業績')[1], '60000')
    type(fields('輸入抽成(%)')[1], '45')
    add(rows()[1])
    remove(rows()[2])
    add(rows()[2])
    type(fields('輸入業績')[3], '70000')
    type(fields('輸入抽成(%)')[3], '38')
    add(rows()[3])
    remove(rows()[4])
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sentRake(calls).nonSegmented).toEqual([
      {
        attribute: '預設',
        rakeData: {
          designate: [{ threshold: 0, rake: 40 }, { threshold: 60000, rake: 45 }],
          nonDesignate: [{ threshold: 0, rake: 35 }, { threshold: 70000, rake: 38 }],
          nonDistinguish: [],
        },
      },
    ])
  })

  it('歸屬分頁：新分頁依目前模式帶入級距；切回已有分頁時依該分頁資料切換分指定', async () => {
    const designer = withRake({
      nonSegmented: [
        { attribute: '預設', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 0, rake: 30 }] } },
        { attribute: '洗髮', rakeData: { designate: [{ threshold: 0, rake: 10 }], nonDesignate: [{ threshold: 0, rake: 5 }], nonDistinguish: [] } },
      ],
      segmented: [],
    })
    const { calls } = setup({ designer })
    await ready()
    expect(card().getByLabelText('分指定/不指定')).not.toBeChecked()
    // 切到「洗髮」（已有分指定級距）：改為分指定
    tab('洗髮')
    await wait(() => expect(card().getByLabelText('分指定/不指定')).toBeChecked())
    expect(fields('輸入抽成(%)').map(f => f.value)).toEqual(['10', '5'])
    // 分指定時開新分頁「染髮」：帶入指定／不指定各一級
    tab('染髮')
    await wait(() => expect(card().getByRole('tab', { name: '染髮' })).toHaveAttribute('aria-selected', 'true'))
    expect(card().getByText('不指定業績')).toBeInTheDocument()
    // 回「洗髮」（分指定、仍為分指定）
    tab('洗髮')
    await wait(() => expect(card().getByRole('tab', { name: '洗髮' })).toHaveAttribute('aria-selected', 'true'))
    expect(card().getByLabelText('分指定/不指定')).toBeChecked()
    // 回「預設」（不分指定的級距）：改回不分指定
    tab('預設')
    await wait(() => expect(card().getByLabelText('分指定/不指定')).not.toBeChecked())
    // 不分指定時切到「預設」以外的不分指定新分頁不會發生；再切回「預設」維持不分指定
    tab('預設')
    expect(card().getByLabelText('分指定/不指定')).not.toBeChecked()
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sentRake(calls).nonSegmented.map(d => d.attribute)).toEqual(['預設', '洗髮', '染髮'])
    expect(sentRake(calls).nonSegmented[2].rakeData).toEqual({
      designate: [{ threshold: 0, rake: 0 }],
      nonDesignate: [{ threshold: 0, rake: 0 }],
      nonDistinguish: [],
    })
  })

  it('不分指定時開新分頁：帶入一級不分指定', async () => {
    const { calls } = setup()
    await ready()
    tab('洗髮')
    await wait(() => expect(card().getByRole('tab', { name: '洗髮' })).toHaveAttribute('aria-selected', 'true'))
    type(fields('輸入抽成(%)')[0], '22')
    // 回到已有的「預設」（不分指定、沒有指定級距）：維持不分指定
    tab('預設')
    await wait(() => expect(fields('輸入抽成(%)')[0]).toHaveValue(30))
    expect(card().getByLabelText('分指定/不指定')).not.toBeChecked()
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sentRake(calls).nonSegmented[1]).toEqual({
      attribute: '洗髮',
      rakeData: { designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 0, rake: 22 }] },
    })
  })
})

describe('抽成設定：其他帶入情形', () => {
  it('有多個歸屬且第一個是空白名稱時，切分頁時把空白名稱改為「預設」送出', async () => {
    const designer = withRake({
      nonSegmented: [
        { attribute: '', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 0, rake: 30 }] } },
        { attribute: '洗髮', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 0, rake: 10 }] } },
      ],
      segmented: [],
    })
    const { calls } = setup({ designer })
    await ready()
    tab('洗髮')
    await wait(() => expect(fields('輸入抽成(%)')[0]).toHaveValue(10))
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sentRake(calls).nonSegmented.map(d => d.attribute)).toEqual(['預設', '洗髮'])
  })

  it('帶入分段不分指定：判斷為分段，下限有值時照常顯示', async () => {
    const designer = withRake({
      nonSegmented: [],
      segmented: [{ designate: [], nonDesignate: [], nonDistinguish: [{ thresholdLowerLimit: 1000, thresholdUpperLimit: 5000, rake: 20 }] }],
    })
    setup({ designer })
    await ready()
    expect(card().getByRole('button', { name: '分段' })).toHaveAttribute('aria-pressed', 'true')
    expect(card().getByLabelText('分指定/不指定')).not.toBeChecked()
    expect(fields('輸入業績').map(f => f.value)).toEqual(['1000', '5000'])
  })

  it('帶入分段分指定且不指定的下限有值', async () => {
    const designer = withRake({
      nonSegmented: [],
      segmented: [
        {
          designate: [],
          nonDesignate: [{ thresholdLowerLimit: 2000, thresholdUpperLimit: 9000, rake: 15 }],
          nonDistinguish: [],
        },
      ],
    })
    setup({ designer })
    await ready()
    expect(card().getByRole('button', { name: '分段' })).toHaveAttribute('aria-pressed', 'true')
    // 分指定只看 designate：沒有指定級距時視為不分指定（顯示不分指定的空級距）
    expect(card().getByLabelText('分指定/不指定')).not.toBeChecked()
  })

  it('角色的「編輯員工」區塊沒有「人員設定」這一項時不顯示人員設定卡片', async () => {
    const section = { pageTitle: '編輯員工', authority: true, pageAuthority: [{ pageName: '抽成設定', authority: true }] }
    const { settle } = setup({ section })
    await ready()
    await settle()
    expect(screen.queryByText('人員設定')).toBeNull()
  })
})

describe('抽成設定：分段級距', () => {
  it('帶入分段分指定；指定、不指定各自新增、刪除與輸入；只送 segmented', async () => {
    const designer = withRake({
      nonSegmented: [],
      segmented: [
        {
          designate: [{ thresholdLowerLimit: 0, thresholdUpperLimit: 50000, rake: 30 }],
          nonDesignate: [{ thresholdLowerLimit: 0, thresholdUpperLimit: 50000, rake: 20 }],
          nonDistinguish: [],
        },
      ],
    })
    const { calls } = setup({ designer })
    await ready()
    expect(card().getByRole('button', { name: '分段' })).toHaveAttribute('aria-pressed', 'true')
    expect(card().getByLabelText('分指定/不指定')).toBeChecked()
    // 分段時沒有歸屬分頁
    expect(card().queryByRole('tab')).toBeNull()
    add(tierRows('指定業績從(含)')[0])
    type(fields('輸入業績')[2], '50000')
    type(fields('輸入業績')[3], '100000')
    type(fields('輸入抽成(%)')[1], '35')
    add(tierRows('指定業績從(含)')[1])
    remove(tierRows('指定業績從(含)')[2])
    add(tierRows('不指定業績從(含)')[0])
    remove(tierRows('不指定業績從(含)')[1])
    type(fields('輸入業績')[4], '100')
    type(fields('輸入業績')[4], '')
    type(fields('輸入業績')[5], '40000')
    type(fields('輸入抽成(%)')[2], '25')
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sentRake(calls)).toEqual({
      userId: EMP_ID,
      nonSegmented: [],
      segmented: [
        {
          designate: [
            { thresholdLowerLimit: 0, thresholdUpperLimit: 50000, rake: 30 },
            { thresholdLowerLimit: 50000, thresholdUpperLimit: 100000, rake: 35 },
          ],
          nonDesignate: [{ thresholdLowerLimit: 0, thresholdUpperLimit: 40000, rake: 25 }],
          nonDistinguish: [],
        },
      ],
    })
  })

  it('改成分段不分指定：下限、上限、抽成，新增與刪除', async () => {
    const { calls } = setup()
    await ready()
    fireEvent.click(card().getByRole('button', { name: '分段' }))
    type(fields('輸入業績')[0], '0')
    type(fields('輸入業績')[1], '30000')
    type(fields('輸入抽成(%)')[0], '28')
    add(tierRows('總業績從(含)')[0])
    type(fields('輸入業績')[2], '30000')
    type(fields('輸入業績')[3], '90000')
    type(fields('輸入抽成(%)')[1], '33')
    add(tierRows('總業績從(含)')[1])
    remove(tierRows('總業績從(含)')[2])
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_RAKE')).toHaveLength(1))
    expect(sentRake(calls).segmented).toEqual([
      {
        designate: [],
        nonDesignate: [],
        nonDistinguish: [
          { thresholdLowerLimit: 0, thresholdUpperLimit: 30000, rake: 28 },
          { thresholdLowerLimit: 30000, thresholdUpperLimit: 90000, rake: 33 },
        ],
      },
    ])
    expect(sentRake(calls).nonSegmented).toEqual([])
  })

  it('任何級距欄位滾動滑鼠滾輪都會先失焦', async () => {
    setup()
    await ready()
    const wheelAll = () => {
      const stillFocused = card()
        .getAllByRole('spinbutton')
        .filter(input => {
          input.focus()
          fireEvent.wheel(input)
          return document.activeElement === input
        })
      expect(stillFocused).toHaveLength(0)
    }
    wheelAll()
    fireEvent.click(card().getByLabelText('分指定/不指定'))
    wheelAll()
    fireEvent.click(card().getByRole('button', { name: '分段' }))
    wheelAll()
    fireEvent.click(card().getByLabelText('分指定/不指定'))
    wheelAll()
  })
})
