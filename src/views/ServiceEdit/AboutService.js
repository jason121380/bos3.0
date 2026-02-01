/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import { useFetchTHirdPartys } from 'hooks/useFetchMerchant'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  alert: css({
    marginBottom: theme.spacing(3),
  }),
  formGroup: css({
    marginBottom: theme.spacing(3) + '!important',
  }),
}

const lockStatus = [
  {
    value: 'TRUE',
    label: '不可更改',
  },
  {
    value: 'FALSE',
    label: '可更改',
  },
  {
    value: 'UNSET',
    label: '依系統參數設定',
  },
]

const TicketlockStatus = [
  {
    value: 'TRUE',
    label: '鎖定',
  },
  {
    value: 'FALSE',
    label: '不鎖定',
  },
  {
    value: 'UNSET',
    label: '依系統參數設定',
  },
]

function AboutService({ className, onChange, service, handleCheckboxChange, ...rest }) {
  const inputLabel = useRef()
  const [thirdParty, setThirdParty] = useState([])
  const serviceCategories = useFetchServiceCategories()
  const getThirdPartys = useFetchTHirdPartys()

  useEffect(() => {
    if (!getThirdPartys.loading) {
      const data = idx(getThirdPartys, _ => _.data.merchant.thirdpartyCoupons)
      setThirdParty(data)
    }
  }, [getThirdPartys.loading])

  return (
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="一般資訊" />
      <CardContent>
        <TextField
          value={service.no}
          label="代號"
          variant="outlined"
          fullWidth
          css={styles.formGroup}
          onChange={event => onChange({ event, key: 'no' })}
        />
        <TextField
          value={service.name}
          label="名稱"
          variant="outlined"
          fullWidth
          css={styles.formGroup}
          onChange={event => onChange({ event, key: 'name' })}
        />
        <FormControl variant="outlined" fullWidth css={styles.formGroup}>
          <InputLabel ref={inputLabel}>服務類別</InputLabel>
          <Select
            label='服務類別'
            value={service.ServiceCategoryId}
            onChange={event => onChange({ event, key: 'ServiceCategoryId' })}
          >
            <MenuItem value="" disabled>
              <em>選擇服務類別</em>
            </MenuItem>
            {idx(serviceCategories, _ =>
              _.data.serviceCategories.map((data, idx) => (
                <MenuItem value={data.id} key={`service-category-${idx}`}>
                  {data.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <TextField
          type="number"
          label="價格"
          variant="outlined"
          fullWidth
          onChange={event =>
            onChange({
              event: {
                target: {
                  value: idx(event, _ => parseInt(_.target.value)),
                },
              },
              key: 'price',
            })
          }
          value={service.price}
          css={styles.formGroup}
          onWheel={() => document.activeElement.blur()}
        />
        <FormControl variant="outlined" fullWidth css={styles.formGroup}>
          <InputLabel ref={inputLabel}>打帳單是否能更改預設價格</InputLabel>
          <Select
            label='打帳單是否能更改預設價格'
            value={service.isLocked}
            onChange={event => onChange({ event, key: 'isLocked' })}
          >
            {lockStatus.map((data, idx) => (
              <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* <FormControl variant="outlined" fullWidth css={styles.formGroup}>
          <FormControlLabel
            // css={styles.isUsing}
            control={<Checkbox color="primary" />}
            label="實收金額固定為0"
            checked={service.isNoCash}
            onChange={() => handleCheckboxChange({ value: !service.isNoCash, key: 'isNoCash' })}
          />
        </FormControl> */}
        <FormControl variant="outlined" fullWidth css={styles.formGroup}>
          <div style={{ display: 'flex' }}>
            <FormControlLabel
              // css={styles.isUsing}
              control={<Checkbox color="primary" />}
              label="特殊抽成"
              checked={service.isSpecialRakeUsing}
              onChange={() => {
                handleCheckboxChange({
                  value: !service.isSpecialRakeUsing,
                  key: 'isSpecialRakeUsing',
                })
                onChange({
                  event: {
                    target: {
                      value: 0,
                    },
                  },
                  key: 'specialRake',
                })
              }}
            />
            {service.isSpecialRakeUsing && (
              <TextField
                style={{ width: '70px' }}
                type="number"
                variant="outlined"
                label="%數"
                value={service.specialRake}
                onChange={event =>
                  onChange({
                    event: {
                      target: {
                        value: idx(event, _ => parseFloat(_.target.value)),
                      },
                    },
                    key: 'specialRake',
                  })
                }
                onWheel={() => document.activeElement.blur()}
              />
            )}
          </div>
        </FormControl>
        <FormControl variant="outlined" fullWidth css={styles.formGroup}>
          <InputLabel >綁定第三方卡券</InputLabel>
          <Select
            label='綁定第三方卡券'
            value={service.bindedThirdPartTicketId}
            onChange={event => onChange({ event, key: 'bindedThirdPartTicketId' })}
          >
            <MenuItem value='none'>無</MenuItem>
            {thirdParty.map((data, idx) => (
              <MenuItem value={data.id} key={`${data.name}-${idx}`}>
                {data.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" fullWidth css={styles.formGroup}>
          <InputLabel >是否鎖定第三方卡券</InputLabel>
          <Select
            label='是否鎖定第三方卡券'
            value={service.isBindedThirdPartTicketLocked}
            onChange={event => onChange({ event, key: 'isBindedThirdPartTicketLocked' })}
          >
            {TicketlockStatus.map((data, idx) => (
              <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

AboutService.propTypes = {
  className: PropTypes.object,
}

export default AboutService
