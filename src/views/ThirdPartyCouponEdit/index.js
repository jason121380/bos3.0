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
import QueryFailed from 'components/QueryFailed'

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
      const list = idx(thirdPartyCouponsData, _ => _.data.getThirdPartTicket) || []
      // 清單查詢失敗或找不到這張卡券時不帶入（原本讀 undefined 整頁進入錯誤畫面）
      const found = list.find(data => data.id === props.match.params.id)
      if (found) setThirdPartyCouponDetail(found)
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
    // 百分比手續費限制 0～100（Jason 2026/10/22「照建議」）
    if (thirdPartyCoupon.type === 'PERCENT' && Number(thirdPartyCoupon.handlingFee) > 100) {
      openSnackbar({ message: '百分比手續費請輸入 0～100', variant: 'warning' })
      return
    }
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
        {thirdPartyCouponsData.error ? (
          <QueryFailed onRetry={() => thirdPartyCouponsData.refetch()} />
        ) : (
          <>
            <AboutThirdPartyCoupon
              thirdPartyCoupon={thirdPartyCoupon}
              onChange={handleOnchange}
            />
            <div>
              <Button variant="primary" disabled={vaild} onClick={handleSubmit}>
                儲存
              </Button>
            </div>
          </>
        )}
      </div>
    </Page>
  )
}

export default ServiceCategoryEdit
