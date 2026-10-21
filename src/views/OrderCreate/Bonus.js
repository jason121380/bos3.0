import { Field, Input } from 'ui/input'
import billContext from 'context/keyInContext'
import { useContext, memo, useEffect } from 'react'
import produce from 'immer'
import { getBonusWalletPayLimit, isBonusDepositDisabled } from 'views/OrderShared/bonusRules'

const styles = {
  bonus: 'flex items-center justify-start mb-[24px] flex-wrap gap-[20px]',
  field: 'w-[200px] flex justify-start',
}

function Bonus({ customerBonus }) {
  const {
    setBill, bill, handleBillChange, bonusConversion, bonusSetting,
    bonusRewardWithLINE, isLineBinded
  } = useContext(billContext)

  const bonusOnChange = (event, key) => {
    const value = Number(event.target.value);
    if (!isNaN(value) && value >= 0) {
      if (key === 'bonusUsed' && value <= (customerBonus + bill.bonusDeposit)) {
        handleBillChange({ key, value });
      } else if (key === 'bonusDecount' && value <= walletPayLimit()) {
        handleBillChange({ key, value });
      } else if (key === 'bonusDeposit') {
        handleBillChange({ key, value });
      }
    }
  };
  // 「點數折抵金額」上限與「點數給點」是否停用：四頁同一套規則（OrderShared/bonusRules）
  const walletPayLimit = () => getBonusWalletPayLimit(bill)
  const bonusDepositDisabled = () => isBonusDepositDisabled({ bonusRewardWithLINE, isLineBinded, bonusSetting })



  useEffect(() => {
    if (bonusConversion.isBonusConversion) {
      setBill(
        produce(draft => {
          draft.bonusDecount = parseInt(bill.bonusUsed / bonusConversion.bonusConversionRate, 10)
        })
      )
    }
  }, [bill.bonusUsed, setBill])
  return (
    <div className={styles.bonus}>
      <Field label="點數給點" className={styles.field}>
        <Input
          value={bill.bonusDeposit}
          disabled={bonusDepositDisabled()}
          onChange={event => bonusOnChange(event, 'bonusDeposit')}
        />
      </Field>
      <Field label="點數扣點" className={styles.field}>
        <Input
          value={bill.bonusUsed}
          onChange={event => bonusOnChange(event, 'bonusUsed')}
        />
      </Field>
      <Field label="點數折抵金額" className={styles.field}>
        <Input
          value={bill.bonusDecount}
          disabled={bonusConversion.isBonusConversion}
          onChange={event => bonusOnChange(event, 'bonusDecount')}
        />
      </Field>
    </div>
  )
}

export default memo(Bonus)
