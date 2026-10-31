import billContext from 'context/keyInContext'
import React, { useState, useEffect } from 'react'
import idx from 'idx'
import useFetchGetThirdPartTicketSetting from 'hooks/useFetchGetThirdPartTicketSetting'

import PanelCouponSells from './PanelCouponSells'
import PanelCouponUse from './PanelCouponUse'
import PanelMerchantSells from './PanelMerchantSells'
import PanelPayment from './PanelPayment'
import PanelService from './PanelService'
import PanelRemark from './PanelRemark'
import PanelMemberShipCardSells from './PanelMemberShipCardSells'
import PanelBonus from './PanelBonus'
import PanelPerformance from './PanelPerformance'

const styles = {
  root: 'w-full flex flex-col gap-[12px] mt-0',
  container: 'grid grid-cols-[1fr_420px] gap-[12px] max-[899.95px]:grid-cols-[1fr]',
  leftColumn: 'flex flex-col gap-[12px] min-w-0',
  rightColumn: 'flex flex-col gap-[12px] min-w-0',
}

const panelByCode = {
  F1: 'service',
  F2: 'merchantSells',
  F3: 'couponSells',
  F4: 'couponUse',
  F5: 'memberShipCardSells',
  F6: 'payment',
  F7: 'remark',
}

function Panel() {
  const { bill, reset, bonusActive, memberShipCardActive } = React.useContext(billContext)
  const thirdPartTicketData = useFetchGetThirdPartTicketSetting()
  const [thirdPartTicket, setthirdPartTicketData] = useState(false)

  const [panel, setPanel] = React.useState({
    service: {
      expanded: true,
      code: 'F1',
    },
    merchantSells: {
      expanded: false,
      code: 'F2',
    },
    couponSells: {
      expanded: false,
      code: 'F3',
    },
    couponUse: {
      expanded: false,
      code: 'F4',
    },
    memberShipCardSells: {
      expanded: false,
      code: 'F5',
    },
    payment: {
      expanded: true,
      code: 'F6',
    },
    remark: {
      expanded: true,
      code: 'F7',
    },
    otherPayment: {
      expanded: false,
      code: 'F8',
    },
    bonus: {
      expanded: false,
      code: '',
    },
    performance: {
      expanded: true,
      code: '',
    },
  })

  useEffect(() => {
    if (!thirdPartTicketData.loading) {
      const thirdPartTicket = idx(thirdPartTicketData, _ => _.data.getIsThirdPartTicketDisplay)
      setthirdPartTicketData(thirdPartTicket)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [thirdPartTicketData.loading])

  useEffect(() => {
    if (reset === 'reset') {
      setPanel({
        service: {
          expanded: true,
          code: 'F1',
        },
        merchantSells: {
          expanded: false,
          code: 'F2',
        },
        couponSells: {
          expanded: false,
          code: 'F3',
        },
        couponUse: {
          expanded: false,
          code: 'F4',
        },
        memberShipCardSells: {
          expanded: false,
          code: 'F5',
        },
        payment: {
          expanded: true,
          code: 'F6',
        },
        remark: {
          expanded: true,
          code: 'F7',
        },
        otherPayment: {
          expanded: false,
          code: 'F8',
        },
        bonus: {
          expanded: false,
          code: '',
        },
        performance: {
          expanded: true,
          code: '',
        },
      })
    }
  }, [reset])

  const handlePanelClick = panelName => {
    setPanel(prevPanel =>
      Object.keys(prevPanel)
        .map(key => ({
          [key]: {
            code: panel[key].code,
            expanded: key === panelName ? !panel[key].expanded : panel[key].expanded,
          },
        }))
        .reduce(
          (acc, curr) => ({
            ...acc,
            ...curr,
          }),
          {}
        )
    )
  }

  React.useEffect(() => {
    const listener = event => {
      if (panelByCode[event.key]) {
        setPanel(prevPanel =>
          Object.values(prevPanel)
            .map(panel => ({
              ...panel,
              expanded: panel.code === event.key,
            }))
            .reduce(
              (acc, cur) => ({
                ...acc,
                [panelByCode[cur.code]]: cur,
              }),
              {}
            )
        )
      }
    }
    document.addEventListener('keydown', listener)
    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [])

  return (
    <div className={styles.root} id="panel">
      <PanelService
        expanded={panel.service.expanded}
        onPanelClick={() => handlePanelClick('service')}
        thirdPartTicket={thirdPartTicket}
        reset={reset}
      />
      <PanelMerchantSells
        expanded={panel.merchantSells.expanded}
        onPanelClick={() => handlePanelClick('merchantSells')}
        thirdPartTicket={thirdPartTicket}
        reset={reset}
      />
      <PanelCouponSells expanded={panel.couponSells.expanded} onPanelClick={() => handlePanelClick('couponSells')} reset={reset} />
      {!bill.withoutCustomerData && (
        <PanelCouponUse
          expanded={panel.couponUse.expanded}
          onPanelClick={() => handlePanelClick('couponUse')}
          display={bill.customerId}
          reset={reset}
        />
      )}
      {memberShipCardActive && (
        <PanelMemberShipCardSells
          expanded={panel.memberShipCardSells.expanded}
          onPanelClick={() => handlePanelClick('memberShipCardSells')}
          thirdPartTicket={thirdPartTicket}
          reset={reset}
        />
      )}
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          {bonusActive && !bill.withoutCustomerData && (
            <PanelBonus expanded={panel.bonus.expanded} bonusActive={bonusActive} onPanelClick={() => handlePanelClick('bonus')} reset={reset} />
          )}
          <PanelPayment />
          <PanelRemark />
        </div>
        <div className={styles.rightColumn}>
          <PanelPerformance />
        </div>
      </div>
      {/* 讓出底部固定合計列的高度，最後一張卡不會被蓋住 */}
      <div aria-hidden="true" className="h-12" />
      {/* <PanelOtherPayment
        expanded={panel.otherPayment.expanded}
        onPanelClick={() => handlePanelClick('otherPayment')}
      /> */}
    </div>
  )
}
export default Panel
