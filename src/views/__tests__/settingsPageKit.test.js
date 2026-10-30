// 設定類表單頁（會員卡、第三方卡券、活動、組合、互助點數）測試共用的小工具。
// 本身也是測試檔：直接執行時驗證工具本身；被其他測試 import 時只提供函式（CRA 會把 __tests__ 下每個檔都當測試）。
// ui/input 的 Field 多半沒有 htmlFor，getByLabelText 找不到欄位，這裡改以「標籤文字 → 同一個 Field 裡的輸入元件」找。
import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

const isMain = expect.getState().testPath === __filename

const labelText = label => label.textContent.replace(/\*/g, '').trim()

// 依標籤文字找出所有同名欄位（例如分段設定的多個「換算金額」）
export function fieldsByLabel(text, root = document.body) {
  return Array.from(root.querySelectorAll('label'))
    .filter(label => labelText(label) === text)
    .map(label => {
      if (label.htmlFor) {
        const target = document.getElementById(label.htmlFor)
        if (target) return target
      }
      return label.parentElement.querySelector('input, select, textarea')
    })
    .filter(Boolean)
}

export function fieldByLabel(text, root = document.body) {
  const found = fieldsByLabel(text, root)
  if (!found.length) throw new Error(`找不到標籤為「${text}」的欄位`)
  return found[0]
}

// 原生 select（ui/native-select、ui/form-control）以選項文字選取
export function pickOption(select, optionText) {
  const option = Array.from(select.options).find(o => o.textContent.trim() === optionText)
  if (!option) {
    throw new Error(`下拉沒有「${optionText}」：${Array.from(select.options).map(o => o.textContent).join('、')}`)
  }
  fireEvent.change(select, { target: { value: option.value } })
}

export const selectedText = select => (select.selectedIndex >= 0 ? select.options[select.selectedIndex].textContent.trim() : '')

// window.location.reload／href 在 jsdom 會報「Not implemented: navigation」；換成可斷言的假物件，回傳還原函式
export function stubLocation(href = 'http://localhost/') {
  const original = window.location
  delete window.location
  window.location = { href, pathname: '/', search: '', hash: '', origin: 'http://localhost', reload: jest.fn(), assign: jest.fn() }
  return () => {
    window.location = original
  }
}

// ui/date-picker 的替身（jest.mock('ui/date-picker', () => require('…/settingsPageKit.test').datePickerModule)）：
// 日期選擇器本身另有測試；頁面測試只需要「選了哪一天」。以時間戳字串輸入，onChange 收到 Date（與真的選擇器相同）。
// 目前值、最早／最晚可選日與唯讀狀態放在屬性上供斷言。
const stamp = value => (value === null || value === undefined || value === '' ? '' : String(new Date(value).getTime()))
function StubDatePicker({ label, value, onChange, readOnly, minDate, maxDate }) {
  return (
    <input
      aria-label={label}
      value={stamp(value)}
      data-min={stamp(minDate)}
      data-max={stamp(maxDate)}
      data-readonly={String(Boolean(readOnly))}
      onChange={event => onChange(new Date(Number(event.target.value)))}
    />
  )
}
export const datePickerModule = { MobileDatePicker: StubDatePicker, DatePicker: StubDatePicker }
export const pickDate = (label, date) => fireEvent.change(document.querySelector(`input[aria-label="${label}"]`), { target: { value: String(date.getTime()) } })

// components/MerchantListAutocompleteForManagement（店家選擇器，另有自己的查詢與彈窗）的替身：
// 按「選擇店家（測試）」回傳 m1、m2；目前選取、是否唯讀、是否用於規則與活動 id 放在屬性上
function StubMerchantPicker({ selectIds = [], onValueChange, isReadOnly = false, inRule = false, eventId = null }) {
  return (
    <div
      data-testid="merchant-picker"
      data-selected={JSON.stringify(selectIds)}
      data-readonly={String(isReadOnly)}
      data-in-rule={String(inRule)}
      data-event-id={eventId || ''}
    >
      <button type="button" onClick={() => onValueChange(['m1', 'm2'])}>
        選擇店家（測試）
      </button>
    </div>
  )
}
export const merchantPickerModule = { __esModule: true, default: StubMerchantPicker }

// components/BelongAutocomplete（歸屬多選）的替身：按「選歸屬（測試）」回傳 ['設計部', '美容部']；選項、目前值、唯讀放在屬性上
function StubBelongAutocomplete({ value = [], onChange, optionData = [], isReadOnly = false }) {
  return (
    <div data-testid="belong" data-value={JSON.stringify(value)} data-options={JSON.stringify(optionData)} data-readonly={String(isReadOnly)}>
      <button type="button" onClick={() => onChange(['設計部', '美容部'])}>
        選歸屬（測試）
      </button>
    </div>
  )
}
export const belongModule = { __esModule: true, default: StubBelongAutocomplete }

// components/PaywayAutocomplete（付款方式多選，另有自己的查詢）的替身：按「選付款方式（測試）」回傳 ['CASH', 'LINEPAY']
function StubPaywayAutocomplete({ value = [], onChange, isReadOnly = false }) {
  return (
    <div data-testid="payway" data-value={JSON.stringify(value)} data-readonly={String(isReadOnly)}>
      <button type="button" onClick={() => onChange(['CASH', 'LINEPAY'])}>
        選付款方式（測試）
      </button>
    </div>
  )
}
export const paywayModule = { __esModule: true, default: StubPaywayAutocomplete }

// 活動規則（建立／編輯規則）的「適用消費類型」：畫面標籤與送出的 consumptionType
export const CONSUMPTION_TYPES = [
  ['服務', 'SERVICE'],
  ['賣卡先入', 'TICKETSELLINPERFORMANCE'],
  ['賣卡後入', 'TICKETSELLNOTINPERFORMANCE'],
  ['用卡先入', 'TICKETUSEPERFORMANCEENTERED'],
  ['用卡後入', 'TICKETUSEPERFORMANCENOTENTERED'],
]
// 某消費類型那一列（套用、歸屬兩個下拉）與其下方的歸屬多選
const consumptionRow = label => screen.getByLabelText(label).closest('.flex-wrap')
export const belongSelectOf = label => within(consumptionRow(label)).getByLabelText('歸屬')
export const belongPickerOf = label => within(consumptionRow(label).parentElement).queryByTestId('belong')

// 組合設定（新增／編輯）四個挑選清單的查詢回應：服務、店販、上架中的預收卡、可販售的會員卡（會員卡以 uuid 為 id）
export const TRANSFER_FIXTURES = {
  GET_SERVICES_FOR_TRANSFERLIST: {
    services: {
      data: [
        { id: 'sv1', no: 'S1', name: '燙髮', price: 2000 },
        { id: 'sv2', no: 'S2', name: '護髮', price: 800 },
        { id: 'sv3', no: null, name: '頭皮按摩', price: 600 },
      ],
    },
  },
  GET_PRODUCT_IN_TRANSFERLIST: { products: { data: [{ id: 'p1', no: 'G1', name: '洗髮精', sellPrice: 450 }, { id: 'p2', no: 'G2', name: '髮蠟', sellPrice: 350 }] } },
  GET_TICKETS_FOR_TRANSFERLIST: { tickets: [{ id: 't1', no: 'T1', name: '剪髮券', price: 300 }, { id: 't2', no: 'T2', name: '洗髮券', price: 200 }] },
  FETCH_MEMBERSHIPS_FOR_TRANSFERLIST: {
    memberships: { data: [{ uuid: 'mc1', no: 'C1', name: '年卡', sellPrice: 12000 }, { uuid: 'mc2', no: 'C2', name: '季卡', sellPrice: 5000 }] },
  },
}
if (isMain) {
  describe('settingsPageKit', () => {
    it('依標籤找欄位、以選項文字選取', () => {
      const onChange = jest.fn()
      const { unmount } = render(
        <div>
          <Field label="名稱" required>
            <Input defaultValue="甲" />
          </Field>
          <Field label="類別">
            <NativeSelect value="" onChange={onChange}>
              <NativeSelectOption value="a">A 類</NativeSelectOption>
              <NativeSelectOption value="b">B 類</NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>
      )
      expect(fieldByLabel('名稱')).toHaveValue('甲')
      pickOption(fieldByLabel('類別'), 'B 類')
      expect(onChange.mock.calls[0][0].target.value).toBe('b')
      expect(() => fieldByLabel('不存在')).toThrow('找不到')
      expect(() => pickOption(fieldByLabel('類別'), 'C 類')).toThrow('下拉沒有')
      unmount()
    })

    it('stubLocation 換掉 reload 並可還原', () => {
      const restore = stubLocation()
      window.location.reload()
      expect(window.location.reload).toHaveBeenCalled()
      restore()
      expect(typeof window.location.reload).toBe('function')
    })
  })
}
