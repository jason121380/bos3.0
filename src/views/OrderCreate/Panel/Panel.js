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

const pannelByCode = {
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

  const [pannel, setPannel] = React.useState({
    service: {
      expaned: true,
      code: 'F1',
    },
    merchantSells: {
      expaned: false,
      code: 'F2',
    },
    couponSells: {
      expaned: false,
      code: 'F3',
    },
    couponUse: {
      expaned: false,
      code: 'F4',
    },
    memberShipCardSells: {
      expaned: false,
      code: 'F5',
    },
    payment: {
      expaned: true,
      code: 'F6',
    },
    remark: {
      expaned: true,
      code: 'F7',
    },
    otherPament: {
      expaned: false,
      code: 'F8',
    },
    bonus: {
      expaned: false,
      code: '',
    },
    performance: {
      expaned: true,
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
      setPannel({
        service: {
          expaned: true,
          code: 'F1',
        },
        merchantSells: {
          expaned: false,
          code: 'F2',
        },
        couponSells: {
          expaned: false,
          code: 'F3',
        },
        couponUse: {
          expaned: false,
          code: 'F4',
        },
        memberShipCardSells: {
          expaned: false,
          code: 'F5',
        },
        payment: {
          expaned: true,
          code: 'F6',
        },
        remark: {
          expaned: true,
          code: 'F7',
        },
        otherPament: {
          expaned: false,
          code: 'F8',
        },
        bonus: {
          expaned: false,
          code: '',
        },
        performance: {
          expaned: true,
          code: '',
        },
      })
    }
  }, [reset])

  const handlePannelClick = panelName => {
    setPannel(prevPannel =>
      Object.keys(prevPannel)
        .map(key => ({
          [key]: {
            code: pannel[key].code,
            expaned: key === panelName ? !pannel[key].expaned : pannel[key].expaned,
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
      if (pannelByCode[event.key]) {
        setPannel(prevPannel =>
          Object.values(prevPannel)
            .map(pannel => ({
              ...pannel,
              expaned: pannel.code === event.key,
            }))
            .reduce(
              (acc, cur) => ({
                ...acc,
                [pannelByCode[cur.code]]: cur,
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
        expanded={pannel.service.expaned}
        onPanelClick={() => handlePannelClick('service')}
        thirdPartTicket={thirdPartTicket}
        reset={reset}
      />
      <PanelMerchantSells
        expanded={pannel.merchantSells.expaned}
        onPanelClick={() => handlePannelClick('merchantSells')}
        thirdPartTicket={thirdPartTicket}
        reset={reset}
      />
      <PanelCouponSells
        expanded={pannel.couponSells.expaned}
        onPanelClick={() => handlePannelClick('couponSells')}
        reset={reset}
      />
      {!bill.withoutCustomerData && (
        <PanelCouponUse
          expanded={pannel.couponUse.expaned}
          onPanelClick={() => handlePannelClick('couponUse')}
          display={bill.customerId}
          reset={reset}
        />
      )}
      {memberShipCardActive && <PanelMemberShipCardSells
        expanded={pannel.memberShipCardSells.expaned}
        onPanelClick={() => handlePannelClick('memberShipCardSells')}
        thirdPartTicket={thirdPartTicket}
        reset={reset}
      />}
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          {(bonusActive && !bill.withoutCustomerData) &&
            <PanelBonus
              expanded={pannel.bonus.expaned}
              bonusActive={bonusActive}
              onPanelClick={() => handlePannelClick('bonus')}
              reset={reset}
            />
          }
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
        expanded={pannel.otherPament.expaned}
        onPanelClick={() => handlePannelClick('otherPament')}
      /> */}
    </div>
  )
}
export default Panel
