import { Field, Input } from 'ui/input'
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
      if (key === 'bonusUsed' && value <= customerBonus + bill.bonusDeposit) {
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
  // 刻意不把換算率放進依賴（Jason 2026/10/30 選 B）：換算率比帳單晚到時不重算 bonusDecount，
  // 舊帳單一律維持結帳當時存的紅利折抵金額；補依賴會在設定到時把已存金額改成重算值。勿當成漏依賴修掉。
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 紅利換算率晚到時刻意不重算，舊帳單維持結帳當時的折抵金額（Jason 2026/10/30 選 B，見上方註解）
  }, [bill.bonusUsed, setBill])

  return (
    <div className="mb-[24px] flex flex-wrap items-center justify-start gap-[20px]">
      <Field label="點數給點" className="flex w-[200px] max-w-full justify-start">
        <Input
          value={bill.bonusDeposit}
          disabled={bonusDepositDisabled()}
          onChange={event => bonusOnChange(event, 'bonusDeposit')}
        />
      </Field>
      <Field label="點數扣點" className="flex w-[200px] max-w-full justify-start">
        <Input
          value={bill.bonusUsed}
          onChange={event => bonusOnChange(event, 'bonusUsed')}
        />
      </Field>
      <Field label="點數折抵金額" className="flex w-[200px] max-w-full justify-start">
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
