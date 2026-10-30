import { TextField, InputAdornment } from 'ui/text-field'
import PropTypes from 'prop-types'
import Autocomplete, { createFilterOptions } from 'ui/combobox'
import { useFetchCustomersInAutoComplete } from 'hooks/useFetchCustomers'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import billContext from 'context/keyInContext'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import produce from 'immer'
import { useContext, useState, useRef, useEffect, Fragment } from 'react'
import { DateTimePicker } from 'ui/date-picker'
import useFetchAddCustomer from 'hooks/useFetchAddCustomer'
import useFetchCustomer from 'hooks/useFetchCustomer'
import { LoaderCircle, UserCog, UserPlus } from 'lucide-react'
import { RowIconButton } from './RowAction'
import { Card } from 'ui/card'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import TeachingModeContext from 'context/teachingModeContext'
import useFetchOrderWithoutCustomerSetting from 'hooks/useFetchOrderWithoutCustomerDefault'
import useFetchGetIsLockDateSetting from 'hooks/useFetchGetIsLockDateSetting'
import useFetchGetIsLockDateDisplaySetting from 'hooks/useFetchGetIsLockDateDisplaySetting'
import { msUntilDailyUnlock } from 'helper/dailyUnlock'
import useFetchGetIsAbleToChangeDateTimeInOrder from 'hooks/useFetchGetIsAbleToChangeDateTimeInOrder'
import { useFetchCustomerLazy } from 'hooks/useFetchCustomer'
import useFetchGetIsAutoSetPreferDesignerForOrderCreate from 'hooks/useFetchGetIsAutoSetPreferDesignerForOrderCreate'
import MembershipCardList from 'components/MembershipCardList'
import lineIcon from 'assets/images/LINE_APP.png'

import { emptyCustomerForm, quickAddCustomerInput } from 'views/OrderShared/customerField'
import AddCustomerModal from './AddCustomerModal'

const styles = {
  box: 'flex flex-wrap gap-[16px_12px] items-start',
  column: 'flex flex-col gap-[4px]',
  column1: 'flex-[1.2_1_220px]',
  column2: 'flex-[1.8_1_280px]',
  column3: 'flex-[2_1_340px]',
  row: 'flex items-end gap-[12px] flex-wrap',
  dateInput: 'w-full',
  customerInput: 'w-full',
  employeeInput: 'w-full flex-1 min-w-[180px]',
  checkboxLabel: 'm-0 whitespace-nowrap',
}

const designate = [
  { label: '指定', value: true },
  { label: '不指定', value: false },
]

export default function Head() {
  const {
    bill,
    handleBillChange,
    setBill,
    focus,
    setFocus,
    stayInCheckoutWithoutCustomer,
    designationSettingForOrderCreate,
    setDesignationSettingForOrderCreate,
    designationSettingForOrderCreateData,
    lastOrderStatusData,
    LBCusDisplay,
    isLineBinded,
    setIsLineBinded,
    reset,
  } = useContext(billContext)
  const lockDate = useToggle()
  const customerRef = useRef()
  const designerRef = useRef()
  const designateRef = useRef()
  const nonDesignateRef = useRef()
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext
  const filter = createFilterOptions()
  // customer autocomplete value
  const [value, setValue] = useState('')

  // is add/edit customer modal open value
  const [openModal, setOpenModal] = useState(false)

  // temp value for input customer autocomplte
  const [tmpCustomerKeyword, setTmpCustomerKeyword] = useState('')

  // after delay time input customer autocomplte
  const [customerKeyword, setCustomerKeyword] = useState('')

  // customer autocomplte query
  const customers = useFetchCustomersInAutoComplete({
    keyword: customerKeyword,
  })

  // customer autocomplte query return data options
  const options = idx(customers, _ => _.data.customers.customers) || []

  // 會員卡的State
  const [membershipPurchase, setMembershipPurchase] = useState([])

  const [checkoutWithoutCustomer, setCheckoutWithoutCustomer] = useState(stayInCheckoutWithoutCustomer)
  const [orderWithoutCustomer, setOrderWithoutCustomer] = useState(false)
  const orderWithoutCustomerSetting = useFetchOrderWithoutCustomerSetting()
  const getIsAutoSetPreferDesignerForOrderCreate = useFetchGetIsAutoSetPreferDesignerForOrderCreate()
  // mutation add customer if the cellphone number is new
  const { addCustomer } = useFetchAddCustomer()

  // 新增客資彈窗的偏好設計師資料
  const [customerInModal, setCustomerInModal] = useState([])

  // find customer after press enter
  const customerData = useFetchCustomer({
    id: bill.customerId !== undefined ? bill.customerId : null,
  })
  const [getCustomerLazy, getCustomerLazyData] = useFetchCustomerLazy()

  // value for keycode in customer autocomplete
  const [keyCode, setKeyCode] = useState(null)

  const [isLockDate, setIsLockDate] = useState(false)
  const [isLockDateDisplay, setIsLockDateDisplay] = useState(false)
  const isLockDateData = useFetchGetIsLockDateSetting()
  const isLockDateDisplayData = useFetchGetIsLockDateDisplaySetting()
  const [isChangeDateTime, setIsChangeDateTime] = useState(false)
  const isAbleToChangeDateTimeInOrder = useFetchGetIsAbleToChangeDateTimeInOrder()
  const [getPreferDesigner, setGetPreferDesigner] = useState(false)
  const [customer, setCustomer] = useState(emptyCustomerForm())
  const [designateStatus, setDesignateStatus] = useState(true)

  useEffect(() => {
    if (reset === 'reset') {
      setValue('')
      setMembershipPurchase([])
      setIsLineBinded(false)
      setFocus('customer')
      customerRef.current.focus()
      setCustomer(emptyCustomerForm())
    }
  }, [reset, setFocus, setIsLineBinded])
  useEffect(() => {
    if (!designationSettingForOrderCreateData.loading && !lastOrderStatusData.loading) {
      setDesignateStatus(false)
    }
  }, [designationSettingForOrderCreateData.loading, lastOrderStatusData.loading])
  useEffect(() => {
    if (!isAbleToChangeDateTimeInOrder.loading) {
      const isAbleToChangeDate = idx(isAbleToChangeDateTimeInOrder, _ => _.data.getIsAbleToChangeDateTimeInOrderCreate)
      setIsChangeDateTime(isAbleToChangeDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isAbleToChangeDateTimeInOrder.loading])

  // 打帳單顯示鎖定checkbox
  useEffect(() => {
    if (!isLockDateDisplayData.loading) {
      const isLockDateDisplay = idx(isLockDateDisplayData, _ => _.data.getIsDateLockDisplay)
      setIsLockDateDisplay(isLockDateDisplay)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isLockDateDisplayData.loading])

  // 打帳單鎖定判斷
  useEffect(() => {
    if (!isLockDateData.loading) {
      const isLockDate = idx(isLockDateData, _ => _.data.getIsDateLock)
      setIsLockDate(isLockDate)
    } else {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isLockDateData.loading])

  useEffect(() => {
    if (!getIsAutoSetPreferDesignerForOrderCreate.loading) {
      const preferDesignerForOrderCreateData = idx(getIsAutoSetPreferDesignerForOrderCreate, _ => _.data.getIsAutoSetPreferDesignerForOrderCreate)
      setGetPreferDesigner(preferDesignerForOrderCreateData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsAutoSetPreferDesignerForOrderCreate.loading])

  // fill preference designer and membership card, base on customer
  useEffect(() => {
    if (!getCustomerLazyData.loading && getCustomerLazyData.data !== undefined) {
      if (getPreferDesigner) {
        const getCustomer = idx(getCustomerLazyData, _ => (_.data.customer.preferDesigner !== null ? _.data.customer.preferDesigner.id : ''))
        if (getCustomer !== '') {
          setBill({ ...bill, designerId: getCustomer })
        }
      }
      // 儲存會員卡
      const membershipPurchase = idx(getCustomerLazyData, _ => _.data.customer.membershipPurchaseRecord)
      const isLineBindedData = idx(getCustomerLazyData, _ => _.data.customer.isLineBinded)
      const tmp = []
      setIsLineBinded(isLineBindedData)
      if (membershipPurchase) {
        membershipPurchase.forEach(d => {
          tmp.push(d)
        })
        setMembershipPurchase(tmp)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [getCustomerLazyData.loading, setBill, setIsLineBinded] 變動時執行；bill、getCustomerLazyData、getPreferDesigner 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [getCustomerLazyData.loading, setBill, setIsLineBinded])

  useEffect(() => {
    if (!orderWithoutCustomerSetting.loading) {
      const orderWithoutCustomerSettingData = idx(orderWithoutCustomerSetting, _ => _.data.orderWithoutCustomerDefault)
      if (!orderWithoutCustomerSettingData) {
        localStorage.removeItem('stayInCheckoutWithoutCustomer')
        setCheckoutWithoutCustomer(false)
      }
      setOrderWithoutCustomer(orderWithoutCustomerSettingData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [orderWithoutCustomerSetting.loading])

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
          getCustomerLazy({
            variables: {
              id: d.id,
            },
          })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [options, customers.loading, tmpCustomerKeyword, setBill] 變動時執行；getCustomerLazy、keyCode 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [options, customers.loading, tmpCustomerKeyword, setBill])

  // delay send query customers
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCustomerKeyword(tmpCustomerKeyword)
    }, 800)
    return () => clearTimeout(delayDebounceFn)
  }, [tmpCustomerKeyword, value])

  useEffect(() => {
    if (bill.withoutCustomerData && bill.designerId === '') {
      setFocus('designer')
      designerRef.current.focus()
    }
  }, [bill, setFocus])

  // 不留客資
  const handleCheckoutWithoutCustomer = () => {
    if (checkoutWithoutCustomer) {
      localStorage.removeItem('stayInCheckoutWithoutCustomer')
      setCheckoutWithoutCustomer(!checkoutWithoutCustomer)
      handleBillChange({ key: 'withoutCustomerData', value: false })
      setMembershipPurchase([])
      setIsLineBinded(false)
    } else {
      // checked => 不留客資
      localStorage.setItem('stayInCheckoutWithoutCustomer', true)
      setCheckoutWithoutCustomer(!checkoutWithoutCustomer)
      handleBillChange({ key: 'withoutCustomerData', value: true })
      setFocus('designer')
      designerRef.current.focus()
      setBill(
        produce(draft => {
          draft.customerId = undefined
          draft.customerCellphone = ''
          draft.walletPay = 0
          draft.bonusDecount = 0
          draft.bonusDeposit = 0
          draft.bonusUsed = 0
          draft.useTicketOrders = []
        })
      )
      setValue('')
      setTmpCustomerKeyword('')
      setMembershipPurchase([])
      setIsLineBinded(false)
      setCustomer(emptyCustomerForm())
    }
  }

  const handleLockDate = isLockDate => {
    if (!lockDate.open && JSON.parse(localStorage.getItem('lockDate')) === null) {
      localStorage.setItem('lockDate', true)
      localStorage.setItem('lockDateTimeStamp', bill.date)
    } else {
      localStorage.removeItem('lockDate')
      localStorage.removeItem('lockDateTimeStamp')
      handleBillChange({ key: 'date', value: new Date().getTime() })
    }
    lockDate.toggle()
  }
  const handleToggleButtonChange = (_event, state) => {
    if (state !== null) {
      handleBillChange({ key: 'isDesignate', value: state })
      setDesignationSettingForOrderCreate(state)
    }
    setFocus('')
  }

  const handleDateChange = date => {
    const currentDate = new Date(date).getTime()
    if (!isNaN(currentDate)) {
      handleBillChange({ key: 'date', value: currentDate })
    }
  }
  // Add new customer modal
  const handleOpenAddCustomerModal = () => {
    setOpenModal(true)
    // 如果沒有打電話 會是新增客人
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
          })
        )
        setOpenModal(!openModal)
      })
    }
  }
  // Edit customer modal
  const handleOpenEditCustomerModal = () => {
    // 有打電話就是編輯客人
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
        latestDesigner: customer.latestDesigner !== null ? customer.latestDesigner.id : '',
      })
    }
    setOpenModal(true)
  }

  // 從新增客戶彈窗（完整表單）新增成功：帳單與顧客欄帶入新顧客
  const handleCustomerAdded = added => {
    setBill(
      produce(draft => {
        draft.customerId = added.id
        draft.customerCellphone = added.cellphone
      })
    )
    setValue(added.cellphone)
  }

  const handleEditClose = () => {
    setOpenModal(false)
    setCustomer(emptyCustomerForm())
  }

  const handleFocus = event => {
    setFocus(event.target.name)
    event.target.focus()
  }

  const handleDesignateBtnKeyDown = e => {
    switch (e.keyCode) {
      case 37:
        handleBillChange({ key: 'isDesignate', value: true })
        setDesignationSettingForOrderCreate(true)
        break
      case 39:
        handleBillChange({ key: 'isDesignate', value: false })
        setDesignationSettingForOrderCreate(false)
        break
      case 13:
        setFocus('service')
        break
      default:
        break
    }
  }

  // 每天 23:59 解除「鎖定日期」並把帳單日期改回現在。
  // 原本在 render 本體呼叫 node-schedule：每次 render（每個按鍵）都多排一個永不取消的排程，
  // 打帳單頁開一整天會累積上千個；改為只排一個計時器，離開頁面時取消。
  useEffect(() => {
    let timer
    const scheduleNext = initial => {
      timer = setTimeout(
        () => {
          if (JSON.parse(localStorage.getItem('lockDate')) !== null) {
            localStorage.removeItem('lockDate')
            localStorage.removeItem('lockDateTimeStamp')
            lockDate.setOpen(false)
            setBill(
              produce(draft => {
                draft.date = new Date().getTime()
              })
            )
          }
          scheduleNext(false)
        },
        msUntilDailyUnlock(new Date(), initial)
      )
    }
    scheduleNext(true)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [setBill] 變動時執行；lockDate 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [setBill])

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
        <div className={styles.box}>
          {/* 第 1 欄：日期與鎖定 */}
          <div className={`${styles.column} ${styles.column1}`}>
            <div className={styles.row}>
              {/* 必填 *：依據 Header.js 的 valid（缺 bill.date 時「掛單／明細／結帳」停用） */}
              <Field label="帳單日期" required className="w-full">
                <DateTimePicker
                  value={bill.date}
                  format="yyyy/MM/dd HH:mm"
                  onChange={handleDateChange}
                  className={styles.dateInput}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      size: 'small',
                      onFocus: handleFocus,
                      name: 'date',
                    },
                  }}
                />
              </Field>
            </div>
            {isLockDateDisplay && !isChangeDateTime && (
              <CheckboxField
                className={styles.checkboxLabel}
                labelClassName="font-bold"
                label="鎖定日期"
                onChange={handleLockDate}
                // 一律給布林：沒鎖定時 localStorage 是 null，原本讓勾選框變成非受控，23:59 自動解除後畫面仍顯示勾選
                checked={!!JSON.parse(localStorage.getItem('lockDate'))}
              />
            )}
          </div>

          {/* 第 2 欄：客戶與不留客資 */}
          <div className={`${styles.column} ${styles.column2}`}>
            <div className={styles.row}>
              {/* 必填 *：Header.js 的 valid 要求有顧客（customerId／手機）或勾選「不留客資」；勾了不留客資就不必填 */}
              <Field label="顧客" required={!checkoutWithoutCustomer} className="w-full">
                <Autocomplete
                  disabled={checkoutWithoutCustomer}
                  autoComplete={false}
                  autoHighlight
                  className={styles.customerInput}
                  value={value}
                  clearOnBlur={true}
                  onFocus={handleFocus}
                  onChange={(event, newValue) => {
                    if (newValue && newValue.inputValue) {
                      setValue(newValue.inputValue)
                      setBill(
                        produce(draft => {
                          draft.customerId = undefined
                          draft.customerCellphone = newValue.inputValue
                        })
                      )
                      setIsLineBinded(false)
                      setMembershipPurchase([])
                      designerRef.current.focus()
                    } else if (newValue !== null) {
                      setBill(
                        produce(draft => {
                          draft.customerId = newValue.id
                          draft.customerCellphone = newValue.cellphone
                        })
                      )
                      setValue(newValue)
                      designerRef.current.focus()
                      getCustomerLazy({ variables: { id: newValue.id } })
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
                      setCustomer({
                        customerId: '',
                        category: '',
                        name: '',
                        cellphone: '',
                        birthday: { year: '', month: '', day: '' },
                        OfficialBrandMerchantId: localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null,
                        gender: 'MALE',
                        no: '',
                        nickName: '',
                        PreferDesignerId: '',
                        email: '',
                        address: '',
                        lineId: '',
                        remark: '',
                      })
                    }
                  }}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params)
                    const { inputValue } = params
                    const isExisting = options.some(option => inputValue === option.cellphone)
                    if (inputValue !== '' && !isExisting) {
                      filtered.push({ inputValue, cellphone: `新增 "${inputValue}"` })
                    }
                    return filtered
                  }}
                  options={options}
                  getOptionLabel={option =>
                    typeof option === 'string'
                      ? option
                      : option.inputValue
                        ? option.inputValue
                        : option.name === undefined || option.no === undefined
                          ? option.cellphone
                          : `${option.name}/${option.cellphone}/${option.no}`
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      inputProps={{ ...params.inputProps, autocomplete: 'off' }}
                      onKeyDown={handleBtnKeyDown}
                      inputRef={customerRef}
                      variant="outlined"
                      size="small"
                      placeholder="顧客姓名/手機號碼/編號"
                      onChange={event => setTmpCustomerKeyword(event.target.value)}
                      InputProps={{
                        ...params.InputProps,
                        // 新增／編輯顧客：原為帶 role="button" 的裸 svg（鍵盤無法觸發），改真 <button>（title＋aria-label，onClick 照舊）。
                        // onFocus 只擋冒泡：原 svg 不可聚焦、不會觸發外層 Autocomplete 的 onFocus（setFocus），維持原行為；
                        // disabled 與欄位同條件：原欄位停用時外框 pointer-events-none 點不到圖示，改成按鈕後鍵盤也不能觸發。
                        startAdornment: (
                          <InputAdornment position="start">
                            {bill.customerId !== undefined ? (
                              <RowIconButton
                                label="編輯顧客資料"
                                className="-my-1 ml-2 text-text-tertiary [&_svg]:size-5"
                                onClick={handleOpenEditCustomerModal}
                                onFocus={event => event.stopPropagation()}
                                disabled={checkoutWithoutCustomer}
                              >
                                <UserCog aria-hidden="true" strokeWidth={1.75} />
                              </RowIconButton>
                            ) : (
                              <RowIconButton
                                label="新增顧客"
                                className="-my-1 ml-2 text-text-tertiary [&_svg]:size-5"
                                onClick={handleOpenAddCustomerModal}
                                onFocus={event => event.stopPropagation()}
                                disabled={checkoutWithoutCustomer}
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

            {orderWithoutCustomer && (
              <CheckboxField
                className={styles.checkboxLabel}
                labelClassName="font-bold"
                label="不留客資"
                checked={checkoutWithoutCustomer}
                onChange={handleCheckoutWithoutCustomer}
              />
            )}

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {LBCusDisplay && isLineBinded && <img style={{ width: 24, height: 24 }} alt="line_icon" src={lineIcon} />}
              {membershipPurchase.length > 0 && <MembershipCardList data={membershipPurchase} />}
            </div>
          </div>

          {/* 第 3 欄：服務人員 */}
          <div className={`${styles.column} ${styles.column3}`}>
            <div className={styles.row}>
              {/* 必填 *：Header.js 的 valid 要求 bill.designerId */}
              <Field label="服務人員" required className="min-w-[180px] flex-1">
                <EmployeeAutoComplete
                  className={styles.employeeInput}
                  getCustomerData={values => setCustomerInModal(values)}
                  placeholder="服務人員姓名/編號"
                  value={bill.designerId}
                  ref={designerRef}
                  onFocus={handleFocus}
                  name="designer"
                  onChange={value => handleBillChange({ value: idx(value, _ => _.userId), key: 'designerId' })}
                  onKeyDown={e => {
                    if (e.keyCode === 13) {
                      if (designationSettingForOrderCreate) {
                        designateRef.current.focus()
                      } else {
                        nonDesignateRef.current.focus()
                      }
                    }
                  }}
                />
              </Field>

              <Field label="指定方式" className="shrink-0">
                <ToggleGroup
                  className="shrink-0"
                  size="small"
                  value={designationSettingForOrderCreate}
                  onChange={handleToggleButtonChange}
                  exclusive
                  disabled={designateStatus}
                >
                  {designate.map((data, idx) => (
                    <ToggleGroupItem
                      key={`${data.label}-${idx}`}
                      value={data.value}
                      ref={data.value ? designateRef : nonDesignateRef}
                      onKeyDown={e => handleDesignateBtnKeyDown(e)}
                      disabled={designateStatus}
                      onClick={() => (data.value ? designateRef.current.focus() : nonDesignateRef.current.focus())}
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
          customerInModal={customerInModal}
          onCustomerAdded={handleCustomerAdded}
        />
      )}
    </Card>
  )
}

Head.propTypes = {
  sx: PropTypes.object,
}
