import { TextField, InputAdornment } from 'ui/text-field'
import PropTypes from 'prop-types'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import Autocomplete, { createFilterOptions } from 'ui/combobox'
import { useFetchCustomersInAutoComplete } from 'hooks/useFetchCustomers'
import billContext from 'context/keyInContext'
import idx from 'idx'
import produce from 'immer'
import cloneDeep from 'lodash/cloneDeep'
import { useContext, useState, useRef, useEffect, Fragment } from 'react'
import { DateTimePicker } from 'ui/date-picker'
import { LoaderCircle, UserCog, UserPlus } from 'lucide-react'
import { RowIconButton } from 'views/OrderCreate/RowAction'
import { Card } from 'ui/card'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import useFetchCustomer from 'hooks/useFetchCustomer'
import useFetchAddCustomer from 'hooks/useFetchAddCustomer'
import MembershipCardList from 'components/MembershipCardList'
import lineIcon from 'assets/images/LINE_APP.png'

import {
  emptyCustomerForm,
  quickAddCustomerInput,
  customerFilterOptions,
  getCustomerOptionLabel,
  renderCustomerOption,
} from 'views/OrderShared/customerField'
import AddCustomerModal from './AddCustomerModal'

const designate = [
  { label: '指定', value: true },
  { label: '不指定', value: false },
]

export default function Head() {
  const { bill, handleBillChange, setBill, setFocus, setEmployeeAlready, setCustomerAlready, LBCusDisplay, isLineBinded, setIsLineBinded } =
    useContext(billContext)
  const [openModal, setOpenModal] = useState(false)
  const customerRef = useRef()
  const designerRef = useRef()
  const designateRef = useRef()
  const nonDesignateRef = useRef()
  // add customer mutation
  const { addCustomer } = useFetchAddCustomer()

  // 會員卡的State
  const [membershipPurchase, setMembershipPurchase] = useState([])

  // fetch customer data by bill customer id
  const customerData = useFetchCustomer({
    id: bill.customerId !== undefined ? bill.customerId : null,
  })
  const stayInCheckoutWithoutCustomer = JSON.parse(localStorage.getItem('stayInCheckoutWithoutCustomer'))

  const [checkoutWithoutCustomer, setCheckoutWithoutCustomer] = useState(
    stayInCheckoutWithoutCustomer !== null ? stayInCheckoutWithoutCustomer : false
  )

  // set customer for edit or add customer modal
  const [customer, setCustomer] = useState(emptyCustomerForm())
  // customer autocomplete filter component
  const filter = createFilterOptions()

  // customer autocomplete value
  const [value, setValue] = useState('')

  // temp value for input customer autocomplte
  const [tmpCustomerKeyword, setTmpCustomerKeyword] = useState('')

  // after delay time input customer autocomplte
  const [customerKeyword, setCustomerKeyword] = useState('')

  // value for keycode in customer autocomplete
  const [keyCode, setKeyCode] = useState(null)

  // customer autocomplte query
  const customers = useFetchCustomersInAutoComplete({
    keyword: customerKeyword,
  })

  // customer autocomplte query return data options
  const options = idx(customers, _ => _.data.customers.customers) || []
  // 顧客清單載入完成：「重試」的資料載入判斷（index.js enable）才算客資已就緒（比照帳單詳細 OrderEdit/Head）
  useEffect(() => {
    if (!customers.loading) {
      setCustomerAlready(!customers.loading)
    }
  }, [customers.loading, setCustomerAlready])
  // 儲存會員卡
  useEffect(() => {
    if (!customerData.loading) {
      const customerDetail = idx(customerData, _ => (_.data.customer !== null ? _.data.customer : null))
      // 顧客查詢失敗時 idx 回 undefined，也當成沒有顧客（原本讀 undefined.name 整頁錯誤；2026/10/28）
      if (customerDetail && customerDetail.name !== '不留客資') {
        setValue({
          id: customerDetail.id,
          no: customerDetail.no,
          name: customerDetail.name,
          cellphone: customerDetail.cellphone,
        })
      }

      const membershipPurchase = idx(customerData, _ => _.data.customer.membershipPurchaseRecord)
      const isLineBindedData = idx(customerData, _ => _.data.customer.isLineBinded)
      const tmp = []
      setIsLineBinded(isLineBindedData)
      if (membershipPurchase) {
        membershipPurchase.forEach(d => {
          tmp.push(d)
        })
        setMembershipPurchase(tmp)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [customerData.loading, customerData.data, setIsLineBinded])

  // delay send query customers
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCustomerKeyword(tmpCustomerKeyword)
    }, 800)
    return () => clearTimeout(delayDebounceFn)
  }, [tmpCustomerKeyword, value])

  // if user press enter too fast before the customer data return value , after they press enter this uef will auto fill to bill the first customer data
  // if the customer data return value is [] , we will not fill to bill
  useEffect(() => {
    if (options && options.length > 0 && !customers.loading && keyCode === 13) {
      options.forEach(d => {
        if (tmpCustomerKeyword === d.cellphone || tmpCustomerKeyword === d.no) {
          setBill(
            produce(draft => {
              draft.customerId = d.id
              draft.customerCellphone = d.cellphone
            })
          )
          setValue(d)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [options, customers.loading, tmpCustomerKeyword, setBill] 變動時執行；keyCode 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [options, customers.loading, tmpCustomerKeyword, setBill])

  const handleDateChange = date => {
    const currentDate = new Date(date).getTime()
    if (!isNaN(currentDate)) {
      handleBillChange({ key: 'date', value: currentDate })
    }
  }

  // 依點的項目設定指定／不指定。原本焦點在服務人員欄時一律設成「指定」，第一次點「不指定」不生效（coverage wave 1，2026/10/22 Jason 決定修正）
  const handleToggleButtonChange = (_event, state) => {
    state !== null && handleBillChange({ key: 'isDesignate', value: state })
    setFocus('')
  }
  // 不留客資 button
  const handleCheckoutWithoutCustomer = () => {
    if (bill.withoutCustomerData) {
      localStorage.removeItem('stayInCheckoutWithoutCustomer')
      setCheckoutWithoutCustomer(!checkoutWithoutCustomer)
      handleBillChange({ key: 'withoutCustomerData', value: false })
      setMembershipPurchase([])
      setIsLineBinded(false)
    } else {
      localStorage.setItem('stayInCheckoutWithoutCustomer', true)
      setCheckoutWithoutCustomer(!checkoutWithoutCustomer)
      if (bill.customerId !== undefined) {
        const newBill = cloneDeep(bill)
        delete newBill.customerId
        setBill(newBill)
      }
      handleBillChange({ key: 'withoutCustomerData', value: true })
      setBill(
        produce(draft => {
          draft.customerId = undefined
          draft.customerCellphone = ''
          draft.walletPay = 0
          draft.bonusDecount = 0
          draft.bonusDeposit = 0
          draft.bonusUsed = 0
        })
      )
      setValue('')
      setTmpCustomerKeyword('')
      setMembershipPurchase([])
      setIsLineBinded(false)
      setCustomer(emptyCustomerForm())
    }
  }
  // add customer modal
  const handleOpenAddCustomerModal = () => {
    setOpenModal(true)
    if (bill.customerCellphone !== '') {
      addCustomer({
        input: quickAddCustomerInput(bill.customerCellphone),
      }).then(res => {
        setCustomer({
          ...customer,
          customerId: res.data.addCustomer.id,
          birthday: res.data.addCustomer.birthday,
          gender: res.data.addCustomer.gender,
          cellphone: res.data.addCustomer.cellphone,
          name: res.data.addCustomer.name,
          category: res.data.addCustomer.category,
        })
        setBill(
          produce(draft => {
            draft.customerId = idx(res, _ => _.data.addCustomer.id)
            draft.customerCellphone = ''
          })
        )
        setOpenModal(!openModal)
      })
    }
  }
  // edit customer modal
  const handleOpenEditCustomerModal = () => {
    setOpenModal(true)
    const customer = idx(customerData, _ => (_.data.customer !== null ? _.data.customer : null))
    if (customer !== null) {
      setCustomer({
        customerId: customer.id,
        birthday: customer.birthday,
        gender: customer.gender,
        cellphone: customer.cellphone,
        name: customer.name,
        category: customer.category,
        no: customer.no,
        nickName: customer.nickName,
        PreferDesignerId: customer.preferDesigner !== null ? customer.preferDesigner.id : '',
        email: customer.email,
        address: customer.address,
        lineId: customer.lineId,
        remark: customer.remark !== null ? customer.remark : '',
        source: customer.source !== null ? customer.source : '',
      })
    }
  }
  // 編輯顧客儲存成功：重新查詢顧客資料，顧客欄（上方 effect 依查詢結果更新）與之後再開的編輯彈窗顯示更新後的資料。
  // 原本靠「按儲存時先清掉帳單的顧客、成功後放回」觸發重新查詢，更新失敗時帳單就沒有顧客（coverage wave 1，2026/10/22）。
  // 重新查詢失敗時 errorLink 已提示，顧客欄維持原本顯示
  const handleCustomerUpdated = () => {
    customerData.refetch().catch(() => {})
  }
  // 取消 modal button
  const handleEditClose = () => {
    setOpenModal(false)
  }

  const handleFocus = event => {
    setFocus(event.target.name)
    event.target.focus()
  }

  const handleDesignateBtnKeyDown = e => {
    switch (e.keyCode) {
      case 37:
        handleBillChange({ key: 'isDesignate', value: true })
        break
      case 39:
        handleBillChange({ key: 'isDesignate', value: false })
        break
      case 13:
        setFocus('service')
        break
      default:
        break
    }
  }

  // customer autocomple press down button
  const handleBtnKeyDown = event => {
    if (event.keyCode === 13) {
      setKeyCode(event.keyCode)
    } else {
      setKeyCode(null)
    }
  }
  return (
    <Card className="ui-root mb-6">
      <div className="px-4 py-4">
        <div className="flex flex-wrap items-start gap-x-[12px] gap-y-[16px]">
          {/* 第 1 欄：日期 */}
          <div className="flex flex-col gap-[4px] [flex:1.2_1_220px]">
            <div className="flex flex-wrap items-end gap-[12px]">
              {/* 必填 *：依據 Footer.js 的 vaild（缺 bill.date 時「重試」停用） */}
              <Field label="帳單日期" required className="w-full">
                <DateTimePicker
                  value={bill.date}
                  format="yyyy/MM/dd HH:mm"
                  onChange={handleDateChange}
                  className="w-full"
                  ocaleText={{
                    toolbarTitle: '選擇日期',
                  }}
                  slotProps={{
                    toolbar: {
                      toolbarFormat: 'M月d日',
                    },
                    textField: {
                      variant: 'standard',
                    },
                  }}
                />
              </Field>
            </div>
          </div>

          {/* 第 2 欄：客戶與不留客資 */}
          <div className="flex flex-col gap-[4px] [flex:1.8_1_280px]">
            <div className="flex flex-wrap items-end gap-[12px]">
              {/* 必填 *：Footer.js 的 vaild 要求有顧客（customerId／手機）或勾選「不留客資」 */}
              <Field label="顧客" required={!bill.withoutCustomerData} className="w-full">
                <Autocomplete
                  disabled={bill.withoutCustomerData}
                  name="customer"
                  className="customer w-full"
                  value={value}
                  clearOnBlur={true}
                  onFocus={handleFocus}
                  onChange={(event, newValue) => {
                    // after press enter, the newValue is string -> which means it is the input
                    if (typeof newValue === 'string') {
                      setValue(newValue)
                      setBill(
                        produce(draft => {
                          draft.customerId = undefined
                          draft.customerCellphone = newValue
                        })
                      )
                      designerRef.current.focus()
                    } else if (newValue && newValue.inputValue) {
                      // Create a new value from the user input
                      setValue(newValue.inputValue)
                      setIsLineBinded(false)
                      setMembershipPurchase([])
                      setBill(
                        produce(draft => {
                          draft.customerId = undefined
                          draft.customerCellphone = newValue.inputValue
                        })
                      )
                      designerRef.current.focus()
                      // beginning
                    } else if (newValue !== null) {
                      setBill(
                        produce(draft => {
                          draft.customerId = newValue.id
                          draft.customerCellphone = newValue.cellphone
                        })
                      )
                      setValue(newValue)
                      designerRef.current.focus()
                      // press clear button（newValue === null）
                    } else {
                      setBill(
                        produce(draft => {
                          draft.customerId = undefined
                          draft.customerCellphone = ''
                        })
                      )
                      setKeyCode(null)
                      setValue('')
                      setTmpCustomerKeyword('')
                      setMembershipPurchase([])
                      setIsLineBinded(false)
                      setCustomer(emptyCustomerForm())
                    }
                  }}
                  // 選項的過濾、文字與列表項目：OrderShared/customerField（與其他兩頁共用）
                  filterOptions={customerFilterOptions(filter)}
                  handleHomeEndKeys
                  options={options}
                  getOptionLabel={getCustomerOptionLabel}
                  renderOption={renderCustomerOption}
                  freeSolo
                  renderInput={params => (
                    <TextField
                      {...params}
                      // press enter button handle
                      onKeyDown={event => handleBtnKeyDown(event)}
                      inputRef={customerRef}
                      variant="outlined"
                      size="small"
                      // autoFocus={focus === 'customer'}
                      placeholder="顧客姓名/手機號碼/編號"
                      onChange={event => setTmpCustomerKeyword(event.target.value)}
                      InputProps={{
                        ...params.InputProps,
                        // 新增／編輯顧客：原為帶 role="button" 的裸 svg（鍵盤無法觸發），改真 <button>（title＋aria-label，onClick 照舊）。
                        // onFocus 只擋冒泡：原 svg 不可聚焦、不會觸發外層 Autocomplete 的 onFocus（setFocus），維持原行為；
                        // disabled 與欄位同條件：原欄位停用時外框 pointer-events-none 點不到圖示，改成按鈕後鍵盤也不能觸發。
                        startAdornment: (
                          <InputAdornment position="start">
                            {bill.customerId !== undefined && !bill.withoutCustomerData ? (
                              <RowIconButton
                                label="編輯顧客資料"
                                className="-my-1 ml-2 text-text-tertiary [&_svg]:size-5"
                                onClick={handleOpenEditCustomerModal}
                                onFocus={event => event.stopPropagation()}
                                disabled={bill.withoutCustomerData}
                              >
                                <UserCog aria-hidden="true" strokeWidth={1.75} />
                              </RowIconButton>
                            ) : (
                              <RowIconButton
                                label="新增顧客"
                                className="-my-1 ml-2 text-text-tertiary [&_svg]:size-5"
                                onClick={handleOpenAddCustomerModal}
                                onFocus={event => event.stopPropagation()}
                                disabled={bill.withoutCustomerData}
                              >
                                <UserPlus aria-hidden="true" strokeWidth={1.75} />
                              </RowIconButton>
                            )}
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <Fragment>
                            {customers.loading ? <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.75} /> : null}
                            {params.InputProps.endAdornment}
                          </Fragment>
                        ),
                      }}
                    />
                  )}
                />
              </Field>
            </div>
            <CheckboxField
              className="m-0 whitespace-nowrap"
              labelClassName="font-bold"
              label="不留客資"
              checked={bill.withoutCustomerData}
              onChange={handleCheckoutWithoutCustomer}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {LBCusDisplay && isLineBinded && <img style={{ width: 24, height: 24 }} alt="line_icon" src={lineIcon} />}
              {membershipPurchase.length > 0 && <MembershipCardList data={membershipPurchase} />}
            </div>
          </div>

          {/* 第 3 欄：服務人員 */}
          <div className="flex flex-col gap-[4px] [flex:2_1_340px]">
            <div className="flex flex-wrap items-end gap-[12px]">
              {/* 必填 *：Footer.js 的 vaild 要求 bill.designerId */}
              <Field label="服務人員" required className="min-w-[180px] flex-1">
                <EmployeeAutoComplete
                  className="w-full min-w-[180px] flex-1"
                  setEmployeeAlready={setEmployeeAlready}
                  placeholder="服務人員姓名/編號"
                  value={bill.designerId}
                  ref={designerRef}
                  onFocus={handleFocus}
                  name="designer"
                  inputProps={{
                    'data-testid': 'designer',
                  }}
                  onChange={value => {
                    handleBillChange({ value: idx(value, _ => _.userId), key: 'designerId' })
                  }}
                  onKeyDown={e => {
                    if (e.keyCode === 13) {
                      if (bill.isDesignate) {
                        designateRef.current.focus()
                      } else {
                        nonDesignateRef.current.focus()
                      }
                    }
                  }}
                />
              </Field>
              <Field label="指定方式" className="shrink-0">
                <ToggleGroup className="shrink-0" size="small" value={bill.isDesignate} onChange={handleToggleButtonChange} exclusive>
                  {designate.map((data, idx) => (
                    <ToggleGroupItem
                      key={`${data.label}-${idx}`}
                      value={data.value}
                      ref={data.value ? designateRef : nonDesignateRef}
                      name={data.label}
                      data-testid={`assign-designer-${data.value}`}
                      onKeyDown={e => handleDesignateBtnKeyDown(e)}
                    >
                      {data.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            </div>
          </div>
        </div>
      </div>
      {openModal && (
        <AddCustomerModal
          onClose={handleEditClose}
          open={openModal}
          customer={customer}
          setCustomer={setCustomer}
          setBill={setBill}
          onCustomerUpdated={handleCustomerUpdated}
        />
      )}
    </Card>
  )
}

Head.propTypes = {
  sx: PropTypes.object,
}
