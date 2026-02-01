import { cloneDeep } from "lodash";

const handleTidyBill = bill => {
  let tmp = cloneDeep(bill);
  // 過濾掉 serviceOrders serviceOrderHelpers productOrders ticketOrders 在mutation中不必要的欄位
  const serviceOrdersNoIsLocked = tmp.serviceOrders.map(
    ({ isLocked, isNoCash, isBindedThirdPartTicketLocked, thirdPartyPayName, ...keep }) => keep
  );
  serviceOrdersNoIsLocked.map(
    (data, index) =>
      (serviceOrdersNoIsLocked[index].serviceOrderHelpers =
        data.serviceOrderHelpers.map(({ isCheckoutbox, ...keep }) => keep))
  );
  const productOrdersNoIsLocked = tmp.productOrders.filter(d => !(d.sellerId === '' && d.productId === '')).map(
    ({ isLocked, ...keep }) => keep
  );
  const ticketOrdersNoIsLocked = tmp.ticketOrders.map(
    ({ isLocked, ...keep }) => keep
  );
  const membershipOrders = tmp.membershipOrders.filter(d => !(d.sellerId === '' && d.membershipUUID === ''))
  tmp.serviceOrders = serviceOrdersNoIsLocked;
  tmp.productOrders = productOrdersNoIsLocked;
  tmp.ticketOrders = ticketOrdersNoIsLocked;
  tmp.membershipOrders = membershipOrders;
  delete tmp.raffleRecord
  if (tmp.customerId !== undefined) {
    tmp.customerCellphone = "";
  }
  if (tmp.withoutCustomerData) {
    tmp.bonusDecount = 0
    tmp.bonusDeposit = 0
    tmp.bonusUsed = 0
  }
  return tmp
}
const checkServicesOrders = data => {
  for (let i = 0; i < data.length; i++){
    const d = data[i]
    if (!d.serviceId) {
      return { verify: false, message: '請選擇服務項目' }
    } 
  }
  return { verify: true }
}
const checkProductOrders = data => {
  for (let i = 0; i < data.length; i++){
    const d = data[i]
    if (!d.sellerId) {
      return { verify: false, message: '請選擇店販的服務人員' }
    } else if (!d.productId) {
      return { verify: false, message: '請選擇店販商品' }
    }
  }
  return { verify: true }
}
const checkMembershipOrders = data => {
  for (let i = 0; i < data.length; i++){
    const d = data[i]
    if (!d.sellerId) {
      return { verify: false, message: '請選擇會員卡的服務人員' }
    } else if (!d.membershipUUID) {
      return { verify: false, message: '請選擇會員卡' }
    } else if (isNaN(d.expiryDate) || typeof d.expiryDate === "string") {
      return { verify: false, message: '會員卡到期日有誤' }
    }
  }
  return { verify: true }
}

export { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders }