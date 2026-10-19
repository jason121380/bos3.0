/** @jsxImportSource @emotion/react */
// 表單欄位（TextField / Select / 來源下拉）保留 MUI；性別 ToggleButton 改 ui/toggle-group（合成 event.target.value 傳遞不變）；卡片外框與按鈕為 src/ui
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
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
        <TextField
          label="姓名"
          value={customer.name}
          variant="outlined"
          fullWidth
          onChange={event => onChange({ event, key: 'name' })}
          css={styles.formGroup}
        />
        <TextField
          label="暱稱"
          value={customer.nickName}
          variant="outlined"
          onChange={event => onChange({ event, key: 'nickName' })}
          fullWidth
          css={styles.formGroup}
        />
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
        <TextField
          label="Email"
          value={customer.email}
          onChange={event => onChange({ event, key: 'email' })}
          variant="outlined"
          fullWidth
          css={styles.formGroup}
        />
        <TextField
          label="聯絡地址"
          value={customer.address}
          onChange={event => onChange({ event, key: 'address' })}
          variant="outlined"
          fullWidth
          css={styles.formGroup}
        />
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
        <TextField
          label="LINE ID"
          value={customer.lineId}
          onChange={event => onChange({ event, key: 'lineId' })}
          variant="outlined"
          fullWidth
          css={styles.formGroup}
        />
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
        <TextField
          label="備註"
          value={customer.remark}
          onChange={event => onChange({ event, key: 'remark' })}
          variant="outlined"
          fullWidth
          css={styles.formGroup}
        />
      </CardContent>
    </Card>
  )
}

AboutProject.propTypes = {
  className: PropTypes.object,
}

export default AboutProject
