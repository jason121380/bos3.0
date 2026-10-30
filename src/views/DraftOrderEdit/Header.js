import PropTypes from 'prop-types'
import { useContext, useState } from 'react'
import billContext from 'context/keyInContext'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'
import { ReceiptText } from 'lucide-react'
import { Button } from 'ui/button'

function Header({ ...rest }) {
  const { orderNo, bill } = useContext(billContext)
  const [openModal, setOpenModal] = useState(false)

  // 頁首比照打帳單（OrderCreate/Header）：標題後接小型「帳單速查」；儲存／結帳等主要動作在下方金額彙總卡
  return (
    <div {...rest} className="ui-root noprint flex flex-wrap items-center justify-between gap-4 pb-6">
      <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal} />
      {/* 外層 div（className 含 noprint）依鐵則不動，只調整內部排列 */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-title !font-bold text-text">掛單詳細 {orderNo && `(${orderNo})`}</h1>
        <Button size="sm" variant="secondary" onClick={() => setOpenModal(true)}>
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
