// 畫面掃描用的假 GraphQL（不連任何後端）。依查詢的 selection set 自動補齊回應形狀，
// 再用 FIXTURES 依「根欄位」覆蓋少數需要真資料才能畫出主要畫面的查詢。
// 補齊規則移植自 src/__tests__/testkit.test.js：名稱像清單的欄位回 []，其餘回物件，純量回 null。
const { parse } = require('graphql')
const OPERATION_FIXTURES = require('./fake-operations')

const LIST_NAME = /(^data$|s$|sV\d+$|List|list$|Records|records$|Record$|Data$|NotCash$|Flow$)/
const PAGINATION_FIELDS = ['totalCount', 'pageLimit', 'pageOffset']
// 後端實際回清單、但名稱不像清單的欄位（自動補齊會誤補成物件，頁面 .map／.forEach 就會拋錯）
const KNOWN_LISTS = new Set([
  'designerDailyReport',
  'otherPayway',
  'thirdPartTicket',
  'merchantCommissionWay',
  'categoryPerformance',
  'merchantCustomerCategory',
  'generalMoneyFlow',
  'moneyFlow',
  'moneyFlowNotCash',
  'walletDeposit',
])

// 由 e2e/learn-shapes.js 從頁面實際錯誤學到的形狀（真後端回清單／時間戳的欄位）。重新產生：見該檔說明。
const SHAPES = (() => {
  try {
    return require('./fake-shapes.json')
  } catch (e) {
    return { lists: [], scalarLists: [], timestamps: [] }
  }
})()
SHAPES.lists.forEach(n => KNOWN_LISTS.add(n))
const SCALAR_LISTS = new Set(SHAPES.scalarLists)
const TIMESTAMPS = new Set(SHAPES.timestamps)
const TIMESTAMP_NAME = /(At|Date|date|Time|birthday|Birthday)$/

const selectionNames = ss => ss.selections.filter(s => s.kind === 'Field').map(s => s.name.value)
const containsList = ss => ss.selections.some(s => s.kind === 'Field' && s.selectionSet && LIST_NAME.test(s.name.value))

function emptyComposite(sel, fr, depth) {
  const names = selectionNames(sel.selectionSet)
  const hasScalar = sel.selectionSet.selections.some(c => c.kind === 'Field' && !c.selectionSet)
  const isWrapper = names.some(n => PAGINATION_FIELDS.includes(n)) || (depth === 0 && !hasScalar && containsList(sel.selectionSet))
  if (KNOWN_LISTS.has(sel.name.value)) return []
  if (!isWrapper && LIST_NAME.test(sel.name.value)) return []
  return fill(sel.selectionSet, {}, fr, depth + 1)
}

// 純量欄位的預設值：清單型純量回 []、時間欄位回固定時間戳（後端回毫秒數字），其餘 null
function emptyScalar(name) {
  if (SCALAR_LISTS.has(name)) return []
  if (TIMESTAMPS.has(name) || (TIMESTAMP_NAME.test(name) && !/Time$/.test(name))) return NOW
  return null
}

function fill(ss, value, fr, depth = 0) {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) return value.map(v => fill(ss, v, fr, depth))
  if (typeof value !== 'object') return value
  const out = {}
  const visit = s2 =>
    s2.selections.forEach(sel => {
      if (sel.kind === 'Field') {
        const key = sel.alias ? sel.alias.value : sel.name.value
        const v = value[key]
        if (v === undefined) {
          if (!(key in out)) out[key] = sel.selectionSet ? emptyComposite(sel, fr, depth) : emptyScalar(sel.name.value)
        } else if (sel.selectionSet) out[key] = fill(sel.selectionSet, v, fr, depth + 1)
        else out[key] = v
      } else if (sel.kind === 'InlineFragment') visit(sel.selectionSet)
      else if (sel.kind === 'FragmentSpread' && fr[sel.name.value]) visit(fr[sel.name.value].selectionSet)
    })
  visit(ss)
  return out
}

const NOW = Date.parse('2026-10-30T02:00:00.000Z')
const SECTIONS = ['櫃檯作業', '預約管理', '報表及分析', '客戶管理', '員工及薪資', '商品管理', '行銷工具', '資料設定']
const FULL_AUTHORITY = JSON.stringify(SECTIONS.map(t => ({ pageTitle: t, authority: true, pageAuthority: [{ pageName: t, authority: true }] })))

// 依根欄位給的假資料（沒寫到的欄位由 fill 自動補齊）
const FIXTURES = {
  checkPageAuthority: true,
  getUserPinnedTableSettings: null,
  me: { id: 'user-1', name: '測試店長', status: 'active', theme: null, merchantIdentity: { authorityId: 'au-1', authorityName: '高階主管' } },
  user: {
    id: 'user-1',
    name: '測試店長',
    // 報表總覽（/dashboard-list-detail）依這份頁面權限決定顯示哪些報表
    pageAuthority: {
      authorityName: '高階主管',
      pageAuthority: [
        {
          pageTitle: '報表及分析',
          authority: true,
          pageAuthority: ['店家日報表', '設計師日報表', '店家區間累計表', '設計師排行榜'].map(pageName => ({ pageName, authority: true })),
        },
      ],
    },
  },
  // 預約週曆以營業時間字串切時段
  merchant: { id: 'merchant-1', name: '測試店', openingHours: '10:00:00', closingHours: '20:00:00' },
  merchantPayWays: [
    { id: 'pw-1', type: 'CASH', name: '現金', fee: 0, amountType: 'NUMBER' },
    { id: 'pw-2', type: 'CREDIT', name: '信用卡', fee: 2, amountType: 'PERCENT' },
  ],
  getMerchantAuthorities: [
    { id: 'au-1', authorityName: '高階主管', authoritySettings: FULL_AUTHORITY, isDefault: true, usingDesignerCount: 1 },
    { id: 'au-2', authorityName: '櫃檯', authoritySettings: FULL_AUTHORITY, isDefault: false, usingDesignerCount: 3 },
  ],
  products: {
    pageLimit: 10,
    pageOffset: 0,
    totalCount: 2,
    data: [
      {
        id: 'p-1',
        cost: 100,
        no: 'P001',
        name: '控油洗髮精',
        isUsing: true,
        sellPrice: 680,
        updatedAt: NOW,
        stockUnit: '瓶',
        employeePrice: 500,
        productCategory: { id: 'c-1', name: '洗髮' },
        creator: { id: 'user-1', name: '測試店長' },
        isLocked: false,
        isAvailableForSale: true,
      },
      {
        id: 'p-2',
        cost: 120,
        no: 'P002',
        name: '修護髮膜',
        isUsing: true,
        sellPrice: 880,
        updatedAt: NOW,
        stockUnit: '罐',
        employeePrice: 650,
        productCategory: { id: 'c-2', name: '護髮' },
        creator: { id: 'user-1', name: '測試店長' },
        isLocked: false,
        isAvailableForSale: true,
      },
    ],
  },
}

// failAll：所有查詢（不含 mutation）都回 GraphQL 錯誤，模擬後端掛掉——頁面應顯示「無法載入資料」而不是整頁錯誤
function respondGraphql(body, { failRoots = new Set(), failAll = false } = {}) {
  const one = b => {
    let doc
    try {
      doc = parse(b.query)
    } catch (e) {
      return { data: null, errors: [{ message: 'mock parse error' }] }
    }
    const op = doc.definitions.find(d => d.kind === 'OperationDefinition')
    const fr = {}
    doc.definitions
      .filter(d => d.kind === 'FragmentDefinition')
      .forEach(f => {
        fr[f.name.value] = f
      })
    const roots = op.selectionSet.selections.filter(s => s.kind === 'Field').map(s => s.name.value)
    if ((failAll && op.operation === 'query') || roots.some(r => failRoots.has(r))) {
      return { data: null, errors: [{ message: 'Internal server error', extensions: { code: 'INTERNAL_SERVER_ERROR' } }] }
    }
    const fixture = {}
    roots.forEach(r => {
      if (r in FIXTURES) fixture[r] = FIXTURES[r]
    })
    // 依操作名稱的假資料優先（同名欄位在不同查詢形狀不同時用，見 e2e/fake-operations.js）
    const opFixture = op.name && OPERATION_FIXTURES[op.name.value]
    if (opFixture) Object.assign(fixture, opFixture)
    return { data: fill(op.selectionSet, fixture, fr) }
  }
  return Array.isArray(body) ? body.map(one) : one(body)
}

module.exports = { respondGraphql, FIXTURES, KNOWN_LISTS }
