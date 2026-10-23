// 保護廠商三頁：
// 列表——勾選（單筆、全選）刪除送出所選廠商 uuid，成功重查、後端回 false 或失敗提示；
// 新增——必須選廠商、填代號才送出，送出的是所選「廠商」uuid 與代號、名稱、暱稱、備註，成功回列表、失敗可重送；
// 編輯——帶入原資料（依廠商 uuid 對回選項），儲存送出店家廠商 uuid 與修改內容；原廠商已不在清單時要求重選而不是拋錯；
// 查詢失敗不白屏。GraphQL 全由 testkit 模擬，不連後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, currentLocation, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { VENDORS, clearCombo, inputsByLabel, pickOption } from '../../__tests__/stockKit.test'
import MerchantVendor from '..'
import MerchantVendorCreate from '../../MerchantVendorCreate'
import MerchantVendorEdit from '../../MerchantVendorEdit'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

const GLOBAL_VENDORS = [
  { uuid: 'vendor-1', name: '大和貿易股份有限公司' },
  { uuid: 'vendor-2', name: '美髮材料行' },
]

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('廠商列表', () => {
  const renderList = overrides =>
    renderPage(<MerchantVendor />, {
      fixtures: {
        GET_MERCHANT_VENDOR_LIST: { getMerchantVendorList: VENDORS },
        SET_DELETE_MERCHANT_VENDOR: { deleteMerchantVendor: true },
        ...overrides,
      },
    })
  const rowOf = name => screen.getByText(name).closest('tr')

  it('列出廠商與編輯連結；全選後刪除送出全部 uuid，成功提示並重查', async () => {
    const { settle, calls } = renderList()
    await settle()
    expect(screen.getByText('共 2 筆資料')).toBeInTheDocument()
    expect(within(rowOf('大和貿易')).getByRole('link', { name: '編輯廠商' })).toHaveAttribute('href', '/merchant-vendor/edit/mv-1')
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    const before = callsOf(calls, 'GET_MERCHANT_VENDOR_LIST').length
    fireEvent.click(screen.getByTestId('delete'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除成功', variant: 'success' }))
    expect(callsOf(calls, 'SET_DELETE_MERCHANT_VENDOR')[0].variables).toEqual({ merchantVendorUUIds: ['mv-1', 'mv-2'] })
    await settle()
    expect(callsOf(calls, 'GET_MERCHANT_VENDOR_LIST').length).toBeGreaterThan(before)
  })

  it('單筆勾選與取消；全選後再按取消全部；後端回 false 提示刪除失敗；失敗提示錯誤', async () => {
    const { settle, calls } = renderList({ SET_DELETE_MERCHANT_VENDOR: { deleteMerchantVendor: false } })
    await settle()
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    expect(within(rowOf('大和貿易')).getByRole('checkbox')).not.toBeChecked()
    fireEvent.click(within(rowOf('美髮材料行')).getByRole('checkbox'))
    fireEvent.click(within(rowOf('大和貿易')).getByRole('checkbox'))
    fireEvent.click(within(rowOf('大和貿易')).getByRole('checkbox'))
    fireEvent.click(screen.getByTestId('delete'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除失敗', variant: 'error' }))
    expect(callsOf(calls, 'SET_DELETE_MERCHANT_VENDOR')[0].variables).toEqual({ merchantVendorUUIds: ['mv-2'] })
    cleanup()

    openSnackbar.mockClear()
    const second = renderList({ SET_DELETE_MERCHANT_VENDOR: new Error('廠商已有商品') })
    await second.settle()
    fireEvent.click(within(rowOf('美髮材料行')).getByRole('checkbox'))
    fireEvent.click(screen.getByTestId('delete'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '廠商已有商品', variant: 'error' }))
  })

  it('查詢失敗：不進錯誤畫面', async () => {
    const { settle } = renderPage(<MerchantVendor />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('廠商列表')[0]).toBeInTheDocument()
  })
})

describe('新增廠商', () => {
  const renderCreate = overrides =>
    renderPage(<MerchantVendorCreate />, {
      fixtures: {
        GET_VENDOR: { getVendor: GLOBAL_VENDORS },
        SET_CREATE_MERCHANT_VENDOR: { createMerchantVendor: true },
        ...overrides,
      },
      route: '/merchant-vendor/create',
    })
  const field = label => inputsByLabel(label)[0]

  it('未選廠商、未填代號時提示且不送出；填妥後送出所選廠商 uuid 與各欄位，成功回列表', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    const submit = screen.getByRole('button', { name: '新增' })
    fireEvent.click(submit)
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇廠商', variant: 'warning' })
    pickOption('選擇廠商', '大和貿易股份有限公司')
    fireEvent.click(submit)
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入代號', variant: 'warning' })
    expect(callsOf(calls, 'SET_CREATE_MERCHANT_VENDOR')).toHaveLength(0)
    fireEvent.change(field('代號'), { target: { value: 'V01' } })
    fireEvent.change(field('名稱'), { target: { value: '大和' } })
    fireEvent.change(field('暱稱'), { target: { value: '大和小姐' } })
    fireEvent.change(field('備註'), { target: { value: '月結 30 天' } })
    fireEvent.click(submit)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增成功', variant: 'success' }))
    expect(callsOf(calls, 'SET_CREATE_MERCHANT_VENDOR')[0].variables).toEqual({
      input: { vendorUUId: 'vendor-1', no: 'V01', name: '大和', nickname: '大和小姐', remark: '月結 30 天' },
    })
    await wait(() => expect(currentLocation()).toBe('/merchant-vendor'))
  })

  it('後端回 false 提示新增失敗；失敗提示錯誤；都可再送出', async () => {
    const { settle } = renderCreate({ SET_CREATE_MERCHANT_VENDOR: { createMerchantVendor: false } })
    await settle()
    pickOption('選擇廠商', '美髮材料行')
    fireEvent.change(field('代號'), { target: { value: 'V02' } })
    fireEvent.click(screen.getByRole('button', { name: '新增' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增失敗', variant: 'error' }))
    expect(screen.getByRole('button', { name: '新增' })).toBeEnabled()
    cleanup()

    openSnackbar.mockClear()
    const second = renderCreate({ SET_CREATE_MERCHANT_VENDOR: new Error('代號重複') })
    await second.settle()
    pickOption('選擇廠商', '美髮材料行')
    fireEvent.change(field('代號'), { target: { value: 'V02' } })
    fireEvent.click(screen.getByRole('button', { name: '新增' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '代號重複', variant: 'error' }))
    expect(screen.getByRole('button', { name: '新增' })).toBeEnabled()
  })

  it('查詢失敗：不進錯誤畫面', async () => {
    const { settle } = renderPage(<MerchantVendorCreate />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})

describe('編輯廠商', () => {
  const MERCHANT_VENDOR = { ...VENDORS[0] }
  const renderEdit = overrides =>
    renderPage(<MerchantVendorEdit match={{ params: { id: 'mv-1' } }} />, {
      fixtures: {
        GET_VENDOR: { getVendor: GLOBAL_VENDORS },
        getMerchantVendor: { getMerchantVendor: MERCHANT_VENDOR },
        SET_UPDATE_MERCHANT_VENDOR: { updateMerchantVendor: true },
        ...overrides,
      },
      route: '/merchant-vendor/edit/mv-1',
    })
  const field = label => inputsByLabel(label)[0]
  const save = () => fireEvent.click(screen.getByRole('button', { name: '儲存' }))

  it('帶入原資料並以廠商 uuid 對回選項；修改後儲存送出店家廠商 uuid 與內容，成功回列表', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    expect(callsOf(calls, 'getMerchantVendor')[0].variables).toEqual({ input: 'mv-1' })
    expect(field('選擇廠商')).toHaveValue('大和貿易股份有限公司')
    expect(field('代號')).toHaveValue('V01')
    expect(field('暱稱')).toHaveValue('大和')
    fireEvent.change(field('名稱'), { target: { value: '大和二店' } })
    fireEvent.change(field('暱稱'), { target: { value: '大和二' } })
    fireEvent.change(field('備註'), { target: { value: '改月結' } })
    pickOption('選擇廠商', '美髮材料行')
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '編輯成功', variant: 'success' }))
    expect(callsOf(calls, 'SET_UPDATE_MERCHANT_VENDOR')[0].variables).toEqual({
      input: { uuid: 'mv-1', no: 'V01', name: '大和二店', nickname: '大和二', remark: '改月結', vendorUUId: 'vendor-2' },
    })
    await wait(() => expect(currentLocation()).toBe('/merchant-vendor'))
  })

  it('清除廠商、清空代號：提示並不送出', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    clearCombo(field('選擇廠商'))
    save()
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇廠商', variant: 'warning' })
    pickOption('選擇廠商', '大和貿易股份有限公司')
    fireEvent.change(field('代號'), { target: { value: '' } })
    save()
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入代號', variant: 'warning' })
    expect(callsOf(calls, 'SET_UPDATE_MERCHANT_VENDOR')).toHaveLength(0)
  })

  it('原廠商已不在廠商清單：儲存時要求重選，不拋錯', async () => {
    const { settle, calls } = renderEdit({
      getMerchantVendor: { getMerchantVendor: { ...MERCHANT_VENDOR, vendor: { uuid: 'vendor-gone' } } },
    })
    await settle()
    expect(field('選擇廠商')).toHaveValue('')
    expect(() => save()).not.toThrow()
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇廠商', variant: 'warning' })
    expect(callsOf(calls, 'SET_UPDATE_MERCHANT_VENDOR')).toHaveLength(0)
  })

  it('後端回 false 提示編輯失敗；失敗提示錯誤；都可再儲存', async () => {
    const { settle } = renderEdit({ SET_UPDATE_MERCHANT_VENDOR: { updateMerchantVendor: false } })
    await settle()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '編輯失敗', variant: 'error' }))
    expect(screen.getByRole('button', { name: '儲存' })).toBeEnabled()
    cleanup()

    openSnackbar.mockClear()
    const second = renderEdit({ SET_UPDATE_MERCHANT_VENDOR: new Error('代號重複') })
    await second.settle()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '代號重複', variant: 'error' }))
    expect(screen.getByRole('button', { name: '儲存' })).toBeEnabled()
  })

  it('查詢失敗：不進錯誤畫面', async () => {
    const { settle } = renderPage(<MerchantVendorEdit match={{ params: { id: 'mv-1' } }} />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('編輯廠商')[0]).toBeInTheDocument()
  })
})
