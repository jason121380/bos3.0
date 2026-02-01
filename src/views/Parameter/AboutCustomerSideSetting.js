/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Divider, CardActions,
  Checkbox, FormControlLabel
} from '@mui/material'
import { memo } from 'react'
import produce from 'immer'
import styles from './styles/AboutCustomerSideSetting'

const pages = [
  {
    label: '服務紀錄',
    key: 'ServiceRecord',
  },
  {
    label: '我的卡券',
    key: 'TicketRecord',
  },
  {
    label: '入金紀錄',
    key: 'WalletRecord',
  },
  {
    label: '紅利點數紀錄',
    key: 'BonusRecord',
  },
  {
    label: '名留商城',
    key: 'CustomerMall',
  },
]

function AboutCustomerSideSetting({
  className, aboutCustomer, setAboutCustomer, inputEnable,
}) {
  const handleSetValue = (key, value) => {
    setAboutCustomer(
      produce(draft => {
        draft.customerSidePageDisplay[key] = value
      })
    )
  }
  return (
    <Card css={className}>
      <CardHeader title="頁面顯示設定" />
      <Divider />
      <CardContent>
        <div css={styles.serviceInputGroup}>
          <CardActions style={{ flexWrap: 'wrap', gap: '0px 20px' }}>
            {pages.map(d => (
              <FormControlLabel
                style={{ margin: 0 }}
                control={<Checkbox color="primary" />}
                label={d.label}
                checked={aboutCustomer.customerSidePageDisplay[d.key]}
                key={`${d.label}`}
                disabled={!inputEnable}
                onChange={(e, v) => handleSetValue(d.key, v)}
              />
            ))}
          </CardActions>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutCustomerSideSetting)
