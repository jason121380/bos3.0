const designerName = (designer, nameDisplayOnInvoice) => {
  if (!designer) return ''
  switch (nameDisplayOnInvoice) {
    case "NAME":
      return designer.name
    case "NICKNAME":
      return designer.nickName || designer.name
    case "BOTH":
      return `${designer.name}${designer.nickName ? `(${designer.nickName})` : ''}`
  }
}
export default designerName