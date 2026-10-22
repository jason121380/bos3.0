import { roleSectionAuthority, hasPageAuthority } from '../rolePageAuthority'

// 為什麼重要：角色權限是 JSON 字串，舊角色可能缺後來才新增的區塊；讀不到時要「當作沒有權限、頁面照常」，
// 不能讓整頁變錯誤畫面，也不能因此多給權限。

const role = (id, name, settings) => ({ id, authorityName: name, authoritySettings: JSON.stringify(settings) })
const clockIn = { pageTitle: '打卡權限設定', authority: true, pageAuthority: [{ pageName: '編輯打卡紀錄', authority: true }] }

test('以角色 id 讀出指定區塊的頁面權限', () => {
  const section = roleSectionAuthority([role('a1', '店長', [clockIn])], 'a1', '打卡權限設定')
  expect(hasPageAuthority(section, '編輯打卡紀錄')).toBe(true)
  expect(hasPageAuthority(section, '刪除打卡紀錄')).toBe(false)
})

test('同名角色以 id 區分，不會讀到另一個角色的權限', () => {
  const closed = { ...clockIn, pageAuthority: [{ pageName: '編輯打卡紀錄', authority: false }] }
  const authorities = [role('a1', '設計師', [clockIn]), role('a2', '設計師', [closed])]
  expect(hasPageAuthority(roleSectionAuthority(authorities, 'a2', '打卡權限設定'), '編輯打卡紀錄')).toBe(false)
})

test('缺區塊、找不到角色、設定格式壞掉、查詢失敗時一律沒有權限', () => {
  expect(roleSectionAuthority([role('a1', '店長', [])], 'a1', '打卡權限設定')).toEqual([])
  expect(roleSectionAuthority([role('a1', '店長', [clockIn])], 'a9', '打卡權限設定')).toEqual([])
  expect(roleSectionAuthority([{ id: 'a1', authoritySettings: '{壞掉' }], 'a1', '打卡權限設定')).toEqual([])
  expect(roleSectionAuthority([role('a1', '店長', [{ pageTitle: '打卡權限設定' }])], 'a1', '打卡權限設定')).toEqual([])
  expect(roleSectionAuthority(undefined, 'a1', '打卡權限設定')).toEqual([])
  // JSON 合法但不是區塊陣列（例如被存成物件或 null）也視為沒有權限，不可讓 .find 拋錯
  expect(roleSectionAuthority([{ id: 'a1', authoritySettings: '{"pageTitle":"打卡權限設定"}' }], 'a1', '打卡權限設定')).toEqual([])
  expect(roleSectionAuthority([{ id: 'a1', authoritySettings: 'null' }], 'a1', '打卡權限設定')).toEqual([])
})
