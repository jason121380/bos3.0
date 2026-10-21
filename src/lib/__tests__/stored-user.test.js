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
