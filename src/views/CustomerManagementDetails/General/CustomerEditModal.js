// 大型表單彈窗：外框（卡片、標題、底部動作）換成 ui/card、ui/button，欄位排版改 Tailwind grid（MUI md 900px 起兩欄）；
// 只換彈窗外殼，保留內部欄位、驗證與表單 refs。
import clsx from 'clsx'
import { Dialog, DialogContent } from 'ui/dialog'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
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
import StaffCombobox from 'components/StaffCombobox'
import { Button } from 'ui/button'
import { CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'

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

function CustomerEditModal({ open, onClose, customer, className, ...rest }) {
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
    // 顧客查詢回的是 preferDesigner { id }（原本讀不存在的 PreferDesignerId，永遠帶入空白、沒動就儲存會清掉；Jason 2026/10/22 fix all）
    PreferDesignerId: (customer.preferDesigner && customer.preferDesigner.id) || '',
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
        if (parseInt(e.target.value, 10) <= 12 || e.target.value === '') {
          setBirthdayObj({ ...birthdayObj, month: e.target.value })
        }
        break
      case 'day':
        if (parseInt(e.target.value, 10) <= 31 || e.target.value === '') {
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

  // 未開啟時不渲染；放在所有 hooks 之後（原本在兩個 useEffect 之前 return，違反 hooks 呼叫順序規則）
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      {/* 保留原 700px 寬度。 */}
      <DialogContent hideClose
          onOpenAutoFocus={event => {
            // 沿用舊 Modal：保留已有欄位焦點，否則聚焦面板，避免手機自動叫出鍵盤。
            event.preventDefault()
            if (!event.target.contains(document.activeElement)) event.target.focus()
          }} aria-describedby={undefined} aria-labelledby="customer-edit-modal-title" {...rest} className={clsx('!max-w-[700px] overflow-y-auto', className)}>
        <CardHeader className="pb-4">
          <CardTitle id="customer-edit-modal-title">編輯客戶資料</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-2">
            <div>
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
            </div>
            <div>
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
            </div>
            <div>
              <NativeSelect
                inputRef={genderRef}
                value={values.gender}
                name="gender"
                onChange={handleFieldChange}
                displayEmpty={false}
                placeholder="請選擇…"
                label="性別"
                labelRef={inputLabel}
              // onKeyDown={e => handleKeyDownFocus(e)}
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
            </div>
            <div>
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
            </div>
            <div>
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
            </div>
            <div>
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
            </div>
            <div className="flex">
              <TextField
                label="民國年"
                name="year"
                inputRef={yearRef}
                value={birthdayObj.year}
                onChange={e => handleBirthdayChange(e)}
                variant="outlined"
                className="w-[80px]"
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
                className="ml-[10px] w-[80px]"
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
                className="ml-[10px] w-[80px]"
                onKeyDown={e => handleKeyDownFocus(e)}
                onFocus={e => {
                  e.target.select()
                }}
              />
            </div>
            <div>
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
            </div>
            <div>
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
            </div>
            <div>
              <SourceSelect
                emptyOption
                value={values.source}
                onChange={handleFieldChange}
                ref={sourceRef}
              />
            </div>
            <div>
              <NativeSelect
                value={values.DesignerId || ''}
                onChange={handleFieldChange}
                name="DesignerId"
                disabled
                displayEmpty={false}
                placeholder="請選擇…"
                label="最近設計師"
                labelRef={inputLabel}
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
            </div>
            <div>
              {/* 員工清單可打字搜尋（Jason 2026/10/30 決定）；清除鈕＝原本的「None」 */}
              <StaffCombobox
                label="偏好設計師"
                name="PreferDesignerId"
                value={values.PreferDesignerId}
                users={idx(designers, _ => _.data.users.users)}
                loading={!designers.data}
                onChange={handleFieldChange}
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="備註"
                onChange={handleFieldChange}
                name="remark"
                value={values.remark}
                variant="outlined"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap">
          {/* 停用原因（STYLE.md §6）：依 vaild（客戶姓名、性別、電話必填；沒有目前店家時無法儲存） */}
          {vaild && (
            <p id="customer-edit-missing" role="status" className="mr-auto text-caption text-text-secondary">
              尚缺：{[!values.name && '客戶姓名', !values.gender && '性別', !values.cellphone && '電話', !values.OfficialBrandMerchantId && '目前店家（請重新選擇店家）'].filter(Boolean).join('、')}
            </p>
          )}
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={vaild} aria-describedby={vaild ? 'customer-edit-missing' : undefined}>
            儲存
          </Button>
        </CardFooter>
      </DialogContent>
    </Dialog>
  )
}

CustomerEditModal.propTypes = {
  className: PropTypes.string,
  customer: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

CustomerEditModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default CustomerEditModal
