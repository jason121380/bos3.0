/** @jsxImportSource @emotion/react */
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
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: 700,
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%',
    '& .MuiCardHeader-action': {
      marginTop: 0,
    }
  }),
  birthday: css({
    width: '100%',
  }),
  actions: css({
    justifyContent: 'flex-end',
  }),
  birthdayInput: css({
    width: '80px',
  }),
  birthdayMonthDay: css({
    width: '80px',
    marginLeft: '10px !important',
  }),
}

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
      <Card css={styles.root}>
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
              <NativeSelect
                className="ui-root"
                label='性別'
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
                css={styles.birthdayInput}
              />
              <TextField
                label="月"
                name="month"
                value={birthdayObj.month}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                css={styles.birthdayMonthDay}
              />
              <TextField
                label="日"
                name="day"
                value={birthdayObj.day}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                css={styles.birthdayMonthDay}
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
              <NativeSelect
                className="ui-root"
                label='最近設計師'
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
            </Grid>
            <Grid item md={6} xs={12}>
              {designers.data ? (
                <NativeSelect
                  className="ui-root"
                  label='偏好設計師'
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
        <CardActions css={styles.actions}>
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
