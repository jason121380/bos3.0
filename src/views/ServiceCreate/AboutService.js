// 純文字欄（代號／名稱）改 Field 上方標籤＋ui Input（TextField 試點）；Select 與金額／%數欄位保留 MUI
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import { useFetchTHirdPartys } from 'hooks/useFetchMerchant'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'

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
    <Card {...rest}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Field label="代號">
          <Input
            value={service.no}
            onChange={event => onChange({ event, key: 'no' })}
          />
        </Field>
        <Field label="名稱">
          <Input
            value={service.name}
            onChange={event => onChange({ event, key: 'name' })}
          />
        </Field>
        <FormControl variant="outlined" fullWidth>
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
          onWheel={() => document.activeElement.blur()}
        />
        <FormControl variant="outlined" fullWidth>
          <InputLabel >打帳單是否能更改預設價格</InputLabel>
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
        {/* <FormControl variant="outlined" fullWidth>
          <FormControlLabel
            // css={styles.isUsing}
            control={<Checkbox color="primary" />}
            label="實收金額固定為0"
            checked={service.isNoCash}
            onChange={() => handleCheckboxChange({ value: !service.isNoCash, key: 'isNoCash' })}
          />
        </FormControl> */}
        <FormControl variant="outlined" fullWidth>
          <div className="flex items-center gap-3">
            <FormControlLabel
              // css={styles.isUsing}
              control={<Checkbox color="primary" />}
              label="特殊抽成"
              checked={service.isSpecialRakeUsing}
              onChange={() =>
                handleCheckboxChange({
                  value: !service.isSpecialRakeUsing,
                  key: 'isSpecialRakeUsing',
                })
              }
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
        <FormControl variant="outlined" fullWidth>
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
        <FormControl variant="outlined" fullWidth>
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
