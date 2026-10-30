import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { formatMoney } from 'ui/format'
import { useContext, useEffect, useState } from 'react'
import Bonus from './Bonus'
import billContext from 'context/keyInContext'
import { useFetchGetCustomerBonusRecordLazy } from 'hooks/useFetchGetCustomerBonusRecord'

export default function PanelBonus({ bonusActive }) {
  const { bill, order, bonusConversion } = useContext(billContext)
  const [getCustomerBonusRecord, customerBonusRecordData] = useFetchGetCustomerBonusRecordLazy()
  const [customerBonus, setCustomerBonus] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }

  useEffect(() => {
    if (bill.customerId && bonusActive) {
      getCustomerBonusRecord({
        variables: {
          customerId: bill.customerId
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [bill.customerId] 變動時執行；bonusActive、getCustomerBonusRecord 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [bill.customerId])

  useEffect(() => {
    if (!customerBonusRecordData.loading && customerBonusRecordData.data) {
      const total = customerBonusRecordData.data.customerBonusRecord.reduce((a, b) => a + b.bonus, 0)
      setCustomerBonus(total)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [customerBonusRecordData.loading])

  useEffect(() => {
    if (!order.loading && order.data?.order) {
      const isExpanded = 
        order.data.order.bonusDecount > 0 ||
        order.data.order.bonusDeposit > 0 ||
        order.data.order.bonusUsed > 0

      setExpanded(isExpanded)
    }
  }, [order.loading, order.data])

  return (
    <Accordion key="panelRemark" expanded={expanded}>
      <AccordionSummary
        onClick={handleAccordionClick}
        data-testid="panelRemark"
        style={{ width: '100%' }}
        summaryMeta={!expanded && bill.bonusDecount > 0 ? `折抵 ${formatMoney(bill.bonusDecount)}` : ''}
      >
        <p className="m-0 flex items-center !text-[16px] font-bold text-text">紅利點數
          <span className="ml-2.5 text-caption">
            {bill.customerId ? `剩餘點數: ${customerBonus}` : ''}
          </span>
          {bonusConversion.isBonusConversion && (
            <span className="ml-2.5 text-caption">
              {`換算比率: ${bonusConversion.bonusConversionRate}`}
            </span>
          )}
        </p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          <Bonus expanded={expanded} customerBonus={customerBonus}/>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
