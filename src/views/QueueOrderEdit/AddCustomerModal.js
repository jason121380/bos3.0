import { Modal } from 'ui/modal-compat'
import { Grid } from 'ui/grid-compat'
import { Button } from 'ui/button-compat'
import { Card, CardActions, CardContent, CardHeader } from 'ui/card-compat'
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { TextField, InputAdornment } from 'ui/text-field'
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
import React, { useState, useEffect, useRef } from 'react'
import useFetchAddCustomer from 'hooks/useFetchAddCustomer'
import useFetchGetCheckIsCustomerNoUsed from 'hooks/useFetchGetCheckIsCustomerNoUsed'
import useFetchGetLastCustomerNo from 'hooks/useFetchGetLastCustomerNo'
import _ from 'lodash'
import SourceSelect from 'components/SourceSelect'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

const gender = [
  {
    value: 'MALE',
    label: '男',
  },
  {
    value: 'FEMALE',
    label: '女',
  },
]

function AddCustomerModal({ open, onClose, customer, setCustomer, setBill }) {
  const inputLabel = useRef()
  const lastCustomerNo = useFetchGetLastCustomerNo()
  const [lastNo, setLastNo] = useState(null)
  const [quickAddCustomer, setQuickAddCustomer] = useState(true)
  const [noVerify, setNoVerify] = React.useState(false)
  const [isSetTime, setIsSetTime] = React.useState(false) // 是否在setTimeout時間差之內的判斷
  const [checkIsCustomerNoUsedLazy, checkIsCustomerNoUsedLazyData] = useFetchGetCheckIsCustomerNoUsed()

  const designers = useFetchUsers({ notDesigner: false, usagelimit: 'EMPLOYEE_LIST' })
  const { updateCustomer } = useFetchUpdateCustomer()
  const { addCustomer } = useFetchAddCustomer()
  const [birthdayObj, setBirthdayObj] = useState({
    year: customer.birthday ? customer.birthday.year : '',
    month: customer.birthday ? customer.birthday.month : '',
    day: customer.birthday ? customer.birthday.day : '',
  })
  const [values, setValues] = useState({
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

  useEffect(() => {
    setValues({
      ...Object.keys(customer).reduce((acc, key) => {
        acc[key] = customer[key] || ''
        return acc
      }, {}),
      PreferDesignerId: customer.PreferDesignerId,
      cellphone: customer.cellphone,
      customerId: customer.customerId,
      name: customer.name,
    })
  }, [customer])

  useEffect(() => {
    if (values.cellphone.length >= 10) {
      setQuickAddCustomer(false)
    }
  }, [values])

  const { loading } = usePageLoading()

  const handleFieldChange = event => {
    if (event.persist) event.persist()
    setValues(
      produce(draft => {
        draft[event.target.name] = event.target.value
      })
    )
  }

  const handleBirthdayChange = e => {
    switch (e.target.name) {
      case 'year':
        if (e.target.value.length <= 3) {
          setBirthdayObj({ ...birthdayObj, year: e.target.value })
        }
        break
      case 'month':
        if (parseInt(e.target.value) <= 12 || e.target.value === '') {
          setBirthdayObj({ ...birthdayObj, month: e.target.value })
        }
        break
      case 'day':
        if (parseInt(e.target.value) <= 31 || e.target.value === '') {
          setBirthdayObj({ ...birthdayObj, day: e.target.value })
        }
        break
      default:
        break
    }
  }

  const handleSubmit = () => {
    if (values.customerId.length > 0) {
      const newValues = _.cloneDeep(values)
      delete newValues.id
      delete newValues.latestDesigner
      updateCustomer({ input: { ...values, birthday: birthdayObj } })
        .then(() => {
          openSnackbar({ variant: 'success', message: '成功更新顧客資訊' })
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
      setBill(
        produce(draft => {
          draft.customerId = null
          draft.customerCellphone = ''
        })
      )
    } else {
      const newValues = _.cloneDeep(values)
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

  useEffect(() => {
    if (!lastCustomerNo.loading) {
      const data = idx(lastCustomerNo, _ => _.data.getLastCustomerNo)
      setLastNo(data)
    }
  }, [lastCustomerNo.loading])

  return (
    <Modal open={open}>
      <Card className="absolute left-1/2 top-1/2 max-h-full w-[700px] max-w-full overflow-y-auto [outline:none] [transform:translate(-50%,-50%)] [box-shadow:0px_10px_13px_-6px_rgba(0,0,0,0.2),0px_20px_31px_3px_rgba(0,0,0,0.14),0px_8px_38px_7px_rgba(0,0,0,0.12)] [&_.MuiCardHeader-action]:mt-0">
        <CardHeader
          title={values.customerId.length > 0 ? '編輯客戶資料' : '新增客戶'}
          action={!lastCustomerNo.loading && <span className="text-body text-text">{`最新顧客編號: ${lastNo}`}</span>}
        />
        <div className="h-px bg-border" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
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
            </Grid>
            <Grid item md={6} xs={12}>
              <Field label="客戶姓名">
                <Input
                  name="name"
                  onChange={handleFieldChange}
                  value={values.name}
                />
              </Field>
            </Grid>
            <Grid item md={6} xs={12}>
              {/* 標籤改放欄位上方（與同彈窗其他欄位一致），不再卡在外框上緣 */}
              <Field label="性別" htmlFor="queueAddCustomerModal-gender">
                <NativeSelect
                  className="ui-root"
                  id="queueAddCustomerModal-gender"
                  value={values.gender}
                  name="gender"
                  onChange={handleFieldChange}
                >
                  <NativeSelectOption value="UNKNOWN">
                    <em>未知</em>
                  </NativeSelectOption>
                  {gender.map((data, index) => (
                    <NativeSelectOption value={data.value} key={`${data.value}-${index}`}>
                      {data.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </Grid>
            <Grid item md={6} xs={12}>
              <Field label="Email">
                <Input
                  name="email"
                  value={values.email}
                  onChange={handleFieldChange}
                />
              </Field>
            </Grid>
            <Grid item md={6} xs={12}>
              <Field label="lineId">
                <Input
                  name="lineId"
                  value={values.lineId}
                  onChange={handleFieldChange}
                />
              </Field>
            </Grid>
            <Grid item md={6} xs={12}>
              <Field label="地址">
                <Input
                  name="address"
                  value={values.address}
                  onChange={handleFieldChange}
                />
              </Field>
            </Grid>
            <Grid item md={6} xs={12}>
              <Field label="客戶暱稱">
                <Input
                  name="nickName"
                  value={values.nickName}
                  onChange={handleFieldChange}
                />
              </Field>
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                label="民國年"
                name="year"
                value={birthdayObj.year}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                className="w-[80px]"
              />
              <TextField
                label="月"
                name="month"
                value={birthdayObj.month}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                className="!ml-[10px] w-[80px]"
              />
              <TextField
                label="日"
                name="day"
                value={birthdayObj.day}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                className="!ml-[10px] w-[80px]"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <Field label="電話">
                <Input
                  onChange={handleFieldChange}
                  name="cellphone"
                  value={values.cellphone}
                />
              </Field>
            </Grid>
            <Grid item md={6} xs={12}>
              <SourceSelect
                emptyOption
                value={values.source}
                onChange={handleFieldChange}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <Field label="最近設計師" htmlFor="queueAddCustomerModal-latestDesigner">
                <NativeSelect
                  className="ui-root"
                  id="queueAddCustomerModal-latestDesigner"
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
            </Grid>
            <Grid item md={6} xs={12}>
              {designers.data ? (
                <Field label="偏好設計師" htmlFor="queueAddCustomerModal-preferDesigner">
                  <NativeSelect
                    className="ui-root"
                    id="queueAddCustomerModal-preferDesigner"
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
            </Grid>
            <Grid item md={6} xs={12}>
              <Field label="備註">
                <Input
                  onChange={handleFieldChange}
                  name="remark"
                  value={values.remark}
                />
              </Field>
            </Grid>
          </Grid>
        </CardContent>
        <div className="h-px bg-border" />
        <CardActions className="justify-end">
          <Button onClick={onClose}>取消</Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            variant="contained"
            disabled={quickAddCustomer}
          >
            {values.customerId.length > 0 ? '儲存' : '新增'}
          </Button>
        </CardActions>
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
  onClose: () => { },
}

export default AddCustomerModal
