import { CheckboxField } from 'ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import produce from 'immer'

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

function AboutCustomerSideSetting({ className, aboutCustomer, setAboutCustomer, inputEnable }) {
  const handleSetValue = (key, value) => {
    setAboutCustomer(
      produce(draft => {
        draft.customerSidePageDisplay[key] = value
      })
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>頁面顯示設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="flex items-center p-2" style={{ flexWrap: 'wrap', gap: '0px 20px' }}>
            {pages.map(d => (
              <CheckboxField
                label={d.label}
                checked={aboutCustomer.customerSidePageDisplay[d.key]}
                key={`${d.label}`}
                disabled={!inputEnable}
                onChange={(e, v) => handleSetValue(d.key, v)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutCustomerSideSetting)
