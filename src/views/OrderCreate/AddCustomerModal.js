/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  InputAdornment,
  Typography,
  Autocomplete,
  CircularProgress
} from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
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
          action={!lastCustomerNo.loading && <Typography variant="body1">{`最新顧客編號: ${lastNo}`}</Typography>}
        />
        <Divider />
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
                inputRef={noRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('name')}
                InputProps={{
                  endAdornment: (
                    (values.no === '') ? '' :
                      isSetTime ?
                        <InputAdornment position="start">
                          <CircularProgress size={20} />
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
              <TextField
                fullWidth
                label="客戶姓名"
                name="name"
                onChange={handleFieldChange}
                value={values.name}
                variant="outlined"
                inputRef={nameRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('gender')}
              />
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
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={values.email}
                onChange={handleFieldChange}
                variant="outlined"
                inputRef={emailRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('lineId')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="lineId"
                name="lineId"
                value={values.lineId}
                onChange={handleFieldChange}
                variant="outlined"
                inputRef={lineIdRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('address')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="地址"
                name="address"
                value={values.address}
                onChange={handleFieldChange}
                variant="outlined"
                inputRef={addressRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('nickName')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="客戶暱稱"
                name="nickName"
                value={values.nickName}
                onChange={handleFieldChange}
                variant="outlined"
                inputRef={nickNameRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('year')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                label="民國年"
                name="year"
                value={birthdayObj.year}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                css={styles.birthdayInput}
                inputRef={yearRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('month')}
              />
              <TextField
                label="月"
                name="month"
                value={birthdayObj.month}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                css={styles.birthdayMonthDay}
                inputRef={monthRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('day')}
              />
              <TextField
                label="日"
                name="day"
                value={birthdayObj.day}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                css={styles.birthdayMonthDay}
                inputRef={dayRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('cellphone')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="電話"
                onChange={handleFieldChange}
                name="cellphone"
                value={values.cellphone || customer.cellphone}
                variant="outlined"
                inputRef={cellphoneRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('source')}
              />
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
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel}>最近設計師</InputLabel>
                <Select
                  label='最近設計師'
                  value={customer.latestDesigner || ''}
                  onChange={handleFieldChange}
                  name="DesignerId"
                  disabled
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {customerInModal.map((data, index) => (
                    <MenuItem value={data.userId} key={`${data.userId}-${index}`}>
                      {data.userName}
                    </MenuItem>
                  ))
                  }
                </Select>
              </FormControl>
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
              <TextField
                fullWidth
                label="備註"
                onChange={handleFieldChange}
                name="remark"
                value={values.remark}
                variant="outlined"
                inputRef={remarkRef}
                onKeyDown={e => e.key === 'Enter' && setFocus('submit')}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
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
