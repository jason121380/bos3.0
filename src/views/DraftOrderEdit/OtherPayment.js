import { Button } from 'ui/button'
import billContext from 'context/keyInContext'
import React from 'react'

// 本檔未被引用（PannelOtherPayment 已在 Pannel.js 註解掉）；原 emotion styles 物件缺少 `const styles = {` 開頭、語法無效，
// 這裡依原數值轉 Tailwind（payment：flex 置左、下外距 24px；linePay：白字、hover 綠底 80% 透明）
export default function Payment() {
  const { bill, handleBillChange } = React.useContext(billContext)
  return (
    <div className="mb-[24px] flex items-center justify-start">
      <Button
        variant="primary"
        className="text-white hover:opacity-80"
        style={{
          backgroundColor: bill.linePay ? '#00c300' : 'rgb(var(--text) / 0.26)',
        }}
        onClick={() =>
          handleBillChange({
            key: 'linePay',
            value: !bill.linePay,
          })
        }
      >
        LINE Pay
      </Button>
    </div>
  )
}
