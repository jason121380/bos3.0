import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

// 把子元素畫進另一個元件提供的插槽（以 id 尋找）。
// 側欄的頂列（TopBar）與選單（NavBar）是兩個元件：切換店家鈕由 TopBar 畫進 NavBar 底部、搜尋鈕由 NavBar 畫進 TopBar 頂列，
// 狀態仍留在原元件。插槽可能較晚出現（例如 profile 載入後才渲染），以 MutationObserver 等待。
export default function SlotPortal({ slotId, children }) {
  const [slot, setSlot] = useState(() => document.getElementById(slotId))
  useEffect(() => {
    const find = () => {
      const el = document.getElementById(slotId)
      setSlot(prev => (prev === el ? prev : el))
    }
    find()
    const observer = new MutationObserver(find)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [slotId])
  return slot ? ReactDOM.createPortal(children, slot) : null
}

SlotPortal.propTypes = {
  slotId: PropTypes.string.isRequired,
  children: PropTypes.node,
}
