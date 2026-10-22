import { Modal } from 'ui/modal-compat'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { TextField, InputAdornment } from 'ui/text-field'
import { LoaderCircle } from 'lucide-react'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
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
      // 顧客沒填性別（null）時顯示並送出「未知」，與初始值相同（原本變成空字串：下拉沒有對應選項、送出空白）
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
    if (values.customerId.length > 0) {
      const newValues = cloneDeep(values)
      delete newValues.id
      delete newValues.latestDesigner
      updateCustomer({ input: { ...newValues, birthday: birthdayObj } })
        .then(() => {
          openSnackbar({ variant: 'success', message: '成功更新顧客資訊' })
          // 先清空再指回同一位顧客：頁首依顧客 id 重新查詢，顯示更新後的姓名（原本在送出當下就清空，
          // 失敗時帳單的顧客就此被清掉；改成成功後才做，兩次更新在 Promise 回呼中各自渲染一次）
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
        })
        .catch(error => {
          openSnackbar({ message: error.message, variant: 'error' })
        })
    } else {
      const newValues = cloneDeep(values)
      delete newValues.customerId
      delete newValues.source
      if (newValues.name.length === 0 || newValues.cellphone.length === 0) {
        openSnackbar({ variant: 'warning', message: '姓名與電話為必填' })
      } else {
        addCustomer({
          input: { ...newValues, birthday: birthdayObj },
        })
          .then(res => {
            setCustomer({
              ...customer,
              customerId: res.data.addCustomer.id,
              birthday: res.data.addCustomer.birthday,
              name: res.data.addCustomer.name,
              gender: res.data.addCustomer.gender,
            })
            // 新顧客直接帶進帳單（與只輸入手機的快速新增相同，見 Head handleOpenAddCustomerModal）
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
          .catch(error => {
            openSnackbar({ message: error.message, variant: 'error' })
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
    <Modal open={open}>
      <Card className="absolute left-1/2 top-1/2 max-h-[calc(100%-32px)] w-[700px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-background shadow-float outline-none">
        <CardHeader
          className="items-center pb-4"
          action={!lastCustomerNo.loading && <span className="text-body text-text">{`最新顧客編號: ${lastNo}`}</span>}
        >
          <CardTitle>{values.customerId.length > 0 ? '編輯客戶資料' : '新增客戶'}</CardTitle>
        </CardHeader>
        <div className="h-px bg-border" />
        <CardContent>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 min-[900px]:grid-cols-2">
            <div className="min-w-0">
              <TextField
                error={noVerify && !isSetTime}
                helperText={noVerify && !isSetTime ? '客戶編號重複' : ''}
                fullWidth
                label="客戶編號"
                name="no"
                onChange={handleFieldChange}
                value={values.no}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    (values.no === '') ? '' :
                      isSetTime ?
                        <InputAdornment position="start">
                          <LoaderCircle className="h-5 w-5 animate-spin text-accent" strokeWidth={1.75} />
                        </InputAdornment> :
                        !noVerify ?
                          <InputAdornment position="start">
                            <CheckRoundedIcon color='success' />
                          </InputAdornment> :
                          <InputAdornment position="start">
                            <WarningAmberRoundedIcon color='error' />
                          </InputAdornment>
                  ),
                }}
              />
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
              {/* 標籤在欄位上方（與同彈窗其他欄位一致），不用外框上緣標籤 */}
              <Field label="性別" htmlFor="orderEditAddCustomer-gender">
              <NativeSelect
                id="orderEditAddCustomer-gender"
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
              {/* 生日三格：標籤在上（比照打帳單的新增顧客彈窗） */}
              <div className="flex flex-wrap gap-2.5">
                <Field label="民國年" className="w-20">
                  <TextField
                    fullWidth
                    name="year"
                    value={birthdayObj.year}
                    onChange={e => handleBirthdayChange(e)}
                    variant="outlined"
                  />
                </Field>
                <Field label="月" className="w-20">
                  <TextField
                    fullWidth
                    name="month"
                    value={birthdayObj.month}
                    onChange={e => handleBirthdayChange(e)}
                    variant="outlined"
                  />
                </Field>
                <Field label="日" className="w-20">
                  <TextField
                    fullWidth
                    name="day"
                    value={birthdayObj.day}
                    onChange={e => handleBirthdayChange(e)}
                    variant="outlined"
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
                css={styles.birthday}
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
                  value={values.cellphone}
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
              <Field label="最近設計師" htmlFor="orderEditAddCustomer-latestDesigner">
              <NativeSelect
                id="orderEditAddCustomer-latestDesigner"
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
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel}>偏好設計師</InputLabel>
                {designers.data ? (
                  <Select
                    label='偏好設計師'
                    value={values.PreferDesignerId}
                    onChange={handleFieldChange}
                    name="PreferDesignerId"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {idx(designers, _ =>
                      _.data.users.users.map((data, index) => (
                        <MenuItem value={data.id} key={`${data.id}-${index}`}>
                          {data.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                ) : (
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
                )}
              </FormControl>
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
        </CardContent>
        <div className="h-px bg-border" />
        <CardFooter>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={quickAddCustomer}
          >
            {values.customerId.length > 0 ? '儲存' : '新增'}
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  )
}

AddCustomerModal.propTypes = {
  className: PropTypes.string,
  customer: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

AddCustomerModal.defaultProps = {
  open: false,
}

export default AddCustomerModal
