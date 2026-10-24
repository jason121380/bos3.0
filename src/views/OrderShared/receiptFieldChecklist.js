// 四份收據範本的欄位契約。測試讀原始碼，避免「印出來的欄」在改畫面時悄悄漂移。
// 掛單（草稿／掛單列表）不印點數餘額；已結帳（打帳單、帳單列表）要印。增點／扣點／折抵四份都印。
export const POINT_BALANCE_LABEL = '點數餘額：'

export const SHARED_RECEIPT_FIELDS = [
  '日期：',
  '帳單編號：',
  '合計：',
  '結帳：',
  '扣入金：',
  '入金餘額：',
  '增點：',
  '扣點：',
  '折抵：',
  '卡券金額：',
  '付現金額：',
]

export const RECEIPT_TEMPLATES = [
  {
    id: 'order-create',
    title: '打帳單結帳收據',
    file: 'src/views/OrderCreate/OrderDetailModal.js',
    kind: 'paid',
    showsPointBalance: true,
    customerLabel: '顧客：',
    designerLabel: '設計師:',
  },
  {
    id: 'order-list',
    title: '帳單列表補印收據',
    file: 'src/views/OrderManagementList/ResultsV2.js',
    kind: 'paid',
    showsPointBalance: true,
    customerLabel: '客戶：',
    designerLabel: '設計師：',
  },
  {
    id: 'draft-edit',
    title: '掛單詳細收據',
    file: 'src/views/DraftOrderEdit/Footer.js',
    kind: 'draft',
    showsPointBalance: false,
    customerLabel: '顧客:',
    designerLabel: '設計師:',
  },
  {
    id: 'draft-list',
    title: '掛單列表收據',
    file: 'src/views/DraftOrderManagementList/ResultsV2.js',
    kind: 'draft',
    showsPointBalance: false,
    customerLabel: '顧客:',
    designerLabel: '設計師:',
  },
]
