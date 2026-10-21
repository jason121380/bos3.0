import { ApolloClient, ApolloLink, InMemoryCache, Observable, gql } from '@apollo/client'
import { settingsQuery, settingsCacheLink, bindSettingsCache, evictSettings, SETTINGS_MAX_AGE_MS } from '../settings-cache'

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

function setup() {
  const calls = []
  let value = true
  const terminal = new ApolloLink(operation => {
    calls.push(operation.operationName)
    return new Observable(observer => {
      const data = operation.operationName === 'TEST_SAVE' ? { saveSomething: true } : { getIsMemberShipCardActive: value }
      observer.next({ data })
      observer.complete()
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

test('沒有綁定 cache 時清除不拋錯', () => {
  expect(() => evictSettings(null)).not.toThrow()
})

test('共用根欄位（merchant 底下還有權限與報表）不能登記為設定，否則清設定會連帶清掉它們', () => {
  expect(() => settingsQuery(gql`query SHARED_ROOT { merchant { thirdpartyCoupons { id } } }`)).toThrow('merchant')
})

// 清除以根欄位為單位：設定查詢的根欄位若也被「帶參數的查詢」（依日期的分析報表、權限等）使用，
// 每次存檔或 10 分鐘到期都會把那些報表一起清掉重抓（Codex review，PR #251：productCategories／serviceCategories 的分析報表）。
// 掃全站 gql 文件，擋下這種組合；共用根欄位的其他查詢若同樣不帶任何參數（純設定旗標），連帶重抓無妨。
test('設定查詢的根欄位不能和帶參數的查詢共用', () => {
  const fs = require('fs')
  const path = require('path')
  const { parse, visit } = require('graphql')
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
      doc.definitions
        .filter(def => def.kind === 'OperationDefinition' && def.operation === 'query')
        .forEach(def => {
          const roots = def.selectionSet.selections.filter(sel => sel.kind === 'Field').map(sel => sel.name.value)
          const name = `${path.relative(process.cwd(), file)} ${def.name ? def.name.value : '(anonymous)'}`
          if (match[1]) roots.forEach(root => settingsRoots.set(root, name))
          else otherQueries.push({ name, roots, withArguments: hasArguments(def) })
        })
    }
  })
  expect(settingsRoots.size).toBeGreaterThan(50)
  const conflicts = otherQueries
    .filter(query => query.withArguments)
    .flatMap(query => query.roots.filter(root => settingsRoots.has(root)).map(root => `${root}: ${settingsRoots.get(root)} ↔ ${query.name}`))
  expect(conflicts).toEqual([])
})
