import { storableUser, saveStoredUser, sanitizeStoredUser } from '../stored-user'

// 為什麼重要：localStorage 任何同網域腳本都讀得到、關閉瀏覽器也不清除；登入者的手機號碼與各店 solmateKey
// 不應落地。但全站 20 多處用 JSON.parse(localStorage.getItem('user')).id 判斷登入與查資料，id 一定要留。
const loginUser = {
  id: 'u1',
  cellphone: '0912345678',
  uid: 'uid-1',
  userCode: 'C001',
  status: 'ACTIVE',
  isNeedChangePassword: false,
  firstName: '小',
  lastName: '王',
  name: '王小明',
  merchants: [{ id: 'm1', name: '一店', solmateKey: 'secret-key' }],
  isAdmin: true,
}

// setupTests 的 localStorage 假物件會再 JSON.stringify 一次，這裡改成與瀏覽器相同的行為
let store
beforeEach(() => {
  store = {}
  jest.spyOn(window.localStorage, 'getItem').mockImplementation(k => (k in store ? store[k] : null))
  jest.spyOn(window.localStorage, 'setItem').mockImplementation((k, v) => { store[k] = String(v) })
})

test('只留 id、name、isAdmin、isNeedChangePassword，不含手機號碼與 solmateKey', () => {
  expect(storableUser(loginUser)).toEqual({ id: 'u1', name: '王小明', isAdmin: true, isNeedChangePassword: false })
})

test('saveStoredUser 寫入後，localStorage 字串裡沒有個資', () => {
  saveStoredUser(loginUser)
  expect(JSON.parse(store.user).id).toBe('u1')
  expect(store.user).not.toMatch(/0912345678|secret-key|uid-1|C001/)
})

test('sanitizeStoredUser 把改版前存的完整資料就地瘦身，登入狀態（id）不變', () => {
  store.user = JSON.stringify(loginUser)
  sanitizeStoredUser()
  expect(JSON.parse(store.user)).toEqual({ id: 'u1', name: '王小明', isAdmin: true, isNeedChangePassword: false })
})

test('未登入或資料損壞時不動', () => {
  sanitizeStoredUser()
  expect(store.user).toBeUndefined()
  store.user = 'not-json'
  sanitizeStoredUser()
  expect(store.user).toBe('not-json')
})

// 登入 API 偶爾少給欄位（例如舊帳號沒有 isNeedChangePassword）：不可存成 undefined 或補上不存在的欄位
test('只留實際有值的欄位', () => {
  expect(storableUser({ id: 'u2', name: '小美', cellphone: '0911' })).toEqual({ id: 'u2', name: '小美' })
})

test('不是物件（未登入的 null、字串）時原樣回傳，交給呼叫端原本的登入檢查', () => {
  expect(storableUser(null)).toBeNull()
  expect(storableUser('u1')).toBe('u1')
})

test('已經是瘦身後的資料：不重寫 localStorage', () => {
  store.user = JSON.stringify({ id: 'u1', name: '王小明' })
  window.localStorage.setItem.mockClear()
  sanitizeStoredUser()
  expect(window.localStorage.setItem).not.toHaveBeenCalled()
  expect(JSON.parse(store.user)).toEqual({ id: 'u1', name: '王小明' })
})

test('存的是 JSON 但不是物件（"null"、數字）時不動', () => {
  store.user = 'null'
  sanitizeStoredUser()
  expect(store.user).toBe('null')
  store.user = '42'
  sanitizeStoredUser()
  expect(store.user).toBe('42')
})
