import { CircularProgress } from 'ui/display-compat'
import { TextField, InputAdornment } from 'ui/text-field'
import PropTypes from 'prop-types'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import Autocomplete, { createFilterOptions } from 'ui/combobox'
import { useFetchCustomersInAutoComplete } from 'hooks/useFetchCustomers'
import billContext from 'context/keyInContext'
import idx from 'idx'
import produce from 'immer'
import _ from 'lodash'
import { useContext, useState, useEffect, useRef, Fragment } from 'react'
import { DateTimePicker } from 'ui/date-picker'
import { UserCog, UserPlus } from 'lucide-react'
import { Card } from 'ui/card'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import useFetchCustomer from 'hooks/useFetchCustomer'
import useFetchAddCustomer from 'hooks/useFetchAddCustomer'
import MembershipCardList from 'components/MembershipCardList'
import lineIcon from 'assets/images/LINE_APP.png'
import AddCustomerModal from './AddCustomerModal'

// 原 emotion styles 逐值轉 Tailwind。dateInput／customerInput／employeeInput 的 '& .MuiOutlinedInput-root'（底色、fieldset 框線、圖示）
// 與 checkboxLabel 的 '& .MuiFormControlLabel-label'／'& .MuiCheckbox-root' 在 ui/date-picker、ui/combobox、ui/checkbox（不輸出這些 class）
// 內不命中，屬死碼不轉，只保留寬度、外距與換行設定
const styles = {
  box: 'flex flex-wrap gap-[16px_12px] items-start',
  column: 'flex flex-col gap-[4px]',
  column1: '[flex:1.2_1_220px]',
  column2: '[flex:1.8_1_280px]',
  column3: '[flex:2_1_340px]',
  row: 'flex items-end gap-[12px] flex-wrap',
  dateInput: 'w-full',
  customerInput: 'w-full',
  employeeInput: 'w-full flex-1 min-w-[180px]',
  addPersonIcon: 'cursor-pointer text-[rgb(var(--text-tertiary))] text-[22px] ml-[14px]',
  checkboxLabel: 'm-0 whitespace-nowrap',
}

const designate = [
  { label: '指定', value: true },
  { label: '不指定', value: false },
]

export default function Head() {
  const {
    bill, handleBillChange, setBill, setFocus, focus, LBCusDisplay,
    isLineBinded, setIsLineBinded,
  } = useContext(billContext)
  const [openModal, setOpenModal] = useState(false)

  const customerRef = useRef()
  const designerRef = useRef()
  const designateRef = useRef()
  const nonDesignateRef = useRef()

  // 會員卡的State
  const [membershipPurchase, setMembershipPurchase] = useState([])

  // fetch customer data by bill customer id
  const customerData = useFetchCustomer({
    id: bill.customerId !== undefined ? bill.customerId : null,
  })

  // add customer mutation
  const { addCustomer } = useFetchAddCustomer()

  const stayInCheckoutWithoutCustomer = JSON.parse(
    localStorage.getItem('stayInCheckoutWithoutCustomer')
  )
  const handleToggleButtonChange = (_event, state) => {
    state !== null &&
      handleBillChange({ key: 'isDesignate', value: focus === 'designer' ? true : state })
    setFocus('')
  }

  // at the beginning take order withoutCustomerData
  const [checkoutWithoutCustomer, setCheckoutWithoutCustomer] = useState(
    stayInCheckoutWithoutCustomer !== null ? stayInCheckoutWithoutCustomer : false
  )
  // set customer for edit or add customer modal
  const [customer, setCustomer] = useState({
    customerId: '',
    category: '',
    name: '',
    cellphone: '',
    birthday: {
      year: '',
      month: '',
      day: '',
    },
    OfficialBrandMerchantId: localStorage.getItem('userMerchant')
      ? JSON.parse(localStorage.getItem('userMerchant')).id
      : null,
    gender: 'MALE',
    no: '',
    nickName: '',
    PreferDesignerId: '',
    email: '',
    address: '',
    lineId: '',
    remark: '',
  })

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

  const handleDateChange = date => {
    const currentDate = new Date(date).getTime()
    if (!isNaN(currentDate)) {
      handleBillChange({ key: 'date', value: currentDate })
    }
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
      handleBillChange({ key: 'withoutCustomerData', value: true })
      setMembershipPurchase([])
      setIsLineBinded(false)
      setBill(
        produce(draft => {
          draft.customerId = undefined
          draft.customerCellphone = ''
          draft.walletPay = 0,
            draft.bonusDecount = 0,
            draft.bonusDeposit = 0,
            draft.bonusUsed = 0
        })
      )
      setValue('')
      setCustomer({
        customerId: '',
        category: '',
        name: '',
        cellphone: '',
        birthday: {
          year: '',
          month: '',
          day: '',
        },
        OfficialBrandMerchantId: localStorage.getItem('userMerchant')
          ? JSON.parse(localStorage.getItem('userMerchant')).id
          : null,
        gender: 'MALE',
        no: '',
        nickName: '',
        PreferDesignerId: '',
        email: '',
        address: '',
        lineId: '',
        remark: '',
      })

      setTmpCustomerKeyword('')
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

  // add customer modal
  const handleOpenAddCustomerModal = () => {
    setOpenModal(true)
    if (bill.customerCellphone !== '') {
      addCustomer({
        input: {
          OfficialBrandMerchantId: localStorage.getItem('userMerchant')
            ? JSON.parse(localStorage.getItem('userMerchant')).id
            : null,
          gender: 'MALE',
          cellphone: bill.customerCellphone,
          birthday: {
            year: '',
            month: '',
            day: '',
          },
          name: '',
          category: '',
        },
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
        category: customer.category,
        nickName: customer.nickName,
        PreferDesignerId: customer.preferDesigner !== null ? customer.preferDesigner.id : '',
        email: customer.email,
        address: customer.address,
        lineId: customer.lineId,
        gender: customer.gender,
        remark: customer.remark !== null ? customer.remark : '',
        source: customer.source !== null ? customer.source : '',
      })
    }
  }

  const handleEditClose = () => {
    setOpenModal(false)
  }

  const handleFocus = event => {
    let setted = false
    if (!setted) {
      setFocus(event.target.name)
      setted = true
      event.target.focus()
    }
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

  useEffect(() => {
    if (!customerData.loading) {
      // at the beginning take customer detail for customer autocomplete
      const customerDetail = idx(customerData, _ =>
        _.data.customer !== null ? _.data.customer : null
      )
      if (customerDetail !== null && customerDetail.name !== '不留客資') {
        setValue({
          id: customerDetail.id,
          no: customerDetail.no,
          name: customerDetail.name,
          cellphone: customerDetail.cellphone,
        })
      }
      // 儲存會員卡
      const membershipPurchase = idx(customerData, _ => _.data.customer.membershipPurchaseRecord)
      const isLineBindedData = idx(customerData, _ => _.data.customer.isLineBinded)
      const tmp = []
      setIsLineBinded(isLineBindedData)
      if (membershipPurchase) {
        membershipPurchase.map(d => {
          tmp.push(d)
        })
        setMembershipPurchase(tmp)
      }
    }
  }, [customerData.loading])

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
      options.map(d => {
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
  }, [options, customers.loading, tmpCustomerKeyword])
  return (
    <Card className="ui-root mb-6">
      <div className="px-4 py-4">
        <div className={styles.box}>
          {/* 第 1 欄：日期 */}
          <div className={`${styles.column} ${styles.column1}`}>
            <div className={styles.row}>
              {/* 必填 *：依據 Footer.js 的 vaild（缺 bill.date 時「儲存／結帳」停用） */}
              <Field label="帳單日期" required className="w-full">
                <DateTimePicker
                  value={bill.date}
                  format='yyyy/MM/dd HH:mm'
                  onChange={handleDateChange}
                  className={styles.dateInput}
                />
              </Field>
            </div>
            {/* <FormControlLabel
            control={
              <Checkbox
                onChange={handleLockDate}
                checked={lockDate.open}
                color="primary"
                inputProps={{
                  'data-testid': 'lock-date',
                }}
              />
            }
            label="鎖定日期"
          /> */}
          </div>

          {/* 第 2 欄：客戶與不留客資 */}
          <div className={`${styles.column} ${styles.column2}`}>
            <div className={styles.row}>
              {/* 必填 *：Footer.js 的 vaild 要求有顧客（customerId／手機）或勾選「不留客資」 */}
              <Field label="顧客" required={!bill.withoutCustomerData} className="w-full">
                <Autocomplete
                  disabled={bill.withoutCustomerData}
                  name="customer"
                  className={`customer ${styles.customerInput}`}
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
                      // press clear button
                    } else if (newValue === null) {
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
                        birthday: {
                          year: '',
                          month: '',
                          day: '',
                        },
                        OfficialBrandMerchantId: localStorage.getItem('userMerchant')
                          ? JSON.parse(localStorage.getItem('userMerchant')).id
                          : null,
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
                  // determines the filtered options to be rendered on search
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params)
                    const { inputValue } = params
                    const isExisting = options.some(option => inputValue === option.cellphone)
                    if (inputValue !== '' && !isExisting) {
                      filtered.push({
                        inputValue,
                        cellphone: `新增 "${inputValue}"`,
                      })
                    }
                    return filtered
                  }}
                  handleHomeEndKeys
                  options={options}
                  // It's used to fill the input
                  getOptionLabel={option => {
                    // Value selected with enter, right from the input
                    if (typeof option === 'string') {
                      return option
                    }
                    // Add "xxx" option created dynamically
                    if (option.inputValue) {
                      return option.inputValue
                    }
                    // Regular option
                    return option.name === undefined || option.no === undefined
                      ? option.cellphone
                      : option.name + '/' + option.cellphone + '/' + option.no
                  }}
                  // Render the option, use getOptionLabel by default
                  renderOption={({ key, ...props }, option) => {
                    return (
                      <li key={option.id || option.cellphone} {...props}>
                        {option.name === undefined || option.no === undefined
                          ? option.cellphone
                          : option.name + '/' + option.cellphone + '/' + option.no}
                      </li>
                    )
                  }}
                  freeSolo
                  renderInput={params => (
                    <TextField
                      {...params}
                      // press enter button handle
                      onKeyDown={event => handleBtnKeyDown(event)}
                      inputRef={customerRef}
                      variant="outlined"
                      size="small"
                      autoFocus={focus === 'customer'}
                      placeholder="顧客姓名/手機號碼/編號"
                      onChange={event => setTmpCustomerKeyword(event.target.value)}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            {bill.customerId !== undefined && !bill.withoutCustomerData ? (
                              <UserCog
                                role="button"
                                aria-label="編輯顧客資料"
                                strokeWidth={1.75}
                                className={styles.addPersonIcon}
                                onClick={handleOpenEditCustomerModal}
                              />
                            ) : (
                              <UserPlus
                                role="button"
                                aria-label="新增顧客"
                                strokeWidth={1.75}
                                className={styles.addPersonIcon}
                                onClick={handleOpenAddCustomerModal}
                              />
                            )}
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <Fragment>
                            {customers.loading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
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
              className={styles.checkboxLabel}
              labelClassName="font-bold"
              label="不留客資"
              checked={bill.withoutCustomerData}
              onChange={handleCheckoutWithoutCustomer}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {(LBCusDisplay && isLineBinded) && <img style={{ width: 24, height: 24 }} alt='line_icon' src={lineIcon} />}
              {membershipPurchase.length > 0 && <MembershipCardList data={membershipPurchase} />}
            </div>
          </div>

          {/* 第 3 欄：服務人員 */}
          <div className={`${styles.column} ${styles.column3}`}>
            <div className={styles.row}>
              {/* 必填 *：Footer.js 的 vaild 要求 bill.designerId */}
              <Field label="服務人員" required className="min-w-[180px] flex-1">
                <EmployeeAutoComplete
                  className={styles.employeeInput}
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
                <ToggleGroup
                  className="shrink-0"
                  size="small"
                  value={bill.isDesignate}
                  onChange={handleToggleButtonChange}
                  exclusive
                >
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
        />
      )}
    </Card>
  )
}
Head.propTypes = {
  sx: PropTypes.object,
}
