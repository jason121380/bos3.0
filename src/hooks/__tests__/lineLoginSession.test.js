import { persistLineLoginSession } from 'hooks/useFetchUserLoginForLine'

// 為什麼重要：LINE 登入走 userLoginForLine，回傳的是使用者本人，沒有 userLoginV2 的 token 欄位。
// 不能把不存在的欄位寫進 GraphQL（整次登入會失敗），也不能把 token 存成空字串蓋掉既有憑證。
// localStorage 與瀏覽器相同：字串原樣存入，JSON 字串解析一次就是物件。

beforeEach(() => {
  localStorage.clear()
})

test('沒有使用者物件時不寫入，也不清掉既有 token', () => {
  localStorage.setItem('token', 'keep-me')
  expect(persistLineLoginSession(null)).toBe(false)
  expect(persistLineLoginSession(undefined)).toBe(false)
  expect(localStorage.getItem('token')).toBe('keep-me')
  expect(localStorage.getItem('user')).toBeNull()
})

test('有使用者、沒有 token 欄位：只存白名單欄位，不寫 token', () => {
  localStorage.setItem('token', 'keep-me')
  expect(
    persistLineLoginSession({
      id: 'u1',
      name: '店長',
      isAdmin: false,
      isNeedChangePassword: false,
      cellphone: '0912345678',
    })
  ).toBe(true)
  const stored = JSON.parse(localStorage.getItem('user'))
  expect(stored).toEqual({ id: 'u1', name: '店長', isAdmin: false, isNeedChangePassword: false })
  expect(localStorage.getItem('token')).toBe('keep-me')
})

test('回應物件上若已有非空 token，比照一般登入寫入', () => {
  expect(
    persistLineLoginSession({
      id: 'u1',
      name: '店長',
      isAdmin: true,
      isNeedChangePassword: false,
      token: 'line-token',
    })
  ).toBe(true)
  expect(localStorage.getItem('token')).toBe('line-token')
})
