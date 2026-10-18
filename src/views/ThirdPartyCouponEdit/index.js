import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchThirdPartyCoupons from 'hooks/useFetchThirdPartTicket'
import useFetchUpdateThirdPartyCoupon from 'hooks/useFetchUpdateThirdPartTicket'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutThirdPartyCoupon from './AboutThirdPartyCoupon'

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
    <Page className="ui-root" title="編輯第三方卡券">
      {/* 頁面外距由 #printContainer 提供；表單頁內容寬度 max-w-3xl */}
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <PageHeader className="pb-0" title='編輯第三方卡券' />
        <AboutThirdPartyCoupon
          thirdPartyCoupon={thirdPartyCoupon}
          onChange={handleOnchange}
        />
        <div>
          <Button variant="primary" disabled={vaild} onClick={handleSubmit}>
            儲存
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default ServiceCategoryEdit
