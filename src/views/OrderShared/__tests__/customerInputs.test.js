import React from 'react'
import { render } from '@testing-library/react'
import { emptyCustomerForm, quickAddCustomerInput, customerFilterOptions, getCustomerOptionLabel, renderCustomerOption } from '../customerField'
import { GENDER_OPTIONS, makeFieldChange, makeBirthdayChange } from '../customerFormInput'
import { SERVICE_COLUMNS, COUPON_COLUMNS, COUPON_COLUMNS_WITH_CATEGORY } from '../pickerColumns'
import { loginAs, MERCHANT_ID } from '../../../__tests__/testkit.test'

// 為什麼重要：四個帳單頁的「顧客」欄位與新增／編輯顧客彈窗共用這些片段。
// - 新增顧客一定要帶目前店家（OfficialBrandMerchantId），否則顧客會建到別家店或建立失敗；沒選店家時送 null 讓後端擋下，不可拋錯
// - 顧客自動完成：輸入的手機不在清單時要多一個「新增 "…"」選項，已存在時不可再出現（避免重複建立同一位顧客）
// - 生日：民國年最多 3 碼、月 ≤ 12、日 ≤ 31，超出的輸入不接受（存進去的生日才不會是無效日期）
// - 選擇窗表格欄位：代號、類別、名稱、價格（千分位）、可使用次數，缺類別時不拋錯

describe('新增顧客的空白表單與快速新增', () => {
  it('帶入目前店家 id；性別預設男、其他欄位空白', () => {
    loginAs()
    const form = emptyCustomerForm()
    expect(form.OfficialBrandMerchantId).toBe(MERCHANT_ID)
    expect(form).toEqual(
      expect.objectContaining({ customerId: '', name: '', cellphone: '', gender: 'MALE', birthday: { year: '', month: '', day: '' } })
    )
  })

  it('只輸入手機就按新增：以該手機與目前店家建立顧客', () => {
    loginAs()
    expect(quickAddCustomerInput('0912345678')).toEqual({
      OfficialBrandMerchantId: MERCHANT_ID,
      gender: 'MALE',
      cellphone: '0912345678',
      birthday: { year: '', month: '', day: '' },
      name: '',
      category: '',
    })
  })

  it('還沒選店家（localStorage 沒有 userMerchant）：店家送 null、不拋錯', () => {
    loginAs({ merchant: null })
    expect(emptyCustomerForm().OfficialBrandMerchantId).toBeNull()
    expect(quickAddCustomerInput('0912').OfficialBrandMerchantId).toBeNull()
  })
})

describe('顧客自動完成', () => {
  const options = [
    { id: 'c1', name: '王小美', cellphone: '0911111111', no: 'C001' },
    { id: 'c2', name: '林小華', cellphone: '0922222222', no: 'C002' },
  ]
  const passThrough = list => [...list]

  it('輸入的手機不在清單：多一個「新增 "…"」選項', () => {
    const filtered = customerFilterOptions(passThrough)(options, { inputValue: '0933333333' })
    expect(filtered[filtered.length - 1]).toEqual({ inputValue: '0933333333', cellphone: '新增 "0933333333"' })
  })

  it('輸入的手機已有顧客：不出現新增選項（避免重複建立）', () => {
    const filtered = customerFilterOptions(passThrough)(options, { inputValue: '0911111111' })
    expect(filtered).toEqual(options)
  })

  it('沒有輸入：只列出篩選結果', () => {
    const filter = jest.fn(() => [options[0]])
    expect(customerFilterOptions(filter)(options, { inputValue: '' })).toEqual([options[0]])
    expect(filter).toHaveBeenCalledWith(options, { inputValue: '' })
  })

  it('欄位文字：直接輸入的字串、新增選項顯示輸入值、一般顧客顯示 姓名/手機/編號', () => {
    expect(getCustomerOptionLabel('0912')).toBe('0912')
    expect(getCustomerOptionLabel({ inputValue: '0933', cellphone: '新增 "0933"' })).toBe('0933')
    expect(getCustomerOptionLabel(options[0])).toBe('王小美/0911111111/C001')
    // 剛建立、只有手機的顧客（沒有姓名或編號欄位）只顯示手機
    expect(getCustomerOptionLabel({ cellphone: '0944' })).toBe('0944')
    expect(getCustomerOptionLabel({ name: '陳', cellphone: '0955' })).toBe('0955')
  })

  it('下拉選項的文字與欄位文字規則相同', () => {
    const { getByText, unmount } = render(
      <ul>
        {renderCustomerOption({ key: 'k1', 'data-option': 'a' }, options[0])}
        {renderCustomerOption({ key: 'k2' }, { inputValue: '0933', cellphone: '新增 "0933"' })}
      </ul>
    )
    expect(getByText('王小美/0911111111/C001')).toHaveAttribute('data-option', 'a')
    expect(getByText('新增 "0933"')).toBeInTheDocument()
    unmount()
  })
})

describe('新增／編輯顧客彈窗的欄位輸入', () => {
  it('性別選項：男、女', () => {
    expect(GENDER_OPTIONS.map(o => [o.value, o.label])).toEqual([
      ['MALE', '男'],
      ['FEMALE', '女'],
    ])
  })

  // 欄位處理在 setState 的 updater 內才讀 event.target：React 17 的合成事件會被回收，所以要先 persist
  it('一般欄位：先 persist 事件，再依 name 寫入', () => {
    let values = { name: '舊名', cellphone: '0911' }
    const setValues = updater => {
      values = updater(values)
    }
    const persist = jest.fn()
    makeFieldChange(setValues)({ persist, target: { name: 'name', value: '新名' } })
    expect(persist).toHaveBeenCalled()
    expect(values).toEqual({ name: '新名', cellphone: '0911' })
  })

  it('一般欄位：沒有 persist 的事件（原生事件）照樣寫入', () => {
    let values = { email: '' }
    makeFieldChange(updater => {
      values = updater(values)
    })({ target: { name: 'email', value: 'a@b.c' } })
    expect(values.email).toBe('a@b.c')
  })

  describe('生日', () => {
    const run = (name, value, current = { year: '80', month: '1', day: '1' }) => {
      const setBirthdayObj = jest.fn()
      makeBirthdayChange(current, setBirthdayObj)({ target: { name, value } })
      return setBirthdayObj.mock.calls.length ? setBirthdayObj.mock.calls[0][0] : 'rejected'
    }

    it('民國年最多 3 碼', () => {
      expect(run('year', '115')).toEqual({ year: '115', month: '1', day: '1' })
      expect(run('year', '1150')).toBe('rejected')
    })

    it('月 1～12 可輸入、可清空；13 不接受', () => {
      expect(run('month', '12')).toEqual({ year: '80', month: '12', day: '1' })
      expect(run('month', '')).toEqual({ year: '80', month: '', day: '1' })
      expect(run('month', '13')).toBe('rejected')
    })

    it('日 1～31 可輸入、可清空；32 不接受', () => {
      expect(run('day', '31')).toEqual({ year: '80', month: '1', day: '31' })
      expect(run('day', '')).toEqual({ year: '80', month: '1', day: '' })
      expect(run('day', '32')).toBe('rejected')
    })

    it('其他欄位不處理', () => {
      expect(run('hour', '10')).toBe('rejected')
    })
  })
})

describe('選擇窗表格欄位', () => {
  const cells = (columns, row) => Object.fromEntries(columns.map(c => [c.header, c.cell(row)]))

  it('服務：代號、類別、名稱、參考價格（千分位）', () => {
    expect(cells(SERVICE_COLUMNS, { no: 'S01', name: '精緻剪髮', price: 1200, serviceCategory: { name: '剪髮' } })).toEqual({
      代號: 'S01',
      類別: '剪髮',
      名稱: '精緻剪髮',
      參考價格: '1,200',
    })
    // 沒有分類的服務：類別空白，不拋錯
    expect(cells(SERVICE_COLUMNS, { no: 'S02', name: '洗髮', price: 300, serviceCategory: null }).類別).toBeNull()
  })

  it('卡券：打帳單多一欄類別，其他頁沒有；價格與可使用次數加千分位', () => {
    const coupon = { no: 'T01', name: '剪髮十次卡', price: 12000, ticketAvailableCount: 10, ServiceCategory: { name: '剪髮' } }
    expect(cells(COUPON_COLUMNS_WITH_CATEGORY, coupon)).toEqual({
      代號: 'T01',
      類別: '剪髮',
      名稱: '剪髮十次卡',
      參考價格: '12,000',
      可使用次數: '10',
    })
    expect(COUPON_COLUMNS.map(c => c.header)).toEqual(['代號', '名稱', '參考價格', '可使用次數'])
    expect(cells(COUPON_COLUMNS, { ...coupon, ticketAvailableCount: 1000 }).可使用次數).toBe('1,000')
  })
})
