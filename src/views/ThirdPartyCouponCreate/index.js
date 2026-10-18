import Page from 'components/Page'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateThirdPartyCoupon from 'hooks/useFetchCreateThirdPartTicket'
import useFetchThirdPartyCoupons from 'hooks/useFetchThirdPartTicket'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'

import AboutThirdPartyCoupon from './AboutThirdPartyCoupon'

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
    <Page className="ui-root" title="新增第三方卡券">
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader title="新增第三方卡券" />
        <AboutThirdPartyCoupon
          thirdPartyCoupon={thirdPartyCoupon}
          onChange={handleOnchange}
        />
        <div className="mt-6 flex justify-end">
          <Button variant="primary" disabled={vaild} onClick={handleSubmit}>
            新增
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default ServiceCategoryCreate
