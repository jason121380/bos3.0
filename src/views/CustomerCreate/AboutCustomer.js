// 純文字欄（姓名／暱稱／Email／地址／LINE ID／備註）改 Field 上方標籤＋ui Input（TextField 試點）；代號（重複檢查 error／endAdornment）、手機 tel、民國年生日、Select／來源下拉使用正式 ui 元件；性別 ToggleButton 為 ui/toggle-group（合成 event.target.value 傳遞不變）
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { TextField, InputAdornment } from 'ui/text-field'
import { LoaderCircle } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Field, Input } from 'ui/input'
import { CheckRounded as CheckRoundedIcon, WarningAmberRounded as WarningAmberRoundedIcon } from 'ui/icons'
import useFetchMerchantDesigners from 'hooks/useFetchMerchantDesigners'
import idx from 'idx'
import PropTypes from 'prop-types'
import React from 'react'
import useFetchGetCheckIsCustomerNoUsed from 'hooks/useFetchGetCheckIsCustomerNoUsed'
import SourceSelect from 'components/SourceSelect'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

function AboutProject({
  className,
  customer,
  onChange,
  birthdayObj,
  handleOnClick,
  handleBirthdayChange,
  lastNo,
  isLoading,
  submitting,
  ...rest
}) {
  const designers = useFetchMerchantDesigners()

  const vaild = !customer.cellphone

  const [noVerify, setNoVerify] = React.useState(false)
  const [isSetTime, setIsSetTime] = React.useState(false) // 是否在setTimeout時間差之內的判斷
  const [checkIsCustomerNoUsedLazy, checkIsCustomerNoUsedLazyData] = useFetchGetCheckIsCustomerNoUsed()

  const checkNo = () => {
    checkIsCustomerNoUsedLazy({
      variables: {
        input: customer.no,
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
    if (customer.no !== "") {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（checkNo）；只在 [customer.no] 變動時呼叫，補上會每次 render 重跑
  }, [customer.no])

  return (
    <Card {...rest} className={className}>
      <CardHeader
        className="flex-wrap items-center"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {!isLoading && <span className="text-body tabular-nums text-text-secondary">{`最新顧客編號: ${lastNo}`}</span>}
            {/* 與下方新增鈕共用送出中停用，連按不重複建立（Jason 2026/10/22 fix all） */}
            <Button variant="secondary" onClick={handleOnClick} disabled={vaild || submitting}>
              新增
            </Button>
          </div>
        }
      >
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent>
        <TextField
          error={noVerify && !isSetTime}
          helperText={noVerify && !isSetTime ? '客戶編號重複' : ''}
          label="代號"
          value={customer.no}
          variant="outlined"
          fullWidth
          onChange={event => onChange({ event, key: 'no' })}
          className="w-full !mb-[24px]"
          InputProps={{
            endAdornment: (
              (customer.no === '') ? '' :
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
        <Field label="姓名" className="mb-6">
          <Input
            value={customer.name}
            onChange={event => onChange({ event, key: 'name' })}
          />
        </Field>
        <Field label="暱稱" className="mb-6">
          <Input
            value={customer.nickName}
            onChange={event => onChange({ event, key: 'nickName' })}
          />
        </Field>
        <TextField
          label="手機"
          type="tel"
          variant="outlined"
          fullWidth
          value={customer.cellphone}
          onChange={event => onChange({ event, key: 'cellphone' })}
          className="w-full !mb-[24px]"
        />
        <div className="w-full !mb-[24px]">
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
        <Field label="Email" className="mb-6">
          <Input
            value={customer.email}
            onChange={event => onChange({ event, key: 'email' })}
          />
        </Field>
        <Field label="聯絡地址" className="mb-6">
          <Input
            value={customer.address}
            onChange={event => onChange({ event, key: 'address' })}
          />
        </Field>
        <ToggleGroup
          size="medium"
          value={customer.gender}
          // 再按已選的選項會回傳 null：忽略，維持原選擇（比照成為會員頁；Jason 2026/10/22 fix all）
          onChange={(event, newAlignment) =>
            newAlignment !== null &&
            onChange({
              event: {
                target: {
                  value: newAlignment,
                },
              },
              key: 'gender',
            })
          }
          exclusive
          className="w-full !mb-[24px]"
        >
          <ToggleGroupItem key="MALE" value="MALE">
            男
          </ToggleGroupItem>
          <ToggleGroupItem key="FEMALE" value="FEMALE">
            女
          </ToggleGroupItem>
        </ToggleGroup>
        <Field label="LINE ID" className="mb-6">
          <Input
            value={customer.lineId}
            onChange={event => onChange({ event, key: 'lineId' })}
          />
        </Field>
        <FormControl variant="outlined" className="w-full !mb-[24px]">
          <InputLabel>設計師</InputLabel>
          <Select
            label='設計師'
            value={customer.DesignerId}
            onChange={event => onChange({ event, key: 'PreferDesignerId' })}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {idx(designers.data, _ =>
              _.merchantDesigners.map((data, index) => (
                <MenuItem value={data.id} key={`designer-${index}`}>
                  {data.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <SourceSelect
          emptyOption
          className="w-full !mb-[24px]"
          value={customer.source}
          onChange={event => onChange({ event, key: 'source' })}
        />
        <Field label="備註" className="mb-6">
          <Input
            value={customer.remark}
            onChange={event => onChange({ event, key: 'remark' })}
          />
        </Field>
      </CardContent>
    </Card>
  )
}

AboutProject.propTypes = {
  className: PropTypes.string,
}

export default AboutProject
