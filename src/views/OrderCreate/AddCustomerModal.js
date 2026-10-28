import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from 'ui/dialog'
import { Button } from 'ui/button'
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import { LoaderCircle } from 'lucide-react'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { CheckRounded as CheckRoundedIcon, WarningAmberRounded as WarningAmberRoundedIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import useFetchUpdateCustomer from 'hooks/useFetchUpdateCustomer'
import usePageLoading from 'hooks/usePageLoading'
import produce from 'immer'
import PropTypes from 'prop-types'
import React from 'react'
import useFetchAddCustomer from 'hooks/useFetchAddCustomer'
import useFetchGetCheckIsCustomerNoUsed from 'hooks/useFetchGetCheckIsCustomerNoUsed'
import useFetchGetLastCustomerNo from 'hooks/useFetchGetLastCustomerNo'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import { useHistory } from 'react-router'
import SourceSelect from 'components/SourceSelect'
import { GENDER_OPTIONS, makeFieldChange, makeBirthdayChange } from 'views/OrderShared/customerFormInput'
import { Autocomplete } from 'ui/combobox'


function AddCustomerModal({ open, onClose, customer, setCustomer, setBill, customerInModal, onCustomerAdded }) {
  const lastCustomerNo = useFetchGetLastCustomerNo()
  const inputLabel = React.useRef()
  const noRef = React.useRef()
  const nameRef = React.useRef()
  const genderRef = React.useRef()
  const emailRef = React.useRef()
  const lineIdRef = React.useRef()
  const nickNameRef = React.useRef()
  const yearRef = React.useRef()
  const monthRef = React.useRef()
  const dayRef = React.useRef()
  const cellphoneRef = React.useRef()
  const addressRef = React.useRef()
  const sourceRef = React.useRef()
  const remarkRef = React.useRef()
  const preferDesignerRef = React.useRef()
  const submitRef = React.useRef()

  const [quickAddCustomer, setQuickAddCustomer] = React.useState(true)
  const [focus, setFocus] = React.useState('')
  const [noVerify, setNoVerify] = React.useState(false)
  const [lastNo, setLastNo] = React.useState(null)
  const [isSetTime, setIsSetTime] = React.useState(false) // 是否在setTimeout時間差之內的判斷

  const { updateCustomer } = useFetchUpdateCustomer()
  const { addCustomer } = useFetchAddCustomer()
  const [checkIsCustomerNoUsedLazy, checkIsCustomerNoUsedLazyData] = useFetchGetCheckIsCustomerNoUsed()

  const [birthdayObj, setBirthdayObj] = React.useState({
    year: customer.birthday ? customer.birthday.year : '',
    month: customer.birthday ? customer.birthday.month : '',
    day: customer.birthday ? customer.birthday.day : '',
  })

  const [values, setValues] = React.useState({
    customerId: customer.customerId || '',
    category: customer.category || '',
    no: customer.no || '',
    name: customer.name || '',
    nickName: customer.nickName || '',
    cellphone: customer.cellphone || 0,
    birthday: customer.birthday || { year: '', month: '', day: '' },
    PreferDesignerId: customer.PreferDesignerId || '',
    OfficialBrandMerchantId:
      customer.OfficialBrandMerchantId || localStorage.getItem('userMerchant')
        ? JSON.parse(localStorage.getItem('userMerchant')).id
        : null,
    email: customer.email || '',
    address: customer.address || '',
    lineId: customer.lineId || '',
    gender: customer.gender || 'UNKNOWN',
    remark: customer.remark || '',
    source: customer.source || '',
  })



  React.useEffect(() => {
    setValues({
      ...Object.keys(customer).reduce((acc, key) => {
        acc[key] = customer[key] || ''
        return acc
      }, {}),
      PreferDesignerId: customer.PreferDesignerId,
      cellphone: customer.cellphone,
      customerId: customer.customerId,
      name: customer.name,
      // 顧客沒有性別資料（null）時與新增時相同視為「未知」，不顯示空白、也不送出空字串
      gender: customer.gender || 'UNKNOWN',
    })
  }, [customer])

  React.useEffect(() => {
    if (values.cellphone.length >= 1) {
      setQuickAddCustomer(false)
    } else {
      setQuickAddCustomer(true)
    }
  }, [values])

  const { loading } = usePageLoading()

  // 欄位輸入（OrderShared/customerFormInput，四頁共用）
  const handleFieldChange = makeFieldChange(setValues)
  const handleBirthdayChange = makeBirthdayChange(birthdayObj, setBirthdayObj)


  const handlePreferDesignerChange = value => {
    setValues(
      produce(draft => {
        draft['PreferDesignerId'] = value === null ? '' : value.userId
      })
    )
  }

  const handleSubmit = () => {
    setQuickAddCustomer(true)
    if (values.customerId.length > 0) {
      const newValues = cloneDeep(values)
      delete newValues.id
      delete newValues.latestDesigner
      updateCustomer({ input: { ...newValues, birthday: birthdayObj } }).then(() => {
        openSnackbar({ variant: 'success', message: '成功更新顧客資訊' })
        setBill(
          produce(draft => {
            draft.customerId = values.customerId
            draft.customerCellphone = ''
          })
        )
        onClose()
      }).catch(error => {
        setQuickAddCustomer(false)
        // 更新失敗：把下方先清掉的顧客帶回帳單（原本失敗時帳單的顧客被悄悄清空）
        setBill(
          produce(draft => {
            draft.customerId = values.customerId
            draft.customerCellphone = ''
          })
        )
      })
      setBill(
        produce(draft => {
          draft.customerId = null
          draft.customerCellphone = ''
        })
      )
    } else {
      const newValues = cloneDeep(values)
      delete newValues.customerId
      if (newValues.name.length === 0 || newValues.cellphone.length === 0) {
        openSnackbar({ variant: 'warning', message: '姓名與電話為必填' })
      } else {
        addCustomer({
          input: { ...newValues, birthday: birthdayObj },
        }).then(res => {
          setCustomer({
            ...customer,
            customerId: res.data.addCustomer.id,
            birthday: res.data.addCustomer.birthday,
            name: res.data.addCustomer.name,
            gender: res.data.addCustomer.gender,
          })
          openSnackbar({
            message: '成功新增客戶',
            variant: 'success',
          })
          // 新增成功後帳單帶入這位新顧客（與只輸入手機時的快速建檔相同；原本新增完帳單仍沒有顧客）
          onCustomerAdded && onCustomerAdded(res.data.addCustomer)
          onClose()
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
        }).catch(error => {
          setQuickAddCustomer(false)
        })
      }
    }
  }

  React.useEffect(() => {
    switch (focus) {
      case 'no':
        noRef.current.focus()
        break
      case 'name':
        nameRef.current.focus()
        break
      case 'gender':
        genderRef.current.focus()
        break
      case 'email':
        emailRef.current.focus()
        break
      case 'lineId':
        lineIdRef.current.focus()
        break
      case 'address':
        addressRef.current.focus()
        break
      case 'nickName':
        nickNameRef.current.focus()
        break
      case 'year':
        yearRef.current.focus()
        break
      case 'month':
        monthRef.current.focus()
        break
      case 'day':
        dayRef.current.focus()
        break
      case 'cellphone':
        cellphoneRef.current.focus()
        break
      case 'source':
        sourceRef.current.focus()
        break
      case 'preferDesigner':
        preferDesignerRef.current.focus()
        break
      case 'remark':
        remarkRef.current.focus()
        break
      case 'submit':
        submitRef.current.focus()
        break
      default:
        break
    }
  }, [focus])

  // 查看訂單記錄
  const history = useHistory()
  const handleGoToCustomerEdit = () => {
    history.push(`/management/customers/${values.customerId}/invoices`)
  }

  // ui/combobox 以選項物件（已選的設計師）或 id 字串呼叫：物件直接取姓名；原本物件一律回空字串，選了之後欄位顯示空白
  const optionLabel = (id) => {
    if (id === '' || id === null) {
      return ''
    } else if (typeof id === 'object') {
      return id.userName ?? ''
    } else {
      const newOption = customerInModal.find(d => d.userId !== null && d.userId === id)
      // 偏好設計師不在可打單人員中（例如已離職）時顯示空白，不讓整頁出錯
      return newOption ? newOption.userName : ''
    }
  }
  // 固定同一個函式參照：原本每次 render 都是新函式，每次 focus 都多掛一個 keydown 監聽且移除不掉
  // （同一參照重複 addEventListener 不會重複註冊）
  const handleClick = React.useCallback(event => {
    if (event.keyCode === 13) {
      setFocus('remark')
      remarkRef.current.focus()
      preferDesignerRef.current.removeEventListener('keydown', handleClick)
    }
  }, [])

  const checkNo = () => {
    checkIsCustomerNoUsedLazy({
      variables: {
        input: values.no,
        customerId: values.customerId === "" ? null : values.customerId,
      }
    })
  }

  React.useEffect(() => {
    if (checkIsCustomerNoUsedLazyData.data !== undefined && !checkIsCustomerNoUsedLazyData.loading) {
      const data = idx(checkIsCustomerNoUsedLazyData, _ => _.data.checkIsCustomerNoUsed)
      setIsSetTime(false)
      setNoVerify(data)
      data && setFocus('no')
    }
  }, [checkIsCustomerNoUsedLazyData.loading])

  React.useEffect(() => {
    if (values.no !== "") {
      setIsSetTime(true)
      const timer = setTimeout(() => {
        checkNo()
      }, 500)
      return () => {
        clearTimeout(timer)
      }
    } else {
      setNoVerify(false)
    }
  }, [values.no])

  React.useEffect(() => {
    if (!lastCustomerNo.loading) {
      const data = idx(lastCustomerNo, _ => _.data.getLastCustomerNo)
      setLastNo(data)
    }
  }, [lastCustomerNo.loading])

  return (
    <Dialog open={open}>
      {/* 保留原表單寬 700px；本批僅替換彈窗外殼。 */}
      <DialogContent hideClose
        onOpenAutoFocus={event => {
          // 沿用舊 Modal：已有欄位焦點就保留，否則先聚焦面板，避免選人窗自動叫出手機鍵盤。
          event.preventDefault()
          if (!event.target.contains(document.activeElement)) event.target.focus()
        }}
        className="sm:max-w-[700px]" aria-describedby={undefined}>
        <DialogHeader className="items-center pb-4">
          <div className="flex w-full items-center justify-between gap-4">
            <DialogTitle>{values.customerId.length > 0 ? '編輯客戶資料' : '新增客戶'}</DialogTitle>
            {!lastCustomerNo.loading && <span className="text-body text-text">{`最新顧客編號: ${lastNo}`}</span>}
          </div>
        </DialogHeader>
        <div className="h-px bg-border" />
        <DialogBody>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 min-[900px]:grid-cols-2">
            <div className="min-w-0">
              <Field
                label="客戶編號"
                htmlFor="addCustomerModal-no"
                error={noVerify && !isSetTime ? '客戶編號重複' : ''}
              >
                <div className="relative">
                  <Input
                    id="addCustomerModal-no"
                    invalid={noVerify && !isSetTime}
                    className="pr-10"
                    name="no"
                    onChange={handleFieldChange}
                    value={values.no}
                    ref={noRef}
                    onKeyDown={e => e.key === 'Enter' && setFocus('name')}
                  />
                  {values.no !== '' && (
                    <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
                      {isSetTime ? (
                        <LoaderCircle className="h-5 w-5 animate-spin text-accent" strokeWidth={1.75} />
                      ) : !noVerify ? (
                        <CheckRoundedIcon color='success' />
                      ) : (
                        <WarningAmberRoundedIcon color='error' />
                      )}
                    </span>
                  )}
                </div>
              </Field>
            </div>
            <div className="min-w-0">
              <Field label="客戶姓名" htmlFor="addCustomerModal-name">
                <Input
                  id="addCustomerModal-name"
                  name="name"
                  value={values.name}
                  onChange={handleFieldChange}
                  ref={nameRef}
                  onKeyDown={e => e.key === 'Enter' && setFocus('gender')}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <FormControl
                focused={focus === 'gender'}
                onKeyDown={e => e.key === 'Enter' && setFocus('email')}
                variant="outlined" fullWidth>
                <InputLabel focused={focus === 'gender'} ref={inputLabel}>性別</InputLabel>
                <Select
                  inputRef={genderRef}
                  label='性別'
                  value={values.gender}
                  name='gender'
                  onChange={event => {
                    handleFieldChange(event)
                  }}
                >
                  <MenuItem value="UNKNOWN">
                    <em>未知</em>
                  </MenuItem>
                  {GENDER_OPTIONS.map((data, index) => (
                    <MenuItem value={data.value} key={`${data.value}-${index}`}>
                      {data.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="min-w-0">
              <Field label="Email" htmlFor="addCustomerModal-email">
                <Input
                  id="addCustomerModal-email"
                  name="email"
                  value={values.email}
                  onChange={handleFieldChange}
                  ref={emailRef}
                  onKeyDown={e => e.key === 'Enter' && setFocus('lineId')}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <Field label="lineId" htmlFor="addCustomerModal-lineId">
                <Input
                  id="addCustomerModal-lineId"
                  name="lineId"
                  value={values.lineId}
                  onChange={handleFieldChange}
                  ref={lineIdRef}
                  onKeyDown={e => e.key === 'Enter' && setFocus('address')}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <Field label="地址" htmlFor="addCustomerModal-address">
                <Input
                  id="addCustomerModal-address"
                  name="address"
                  value={values.address}
                  onChange={handleFieldChange}
                  ref={addressRef}
                  onKeyDown={e => e.key === 'Enter' && setFocus('nickName')}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <Field label="客戶暱稱" htmlFor="addCustomerModal-nickName">
                <Input
                  id="addCustomerModal-nickName"
                  name="nickName"
                  value={values.nickName}
                  onChange={handleFieldChange}
                  ref={nickNameRef}
                  onKeyDown={e => e.key === 'Enter' && setFocus('year')}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2.5">
                <Field label="民國年" htmlFor="addCustomerModal-year" className="w-20">
                  <Input
                    id="addCustomerModal-year"
                    name="year"
                    value={birthdayObj.year}
                    onChange={e => handleBirthdayChange(e)}
                    ref={yearRef}
                    onKeyDown={e => e.key === 'Enter' && setFocus('month')}
                  />
                </Field>
                <Field label="月" htmlFor="addCustomerModal-month" className="w-20">
                  <Input
                    id="addCustomerModal-month"
                    name="month"
                    value={birthdayObj.month}
                    onChange={e => handleBirthdayChange(e)}
                    ref={monthRef}
                    onKeyDown={e => e.key === 'Enter' && setFocus('day')}
                  />
                </Field>
                <Field label="日" htmlFor="addCustomerModal-day" className="w-20">
                  <Input
                    id="addCustomerModal-day"
                    name="day"
                    value={birthdayObj.day}
                    onChange={e => handleBirthdayChange(e)}
                    ref={dayRef}
                    onKeyDown={e => e.key === 'Enter' && setFocus('cellphone')}
                  />
                </Field>
              </div>
            </div>
            <div className="min-w-0">
              <Field label="電話" htmlFor="addCustomerModal-cellphone">
                <Input
                  id="addCustomerModal-cellphone"
                  name="cellphone"
                  value={values.cellphone || customer.cellphone}
                  onChange={handleFieldChange}
                  ref={cellphoneRef}
                  onKeyDown={e => e.key === 'Enter' && setFocus('source')}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <SourceSelect
                focused={focus === 'source'}
                onKeyDown={e => e.key === 'Enter' && setFocus('preferDesigner')}
                emptyOption
                value={values.source}
                onChange={event => handleFieldChange(event)}
                ref={sourceRef}
              />
            </div>
            <div className="min-w-0">
              <Field label="最近設計師" htmlFor="addCustomerModal-latestDesigner">
                <NativeSelect
                  id="addCustomerModal-latestDesigner"
                  value={customer.latestDesigner || ''}
                  onChange={handleFieldChange}
                  name="DesignerId"
                  disabled
                >
                  <NativeSelectOption value="">
                    <em>None</em>
                  </NativeSelectOption>
                  {customerInModal.map((data, index) => (
                    <NativeSelectOption value={data.userId} key={`${data.userId}-${index}`}>
                      {data.userName}
                    </NativeSelectOption>
                  ))
                  }
                </NativeSelect>
              </Field>
            </div>
            <div className="min-w-0">
              <Autocomplete
                value={values.PreferDesignerId || null}
                autoHighlight
                name="PreferDesignerId"
                options={customerInModal}
                onChange={(event, value) => {
                  handlePreferDesignerChange(value)
                  value !== null && remarkRef.current.focus()
                  setFocus('remark')
                }}
                isOptionEqualToValue={(option, value) => option.userId === value}
                autoSelect
                getOptionLabel={optionLabel}
                renderOption={(props, option) => <li {...props} key={option.userId} >{`${option.userName}${!!option.userNo ? '-' + option.userNo : '(無代號)'}`}</li>}
                renderInput={(params) =>
                  <TextField
                    onFocus={() => {
                      preferDesignerRef.current.addEventListener('keydown', handleClick)
                    }}
                    inputRef={preferDesignerRef}
                    variant='outlined' {...params}
                    name='preferDesigner'
                    label="偏好設計師"
                  />
                }
                filterOptions={(options, state) => {
                  const keyword = state.inputValue
                  if (keyword === '' || keyword.length === 0) {
                    return options
                  } else {
                    const newOptions = options.filter(d => d.userNo !== null && d.userNo.includes(keyword) || d.userName !== null && d.userName.includes(keyword))
                    return newOptions
                  }
                }}
              />
            </div>
            <div className="min-w-0">
              <Field label="備註" htmlFor="addCustomerModal-remark">
                <Input
                  id="addCustomerModal-remark"
                  name="remark"
                  value={values.remark}
                  onChange={handleFieldChange}
                  ref={remarkRef}
                  onKeyDown={e => e.key === 'Enter' && setFocus('submit')}
                />
              </Field>
            </div>
          </div>
        </DialogBody>
        <div className="h-px bg-border" />
        <DialogFooter className="flex-wrap justify-between border-t-0">
          <div>
            {values.customerId.length > 0 && (
              <Button variant="secondary" onClick={handleGoToCustomerEdit}>
                查看帳單記錄
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>取消</Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={quickAddCustomer}
              ref={submitRef}
            >
              {values.customerId.length > 0 ? '儲存' : '新增'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

AddCustomerModal.propTypes = {
  className: PropTypes.string,
  customer: PropTypes.any,
  onClose: PropTypes.func,
  onCustomerAdded: PropTypes.func,
  open: PropTypes.bool,
}

AddCustomerModal.defaultProps = {
  open: false,
}

export default AddCustomerModal
