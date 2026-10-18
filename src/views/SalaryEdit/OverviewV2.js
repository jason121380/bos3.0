import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import idx from 'idx'
import { Card } from 'ui/card'

// 薪資概覽：每格「標題（可多行）＋數值」，排列與舊版相同（手機 2 欄、平板 4 欄、桌機 6 欄）
function OverviewV2({ designer, actualTransferFun, memberActive }) {
  const [salaryCheckoutRecord, setSalaryCheckoutRecord] = useState()
  const [isHelperRetrireveAutoSet, setIsHelperRetrireveAutoSet] = useState(false)
  const [membershipDisplay, setMembershipDisplay] = useState(false)

  useEffect(() => {
    const tmp = idx(designer, _ => _.salaryMonthlyCheckoutRecord)
    const autoSet = idx(designer, _ => _.isHelperRetrireveAutoSet)
    setSalaryCheckoutRecord(tmp)
    setIsHelperRetrireveAutoSet(autoSet)
    setMembershipDisplay(memberActive || tmp.membershipPerformance !== 0 || tmp.membershipRake !== 0)
  }, [designer, memberActive])
  return (
    <div className="my-5">
      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6">
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label font-medium text-danger">
              實際匯款金額
            </span>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">{Math.round(actualTransferFun * 10) / 10 || 0}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label text-text-secondary">
              總實業績
            </span>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.totalTruthPerformance * 10) / 10 || 0
                  : 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label text-text-secondary">
              指定實業績
            </span>
            <span className="text-label text-text-secondary">
              不指定實業績
            </span>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.designateTruthPerformance * 10) / 10 || 0
                  : 0}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.nonDesignateTruthPerformance * 10) / 10 || 0
                  : 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label text-text-secondary">
              指定抽成
            </span>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.designateRake * 10) / 10 || 0
                  : 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label text-text-secondary">
              不指定抽成
            </span>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.nonDesignateRake * 10) / 10 || 0
                  : 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label text-text-secondary">
              特殊業績
            </span>
            <span className="text-label text-text-secondary">
              特殊抽成
            </span>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {' '}
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.specialTruthPerformance * 10) / 10 || 0
                  : 0}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.specialRake * 10) / 10 || 0
                  : 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label text-text-secondary">
              店販實業績
            </span>
            {membershipDisplay && (
              <span className="text-label text-text-secondary">
                會員卡實業績
              </span>
            )}
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.productPerformance * 10) / 10 || 0
                  : 0}
              </span>
            </div>
            {membershipDisplay && (
              <div className="mt-1 flex items-center justify-center">
                <span className="text-heading tabular-nums text-text">
                  {salaryCheckoutRecord !== undefined
                    ? Math.round(salaryCheckoutRecord.membershipPerformance * 10) / 10 || 0
                    : 0}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label text-text-secondary">
              店販抽成
            </span>
            {membershipDisplay && (
              <span className="text-label text-text-secondary">
                會員卡抽成
              </span>
            )}
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.productRake * 10) / 10 || 0
                  : 0}
              </span>
            </div>
            {membershipDisplay && (
              <div className="mt-1 flex items-center justify-center">
                <span className="text-heading tabular-nums text-text">
                  {salaryCheckoutRecord !== undefined
                    ? Math.round(salaryCheckoutRecord.membershipRake * 10) / 10 || 0
                    : 0}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label text-text-secondary">
              服務/卡券扣項
            </span>
            <span className="text-caption font-medium text-danger">
              (扣薪水)
            </span>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.deductionItemOnSalary * 10) / 10 || 0
                  : 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label text-text-secondary">
              互助使用總金額
            </span>
            <span className="text-label text-text-secondary">
              (包含的點數)
            </span>
            <span className="text-caption font-medium text-danger">
              (扣薪水)
            </span>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {`${salaryCheckoutRecord != undefined
                    ? Math.round(salaryCheckoutRecord.helperPaidPriceOnSalary * 10) / 10
                    : 0
                  }(${salaryCheckoutRecord != undefined
                    ? Math.round(salaryCheckoutRecord.helperPaidPointOnSalary * 10) / 10
                    : 0
                  })` || 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 px-3.5 py-6 text-center">
            <span className="text-label text-text-secondary">
              互助獲得總金額
            </span>
            <span className="text-label text-text-secondary">
              (包含的點數)
            </span>
            {!isHelperRetrireveAutoSet && (
              <span className="text-caption font-medium text-danger">
                (未自動帶入下方)
              </span>
            )}
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {`${salaryCheckoutRecord !== undefined
                    ? Math.round(salaryCheckoutRecord.helperRetrievePrice * 10) / 10
                    : 0
                  }(${salaryCheckoutRecord !== undefined
                    ? Math.round(salaryCheckoutRecord.helperRetrievePoint * 10) / 10
                    : 0
                  })` || 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-6 text-center">
            <span className="text-label text-text-secondary">
              手續費
            </span>
            <span className="text-caption font-medium text-danger">
              (其他付款方式/入金)
            </span>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-heading tabular-nums text-text">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.otherPayHandlingFeeOnSalary * 10) / 10
                  : 0 || 0}
                /{' '}
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.walletDepositHandlingFee * 10) / 10
                  : 0 || 0}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

OverviewV2.propTypes = {
  className: PropTypes.string,
}

export default OverviewV2
