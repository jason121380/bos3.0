/** @jsxImportSource @emotion/react */
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import { Button, Card, CardActions, CardContent, CardHeader, Grid, Modal } from '@mui/material'
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
import _ from 'lodash'
import { useHistory } from 'react-router'
import SourceSelect from 'components/SourceSelect'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Autocomplete } from 'ui/combobox'

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
    justifyContent: 'space-between',
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

function AddCustomerModal({ open, onClose, customer, setCustomer, setBill, customerInModal }) {
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

  const handleFieldChange = event => {
    if (event.persist) event.persist()
    setValues(
      produce(draft => {
        draft[event.target.name] = event.target.value
      })
    )
  }

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
      const newValues = _.cloneDeep(values)
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
        openSnackbar({ variant: 'error', message: error.message })
        setQuickAddCustomer(false)
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
          openSnackbar({ variant: 'error', message: error.message })
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

  const optionLabel = (id) => {
    if (id === '' || typeof id === 'object') {
      return ''
    } else {
      const newOption = customerInModal.find(d => d.userId !== null && d.userId === id)
      return newOption.userName
    }
  }
  const handleClick = event => {
    if (event.keyCode === 13) {
      setFocus('remark')
      remarkRef.current.focus()
      return preferDesignerRef.current.removeEventListener('keydown', handleClick);
    }
  };

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
            </Grid>
            <Grid item md={6} xs={12}>
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
            </Grid>
            <Grid item md={6} xs={12}>
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
                  {gender.map((data, index) => (
                    <MenuItem value={data.value} key={`${data.value}-${index}`}>
                      {data.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={6} xs={12}>
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
            </Grid>
            <Grid item md={6} xs={12}>
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
            </Grid>
            <Grid item md={6} xs={12}>
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
            </Grid>
            <Grid item md={6} xs={12}>
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
            </Grid>
            <Grid item md={6} xs={12}>
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
            </Grid>
            <Grid item md={6} xs={12}>
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
            </Grid>
            <Grid item md={6} xs={12}>
              <SourceSelect
                focused={focus === 'source'}
                onKeyDown={e => e.key === 'Enter' && setFocus('preferDesigner')}
                emptyOption
                value={values.source}
                onChange={event => handleFieldChange(event)}
                ref={sourceRef}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <NativeSelect
                label='最近設計師'
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
            </Grid>
            <Grid item md={6} xs={12}>
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
            </Grid>
            <Grid item md={6} xs={12}>
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
            </Grid>
          </Grid>
        </CardContent>
        <div className="h-px bg-border" />
        <CardActions css={styles.actions}>
          <div>
            {values.customerId.length > 0 && (
              <Button color="primary" variant="contained" onClick={handleGoToCustomerEdit}>
                查看訂單記錄
              </Button>
            )}
          </div>
          <div>
            <Button onClick={onClose}>取消</Button>
            <Button
              color="primary"
              onClick={handleSubmit}
              variant="contained"
              disabled={quickAddCustomer}
              ref={submitRef}
              focusRipple={focus === 'submit'}
            >
              {values.customerId.length > 0 ? '儲存' : '新增'}
            </Button>
          </div>
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
