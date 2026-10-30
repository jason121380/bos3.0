const designerName = (designer, nameDisplayOnInvoice) => {
  if (!designer) return ''
  switch (nameDisplayOnInvoice) {
    case 'NAME':
      return designer.name
    case 'NICKNAME':
      return designer.nickName || designer.name
    case 'BOTH':
      return `${designer.name}${designer.nickName ? `(${designer.nickName})` : ''}`
    default:
      // 其他值不處理（與原本沒有 default 時相同）
      break
  }
}
export default designerName
