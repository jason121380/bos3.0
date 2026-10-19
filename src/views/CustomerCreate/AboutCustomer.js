/** @jsxImportSource @emotion/react */
// 純文字欄（姓名／暱稱／Email／地址／LINE ID／備註）改 Field 上方標籤＋ui Input（TextField 試點）；代號（重複檢查 error／endAdornment）、手機 tel、民國年生日、Select／來源下拉保留 MUI；性別 ToggleButton 為 ui/toggle-group（合成 event.target.value 傳遞不變）
import { TextField, InputAdornment } from 'ui/text-field'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

const styles = {
  formGroup: css({
    width: '100%',
    marginBottom: theme.spacing(3) + '!important',
  }),
  birthdayMonthDay: css({
    width: '80px',
    marginLeft: '10px !important',
  }),
  birthdayInput: css({
    width: '80px',
  }),
  actions: css({
    display: 'flex',
    gap: 10,
    flexWRap: 'wrap',
    alignItems: 'center',
    margin: theme.spacing(3),
  }),
}

function AboutProject({
  className,
  customer,
  onChange,
  birthdayObj,
  handleOnClick,
  handleBirthdayChange,
  lastNo,
  isLoading,
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
  }, [customer.no])

  return (
    <Card {...rest} css={className}>
      <CardHeader
        className="flex-wrap items-center"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {!isLoading && <span className="text-body tabular-nums text-text-secondary">{`最新顧客編號: ${lastNo}`}</span>}
            <Button variant="secondary" onClick={handleOnClick} disabled={vaild}>
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
          css={styles.formGroup}
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
          css={styles.formGroup}
        />
        <div css={styles.formGroup}>
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
          onChange={(event, newAlignment) =>
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
          css={styles.formGroup}
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
        <FormControl variant="outlined" css={styles.formGroup}>
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
          className={styles.formGroup}
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
  className: PropTypes.object,
}

export default AboutProject
