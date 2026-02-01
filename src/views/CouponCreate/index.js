/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateCoupon from 'hooks/useFetchCreateCoupon'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchMerchantCustomerCategory from 'hooks/useFetchMerchantCustomerCategory'
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutAssistantSetting from './AboutAssistantSetting'
import AboutCoupon from './AboutCoupon'
import AboutDeduction from './AboutDeduction'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  about: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
  }),
}

function ServiceCategoryCreate() {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  const merchantCommissions = useFetchMerchantCommissionWay()
  const customerCategory = useFetchMerchantCustomerCategory()
  const merchantHelperItemsData = useFetchMerchantHelperItems({ merchantId })
  const merchantHelperItems = idx(merchantHelperItemsData, _ => _.data.merchantHelperItems)
  const { createCoupon } = useFetchCreateCoupon()
  const history = useHistory()

  React.useEffect(() => {
    if (!merchantCommissions.loading && !customerCategory.loading) {
      setCoupon(
        produce(draft => {
          draft.ServiceDeductionItems = idx(merchantCommissions.data, _ =>
            _.merchantCommissionWay.map(data => ({
              type: data.name,
              itemSettings: [
                {
                  isSpecial: false,
                  name: '材料費',
                  type: 'onSales',
                  deductionWay: '',
                  price: 0,
                  designatePrice: 0,
                  nonDesignatePrice: 0,
                  deductionOrder: 1,
                  deductionReference: 0,
                },
              ],
            }))
          )
          draft.customerSellSetting = idx(customerCategory.data, _ =>
            _.merchantCustomerCategory.map(data => ({
              category: data.name,
              percent: 100,
              birthday: 100,
            }))
          )
        })
      )
    }
  }, [
    merchantCommissions.loading,
    merchantCommissions.data,
    customerCategory.data,
    customerCategory.loading,
  ])
  const [saveBtn, setSaveBtn] = React.useState(false)
  const [coupon, setCoupon] = React.useState({
    no: '',
    name: '',
    price: 0,
    isTicket: true,
    ticketAvailableCount: 1,
    isTicketCountNow: false,
    helperDeductionSetting: [
      {
        helperDeductionType: 'onSales',
        type: '',
        nameList: [],
        peopleCount: 0,
        point: 0,
        cash: 0,
        percent: 0,
        designateCash: 0,
        nonDesignateCash: 0,
        designatePercent: 0,
        nonDesignatePercent: 0,
        designatePoint: 0,
        nonDesignatePoint: 0,
        deductionWay: '',
        isSplitted: false,
      },
    ],
    ServiceDeductionItems: [],
    customerSellSetting: [],
    ServiceCategoryId: '',
    OfficialBrandMerchantId: merchantId,
    isLocked: 'UNSET',
    performanceCalculationMode: 'USING',
    handlingFeeDecountMode: 'USING',
    isLaunched: true
  })

  const handleOnChange = ({ event, key }) => {
    if (event.persist) event.persist()
    setCoupon(
      produce(draft => {
        draft[key] = idx(event, _ => _.target.value)
      })
    )
  }
  const vaild = !(coupon.name && coupon.ServiceCategoryId && coupon.ticketAvailableCount)
  const handleSubmit = () => {
    setSaveBtn(true)
    const newCoupon = _.cloneDeep(coupon)
    const newHelperDeductionSetting = newCoupon.helperDeductionSetting.map(
      ({ deductionWay, isDesignate, __typename, ...keepProteries }) => {
        return {
          ...keepProteries,
          point: parseFloat(keepProteries.point) || 0,
          cash: parseFloat(keepProteries.cash) || 0,
          percent: parseFloat(keepProteries.percent) || 0,
          designateCash: parseFloat(keepProteries.designateCash) || 0,
          nonDesignateCash: parseFloat(keepProteries.nonDesignateCash) || 0,
          designatePercent: parseFloat(keepProteries.designatePercent) || 0,
          nonDesignatePercent: parseFloat(keepProteries.nonDesignatePercent) || 0,
          designatePoint: parseFloat(keepProteries.designatePoint) || 0,
          nonDesignatePoint: parseFloat(keepProteries.nonDesignatePoint) || 0,
        }
      }
    )
    newCoupon.helperDeductionSetting = newHelperDeductionSetting

    createCoupon({ input: newCoupon }).then(() => {
      openSnackbar({ variant: 'success', message: '成功新增卡券' })
      history.push('/coupons')
    }).catch(error => {
      setSaveBtn(false)
      openSnackbar({ variant: 'error', message: error.message })
    })
  }

  return (
    <Page css={styles.root} title="新增卡券項目">
      <Container maxWidth="md">
        <PageTitle title='新增卡券項目' subTitle='New Coupon' />
        <AboutCoupon className={styles.about} coupon={coupon} onChange={handleOnChange} />

        <AboutDeduction
          className={styles.about}
          ServiceDeductionItems={coupon.ServiceDeductionItems}
          onChange={handleOnChange}
        />

        <AboutAssistantSetting
          className={styles.about}
          merchantHelperItems={merchantHelperItems}
          support={coupon.helperDeductionSetting}
          onChange={handleOnChange}
        />

        <div css={styles.actions}>
          <Button color="primary" variant="contained" disabled={vaild || saveBtn} onClick={handleSubmit}>
            新增卡券
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default ServiceCategoryCreate
