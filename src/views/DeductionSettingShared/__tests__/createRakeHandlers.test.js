import { openSnackbar } from 'elements/snackbars'
import createRakeHandlers, { checkInputEmptyAsZero, checkInputRangeOnly } from '../createRakeHandlers'

// 為什麼重要：抽成級距直接決定設計師薪資。新增／編輯抽成設定、員工批量抽成彈窗、員工抽成設定四處共用這份 handler。
// 守住：
// - 切換「指定／不指定」「全段／分段」時，換成對應的空白級距（只留一列 0），不殘留另一種模式的級距（否則存檔會混入舊資料）；
// - 新增／刪除／輸入級距只改目前選取的那一組（deductionIndex）與那一列，不動其他組；
// - 抽成 % 只能 0～100（含小數，以存檔的同一個數值檢查）、門檻不可為負，超出時改成 0 並提示；設定頁把空字串當 0，彈窗不處理空字串（兩者原樣保留）；
// - 一律回傳新物件，不直接改 React state（原地修改畫面不會更新）。

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))

const tier = (threshold, rake) => ({ threshold, rake })
const segTier = (thresholdLowerLimit, thresholdUpperLimit, rake) => ({ thresholdLowerLimit, thresholdUpperLimit, rake })

// 全段：兩組（預設、染髮），目前在第 2 組
const nonSegmentedSharing = (designationUsage = false) => ({
  isSegmented: false,
  designationUsage,
  segmented: [],
  nonSegmented: [
    { attribute: '預設', rakeData: { designate: [tier(0, 40)], nonDesignate: [tier(0, 30)], nonDistinguish: [tier(0, 35)] } },
    {
      attribute: '染髮',
      rakeData: {
        designate: [tier(0, 45), tier(50000, 50)],
        nonDesignate: [tier(0, 30), tier(50000, 35)],
        nonDistinguish: [tier(0, 38), tier(50000, 42)],
      },
    },
  ],
})

const segmentedSharing = (designationUsage = false) => ({
  isSegmented: true,
  designationUsage,
  segmented: [
    {
      designate: [segTier(0, 50000, 40), segTier(50000, 100000, 45)],
      nonDesignate: [segTier(0, 50000, 30), segTier(50000, 100000, 35)],
      nonDistinguish: [segTier(0, 50000, 35), segTier(50000, 100000, 40)],
    },
  ],
  nonSegmented: [],
})

function setup(profitSharing, { deductionIndex = 1, checkInput = checkInputEmptyAsZero } = {}) {
  const snapshot = JSON.stringify(profitSharing)
  const changes = {}
  const order = []
  const onChange = ({ key, value }) => {
    changes[key] = value
    order.push(key)
  }
  const setTabValue = jest.fn()
  const setDeductionIndex = jest.fn()
  const handlers = createRakeHandlers({ profitSharing, onChange, deductionIndex, setTabValue, setDeductionIndex, checkInput })
  const unchanged = () => expect(JSON.stringify(profitSharing)).toBe(snapshot)
  return { handlers, changes, order, setTabValue, setDeductionIndex, unchanged }
}

const inputEvent = value => ({ target: { value } })

describe('切換「指定／不指定」', () => {
  it('全段、不指定 → 指定：目前這組換成指定／非指定各一列 0，不分指定清空', () => {
    const { handlers, changes, unchanged } = setup(nonSegmentedSharing(false))
    handlers.handleDesignateChange()
    expect(changes.designationUsage).toBe(true)
    expect(changes.nonSegmented[1].rakeData).toEqual({ designate: [tier(0, 0)], nonDesignate: [tier(0, 0)], nonDistinguish: [] })
    expect(changes.nonSegmented[0]).toEqual(nonSegmentedSharing().nonSegmented[0]) // 其他組不動
    unchanged()
  })

  it('全段、指定 → 不指定：目前這組只留不分指定一列 0', () => {
    const { handlers, changes, unchanged } = setup(nonSegmentedSharing(true))
    handlers.handleDesignateChange()
    expect(changes.designationUsage).toBe(false)
    expect(changes.nonSegmented[1].rakeData).toEqual({ designate: [], nonDesignate: [], nonDistinguish: [tier(0, 0)] })
    unchanged()
  })

  it('分段、不指定 → 指定：指定／非指定各一段 0～0', () => {
    const { handlers, changes, unchanged } = setup(segmentedSharing(false))
    handlers.handleDesignateChange()
    expect(changes.designationUsage).toBe(true)
    expect(changes.segmented[0]).toEqual({ designate: [segTier(0, 0, 0)], nonDesignate: [segTier(0, 0, 0)], nonDistinguish: [] })
    unchanged()
  })

  it('分段、指定 → 不指定：只留不分指定一段 0～0', () => {
    const { handlers, changes, unchanged } = setup(segmentedSharing(true))
    handlers.handleDesignateChange()
    expect(changes.segmented[0]).toEqual({ designate: [], nonDesignate: [], nonDistinguish: [segTier(0, 0, 0)] })
    unchanged()
  })
})

describe('切換「全段／分段」', () => {
  it('分段 → 全段（指定）：只剩「預設」一組、指定／非指定各一列 0，分頁回到預設', () => {
    const { handlers, changes, setTabValue, setDeductionIndex, unchanged } = setup(segmentedSharing(true))
    handlers.handleToggleButtonChange()
    expect(changes.isSegmented).toBe(false)
    expect(changes.segmented).toEqual([])
    expect(changes.nonSegmented).toEqual([
      { attribute: '預設', rakeData: { designate: [tier(0, 0)], nonDesignate: [tier(0, 0)], nonDistinguish: [] } },
    ])
    expect(setTabValue).toHaveBeenCalledWith('預設')
    expect(setDeductionIndex).toHaveBeenCalledWith(0)
    unchanged()
  })

  it('分段 → 全段（不指定）：只剩「預設」一組、不分指定一列 0，分頁回到預設', () => {
    // 先前停在全段第 3 組（deductionIndex 2）後切到分段、取消指定，再回全段：組別索引要歸零，否則讀不到「預設」以外的組別
    // （2026/10/22 修正前這個分支沒有歸零，回全段時整頁錯誤，見 CreateDeductionSetting/__tests__/segmentedToggle.page.test.js）
    const { handlers, changes, setTabValue, setDeductionIndex, unchanged } = setup(segmentedSharing(false), { deductionIndex: 2 })
    handlers.handleToggleButtonChange()
    expect(changes.isSegmented).toBe(false)
    expect(changes.segmented).toEqual([])
    expect(changes.nonSegmented).toEqual([
      { attribute: '預設', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [tier(0, 0)] } },
    ])
    expect(setTabValue).toHaveBeenCalledWith('預設')
    expect(setDeductionIndex).toHaveBeenCalledWith(0)
    unchanged()
  })

  it('全段 → 分段（指定）：清掉所有全段組別，分段只有指定／非指定各一段 0～0', () => {
    const { handlers, changes, unchanged } = setup(nonSegmentedSharing(true))
    handlers.handleToggleButtonChange()
    expect(changes.isSegmented).toBe(true)
    expect(changes.nonSegmented).toEqual([])
    expect(changes.segmented).toEqual([{ designate: [segTier(0, 0, 0)], nonDesignate: [segTier(0, 0, 0)], nonDistinguish: [] }])
    unchanged()
  })

  it('全段 → 分段（不指定）：分段只有不分指定一段 0～0，分頁回到預設', () => {
    const { handlers, changes, setTabValue, setDeductionIndex, unchanged } = setup(nonSegmentedSharing(false))
    handlers.handleToggleButtonChange()
    expect(changes.isSegmented).toBe(true)
    expect(changes.nonSegmented).toEqual([])
    expect(changes.segmented).toEqual([{ designate: [], nonDesignate: [], nonDistinguish: [segTier(0, 0, 0)] }])
    expect(setTabValue).toHaveBeenCalledWith('預設')
    expect(setDeductionIndex).toHaveBeenCalledWith(0)
    unchanged()
  })
})

describe('全段：新增與刪除級距（只動目前這組）', () => {
  it.each([
    ['nonDistinguish', 3],
    ['designate', 3],
    ['nonDesignate', 3],
  ])('新增 %s 級距：在目前這組最後加一列 0', (type, length) => {
    const { handlers, changes, unchanged } = setup(nonSegmentedSharing())
    handlers.handleAddSetDeductionNum(type)
    expect(changes.nonSegmented[1].rakeData[type]).toHaveLength(length)
    expect(changes.nonSegmented[1].rakeData[type][length - 1]).toEqual(tier(0, 0))
    expect(changes.nonSegmented[0]).toEqual(nonSegmentedSharing().nonSegmented[0])
    unchanged()
  })

  it('未知的級距種類不做任何變更', () => {
    const { handlers, order } = setup(nonSegmentedSharing())
    handlers.handleAddSetDeductionNum('unknown')
    expect(order).toEqual([])
  })

  it.each([
    ['handleDeleteSetDeductionNum', 'nonDistinguish'],
    ['handleDeleteNonSegmentedDesignate', 'designate'],
    ['handleDeleteNonSegmentedNonDesignate', 'nonDesignate'],
  ])('%s：刪除指定那一列，其餘保留', (handlerName, type) => {
    const sharing = nonSegmentedSharing()
    const { handlers, changes, unchanged } = setup(sharing)
    handlers[handlerName](0)
    expect(changes.nonSegmented[1].rakeData[type]).toEqual([sharing.nonSegmented[1].rakeData[type][1]])
    unchanged()
  })
})

describe('分段：新增與刪除級距', () => {
  it.each(['nonDistinguish', 'designate', 'nonDesignate'])('新增 %s 分段：最後加一段 0～0', type => {
    const { handlers, changes, unchanged } = setup(segmentedSharing())
    handlers.handleAddSegmented(type)
    expect(changes.segmented[0][type]).toHaveLength(3)
    expect(changes.segmented[0][type][2]).toEqual(segTier(0, 0, 0))
    unchanged()
  })

  it('未知的分段種類不做任何變更', () => {
    const { handlers, order } = setup(segmentedSharing())
    handlers.handleAddSegmented('unknown')
    expect(order).toEqual([])
  })

  it.each([
    ['handleDeleteSegmented', 'nonDistinguish'],
    ['handleDeleteSegmentedDesignate', 'designate'],
    ['handleDeleteSegmentedNonDesignate', 'nonDesignate'],
  ])('%s：刪除指定那一段', (handlerName, type) => {
    const sharing = segmentedSharing()
    const { handlers, changes, unchanged } = setup(sharing)
    handlers[handlerName](1)
    expect(changes.segmented[0][type]).toEqual([sharing.segmented[0][type][0]])
    unchanged()
  })
})

describe('全段：輸入門檻與抽成（只改目前這組的那一列）', () => {
  it.each([
    ['handleNonSegmentedThresholdInput', 'nonDistinguish'],
    ['handleNonSegmentedDesignateThresholdInput', 'designate'],
    ['handleNonSegmentedNonDesignateThresholdInput', 'nonDesignate'],
  ])('%s：門檻以整數存入', (handlerName, type) => {
    const sharing = nonSegmentedSharing()
    const { handlers, changes, unchanged } = setup(sharing)
    handlers[handlerName](inputEvent('60000'), 1, 'threshold')
    expect(changes.nonSegmented[1].rakeData[type]).toEqual([sharing.nonSegmented[1].rakeData[type][0], { ...sharing.nonSegmented[1].rakeData[type][1], threshold: 60000 }])
    unchanged()
  })

  it.each([
    ['handleNonSegmentedRakeInput', 'nonDistinguish'],
    ['handleNonSegmentedDesignateRakeInput', 'designate'],
    ['handleNonSegmentedNonDesignateRakeInput', 'nonDesignate'],
  ])('%s：抽成 % 可有小數', (handlerName, type) => {
    const sharing = nonSegmentedSharing()
    const { handlers, changes, unchanged } = setup(sharing)
    handlers[handlerName](inputEvent('37.5'), 1, 'rake')
    expect(changes.nonSegmented[1].rakeData[type][1].rake).toBe(37.5)
    expect(changes.nonSegmented[1].rakeData[type][0]).toEqual(sharing.nonSegmented[1].rakeData[type][0])
    unchanged()
  })

  it('抽成超過 100%：改成 0 並提示，存入 0', () => {
    const { handlers, changes } = setup(nonSegmentedSharing())
    handlers.handleNonSegmentedRakeInput(inputEvent('120'), 0, 'rake')
    expect(changes.nonSegmented[1].rakeData.nonDistinguish[0].rake).toBe(0)
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0~100之間的數字', variant: 'warning' })
  })
})

describe('分段：輸入上下限與抽成', () => {
  it.each([
    ['handleSegmentedInput', 'nonDistinguish'],
    ['handleDesignateSegmentedInput', 'designate'],
    ['handleNonDesignateSegmentedInput', 'nonDesignate'],
  ])('%s：下限、上限、抽成各自寫入那一段', (handlerName, type) => {
    const sharing = segmentedSharing()
    const lower = setup(sharing)
    lower.handlers[handlerName](inputEvent('10000'), 0, 'thresholdLowerLimit')
    expect(lower.changes.segmented[0][type][0].thresholdLowerLimit).toBe(10000)
    expect(lower.changes.segmented[0][type][1]).toEqual(sharing.segmented[0][type][1])

    const upper = setup(sharing)
    upper.handlers[handlerName](inputEvent('80000'), 1, 'thresholdUpperLimit')
    expect(upper.changes.segmented[0][type][1].thresholdUpperLimit).toBe(80000)

    const rake = setup(sharing)
    rake.handlers[handlerName](inputEvent('42.5'), 1, 'rake')
    expect(rake.changes.segmented[0][type][1].rake).toBe(42.5)
    rake.unchanged()

    // 呼叫端只會傳上述三種欄位；其他值不寫入任何欄位
    const other = setup(sharing)
    other.handlers[handlerName](inputEvent('5'), 1, 'threshold')
    expect(other.order).toEqual([])
  })
})

describe('欄位檢查（checkInput）', () => {
  beforeEach(() => openSnackbar.mockClear())

  describe.each([
    ['設定頁（checkInputEmptyAsZero）', checkInputEmptyAsZero],
    ['批量抽成彈窗（checkInputRangeOnly）', checkInputRangeOnly],
  ])('%s', (_name, checkInput) => {
    it.each(['thresholdLowerLimit', 'thresholdUpperLimit', 'threshold'])('%s 為負數：改成 0 並提示', field => {
      const event = inputEvent('-5')
      checkInput(event, field)
      expect(event.target.value).toBe(0)
      expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0以上的數字', variant: 'warning' })
    })

    it.each(['thresholdLowerLimit', 'thresholdUpperLimit', 'threshold'])('%s 為 0 以上：照原值、不提示', field => {
      const event = inputEvent('30000')
      checkInput(event, field)
      expect(event.target.value).toBe('30000')
      expect(openSnackbar).not.toHaveBeenCalled()
    })

    it.each([
      ['101', 0, true],
      ['-1', 0, true],
      ['100', '100', false],
      ['0', '0', false],
      // 小數：檢查與存檔用同一個數值（parseFloat），超出 0～100 一樣擋下（2026/10/22 修正前以 parseInt 檢查，會被存入）
      ['100.5', 0, true],
      ['-0.5', 0, true],
      ['12.5', '12.5', false],
    ])('抽成 %s：結果 %p、是否提示 %p', (value, expected, warned) => {
      const event = inputEvent(value)
      checkInput(event, 'rake')
      expect(event.target.value).toBe(expected)
      expect(openSnackbar.mock.calls.length > 0).toBe(warned)
    })

    it('其他欄位不檢查', () => {
      const event = inputEvent('-5')
      checkInput(event, 'remark')
      expect(event.target.value).toBe('-5')
      expect(openSnackbar).not.toHaveBeenCalled()
    })
  })

  it.each([
    ['新增／編輯抽成設定、員工抽成設定（checkInputEmptyAsZero）', checkInputEmptyAsZero],
    ['員工批量抽成彈窗（checkInputRangeOnly）', checkInputRangeOnly],
  ])('%s：超出範圍的小數不會被存入，範圍內的小數照存', (_name, checkInput) => {
    const { handlers, changes } = setup(nonSegmentedSharing(), { checkInput })
    handlers.handleNonSegmentedRakeInput(inputEvent('100.5'), 0, 'rake')
    expect(changes.nonSegmented[1].rakeData.nonDistinguish[0].rake).toBe(0)
    handlers.handleNonSegmentedRakeInput(inputEvent('-0.5'), 0, 'rake')
    expect(changes.nonSegmented[1].rakeData.nonDistinguish[0].rake).toBe(0)
    const seg = setup(segmentedSharing(), { checkInput })
    seg.handlers.handleSegmentedInput(inputEvent('100.5'), 0, 'rake')
    expect(seg.changes.segmented[0].nonDistinguish[0].rake).toBe(0)
    seg.handlers.handleSegmentedInput(inputEvent('12.5'), 0, 'rake')
    expect(seg.changes.segmented[0].nonDistinguish[0].rake).toBe(12.5)
  })

  it('設定頁：清空欄位視為 0（避免存成 NaN）', () => {
    const event = inputEvent('')
    checkInputEmptyAsZero(event, 'threshold')
    expect(event.target.value).toBe(0)
    const { handlers, changes } = setup(nonSegmentedSharing())
    handlers.handleNonSegmentedThresholdInput(inputEvent(''), 0, 'threshold')
    expect(changes.nonSegmented[1].rakeData.nonDistinguish[0].threshold).toBe(0)
  })

  it('批量抽成彈窗：空字串原樣保留（與合併前相同）', () => {
    const event = inputEvent('')
    checkInputRangeOnly(event, 'threshold')
    expect(event.target.value).toBe('')
  })
})
