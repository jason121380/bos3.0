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

import AboutThirdPartyCoupon from 'views/ThirdPartyCouponShared/AboutThirdPartyCoupon'

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
    // 百分比手續費限制 0～100（Jason 2026/10/22「照建議」）
    if (thirdPartyCoupon.type === 'PERCENT' && Number(thirdPartyCoupon.handlingFee) > 100) {
      openSnackbar({ message: '百分比手續費請輸入 0～100', variant: 'warning' })
      return
    }
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
  // 停用原因（STYLE.md §6）：依 vaild 的三個欄位，依畫面順序列出目前缺的
  const missing = [
    !thirdPartyCoupon.name && '名稱',
    !(thirdPartyCoupon.handlingFee >= 0) && '手續費',
    !thirdPartyCoupon.type && '手續費扣項方式',
  ].filter(Boolean)

  return (
    <Page className="ui-root" title="新增第三方卡券">
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader title="新增第三方卡券" />
        <AboutThirdPartyCoupon
          thirdPartyCoupon={thirdPartyCoupon}
          onChange={handleOnchange}
        />
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          {vaild && (
            <p id="third-party-coupon-create-missing" role="status" className="text-caption text-text-secondary">
              尚缺：{missing.join('、')}
            </p>
          )}
          <Button variant="primary" disabled={vaild} aria-describedby={vaild ? 'third-party-coupon-create-missing' : undefined} onClick={handleSubmit}>
            新增
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default ServiceCategoryCreate
