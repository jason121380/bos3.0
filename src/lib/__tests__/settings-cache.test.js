import { ApolloClient, ApolloLink, InMemoryCache, Observable, gql } from '@apollo/client'
import { settingsQuery, settingsCacheLink, bindSettingsCache, evictSettings, registeredSettingsFields, SETTINGS_MAX_AGE_MS } from '../settings-cache'

// 為什麼重要：設定類查詢改成 cache-first 後，換頁不再重抓（省掉大量重複請求）；
// 但店家在任何地方存檔後、或過了 10 分鐘，畫面上的設定一定要重新抓，否則會用到舊設定（例如會員卡開關、商品分類）。

const SETTING = settingsQuery(gql`
  query TEST_SETTING {
    getIsMemberShipCardActive
  }
`)
const SAVE = gql`
  mutation TEST_SAVE {
    saveSomething
  }
`

// saveResult：存檔的回應方式——'ok'（成功）、'graphqlError'（後端回業務錯誤）、'networkError'（斷線）
function setup({ staggerSaves = false, saveResult = 'ok' } = {}) {
  const calls = []
  let value = true
  let saveCount = 0
  const terminal = new ApolloLink(operation => {
    calls.push(operation.operationName)
    return new Observable(observer => {
      const isSave = operation.operationName === 'TEST_SAVE'
      const respond = () => {
        if (isSave && saveResult === 'networkError') {
          observer.error(new Error('Failed to fetch'))
          return
        }
        if (isSave && saveResult === 'graphqlError') {
          observer.next({ errors: [{ message: '欄位格式錯誤' }] })
        } else {
          observer.next({ data: isSave ? { saveSomething: true } : { getIsMemberShipCardActive: value } })
        }
        observer.complete()
      }
      // 真實後端的多個存檔回應會在不同時間點回來
      if (isSave && staggerSaves) setTimeout(respond, (saveCount += 1))
      else respond()
    })
  })
  const cache = new InMemoryCache({ addTypename: false })
  const client = new ApolloClient({ link: settingsCacheLink.concat(terminal), cache })
  bindSettingsCache(cache, { expire: false })
  return { client, calls, setValue: v => { value = v } }
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

test('同一次開頁第二次讀取設定直接用快取，不再打 API', async () => {
  const { client, calls } = setup()
  await client.query({ query: SETTING, fetchPolicy: 'cache-first' })
  await client.query({ query: SETTING, fetchPolicy: 'cache-first' })
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(1)
})

test('任何 mutation 成功後，畫面上正在看的設定會自動重抓到新值', async () => {
  const { client, calls, setValue } = setup()
  const seen = []
  const sub = client.watchQuery({ query: SETTING, fetchPolicy: 'cache-first' }).subscribe(r => seen.push(r.data && r.data.getIsMemberShipCardActive))
  await flush()
  setValue(false)
  await client.mutate({ mutation: SAVE })
  await flush()
  await flush()
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(2)
  expect(seen[seen.length - 1]).toBe(false)
  sub.unsubscribe()
})

test('同時送出的多個 mutation（參數設定頁一次存 29 項）只在全部完成後重抓一次', async () => {
  const { client, calls } = setup({ staggerSaves: true })
  const sub = client.watchQuery({ query: SETTING, fetchPolicy: 'cache-first' }).subscribe(() => {})
  await flush()
  await Promise.all(Array.from({ length: 29 }, () => client.mutate({ mutation: SAVE })))
  await flush()
  await flush()
  expect(calls.filter(c => c === 'TEST_SAVE')).toHaveLength(29)
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(2)
  sub.unsubscribe()
})

test('每 10 分鐘自動清除設定快取，畫面上的設定會重抓', async () => {
  jest.useFakeTimers()
  const { client, calls } = setup()
  bindSettingsCache(client.cache, { expire: true })
  const sub = client.watchQuery({ query: SETTING, fetchPolicy: 'cache-first' }).subscribe(() => {})
  await Promise.resolve()
  jest.advanceTimersByTime(SETTINGS_MAX_AGE_MS + 1)
  await Promise.resolve()
  jest.useRealTimers()
  await flush()
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(2)
  sub.unsubscribe()
  bindSettingsCache(client.cache, { expire: false })
})

// 存檔失敗時設定沒有改變：不清快取（否則每次失敗都讓畫面上所有設定重抓一次）
test('存檔回業務錯誤：不清除設定快取', async () => {
  const { client, calls } = setup({ saveResult: 'graphqlError' })
  const sub = client.watchQuery({ query: SETTING, fetchPolicy: 'cache-first' }).subscribe(() => {})
  await flush()
  await expect(client.mutate({ mutation: SAVE })).rejects.toThrow('欄位格式錯誤')
  await flush()
  await flush()
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(1)
  sub.unsubscribe()
})

test('存檔時斷線：錯誤照樣傳回頁面（才能提示使用者），且不清除設定快取', async () => {
  const { client, calls } = setup({ saveResult: 'networkError' })
  const sub = client.watchQuery({ query: SETTING, fetchPolicy: 'cache-first' }).subscribe(() => {})
  await flush()
  await expect(client.mutate({ mutation: SAVE })).rejects.toThrow('Failed to fetch')
  await flush()
  await flush()
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(1)
  sub.unsubscribe()
})

// 一個存檔剛完成、清除還沒執行時又送出下一個存檔（連續按兩次儲存）：等第二個也完成才清一次，不重抓兩次
test('清除排定後又有新的存檔：延到新的存檔完成才清，只重抓一次', async () => {
  const { client, calls } = setup()
  const sub = client.watchQuery({ query: SETTING, fetchPolicy: 'cache-first' }).subscribe(() => {})
  await flush()
  await client.mutate({ mutation: SAVE }) // 完成後排定清除（下一個事件迴圈）
  await client.mutate({ mutation: SAVE }) // 清除執行前送出：取消先前排定的清除
  await flush()
  await flush()
  expect(calls.filter(c => c === 'TEST_SAVE')).toHaveLength(2)
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(2)
  sub.unsubscribe()
})

test('App 綁定 cache 時預設啟用 10 分鐘自動清除', async () => {
  jest.useFakeTimers()
  const { client, calls } = setup()
  bindSettingsCache(client.cache)
  const sub = client.watchQuery({ query: SETTING, fetchPolicy: 'cache-first' }).subscribe(() => {})
  await Promise.resolve()
  jest.advanceTimersByTime(SETTINGS_MAX_AGE_MS + 1)
  await Promise.resolve()
  jest.useRealTimers()
  await flush()
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(2)
  sub.unsubscribe()
  bindSettingsCache(client.cache, { expire: false })
})

test('登記的設定根欄位可列出（清除時逐一移除的就是這些）', () => {
  expect(registeredSettingsFields()).toContain('getIsMemberShipCardActive')
  expect(registeredSettingsFields()).not.toContain('saveSomething')
})

// 以 fragment 展開的根層選取沒有欄位名稱，不登記也不拋錯（只登記直接寫出的根欄位）
test('根層的 fragment 展開不登記、不拋錯', () => {
  const doc = gql`
    query TEST_FRAGMENT_ROOT {
      ...RootFields
      getTestFragmentFlag
    }
    fragment RootFields on Query {
      getTestFragmentInner
    }
  `
  expect(settingsQuery(doc)).toBe(doc)
  expect(registeredSettingsFields()).toContain('getTestFragmentFlag')
  expect(registeredSettingsFields()).not.toContain('RootFields')
})

test('沒有綁定 cache 時清除不拋錯', () => {
  expect(() => evictSettings(null)).not.toThrow()
})

test('共用根欄位（merchant 底下還有權限與報表）不能登記為設定，否則清設定會連帶清掉它們', () => {
  expect(() => settingsQuery(gql`query SHARED_ROOT { merchant { thirdpartyCoupons { id } } }`)).toThrow('merchant')
})

// 清除以根欄位為單位：設定查詢的根欄位若也被「帶參數的查詢」（依日期的分析報表、權限等）使用，
// 每次存檔或 10 分鐘到期都會把那些報表一起清掉重抓（Codex review，PR #251：productCategories／serviceCategories 的分析報表）。
// 掃全站 gql 文件，擋下這種組合；共用根欄位的其他查詢若同樣不帶任何參數（純設定旗標），連帶重抓無妨。
test('設定查詢的根欄位不能和帶參數的查詢共用，也不能是依 id 讀單筆的查詢', () => {
  const fs = require('fs')
  const path = require('path')
  const { parse, print, visit } = require('graphql')
  const walk = dir =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full)
      return entry.name.endsWith('.js') ? [full] : []
    })
  const hasArguments = doc => {
    let found = false
    visit(doc, {
      Field: node => {
        if (node.arguments.length) found = true
      },
      VariableDefinition: () => {
        found = true
      },
    })
    return found
  }
  const settingsRoots = new Map()
  const singleRecordSettings = []
  // 變數型別是 ID 但值其實是店家 id 的（店家層級設定），逐一列出原因
  const storeIdVariables = new Set([
    'src/hooks/useFetchGetMerchantAvatar.js GET_MERCHANT_AVATAR $input', // Parameter.js 傳 { input: merchantId }
  ])
  const otherQueries = []
  walk(path.join(__dirname, '..', '..')).forEach(file => {
    const source = fs.readFileSync(file, 'utf8')
    const pattern = /(settingsQuery\(\s*)?gql`([^`]*)`/g
    let match
    while ((match = pattern.exec(source))) {
      let doc
      try {
        doc = parse(match[2].replace(/\$\{[^}]*\}/g, ''))
      } catch (e) {
        continue
      }
      const isSettings = Boolean(match[1])
      doc.definitions
        .filter(def => def.kind === 'OperationDefinition' && def.operation === 'query')
        .forEach(def => {
          const roots = def.selectionSet.selections.filter(sel => sel.kind === 'Field').map(sel => sel.name.value)
          const name = `${path.relative(process.cwd(), file)} ${def.name ? def.name.value : '(anonymous)'}`
          if (isSettings) {
            roots.forEach(root => settingsRoots.set(root, name))
            // 依 id 讀單筆（編輯頁）的不是設定：內容會在別處被改，不能快取 10 分鐘
            def.variableDefinitions
              .filter(variable => print(variable.type).replace(/!$/, '') === 'ID' && variable.variable.name.value !== 'merchantId')
              .forEach(variable => singleRecordSettings.push(`${name} $${variable.variable.name.value}`))
          }
          else otherQueries.push({ name, roots, withArguments: hasArguments(def) })
        })
    }
  })
  expect(settingsRoots.size).toBeGreaterThan(50)
  const conflicts = otherQueries
    .filter(query => query.withArguments)
    .flatMap(query => query.roots.filter(root => settingsRoots.has(root)).map(root => `${root}: ${settingsRoots.get(root)} ↔ ${query.name}`))
  expect(conflicts).toEqual([])
  expect(singleRecordSettings.filter(item => !storeIdVariables.has(item))).toEqual([])
})
