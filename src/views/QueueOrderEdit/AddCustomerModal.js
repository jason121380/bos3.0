import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from 'ui/dialog'
import { Button } from 'ui/button'
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
import cloneDeep from 'lodash/cloneDeep'
import SourceSelect from 'components/SourceSelect'
import { GENDER_OPTIONS, makeFieldChange, makeBirthdayChange } from 'views/OrderShared/customerFormInput'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'


function AddCustomerModal({ open, onClose, customer, setCustomer, setBill, onCustomerUpdated }) {
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
      // 顧客沒有性別資料（null）時以「未知」顯示與送出；原本變成空字串，選單看起來是「未知」但送出 ''（coverage wave 1，2026/10/22）
      gender: customer.gender || 'UNKNOWN',
    })
  }, [customer])

  useEffect(() => {
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
      updateCustomer({ input: { ...values, birthday: birthdayObj } })
        .then(() => {
          openSnackbar({ variant: 'success', message: '成功更新顧客資訊' })
          setBill(
            produce(draft => {
              draft.customerId = values.customerId
              draft.customerCellphone = ''
            })
          )
          // 更新成功才重新查詢顧客資料；按下儲存時不再先清掉帳單的顧客（更新失敗時顧客要保留）
          onCustomerUpdated()
          onClose()
        })
        .catch(error => {
          // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
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
            // 新增的顧客帶進帳單（原本只關閉彈窗，帳單仍沒有顧客；比照顧客欄先輸入手機再新增的流程，coverage wave 1，2026/10/22）
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
            // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（checkNo）；只在 [values.no] 變動時呼叫，補上會每次 render 重跑
  }, [values.no])

  useEffect(() => {
    if (!lastCustomerNo.loading) {
      const data = idx(lastCustomerNo, _ => _.data.getLastCustomerNo)
      setLastNo(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
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
            </div>
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
            </div>
            <div className="min-w-0">
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
                // 載入中用 renderValue 顯示轉圈，使用 ui/form-control Select
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
                      <em>載入中…</em>
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
  className: PropTypes.string,
  customer: PropTypes.any,
  onClose: PropTypes.func,
  onCustomerUpdated: PropTypes.func.isRequired,
  open: PropTypes.bool,
}

AddCustomerModal.defaultProps = {
  open: false,
}

export default AddCustomerModal
