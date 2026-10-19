/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import billContext from 'context/keyInContext'
import { useContext, memo, useEffect } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import produce from 'immer'
const styles = {
  bonus: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
    gap: 20
  }),
  field: css({
    width: '200px',
    display: 'flex',
    justifyContent: 'flex-start',
  })
}

function Bonus({ customerBonus }) {
  const {
    setBill, bill, handleBillChange, onceRef, bonusConversion, bonusSetting,
    bonusRewardWithLINE, isLineBinded
  } = useContext(billContext)
  const bonusOnChange = (event, key) => {
    const value = Number(event.target.value);
    onceRef.current = false
    if (!isNaN(value) && value >= 0) {
      if (key === 'bonusUsed' && value <= customerBonus + bill.bonusDeposit) {
        handleBillChange({ key, value });
      } else if (key === 'bonusDecount' && value <= walletPayLimit()) {
        handleBillChange({ key, value });
      } else if (key === 'bonusDeposit') {
        handleBillChange({ key, value });
      }
    }
  };

  const servicesWithThirdPartyCount = []
  const productsWithThirdPartyCount = []
  const membershipsWithThirdPartyCount = []
  const servicesWithoutThirdPartyCount = []
  const productsWithoutThirdPartyCount = []
  const membershipsWithoutThirdPartyCount = []

  bill.serviceOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId === 'string') {
      servicesWithThirdPartyCount.push(data)
    }
  })
  bill.productOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId === 'string') {
      productsWithThirdPartyCount.push(data)
    }
  })
  bill.membershipOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId === 'string') {
      membershipsWithThirdPartyCount.push(data)
    }
  })

  bill.serviceOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId !== 'string') {
      servicesWithoutThirdPartyCount.push(data)
    }
  })
  bill.productOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId !== 'string') {
      productsWithoutThirdPartyCount.push(data)
    }
  })
  bill.membershipOrders.forEach(data => {
    if (typeof data.thirdPartyCouponMerchantId !== 'string') {
      membershipsWithoutThirdPartyCount.push(data)
    }
  })

  const bonusDepositDisabled = () => {
    if (bonusRewardWithLINE) {
      return isLineBinded ? bonusSetting.isUsing : true;
    }
    return bonusSetting.isUsing;
  };

  const walletPayLimit = () => {
    const totalOrdersCount =
      bill.serviceOrders.length +
      bill.productOrders.length +
      bill.ticketOrders.length +
      bill.membershipOrders.length;

    const thirdPartyOrdersCount =
      servicesWithThirdPartyCount.length +
      productsWithThirdPartyCount.length +
      membershipsWithThirdPartyCount.length;

    const hasWalletPayLimit = totalOrdersCount - thirdPartyOrdersCount >= 1;

    if (hasWalletPayLimit) {
      const servicesTotal = servicesWithoutThirdPartyCount.reduce((total, item) => total + item.price, 0);

      const productsTotal = productsWithoutThirdPartyCount.reduce(
        (total, item) => total + item.price * item.count,
        0
      );

      const membershipsTotal = membershipsWithoutThirdPartyCount.reduce(
        (total, item) => total + item.price,
        0
      );

      const ticketsTotal = bill.ticketOrders.reduce(
        (total, item) => total + item.price * item.count,
        0
      );

      const otherPayments = bill.amountByOtherPay + bill.walletPay;

      const walletPayLimit = servicesTotal + productsTotal + membershipsTotal + ticketsTotal - otherPayments;

      return walletPayLimit;
    }
    return 0;
  }

  useEffect(() => {
    if (bonusConversion.isBonusConversion) {
      setBill(
        produce(draft => {
          draft.bonusDecount = parseInt(bill.bonusUsed / bonusConversion.bonusConversionRate)
        })
      )
    }
  }, [bill.bonusUsed])

  return (
    <div css={styles.bonus}>
      <TextField
        value={bill.bonusDeposit}
        variant="outlined"
        label="點數給點"
        css={styles.field}
        disabled={bonusDepositDisabled()}
        onChange={event => bonusOnChange(event, 'bonusDeposit')}
      />
      <TextField
        value={bill.bonusUsed}
        variant="outlined"
        label="點數扣點"
        css={styles.field}
        onChange={event => bonusOnChange(event, 'bonusUsed')}
      />
      <TextField
        value={bill.bonusDecount}
        variant="outlined"
        label="點數折抵金額"
        css={styles.field}
        disabled={bonusConversion.isBonusConversion}
        onChange={event => bonusOnChange(event, 'bonusDecount')}
      />
    </div>
  )
}

export default memo(Bonus)
