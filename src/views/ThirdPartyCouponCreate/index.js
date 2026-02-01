/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateThirdPartyCoupon from 'hooks/useFetchCreateThirdPartTicket'
import useFetchThirdPartyCoupons from 'hooks/useFetchThirdPartTicket'
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

function ServiceCategoryCreate() {
  const { createThirdPartyCoupon } = useFetchCreateThirdPartyCoupon()
  const thirdPartyCoupons = useFetchThirdPartyCoupons()
  const history = useHistory()
  const [thirdPartyCoupon, setThirdPartyCoupon] = React.useState({
    name: '',
    type: '',
    handlingFee: 0,
    isNoCash: false,
  })
  const handleOnchange = ({ event, key }) => {
    if (event.persist) event.persist()
    setThirdPartyCoupon(
      produce(draft => {
        draft[key] = idx(event, _ => _.target.value)
      })
    )
  }
  const handleSubmit = () => {
    createThirdPartyCoupon({ input: thirdPartyCoupon }).then(() => {
      thirdPartyCoupons.refetch()
      history.push('/third-party-coupons')
      openSnackbar({ message: '新增第三方卡券成功', variant: 'success' })
    })
  }
  const vaild = !(
    thirdPartyCoupon.type &&
    thirdPartyCoupon.name &&
    thirdPartyCoupon.handlingFee >= 0
  )

  return (
    <Page css={styles.root} title="新增第三方卡券">
      <Container maxWidth="lg">
        <PageTitle title='新增第三方卡券' subTitle='New Third Party Coupon' />
        <AboutThirdPartyCoupon
          className={styles.aboutPayment}
          thirdPartyCoupon={thirdPartyCoupon}
          onChange={handleOnchange}
        />
        <div css={styles.actions}>
          <Button color="primary" variant="contained" disabled={vaild} onClick={handleSubmit}>
            新增
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default ServiceCategoryCreate
