// 保護「個人頁 › 基本資料」與「密碼設定」：
// - 帶入登入者個資；儲存送出的 UPDATE_USER_INFO 必須是畫面上的資料（以登入者 id），手機少於 7 碼擋下；成功後重抓 profile 並提示。
// - 換頭像：選檔後開裁切窗，確認後把裁切壓縮後的檔案送 SET_USER_AVATAR，成功重新整理、失敗（false／錯誤）提示並可再按；取消清空選檔。
// - 密碼設定：兩次密碼相同才可送出，以登入者 id 送 CHANGE_PASSWORD，成功後清空。
// 裁切（canvas）與壓縮在 jsdom 無法執行，以 mock 回傳檔案；CropImage 本身另有單元測試。GraphQL 全由模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, typeLikeBrowser, USER_ID } from '../../../__tests__/testkit.test'
import { renderProfile, ME } from './profileKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
const mockCropped = { current: null }
jest.mock('../General/CropImage', () => ({
  __esModule: true,
  default: (...args) => (mockCropped.current ? mockCropped.current(...args) : Promise.resolve(new File(['x'], 'avatar'))),
}))
// 裁切元件在 jsdom 載不了圖：以按鈕模擬「裁切範圍更新」
jest.mock('react-easy-crop', () => props => (
  <button type="button" data-image={props.image} onClick={() => props.onCropComplete({}, { x: 1, y: 2, width: 30, height: 30 })}>
    模擬裁切
  </button>
))
jest.mock('react-image-file-resizer', () => ({
  imageFileResizer: (file, w, h, format, quality, rotation, callback) => callback(new File(['small'], 'avatar.jpg', { type: 'image/jpeg' })),
}))

const realLocation = window.location
beforeEach(() => {
  loginAs()
  mockCropped.current = null
  delete window.location
  window.location = { href: 'http://localhost/', origin: 'http://localhost', pathname: '/', search: '', hash: '', reload: jest.fn() }
})
afterEach(() => {
  cleanup()
  window.location = realLocation
})

// 欄位 onChange 在 produce 的 updater 內才讀 event.target，以瀏覽器相同的方式輸入
const type = (label, value) => typeLikeBrowser(screen.getByLabelText(label), value)
const save = () => fireEvent.click(screen.getByRole('button', { name: '儲存變更' }))
const ready = () => screen.findByDisplayValue('0911222333')

describe('個人頁：基本資料', () => {
  it('帶入個資；修改後送出畫面上的資料，成功後重抓 profile 並提示', async () => {
    const { calls } = renderProfile('general', { fixtures: { UPDATE_USER_INFO: { setUserInfo: true } } })
    await ready()
    expect(screen.getByLabelText('姓氏')).toHaveValue('王')
    expect(screen.getByLabelText('身分證字號')).toHaveValue('A123456789')
    expect(screen.getByLabelText('女')).toBeChecked()
    expect(screen.getByText('設計師', { selector: 'p' })).toBeInTheDocument()
    type('姓氏', '林')
    type('名字', '小華')
    type('暱稱', '華華')
    type('設計師編號', '08')
    type('手機號碼', '0933444555')
    type('身分證字號', 'B223456789')
    type('電子信箱', 'hua@example.com')
    type('通訊住址', '台中市')
    type('戶籍住址', '高雄市')
    type('自我介紹', '專長燙髮')
    type('自介連結', 'https://example.com/hua')
    fireEvent.click(screen.getByLabelText('男'))
    const before = callsOf(calls, 'PROFILE').length
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功', variant: 'success' }))
    expect(callsOf(calls, 'UPDATE_USER_INFO')[0].variables.input).toEqual({
      userId: USER_ID,
      firstName: '小華',
      lastName: '林',
      email: 'hua@example.com',
      contactAddress: '台中市',
      address: '高雄市',
      serialNumber: 'B223456789',
      birthday: ME.birthday,
      gender: 'MALE',
      nickName: '華華',
      designerNo: '08',
      cellphone: '0933444555',
      status: 'ok',
      selfIntroduction: '專長燙髮',
      selfIntroductionLink: 'https://example.com/hua',
    })
    await wait(() => expect(callsOf(calls, 'PROFILE').length).toBeGreaterThan(before))
  })

  it('手機少於 7 碼：提示且不送出', async () => {
    const { calls } = renderProfile('general')
    await ready()
    type('手機號碼', '12345')
    save()
    expect(openSnackbar).toHaveBeenCalledWith({ message: '手機長度必須大於六碼', variant: 'warning' })
    expect(callsOf(calls, 'UPDATE_USER_INFO')).toHaveLength(0)
  })

  it('欄位為 null 時顯示空白；送出時保留 null', async () => {
    // 姓氏、名字、手機號碼為必填（見下方），這裡只把選填欄位設為 null
    const me = { ...ME, nickName: null, designerNo: null, serialNumber: null, email: null, contactAddress: null, address: null, selfIntroduction: null, selfIntroductionLink: null, gender: null, birthday: null }
    const { calls } = renderProfile('general', { me, fixtures: { UPDATE_USER_INFO: { setUserInfo: true } } })
    await ready()
    expect(screen.getByLabelText('暱稱')).toHaveValue('')
    expect(screen.getByLabelText('男')).not.toBeChecked()
    expect(screen.getByLabelText('女')).not.toBeChecked()
    save()
    await wait(() => expect(callsOf(calls, 'UPDATE_USER_INFO')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_USER_INFO')[0].variables.input).toEqual(expect.objectContaining({ nickName: null, gender: null, birthday: null }))
  })

  // 必填（姓氏、名字、手機號碼，比照新增員工）未填時「儲存變更」停用並說明缺哪些欄位（Jason 2026/10/22；
  // 修正前 .filter(...).indexOf(true) 永遠是 -1，按鈕永遠可按）。選填欄位空白或 null 照常可存。手機號碼為 null 時欄位顯示空白。
  it('必填欄位未填時「儲存變更」停用並說明原因；補齊後可按', async () => {
    renderProfile('general', { me: { ...ME, email: '', birthday: 0, cellphone: null } })
    await screen.findByLabelText('姓氏')
    expect(screen.getByLabelText('手機號碼')).toHaveValue('')
    const button = screen.getByRole('button', { name: '儲存變更' })
    expect(button).toBeDisabled()
    expect(screen.getByText('請填寫手機號碼後再儲存')).toBeInTheDocument()
    type('姓氏', '  ')
    expect(screen.getByText('請填寫姓氏、手機號碼後再儲存')).toBeInTheDocument()
    type('姓氏', '王')
    type('手機號碼', '0911222333')
    expect(button).toBeEnabled()
    expect(screen.queryByText(/後再儲存/)).toBeNull()
  })

  // Jason 2026/10/22「照建議」：姓、名、手機必填——停用按鈕之外，送出表單（例如在欄位按 Enter）時也提示且不送出。
  it('必填空白時直接送出表單（Enter）：提示缺少的欄位且不送出', async () => {
    const { calls, settle } = renderProfile('general', { me: { ...ME, cellphone: null }, fixtures: { UPDATE_USER_INFO: { setUserInfo: true } } })
    await screen.findByLabelText('姓氏')
    type('名字', ' ')
    fireEvent.submit(screen.getByLabelText('名字').closest('form'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請填寫名字、手機號碼後再儲存', variant: 'warning' })
    await settle()
    expect(callsOf(calls, 'UPDATE_USER_INFO')).toHaveLength(0)
  })

  it('姓名為 null 時欄位顯示空白、「儲存變更」停用並列出姓氏與名字', async () => {
    renderProfile('general', { me: { ...ME, firstName: null, lastName: null } })
    await ready()
    expect(screen.getByLabelText('姓氏')).toHaveValue('')
    expect(screen.getByLabelText('名字')).toHaveValue('')
    expect(screen.getByRole('button', { name: '儲存變更' })).toBeDisabled()
    expect(screen.getByText('請填寫姓氏、名字後再儲存')).toBeInTheDocument()
  })

  // 選新生日後欄位顯示新日期（Jason 2026/10/22；修正前顯示的是 profile.birthday 原本的值）。
  it('改生日：欄位顯示新日期，送出新日期（台灣時間 00:00）', async () => {
    const { calls } = renderProfile('general', { fixtures: { UPDATE_USER_INFO: { setUserInfo: true } } })
    await ready()
    fireEvent.click(screen.getByLabelText('選擇日期，目前為 1995/05/20'))
    const dialog = screen.getByRole('dialog')
    // 生日從年份開始選（openTo year）：選年份後切到月曆
    fireEvent.click(within(dialog).getByRole('radio', { name: '1995' }))
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '1995年5月10日' }))
    const confirm = within(dialog).queryByText('確認')
    if (confirm) fireEvent.click(confirm)
    await wait(() => expect(screen.getByLabelText('選擇日期，目前為 1995/05/10')).toBeInTheDocument())
    save()
    await wait(() => expect(callsOf(calls, 'UPDATE_USER_INFO')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_USER_INFO')[0].variables.input.birthday).toBe(new Date(1995, 4, 10).getTime())
  })
})

describe('個人頁：更換頭像', () => {
  const pickFile = () => {
    const input = document.getElementById('upload')
    fireEvent.change(input, { target: { files: [new File(['img'], 'me.png', { type: 'image/png' })] } })
    return input
  }

  it('選檔開裁切窗；確認上傳送出壓縮後的檔案，成功提示並重新整理', async () => {
    const { calls } = renderProfile('general', { fixtures: { SET_USER_AVATAR: { setUserAvatar: true } } })
    await ready()
    pickFile()
    const dialog = await screen.findByRole('dialog', { name: '選取頭像範圍' })
    const [rotate, zoom] = within(dialog).getAllByRole('slider')
    fireEvent.change(rotate, { target: { value: '90' } })
    fireEvent.change(zoom, { target: { value: '2' } })
    expect(rotate).toHaveValue('90')
    let cropArgs
    mockCropped.current = (...args) => {
      cropArgs = args
      return Promise.resolve(new File(['x'], 'avatar'))
    }
    // 等選取的檔案讀完（FileReader 非同步）並交給裁切元件
    await wait(() => expect(within(dialog).getByRole('button', { name: '模擬裁切' }).getAttribute('data-image')).toMatch(/^data:/))
    fireEvent.click(within(dialog).getByRole('button', { name: '模擬裁切' }))
    fireEvent.click(within(dialog).getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(window.location.reload).toHaveBeenCalled())
    // 以選取的圖片、裁切範圍與旋轉角度裁切
    expect(cropArgs[0]).toMatch(/^data:image\/png;base64,/)
    expect(cropArgs[1]).toEqual({ x: 1, y: 2, width: 30, height: 30 })
    expect(cropArgs[2]).toBe(90)
    const sent = callsOf(calls, 'SET_USER_AVATAR')[0].variables.file
    expect(sent).toBeInstanceOf(File)
    expect(sent.name).toBe('avatar.jpg')
    expect(openSnackbar).toHaveBeenCalledWith({ message: '頭像上傳成功', variant: 'success' })
  })

  it('後端回 false 或錯誤時提示並可再按；裁切失敗時提示', async () => {
    renderProfile('general', { fixtures: { SET_USER_AVATAR: { setUserAvatar: false } } })
    await ready()
    pickFile()
    const dialog = await screen.findByRole('dialog', { name: '選取頭像範圍' })
    fireEvent.click(within(dialog).getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '頭像上傳失敗', variant: 'error' }))
    await wait(() => expect(within(dialog).getByRole('button', { name: '確認上傳' })).toBeEnabled())
    mockCropped.current = () => Promise.reject(new Error('圖片格式不支援'))
    fireEvent.click(within(dialog).getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '圖片格式不支援', variant: 'error' }))
    cleanup()
    mockCropped.current = null

    renderProfile('general', { fixtures: { SET_USER_AVATAR: new Error('檔案太大') } })
    await ready()
    pickFile()
    const dialog2 = await screen.findByRole('dialog', { name: '選取頭像範圍' })
    fireEvent.click(within(dialog2).getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '檔案太大', variant: 'error' }))
  })

  it('壓縮結果不是檔案時不送出', async () => {
    const { calls } = renderProfile('general', { fixtures: { SET_USER_AVATAR: { setUserAvatar: true } } })
    await ready()
    const resizer = require('react-image-file-resizer')
    const original = resizer.imageFileResizer
    resizer.imageFileResizer = (file, w, h, f, q, r, callback) => callback('data:image/jpeg;base64,xx')
    try {
      pickFile()
      const dialog = await screen.findByRole('dialog', { name: '選取頭像範圍' })
      fireEvent.click(within(dialog).getByRole('button', { name: '確認上傳' }))
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(callsOf(calls, 'SET_USER_AVATAR')).toHaveLength(0)
    } finally {
      resizer.imageFileResizer = original
    }
  })

  it('取消：關閉裁切窗並清空選檔；沒有選到檔案也會開窗', async () => {
    renderProfile('general')
    await ready()
    const input = pickFile()
    const dialog = await screen.findByRole('dialog', { name: '選取頭像範圍' })
    fireEvent.click(within(dialog).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog', { name: '選取頭像範圍' })).toBeNull())
    expect(input.value).toBe('')
    fireEvent.change(input, { target: { files: [] } })
    expect(await screen.findByRole('dialog', { name: '選取頭像範圍' })).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('dialog', { name: '選取頭像範圍' }), { key: 'Escape' })
    await wait(() => expect(screen.queryByRole('dialog', { name: '選取頭像範圍' })).toBeNull())
  })
})

describe('個人頁：密碼設定', () => {
  it('兩次密碼相同才可送出；以登入者 id 送出，成功後清空', async () => {
    const { calls } = renderProfile('security', { fixtures: { CHANGE_PASSWORD: { changePassword: true } } })
    await screen.findByText('更改密碼')
    const button = screen.getByRole('button', { name: '儲存變更' })
    expect(button).toBeDisabled()
    fireEvent.change(screen.getByLabelText('密碼'), { target: { name: 'password', value: 'abc12345' } })
    fireEvent.change(screen.getByLabelText('確認密碼'), { target: { name: 'confirm', value: 'abc1234' } })
    expect(button).toBeDisabled()
    fireEvent.change(screen.getByLabelText('確認密碼'), { target: { name: 'confirm', value: 'abc12345' } })
    expect(button).toBeEnabled()
    fireEvent.click(button)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功變更密碼' }))
    expect(callsOf(calls, 'CHANGE_PASSWORD')[0].variables.input).toEqual({ password: 'abc12345', secondPassword: 'abc12345', userId: USER_ID })
    expect(screen.getByLabelText('密碼')).toHaveValue('')
  })
})
