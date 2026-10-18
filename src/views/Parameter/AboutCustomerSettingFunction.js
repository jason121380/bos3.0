/** @jsxImportSource @emotion/react */
// 「完全新客必填欄位」為多選 Autocomplete（含勾選圖示的選項），保留 MUI
import {
  TextField, Checkbox, Autocomplete
} from '@mui/material'
import { CheckboxField } from 'ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import _ from 'lodash'
import produce from 'immer'
import styles from './styles/AboutCustomerSettingFunction'

const optionArr = [
  { label: "同步顧客個人資料", key: 'isCustomerProfileSync' },
  { label: "一律顯示返回按鈕", key: 'isArrowDisplayForLine' },
  { label: "顯示完全新客非必填欄位", key: 'isNRCDisplayForNewCus' }
]

function AboutCustomerSettingFunction({
  className, inputEnable, aboutCustomer, setAboutCustomer, requiredColumnOptions,
}) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />

  const handleSetValue = (key, value) => {
    setAboutCustomer(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>顧客端功能設定</CardTitle>
      </CardHeader>
      <CardContent>
        {optionArr.map(({ label, key }) => (
          <div key={label}>
            <CheckboxField
              disabled={!inputEnable}
              css={styles.isUsing}
              label={label}
              checked={aboutCustomer[key]}
              onChange={(e, v) => handleSetValue(key, v)}
            />
          </div>
        ))}
        <div style={{ width: '100%', padding: '8px 20px 24px 20px' }}>
          <Autocomplete
            multiple
            options={requiredColumnOptions}
            disableCloseOnSelect
            disabled={!inputEnable}
            getOptionLabel={option => option.label}
            value={aboutCustomer.requiredColumnForNewCustomer}
            onChange={(e, v) => handleSetValue('requiredColumnForNewCustomer', v)}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  style={{ color: 'rgb(var(--text))', marginRight: 8 }}
                  icon={icon}
                  checkedIcon={checkedIcon}
                  checked={selected}
                />
                {option.label}
              </li>
            )}
            renderInput={params => (
              <TextField {...params} variant="outlined" label="完全新客必填欄位" placeholder="欄位名稱" />
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutCustomerSettingFunction)