import Page from 'components/Page'
import { PageHeader } from 'ui/page-header'
import { memo, useState } from 'react'
import _ from 'lodash'
import { useFetchDeductionSettings } from 'hooks/useFetchGetDeductionSettings'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import { useFetchGetMerchantPointValueSettingsForSelect } from 'hooks/useFetchGetMerchantPointValueSettings'

import AboutDesignerSalary from './AboutDesignerSalary'
import Service from '../PerformanceDeductionParameter/Service'
import Deduction from '../PerformanceDeductionParameter/Deduction'
import HelperPoint from './HelperPoint'

function Parameter() {
  const deduction = useFetchDeductionSettings()
  const merchantCommissionWay = useFetchMerchantCommissionWay()
  const merchantPointValueSettingsForSelect = useFetchGetMerchantPointValueSettingsForSelect()
  const [isSubmitForCommission, setIsSubmitForCommission] = useState(false)
  const [isSubmitForPoint, setIsSubmitForPoint] = useState(false)
  const [isSubmitForType, setIsSubmitForType] = useState(false)
  return (
    <Page className="ui-root" title="業績抽成參數設定">
      <PageHeader title="業績抽成參數設定" />
      <div className="flex flex-col gap-6">
        <Service
          merchantCommissionWay={merchantCommissionWay}
          setIsSubmitForCommission={setIsSubmitForCommission}
          setIsSubmitForPoint={setIsSubmitForPoint}
          setIsSubmitForType={setIsSubmitForType}
          isSubmitForType={isSubmitForType}
          isSubmitForPoint={isSubmitForPoint}
          isSubmitForCommission={isSubmitForCommission}
        />
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
        <Deduction
          deduction={deduction}
        />
        <HelperPoint 
          merchantPointValueSettings={merchantPointValueSettingsForSelect}
        />
      </div>
    </Page>
  )
}
export default memo(Parameter)
