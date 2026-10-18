import formatMoney from 'helper/formatMoney'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import idx from 'idx'
import useFetchMerchantMonthlyCheckoutRemark from 'hooks/useFetchMerchantMonthlyCheckoutRemark'
import useFetchSettingMerchantMonthlyCheckoutRemark from 'hooks/useFetchSettingMerchantMonthlyCheckoutRemark'
import { Card } from 'ui/card'
import { Textarea } from 'ui/input'

function Overview({ usersSalary, date }) {
  const usersSalarySummary = (usersSalary || []).reduce((accu, curVal) => {
    const actualSalary = curVal.actualSalary || (curVal.increaseItem - curVal.decreaseItem) || 0;
    return accu + actualSalary;
  }, 0)

  const [titleRemark, setTitleRemark] = useState('')
  const merchantMonthlyCheckoutRemarkData = useFetchMerchantMonthlyCheckoutRemark({ date: date })
  const {
    setMerchantMerchantMonthlyCheckoutRemark,
  } = useFetchSettingMerchantMonthlyCheckoutRemark()

  useEffect(() => {
    if (!merchantMonthlyCheckoutRemarkData.loading) {
      const remark = idx(
        merchantMonthlyCheckoutRemarkData,
        _ => _.data.merchantMonthlyCheckoutRemark
      )
      setTitleRemark(remark || '')
    }
  }, [merchantMonthlyCheckoutRemarkData.loading, merchantMonthlyCheckoutRemarkData])

  const handelTitleRemarkOnChange = e => {
    setTitleRemark(e.target.value)
    setMerchantMerchantMonthlyCheckoutRemark({ date: date, remark: e.target.value })
  }

  return (
    <div className="flex h-full items-stretch gap-6">
      {/* 實際匯款金額合計 */}
      <Card className="flex h-full w-[240px] flex-col justify-center">
        <div className="flex h-full flex-col justify-center gap-2 p-6 text-center">
          <h2 className="m-0 text-label text-text-secondary">
            實際匯款金額合計
          </h2>
          <div className="flex items-center justify-center">
            <span className="text-display tabular-nums text-text">
              {formatMoney(Math.round(usersSalarySummary))}
            </span>
          </div>
        </div>
      </Card>

      {/* 職務備註 */}
      <Card className="flex h-full min-w-[300px] flex-1 flex-col gap-3 px-6 py-4">
        <h2 className="m-0 text-heading text-text">
          {format(new Date(date), 'yyyy/M')} 月結備註
        </h2>
        <Textarea
          aria-label="月結備註"
          placeholder="請輸入本次月結備註..."
          className="flex-1 resize-none"
          onChange={handelTitleRemarkOnChange}
          value={titleRemark}
          rows={3}
        />
      </Card>
    </div>
  )
}

export default Overview
