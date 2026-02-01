/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchThirdPartyCoupons from 'hooks/useFetchThirdPartTicket'
import useFetchUpdateThirdPartyCoupon from 'hooks/useFetchUpdateThirdPartTicket'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutThirdPartyCoupon from './AboutThirdPartyCoupon'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  aboutPayment: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
  }),
}

function ServiceCategoryEdit(props) {
  const { updateThirdPartyCoupon } = useFetchUpdateThirdPartyCoupon()
  const thirdPartyCouponsData = useFetchThirdPartyCoupons()

  const history = useHistory()
  const [thirdPartyCoupon, setThirdPartyCoupon] = React.useState({
    name: '',
    type: '',
    handlingFee: 0,
    isNoCash: false,
  })
  const [thirdPartyCouponDetail, setThirdPartyCouponDetail] = React.useState(null)

  React.useEffect(() => {
    if (!thirdPartyCouponsData.loading) {
      const thirdPartyCouponDetail = idx(thirdPartyCouponsData, _ =>
        _.data.getThirdPartTicket.filter(data => data.id === props.match.params.id)
      )
      setThirdPartyCouponDetail(thirdPartyCouponDetail[0])
    }
  }, [thirdPartyCouponsData.loading])

  React.useEffect(() => {
    if (thirdPartyCouponDetail !== null) {
      setThirdPartyCoupon(
        produce(draft => {
          draft.type = thirdPartyCouponDetail.type
          draft.name = thirdPartyCouponDetail.name
          draft.handlingFee = thirdPartyCouponDetail.handlingFee
          draft.isNoCash = thirdPartyCouponDetail.isNoCash
        })
      )
    }
  }, [thirdPartyCouponDetail])

  const handleOnchange = ({ event, key }) => {
    if (event.persist) event.persist()
    setThirdPartyCoupon(
      produce(draft => {
        draft[key] = idx(event, _ => _.target.value)
      })
    )
  }

  const handleSubmit = () => {
    updateThirdPartyCoupon({
      id: props.match.params.id,
      input: thirdPartyCoupon,
    }).then(() => {
      thirdPartyCouponsData.refetch()
      history.push('/third-party-coupons')
      openSnackbar({ message: '更新第三方卡券成功', variant: 'success' })
    })
  }
  const vaild = !(
    thirdPartyCoupon.type &&
    thirdPartyCoupon.name &&
    thirdPartyCoupon.handlingFee >= 0
  )

  return (
    <Page css={styles.root} title="編輯第三方卡券">
      <Container maxWidth="lg">
        <PageTitle title='編輯第三方卡券' subTitle='Edit Third Party Coupon' />
        <AboutThirdPartyCoupon
          className={styles.aboutPayment}
          thirdPartyCoupon={thirdPartyCoupon}
          onChange={handleOnchange}
        />
        <div css={styles.actions}>
          <Button color="primary" variant="contained" disabled={vaild} onClick={handleSubmit}>
            儲存
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default ServiceCategoryEdit
