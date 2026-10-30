import Page from 'components/Page'
import { PageHeader } from 'ui/page-header'
import { Tabs } from 'ui/tabs'
import { SettingsTabsList, SettingsTabsTrigger, SettingsSectionHeading } from 'ui/settings-nav'
import { CircleDollarSign, Percent, SlidersHorizontal, Users } from 'lucide-react'
import { memo, useState } from 'react'
import { useFetchDeductionSettings } from 'hooks/useFetchGetDeductionSettings'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import { useFetchGetMerchantPointValueSettingsForSelect } from 'hooks/useFetchGetMerchantPointValueSettings'

import AboutDesignerSalary from './AboutDesignerSalary'
import Service from '../PerformanceDeductionParameter/Service'
import Deduction from '../PerformanceDeductionParameter/Deduction'
import HelperPoint from './HelperPoint'
import QueryFailed from 'components/QueryFailed'

function Parameter() {
  const deduction = useFetchDeductionSettings()
  const merchantCommissionWay = useFetchMerchantCommissionWay()
  const merchantPointValueSettingsForSelect = useFetchGetMerchantPointValueSettingsForSelect()
  const [isSubmitForCommission, setIsSubmitForCommission] = useState(false)
  const [isSubmitForPoint, setIsSubmitForPoint] = useState(false)
  const [isSubmitForType, setIsSubmitForType] = useState(false)
  // 設定頁樣板（STYLE §12）：本頁原無分頁、四區直疊；新增的 selectTab 只管呈現。
  // 各區改以 hidden 保留掛載（不卸載），避免切換分頁時各區 local state（編輯中的欄位）被重置；
  // 子元件 props、編輯/儲存 handler 與存值一字未動，初始掛載與 fetch 時序與原直疊版相同。
  const [selectTab, setSelectTab] = useState('commissionWay')
  const handleTabsChange = (event, value) => setSelectTab(value)
  const tabs = [
    { value: 'commissionWay', label: '服務扣項方式命名', icon: SlidersHorizontal },
    { value: 'personnel', label: '人員身分類別', icon: Users },
    { value: 'deduction', label: '抽成方式設定', icon: Percent },
    { value: 'helperPoint', label: '互助點數設定', icon: CircleDollarSign },
  ]
  return (
    <Page className="ui-root" title="業績抽成參數設定">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="業績抽成參數設定" />
        {[deduction, merchantCommissionWay, merchantPointValueSettingsForSelect].some(query => query.error) && (
          <QueryFailed
            onRetry={() =>
              [deduction, merchantCommissionWay, merchantPointValueSettingsForSelect].filter(query => query.error).forEach(query => query.refetch())
            }
          />
        )}
        <Tabs className="md:flex md:items-stretch" value={selectTab} onValueChange={value => handleTabsChange(null, value)} activationMode="manual">
          <SettingsTabsList>
            {tabs.map((tab, index) => (
              <SettingsTabsTrigger key={index} value={tab.value} icon={tab.icon}>
                {tab.label}
              </SettingsTabsTrigger>
            ))}
          </SettingsTabsList>
          <div className="min-w-0 flex-1 md:bg-background md:px-6 md:py-6">
            <SettingsSectionHeading title={tabs.find(tab => tab.value === selectTab)?.label} />
            <div className={selectTab === 'commissionWay' ? 'flex flex-col gap-6' : 'hidden'}>
              <Service
                merchantCommissionWay={merchantCommissionWay}
                setIsSubmitForCommission={setIsSubmitForCommission}
                setIsSubmitForPoint={setIsSubmitForPoint}
                setIsSubmitForType={setIsSubmitForType}
                isSubmitForType={isSubmitForType}
                isSubmitForPoint={isSubmitForPoint}
                isSubmitForCommission={isSubmitForCommission}
              />
            </div>
            <div className={selectTab === 'personnel' ? 'flex flex-col gap-6' : 'hidden'}>
              <AboutDesignerSalary
                deduction={deduction}
                merchantCommissionWay={merchantCommissionWay}
                merchantPointValueSettingsForSelect={merchantPointValueSettingsForSelect}
                setIsSubmitForCommission={setIsSubmitForCommission}
                setIsSubmitForPoint={setIsSubmitForPoint}
                setIsSubmitForType={setIsSubmitForType}
                isSubmitForType={isSubmitForType}
                isSubmitForPoint={isSubmitForPoint}
                isSubmitForCommission={isSubmitForCommission}
              />
            </div>
            <div className={selectTab === 'deduction' ? 'flex flex-col gap-6' : 'hidden'}>
              <Deduction deduction={deduction} />
            </div>
            <div className={selectTab === 'helperPoint' ? 'flex flex-col gap-6' : 'hidden'}>
              <HelperPoint merchantPointValueSettings={merchantPointValueSettingsForSelect} />
            </div>
          </div>
        </Tabs>
      </div>
    </Page>
  )
}
export default memo(Parameter)
