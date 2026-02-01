/** @jsxImportSource @emotion/react */
import { Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { memo, useState } from 'react'
import _ from 'lodash'
import { useFetchDeductionSettings } from 'hooks/useFetchGetDeductionSettings'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import { useFetchGetMerchantPointValueSettingsForSelect } from 'hooks/useFetchGetMerchantPointValueSettings'

import AboutDesignerSalary from './AboutDesignerSalary'
import Service from '../PerformanceDeductionParameter/Service'
import Deduction from '../PerformanceDeductionParameter/Deduction'
import HelperPoint from './HelperPoint'
import styles from './styles/Parameter'

function Parameter() {
  const deduction = useFetchDeductionSettings()
  const merchantCommissionWay = useFetchMerchantCommissionWay()
  const merchantPointValueSettingsForSelect = useFetchGetMerchantPointValueSettingsForSelect()
  const [isSubmitForCommission, setIsSubmitForCommission] = useState(false)
  const [isSubmitForPoint, setIsSubmitForPoint] = useState(false)
  const [isSubmitForType, setIsSubmitForType] = useState(false)
  return (
    <Page css={styles.page} title="業績抽成參數設定">
      <Container maxWidth={false}>
        <PageTitle title='業績抽成參數設定' subTitle='Performance Deduction Parameter' />
        <Service
          className={styles.card}
          merchantCommissionWay={merchantCommissionWay}
          setIsSubmitForCommission={setIsSubmitForCommission}
          setIsSubmitForPoint={setIsSubmitForPoint}
          setIsSubmitForType={setIsSubmitForType}
          isSubmitForType={isSubmitForType}
          isSubmitForPoint={isSubmitForPoint}
          isSubmitForCommission={isSubmitForCommission}
        />
        <AboutDesignerSalary
          className={styles.card}
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
          className={styles.card}
          deduction={deduction}
        />
        <HelperPoint 
          className={styles.card}
          merchantPointValueSettings={merchantPointValueSettingsForSelect}
        />
      </Container>
    </Page>
  )
}
export default memo(Parameter)
