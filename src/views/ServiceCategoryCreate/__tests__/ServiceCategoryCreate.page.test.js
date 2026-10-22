// 保護「新增服務分類」（/service/categories/create）的整頁流程。守住：
// - 代號、類別名稱必填（訊息「請填入代號」「請填入類別」），沒填不送出
// - 服務歸屬選項來自 getAttribution，預設「燙」；送出 createServiceCategory 的 input（代號、名稱、選定的歸屬、備註、目前店家 id）
// - 成功提示並回服務分類列表；失敗提示錯誤、留在本頁
// - 服務歸屬查詢失敗時不整頁錯誤（原本讀 undefined.map 拋錯），仍可以預設歸屬新增
// GraphQL 全由 testkit 的模擬 link 回應（新增 mutation 沒有名稱，以 'undefined' 鍵回應），不連後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT, MERCHANT_ID } from '../../../__tests__/testkit.test'
import { fieldByLabel, pickOption, selectedText } from '../../__tests__/settingsPageKit.test'
import ServiceCategoryCreate from '..'

jest.setTimeout(20000)
jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))

const ATTRIBUTIONS = [
  { name: '燙', value: '燙' },
  { name: '染', value: '染' },
  { name: '剪', value: '剪' },
]

const setup = (extra = {}) =>
  renderPage(<ServiceCategoryCreate />, {
    route: '/service/categories/create',
    fixtures: {
      USE_FETCH_GET_ATTRIBUTIONS: { getAttribution: ATTRIBUTIONS },
      undefined: { createServiceCategory: true },
      ...extra,
    },
  })

const createCalls = calls => calls.filter(c => c.variables && c.variables.input && 'OfficialBrandMerchantId' in c.variables.input)

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

it('代號、類別名稱必填：沒填顯示訊息且不送出', async () => {
  const utils = setup()
  await utils.settle()
  fireEvent.click(screen.getByTestId('submit'))
  expect(await screen.findByText('請填入代號')).toBeInTheDocument()
  expect(screen.getByText('請填入類別')).toBeInTheDocument()
  expect(screen.getByTestId('no')).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByTestId('no')).toHaveAttribute('aria-describedby', 'service-category-create-no-helper-text')
  expect(screen.getByTestId('name')).toHaveAttribute('aria-describedby', 'service-category-create-name-helper-text')
  await utils.settle()
  expect(createCalls(utils.calls)).toHaveLength(0)
})

it('送出代號、名稱、選定的服務歸屬、備註與目前店家；成功提示並回列表', async () => {
  const utils = setup()
  await utils.settle()
  const attribution = fieldByLabel('服務歸屬')
  expect(Array.from(attribution.options).map(o => o.textContent)).toEqual(['燙', '染', '剪'])
  expect(selectedText(attribution)).toBe('燙')
  pickOption(attribution, '染')
  expect(selectedText(fieldByLabel('服務歸屬'))).toBe('染')
  fireEvent.change(screen.getByTestId('no'), { target: { value: 'S01' } })
  fireEvent.change(screen.getByTestId('name'), { target: { value: '染髮' } })
  fireEvent.change(screen.getByTestId('remark'), { target: { value: '含護髮' } })
  fireEvent.click(screen.getByTestId('submit'))
  await wait(() => expect(currentLocation()).toBe('/service/categories'))
  expect(createCalls(utils.calls).map(c => c.variables)).toEqual([
    { input: { no: 'S01', name: '染髮', attribution: '染', remark: '含護髮', OfficialBrandMerchantId: MERCHANT_ID } },
  ])
  expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '已新增服務類別' })
})

it('新增失敗：提示錯誤、留在本頁', async () => {
  const utils = setup({ undefined: new Error('代號重複') })
  await utils.settle()
  fireEvent.change(screen.getByTestId('no'), { target: { value: 'S01' } })
  fireEvent.change(screen.getByTestId('name'), { target: { value: '染髮' } })
  fireEvent.click(screen.getByTestId('submit'))
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '代號重複' }))
  expect(currentLocation()).toBe('/service/categories/create')
})

it('沒有目前店家時送出的店家 id 為 null', async () => {
  loginAs({ merchant: null })
  const utils = setup()
  await utils.settle()
  fireEvent.change(screen.getByTestId('no'), { target: { value: 'S01' } })
  fireEvent.change(screen.getByTestId('name'), { target: { value: '染髮' } })
  fireEvent.click(screen.getByTestId('submit'))
  await wait(() => expect(createCalls(utils.calls)).toHaveLength(1))
  expect(createCalls(utils.calls)[0].variables.input.OfficialBrandMerchantId).toBeNull()
  await utils.settle()
})

it('服務歸屬查詢失敗：不整頁錯誤，仍以預設歸屬「燙」新增（原本讀 undefined.map 拋錯）', async () => {
  const utils = setup({ USE_FETCH_GET_ATTRIBUTIONS: new Error('伺服器錯誤') })
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  fireEvent.change(screen.getByTestId('no'), { target: { value: 'S01' } })
  fireEvent.change(screen.getByTestId('name'), { target: { value: '染髮' } })
  fireEvent.click(screen.getByTestId('submit'))
  await wait(() => expect(currentLocation()).toBe('/service/categories'))
  expect(createCalls(utils.calls)[0].variables.input.attribution).toBe('燙')
})
