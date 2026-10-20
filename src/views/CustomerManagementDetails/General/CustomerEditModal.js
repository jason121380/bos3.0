/** @jsxImportSource @emotion/react */
// 大型表單彈窗：外框（卡片、標題、底部動作）換成 ui/card、ui/button；Modal 與內部表單欄位保留 MUI
import { Modal } from 'ui/modal-compat'
import { Grid } from 'ui/grid-compat'
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { TextField, InputAdornment } from 'ui/text-field'
import { LoaderCircle } from 'lucide-react'
import { CheckRounded as CheckRoundedIcon, WarningAmberRounded as WarningAmberRoundedIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import useFetchMerchantCustomerCategory from 'hooks/useFetchMerchantCustomerCategory'
import useFetchUpdateCustomer from 'hooks/useFetchUpdateCustomer'
import useFetchUsers from 'hooks/useFetchUsers'
import usePageLoading from 'hooks/usePageLoading'
import idx from 'idx'
import produce from 'immer'
import PropTypes from 'prop-types'
import React from 'react'
import useStore from 'hooks/useStore'
import useFetchGetCheckIsCustomerNoUsed from 'hooks/useFetchGetCheckIsCustomerNoUsed'
import SourceSelect from 'components/SourceSelect'
import { css } from '@emotion/react'
import { theme } from '../../../theme'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'

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
  }),
  birthday: css({
    width: '100%',
  }),
  actions: css({
    justifyContent: 'flex-end',
  }),
  birthdayGrid: css({
    display: 'flex',
  }),
  birthdayInput: css({
    width: '80px',
  }),
  birthdayMonthDay: css({
    width: '80px',
    marginLeft: '10px',
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

function CustomerEditModal({ open, onClose, customer, className = {}, ...rest }) {
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
  const PreferDesignerIdRef = React.useRef()
  const customerCategory = useFetchMerchantCustomerCategory()
  const designers = useFetchUsers({ notDesigner: false, usagelimit: 'EMPLOYEE_LIST' })
  const [birthdayObj, setBirthdayObj] = React.useState({
    year: customer.birthday ? customer.birthday.year : '',
    month: customer.birthday ? customer.birthday.month : '',
    day: customer.birthday ? customer.birthday.day : '',
  })
  const { updateCustomer } = useFetchUpdateCustomer()
  const [noVerify, setNoVerify] = React.useState(false)
  const [isSetTime, setIsSetTime] = React.useState(false) // 是否在setTimeout時間差之內的判斷
  const [checkIsCustomerNoUsedLazy, checkIsCustomerNoUsedLazyData] = useFetchGetCheckIsCustomerNoUsed()

  const [values, setValues] = React.useState({
    customerId: customer.id || '',
    category: customer.category  || '',
    no: customer.no  || '',
    name: customer.name  || '',
    nickName: customer.nickName  || '',
    cellphone: customer.cellphone  || 0,
    birthday: customer.birthday || { year: '', month: '', day: '' },
    PreferDesignerId: customer.PreferDesignerId || '',
    OfficialBrandMerchantId: localStorage.getItem('userMerchant')
      ? JSON.parse(localStorage.getItem('userMerchant')).id
      : null,
    email: customer.email || '',
    address: customer.address || '',
    lineId: customer.lineId || '',
    gender: customer.gender || 'UNKNOWN',
    source: customer.source || '',
    remark: customer.remark || '',
  })
  const vaild = !(
    // values.category &&
    (
      values.name &&
      values.gender &&
      values.cellphone &&
      // values.birthday &&
      values.OfficialBrandMerchantId
    )
  )
  const { refetch } = useStore()
  const { loading } = usePageLoading()
  if (!open) {
    return null
  }

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
    const newValues = { ...values, birthday: birthdayObj }
    updateCustomer({ input: newValues }).then(() => {
      refetch()
      openSnackbar({ variant: 'success', message: '成功更新顧客資訊' })
      onClose()
    })
  }

  const handleKeyDownFocus = e => {
    if (e.key === 'Enter') {
      switch (e.target.name) {
        case 'no':
          nameRef.current.focus()
          break
        case 'name':
          emailRef.current.focus()
          break
        case 'email':
          lineIdRef.current.focus()
          break
        case 'lineId':
          nickNameRef.current.focus()
          break
        case 'nickName':
          yearRef.current.focus()
          break
        case 'year':
          monthRef.current.focus()
          break
        case 'month':
          dayRef.current.focus()
          break
        case 'day':
          cellphoneRef.current.focus()
          break
        case 'cellphone':
          addressRef.current.focus()
          break
        default:
          break
      }
    }
  }
  const checkNo = () => {
    checkIsCustomerNoUsedLazy({
      variables: {
        input: values.no,
        customerId: values.customerId
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

  return (
    <Modal onClose={onClose} open={open}>
      <Card {...rest} css={css([styles.root, className])} className="ui-root shadow-float">
        <CardHeader className="pb-4">
          <CardTitle>編輯客戶資料</CardTitle>
        </CardHeader>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                error={noVerify && !isSetTime}
                helperText={noVerify && !isSetTime ? '客戶編號重複' : ''}
                fullWidth
                inputRef={noRef}
                label="客戶編號"
                name="no"
                onChange={handleFieldChange}
                value={values.no}
                variant="outlined"
                onKeyDown={e => handleKeyDownFocus(e)}
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
              <TextField
                fullWidth
                inputRef={nameRef}
                label="客戶姓名"
                name="name"
                onChange={handleFieldChange}
                value={values.name}
                variant="outlined"
                onKeyDown={e => handleKeyDownFocus(e)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel}>性別</InputLabel>
                <Select
                  inputRef={genderRef}
                  label='性別'
                  value={values.gender}
                  name="gender"
                  onChange={handleFieldChange}
                // onKeyDown={e => handleKeyDownFocus(e)}
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
                inputRef={emailRef}
                value={values.email}
                onChange={handleFieldChange}
                variant="outlined"
                onKeyDown={e => handleKeyDownFocus(e)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="lineId"
                name="lineId"
                inputRef={lineIdRef}
                value={values.lineId}
                onChange={handleFieldChange}
                variant="outlined"
                onKeyDown={e => handleKeyDownFocus(e)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="客戶暱稱"
                name="nickName"
                inputRef={nickNameRef}
                value={values.nickName}
                onChange={handleFieldChange}
                variant="outlined"
                onKeyDown={e => handleKeyDownFocus(e)}
              />
            </Grid>
            <Grid item md={6} xs={12} css={styles.birthdayGrid}>
              <TextField
                label="民國年"
                name="year"
                inputRef={yearRef}
                value={birthdayObj.year}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                css={styles.birthdayInput}
                onKeyDown={e => handleKeyDownFocus(e)}
                onFocus={e => {
                  e.target.select()
                }}
              />
              <TextField
                label="月"
                name="month"
                inputRef={monthRef}
                value={birthdayObj.month}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                css={styles.birthdayMonthDay}
                onKeyDown={e => handleKeyDownFocus(e)}
                onFocus={e => {
                  e.target.select()
                }}
              />
              <TextField
                label="日"
                name="day"
                inputRef={dayRef}
                value={birthdayObj.day}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                css={styles.birthdayMonthDay}
                onKeyDown={e => handleKeyDownFocus(e)}
                onFocus={e => {
                  e.target.select()
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="電話"
                onChange={handleFieldChange}
                name="cellphone"
                inputRef={cellphoneRef}
                value={values.cellphone}
                variant="outlined"
                onKeyDown={e => handleKeyDownFocus(e)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="地址"
                onChange={handleFieldChange}
                name="address"
                inputRef={addressRef}
                value={values.address}
                variant="outlined"
                onKeyDown={e => handleKeyDownFocus(e)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <SourceSelect
                emptyOption
                value={values.source}
                onChange={handleFieldChange}
                ref={sourceRef}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel}>最近設計師</InputLabel>
                <Select
                  label='最近設計師'
                  value={values.DesignerId || ''}
                  onChange={handleFieldChange}
                  name="DesignerId"
                  disabled
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
              </FormControl>
            </Grid>
            <Grid item md={6} xs={12}>
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
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="備註"
                onChange={handleFieldChange}
                name="remark"
                value={values.remark}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={vaild}>
            儲存
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  )
}

CustomerEditModal.propTypes = {
  className: PropTypes.object,
  customer: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

CustomerEditModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default CustomerEditModal
