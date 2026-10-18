import PropTypes from 'prop-types'
import  { useContext, useState } from 'react'
import billContext from 'context/keyInContext'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'
import { ReceiptText } from 'lucide-react'
import { Button } from 'ui/button'


function Header({ ...rest }) {
  const { orderNo, bill } = useContext(billContext)
  const [openModal, setOpenModal] = useState(false)

  // 頁首（STYLE.md §4）：左側標題，右側次要動作；主要按鈕在下方結帳列
  return (
    <div {...rest} className="ui-root noprint flex flex-wrap items-center justify-between gap-4 pb-6">
      <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal}/>
      <h1 className="m-0 text-title !font-bold text-text">
        掛單詳細 {orderNo && `(${orderNo})`}
      </h1>
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
