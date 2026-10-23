import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from 'ui/dialog'
import { Button } from 'ui/button'
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { LoaderCircle } from 'lucide-react'
import { Field, Input } from 'ui/input'
import { CheckRounded as CheckRoundedIcon, WarningAmberRounded as WarningAmberRoundedIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import useFetchUpdateCustomer from 'hooks/useFetchUpdateCustomer'
import useFetchUsers from 'hooks/useFetchUsers'
import usePageLoading from 'hooks/usePageLoading'
import idx from 'idx'
import produce from 'immer'
import PropTypes from 'prop-types'
import React from 'react'
import useFetchAddCustomer from 'hooks/useFetchAddCustomer'
import useFetchGetCheckIsCustomerNoUsed from 'hooks/useFetchGetCheckIsCustomerNoUsed'
import useFetchGetLastCustomerNo from 'hooks/useFetchGetLastCustomerNo'
import cloneDeep from 'lodash/cloneDeep'
import SourceSelect from 'components/SourceSelect'
import { GENDER_OPTIONS, makeFieldChange, makeBirthdayChange } from 'views/OrderShared/customerFormInput'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'


function AddCustomerModal({ open, onClose, customer, setCustomer, setBill }) {
  const inputLabel = React.useRef()
  const lastCustomerNo = useFetchGetLastCustomerNo()
  const [lastNo, setLastNo] = React.useState(null)
  const [quickAddCustomer, setQuickAddCustomer] = React.useState(true)
  const [noVerify, setNoVerify] = React.useState(false)
  const [isSetTime, setIsSetTime] = React.useState(false) // 是否在setTimeout時間差之內的判斷
  const [checkIsCustomerNoUsedLazy, checkIsCustomerNoUsedLazyData] = useFetchGetCheckIsCustomerNoUsed()

  const designers = useFetchUsers({ notDesigner: false, usagelimit: 'EMPLOYEE_LIST' })
  const { updateCustomer } = useFetchUpdateCustomer()
  const { addCustomer } = useFetchAddCustomer()
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
    // 顧客已有所屬店家就沿用，沒有才用目前店家（原寫法 a || b ? x : y 的優先順序讓已有的值永遠被忽略）
    OfficialBrandMerchantId:
      customer.OfficialBrandMerchantId ||
      (localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null),
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
      // 顧客沒有性別資料（null）時與初始值一致為「未知」：否則選單顯示空白、儲存送出空字串
      gender: customer.gender || 'UNKNOWN',
    })
  }, [customer])

  React.useEffect(() => {
    if (values.cellphone.length >= 10) {
      setQuickAddCustomer(false)
    }
  }, [values])

  const { loading } = usePageLoading()

  // 欄位輸入（OrderShared/customerFormInput，四頁共用）
  const handleFieldChange = makeFieldChange(setValues)
  const handleBirthdayChange = makeBirthdayChange(birthdayObj, setBirthdayObj)




  const handleSubmit = () => {
    const newValues = cloneDeep(values)
    if (values.customerId.length > 0) {
      delete newValues.id
      delete newValues.latestDesigner
      updateCustomer({ input: { ...newValues, birthday: birthdayObj } }).then(() => {
        openSnackbar({ variant: 'success', message: '成功更新顧客資訊' })
        // 更新成功才先清掉再設回同一位顧客：頁首因顧客 id 改變而重新讀取，顯示更新後的資料。
        // 原本在送出當下就清掉、只在成功時設回，更新失敗時掛單的顧客就被清空
        setBill(
          produce(draft => {
            draft.customerId = null
            draft.customerCellphone = ''
          })
        )
        setBill(
          produce(draft => {
            draft.customerId = values.customerId
            draft.customerCellphone = ''
          })
        )
        onClose()
      }).catch(() => {
        // 失敗提示由 init-apollo 的 errorLink 統一顯示（這裡不重複提示）；顧客與編輯窗保持原樣，可修正後再按
      })
    } else {
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
          // 新增的顧客帶入掛單（比照頁首只輸入手機的快速新增）；原本只關窗，櫃台還得再搜尋選一次
          setBill(
            produce(draft => {
              draft.customerId = res.data.addCustomer.id
              draft.customerCellphone = ''
            })
          )
          openSnackbar({
            message: '成功新增客戶',
            variant: 'success',
          })
          onClose()
        })
      }
    }
  }
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
              {/* 欄位上方標籤，與同彈窗其他欄位及打帳單的新增顧客彈窗一致；檢查圖示改放輸入框右側 */}
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
              <Field label="客戶姓名">
                <Input
                  name="name"
                  onChange={handleFieldChange}
                  value={values.name}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <Field label="性別" htmlFor="addCustomerModal-gender">
                <NativeSelect
                  className="ui-root"
                  id="addCustomerModal-gender"
                  value={values.gender}
                  name="gender"
                  onChange={handleFieldChange}
                >
                  <NativeSelectOption value="UNKNOWN">
                    <em>未知</em>
                  </NativeSelectOption>
                  {GENDER_OPTIONS.map((data, index) => (
                    <NativeSelectOption value={data.value} key={`${data.value}-${index}`}>
                      {data.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <div className="min-w-0">
              <Field label="Email">
                <Input
                  name="email"
                  value={values.email}
                  onChange={handleFieldChange}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <Field label="lineId">
                <Input
                  name="lineId"
                  value={values.lineId}
                  onChange={handleFieldChange}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <Field label="地址">
                <Input
                  name="address"
                  value={values.address}
                  onChange={handleFieldChange}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <Field label="客戶暱稱">
                <Input
                  name="nickName"
                  value={values.nickName}
                  onChange={handleFieldChange}
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
                  />
                </Field>
                <Field label="月" htmlFor="addCustomerModal-month" className="w-20">
                  <Input
                    id="addCustomerModal-month"
                    name="month"
                    value={birthdayObj.month}
                    onChange={e => handleBirthdayChange(e)}
                  />
                </Field>
                <Field label="日" htmlFor="addCustomerModal-day" className="w-20">
                  <Input
                    id="addCustomerModal-day"
                    name="day"
                    value={birthdayObj.day}
                    onChange={e => handleBirthdayChange(e)}
                  />
                </Field>
              </div>
            </div>
            {/* <div className="min-w-0">
              <KeyboardDatePicker
                format="YYYY/MM/DD"
                label="生日"
                value={values.birthday}
                name="birthday"
                className={classes.birthday}
                onChange={(_event, val) =>
                  handleFieldChange({
                    target: {
                      name: 'birthday',
                      value: new Date(val).getTime(),
                    },
                  })
                }
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </div> */}
            {/* <div className="min-w-0">
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel ref={inputLabel}>客戶類別</InputLabel>
                    <Select
                      label='客戶類別'
                      value={values.category}
                      name="category"
                      onChange={handleFieldChange}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {idx(customerCategory, _ =>
                        _.data.merchantCustomerCategory.map((data, index) => (
                          <MenuItem value={data.name} key={`${data.name}-${index}`}>
                            {data.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </div> */}
            <div className="min-w-0">
              <Field label="電話">
                <Input
                  onChange={handleFieldChange}
                  name="cellphone"
                  value={values.cellphone || customer.cellphone}
                />
              </Field>
            </div>
            <div className="min-w-0">
              <SourceSelect
                emptyOption
                value={values.source}
                onChange={handleFieldChange}
              />
            </div>
            <div className="min-w-0">
              <Field label="最近設計師" htmlFor="addCustomerModal-latestDesigner">
                <NativeSelect
                  className="ui-root"
                  id="addCustomerModal-latestDesigner"
                  value={customer.latestDesigner || ''}
                  onChange={handleFieldChange}
                  name="DesignerId"
                  disabled
                >
                  <NativeSelectOption value="">
                    <em>None</em>
                  </NativeSelectOption>
                  {idx(designers, _ =>
                    _.data.users.users.map((data, index) => (
                      <NativeSelectOption value={data.id} key={`${data.id}-${index}`}>
                        {data.name}
                      </NativeSelectOption>
                    ))
                  )}
                </NativeSelect>
              </Field>
            </div>
            <div className="min-w-0">
              {designers.data ? (
                <Field label="偏好設計師" htmlFor="addCustomerModal-preferDesigner">
                  <NativeSelect
                    className="ui-root"
                    id="addCustomerModal-preferDesigner"
                    value={values.PreferDesignerId}
                    onChange={handleFieldChange}
                    name="PreferDesignerId"
                  >
                    <NativeSelectOption value="">
                      <em>None</em>
                    </NativeSelectOption>
                    {idx(designers, _ =>
                      _.data.users.users.map((data, index) => (
                        <NativeSelectOption value={data.id} key={`${data.id}-${index}`}>
                          {data.name}
                        </NativeSelectOption>
                      ))
                    )}
                  </NativeSelect>
                </Field>
              ) : (
                // 載入中用 renderValue 顯示轉圈，保留 MUI Select
                <FormControl variant="outlined" fullWidth>
                  <InputLabel ref={inputLabel}>偏好設計師</InputLabel>
                  <Select
                    label='偏好設計師'
                    value='loading'
                    onChange={handleFieldChange}
                    name="PreferDesignerId"
                    renderValue={() => <LoaderCircle className="h-5 w-5 animate-spin text-accent" strokeWidth={1.75} />}
                  >
                    <MenuItem value="loading">
                      <em>Loading...</em>
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            </div>
            <div className="min-w-0">
              <Field label="備註">
                <Input
                  onChange={handleFieldChange}
                  name="remark"
                  value={values.remark}
                />
              </Field>
            </div>
          </div>
        </DialogBody>
        <div className="h-px bg-border" />
        <DialogFooter className="border-t-0">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={quickAddCustomer}
          >
            {values.customerId.length > 0 ? '儲存' : '新增'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

AddCustomerModal.propTypes = {
  customer: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

AddCustomerModal.defaultProps = {
  open: false,
}

export default AddCustomerModal
