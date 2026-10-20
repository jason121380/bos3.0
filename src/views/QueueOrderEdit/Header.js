import PropTypes from 'prop-types'
import { useContext, useState } from 'react'
import billContext from 'context/keyInContext'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'
import produce from 'immer'
import { ReceiptText } from 'lucide-react'
import { Button } from 'ui/button'
import { Input } from 'ui/input'

function Header() {
  const { bill, setBill, enable, serialNumberUsing } = useContext(billContext)
  const [openModal, setOpenModal] = useState(false)

  // 頁首（STYLE.md §4，比照打帳單 Header）：標題、「帳單速查」與流水號同一列；主要按鈕「重試」在下方金額彙總卡
  // 外層 div（className 含 noprint）依鐵則不動，只調整內部排列
  return (
    <div className="ui-root noprint flex flex-wrap items-center justify-between gap-4 pb-6">
      <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal}/>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-title !font-bold text-text">{`重新開單 ${bill.no ? `(${bill.no})` : ''}`}</h1>
        <Button size="sm" variant="secondary" onClick={() => setOpenModal(true)}>
          <ReceiptText strokeWidth={1.75} />
          帳單速查
        </Button>
        {serialNumberUsing && (
          <label className="flex items-center gap-2 text-label text-text-secondary">
            流水號
            <Input
              disabled={!enable}
              className="w-[100px] tabular-nums"
              value={bill.serialNumber == null ? '' : bill.serialNumber}
              onChange={e => {
                const value = e.target.value === '' ? null : e.target.value
                setBill(
                  produce(draft => {
                    draft.serialNumber = value
                  })
                )
              }}
            />
          </label>
        )}
      </div>
    </div>
  )
}

Header.propTypes = {
  className: PropTypes.string,
}

export default Header
