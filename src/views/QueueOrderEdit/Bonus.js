import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import billContext from 'context/keyInContext'
import { useContext, memo, useEffect } from 'react'
import produce from 'immer'
import { getBonusWalletPayLimit, isBonusDepositDisabled } from 'views/OrderShared/bonusRules'

function Bonus({ customerBonus }) {
  const {
    setBill, bill, handleBillChange, onceRef, bonusConversion, bonusSetting,
    bonusRewardWithLINE, isLineBinded
  } = useContext(billContext)
  const bonusOnChange = (event, key) => {
    const value = Number(event.target.value);
    onceRef.current = false
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
    <div className="mb-6 flex flex-wrap items-center justify-start gap-[20px]">
      <Field label="點數給點" className="flex w-[200px] justify-start">
        <TextField
          fullWidth
          value={bill.bonusDeposit}
          variant="outlined"
          disabled={bonusDepositDisabled()}
          onChange={event => bonusOnChange(event, 'bonusDeposit')}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Field>
      <Field label="點數扣點" className="flex w-[200px] justify-start">
        <TextField
          fullWidth
          value={bill.bonusUsed}
          variant="outlined"
          onChange={event => bonusOnChange(event, 'bonusUsed')}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Field>
      <Field label="點數折抵金額" className="flex w-[200px] justify-start">
        <TextField
          fullWidth
          value={bill.bonusDecount}
          variant="outlined"
          disabled={bonusConversion.isBonusConversion}
          onChange={event => bonusOnChange(event, 'bonusDecount')}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Field>
    </div>
  )
}

export default memo(Bonus)
