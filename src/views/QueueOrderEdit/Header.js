/** @jsxImportSource @emotion/react */
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

  // 頁首（STYLE.md §4）：左側標題與流水號，右側次要動作；主要按鈕在下方結帳列
  return (
    <div className="ui-root noprint flex flex-wrap items-center justify-between gap-4 pb-6">
      <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal}/>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-title !font-bold text-text">{`重新開單 ${bill.no ? `(${bill.no})` : ''}`}</h1>
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
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => setOpenModal(true)}>
          <ReceiptText strokeWidth={1.75} />
          帳單速查
        </Button>
      </div>
    </div>
  )
}

Header.propTypes = {
  className: PropTypes.string,
}

export default Header
