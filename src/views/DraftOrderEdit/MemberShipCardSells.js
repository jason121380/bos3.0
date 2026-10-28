import { Field, Input } from 'ui/input'
import { CheckboxField } from 'ui/checkbox'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import EmployeeAutoComplete from "components/EmployeeAutoComplete";
import MemberShipCardAutoComplete from "components/MemberShipCardAutoComplete";
import ThirdPartyAutoComplete from "components/ThirdPartyAutoComplete";
import idx from "idx";
import React, { Fragment, useState, useEffect, useContext } from "react";
import TeachingModeContext from "context/teachingModeContext";
import billContext from "context/keyInContext";
import { addDays, addYears } from "date-fns";
import { MobileDatePicker } from 'ui/date-picker'

import MemberShipCardSellsModal from "views/OrderShared/MemberShipCardSellsModal";
import { useMembershipPicker } from "views/OrderShared/useItemPicker";
import { formatNumber } from 'ui/format'
import { ROW_ICON_ALIGN } from 'views/OrderShared/rowAlign'

// 版面比照打帳單（views/OrderCreate/styles/MemberShipCardSells）：欄位上方標籤、上緣對齊（OrderShared/rowAlign）、窄螢幕換行不擠壓
// 原 emotion styles 逐值轉 Tailwind（spacing 單位 8px；pxToRem 以 16px 換算；原 `!important` 以 `!` 前綴保留）。
// 自動完成元件與 MobileDatePicker 的 className 原以 css 套在根節點
const styles = {
  merchantSells: 'flex items-start justify-start flex-wrap gap-y-[12px] mb-[24px]',
  field: 'w-[200px] flex !mr-[12px]',
  priceField: 'w-[90px] flex !mr-[12px]', // 會員卡價格常為 5 位數，65px 會截成「1200(」
  heading2: 'text-label font-bold',
  productField: 'w-[250px] flex mr-[12px]',
  dateField: 'w-[200px] flex !mr-[12px]',
}

const MemberShipCardSells = ({
  sellsItem,
  onChange,
  onClear,
  index,
  addSells,
  removeSells,
  first,
  last,
  onCardChange,
  focusFirstField,
  focusRow,
  changeRowFocus,
  sells,
  productLength,
  onProductChange,
  expanded,
  thirdPartTicket,
}) => {
  const techingModeContext = useContext(TeachingModeContext);
  const { teachingMode } = techingModeContext;
  const { thirdPartyCoupons, setMembershipAlready, bill } = useContext(billContext);

  const employeeRef = React.useRef();
  const productRef = React.useRef();
  const priceRef = React.useRef();
  const checkbox = React.useRef();
  const dateRef = React.useRef();
  const thirdPartyRef = React.useRef();
  const remarkRef = React.useRef();
  const [focus, setFocus] = React.useState("");
  // 「從清單選擇」彈窗的狀態與清單查詢（OrderShared/useItemPicker，四頁共用）
  const { productsModalOpen, handleOpenProductsModal, modalProps: pickerModalProps } = useMembershipPicker();

  useEffect(() => {
    // 使用者自己點了這一列的欄位（焦點已在本列欄位上）時不搶焦點（比照帳單詳細；開頁時沒有要聚焦的列，第一次點欄位才指定本列，Jason 2026/10/22 fix all）
    const fieldFocused = [employeeRef, productRef, priceRef, checkbox, dateRef, thirdPartyRef, remarkRef]
      .some(ref => ref.current && ref.current === document.activeElement);
    if (expanded && focusFirstField && !fieldFocused) {
      idx(employeeRef, (_) => _.current.focus());
      setFocus("employee");
    }
  }, [expanded, focusFirstField]);

  const handleFocus = ({ event, field }) => {
    setFocus(field);
    event.target.focus();
    if (field === "price" || field === "count") {
      event.target.select();
    }
    changeRowFocus(index);
  };
  const handleKeyDown = ({ event, nextField }) => {
    if (event.key === "Enter") {
      setFocus(nextField);
    }
  };

  React.useEffect(() => {
    switch (focus) {
      case "employee":
        idx(employeeRef, (_) => _.current.focus());
        break;
      case "product":
        idx(productRef, (_) => _.current.focus());
        break;
      case "price":
        idx(priceRef, (_) => _.current.focus());
        break;
      case "checkbox":
        idx(checkbox, (_) => _.current.focus());
        break;
      case "date":
        idx(dateRef, (_) => _.current.focus());
        break;
      case "thirdParty":
        idx(thirdPartyRef, (_) => _.current.focus());
        break;
      case "remark":
        idx(remarkRef, (_) => _.current.focus());
        break;
      default:
        break;
    }
  }, [focus]);

  return (
    <Fragment>
      <div className={styles.merchantSells}>
        {/* 必填 *：helper/billVerify.js checkMembershipOrders 要求 sellerId、membershipUUID、有效到期日；
            handleTidyBill 會丟掉兩者皆空的列，所以該列有填任一欄才標必填 */}
        <Field label="服務人員" required={!!sells.sellerId || !!sells.membershipUUID}>
          <EmployeeAutoComplete
            // 與同列輸入框同高（36px、手機 40px）
            size="medium"
            className={styles.field}
            placeholder="服務人員姓名/編號"
            value={sells.sellerId}
            ref={employeeRef}
            autoFocus={focus === "employee"}
            onFocus={(event) => handleFocus({ event, field: "employee" })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setTimeout(() => {
                  handleKeyDown({ event, nextField: "product" })
                }, 1)
              }
            }}
            onChange={function (value) {
              onChange({
                index,
                key: "sellerId",
                value: idx(value, (_) => _.userId),
              });
            }}
            inputProps={{
              "data-testid": `merchantSsell-${index}-employee`,
            }}
          />
        </Field>
        {index === 0 ? (
          <RowIconButton label="從清單選擇會員卡" className={`mx-1.5 ${ROW_ICON_ALIGN}`} onClick={handleOpenProductsModal}>
            <Copy aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        ) : (
          <span aria-hidden="true" className={`mx-1.5 h-8 w-8 shrink-0 ${ROW_ICON_ALIGN}`} />
        )}
        <Field label="會員卡" required={!!sells.sellerId || !!sells.membershipUUID}>
          <MemberShipCardAutoComplete
            setMembershipAlready={setMembershipAlready}
            className={styles.productField}
            value={sells.membershipUUID}
            ref={productRef}
            autoFocus={focus === "product"}
            onFocus={(event) => handleFocus({ event, field: "product" })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                if (sells.isLocked !== 'FALSE' && sells.expiryDate === null) {
                  handleKeyDown({ event, nextField: "checkbox" })
                } else if (sells.isLocked === 'FALSE') {
                  handleKeyDown({ event, nextField: "price" })
                } else {
                  handleKeyDown({ event, nextField: "date" })
                }
              }
            }}
            inputProps={{
              "data-testid": `memberShipCardSells-${index}-product`,
              placeholder: '會員卡名稱/代號',
            }}
            onChange={(value) => {
              idx(value, (_) => {
                onCardChange({
                  index,
                  value: {
                    ...sells,
                    membershipUUID: _.uuid,
                    price: _.sellPrice,
                    expiryDate: _.effecitveDay === 0 ? null : addDays(new Date(), _.effecitveDay).getTime(),
                    isLocked: _.isLocked,
                    effecitveDay: _.effecitveDay,
                  },
                });
              });
              if (value.isLocked !== 'FALSE' && value.effecitveDay === 0) {
                handleKeyDown({ event: { key: 'Enter' }, nextField: "checkbox" })
              } else if (value.isLocked === 'FALSE') {
                handleKeyDown({ event: { key: 'Enter' }, nextField: "price" })
              } else {
                handleKeyDown({ event: { key: 'Enter' }, nextField: "date" })
              }
            }}
          />
        </Field>
        {sells.membershipUUID ? (
          <React.Fragment>
            <Field label="價格" className={styles.priceField}>
              <Input
                value={sells.price}
                ref={priceRef}
                data-testid={`memberShipCardSells-${index}-price`}
                onChange={(value) => {
                  setFocus("price");
                  onChange({
                    index,
                    key: "price",
                    value: idx(value, (_) => +_.target.value || 0),
                  });
                }}
                autoFocus={focus === "price"}
                onFocus={(event) => handleFocus({ event, field: "price" })}
                onKeyDown={(event) => {
                  handleKeyDown({ event, nextField: sells.expiryDate === null ? 'checkbox' : 'date' })
                }}
                disabled={!!(sells.isLocked === 'TRUE' || sells.isLocked === 'UNSET')}
              />
            </Field>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* 必填 *：非永久會籍時 checkMembershipOrders 要求有效到期日 */}
              <Field label="到期日" required={sells.expiryDate !== null}>
                <MobileDatePicker
                  className={styles.dateField}
                  value={sells.expiryDate}
                  disabled={sells.expiryDate === null}
                  format="yyyy/MM/dd"
                  autoFocus={focus === "date"}
                  inputRef={dateRef}
                  onError={() =>
                    onChange({
                      index,
                      key: "expiryDate",
                      value: "Invalid Date",
                    })
                  }
                  minDate={addDays(new Date(bill.date), 1)}
                  maxDate={addYears(new Date(bill.date), 50)}
                  localeText={{
                    toolbarTitle: '選擇日期'
                  }}
                  slotProps={{
                    textField: {
                      onFocus: event => handleFocus({ event, field: "date" }),
                      onKeyDown: event => handleKeyDown({ event, nextField: "checkbox" })
                    },
                  }}
                  onChange={(value) => {
                    setFocus("date");
                    onChange({
                      index,
                      key: "expiryDate",
                      value: new Date(value).getTime()
                    });
                  }}
                />
              </Field>
              <CheckboxField
                label="永久會籍"
                ref={checkbox}
                checked={sells.expiryDate === null}
                onFocus={(event) => handleFocus({ event, field: "checkbox" })}
                onKeyDown={(event) =>
                  handleKeyDown({ event, nextField: "thirdParty" })
                }
                onChange={(value) => {
                  // 有效天數為 0（終身卡）時沒有可帶的到期日：帳單日／購買日當天已過期、早於可選的最早日期，
                  // 留空（無效日期）待櫃檯選，送出時被擋下（同重新開單，Codex review PR #265）；已購會員卡有剩餘天數（validDayCount）時照舊
                  onChange({
                    index,
                    key: "expiryDate",
                    value:
                      sells.expiryDate === null
                        ? sells.validDayCount === undefined
                          ? sells.effecitveDay > 0 ? addDays(new Date(bill.date), sells.effecitveDay).getTime() : NaN
                          : sells.validDayCount === null
                            ? sells.effecitveDay > 0 ? addDays(new Date(sells.purchaseDate), sells.effecitveDay).getTime() : NaN
                            : addDays(new Date(sells.purchaseDate), sells.validDayCount).getTime()
                        : null,
                  });
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {thirdPartTicket && (
                <Field label="第三方卡券">
                  <ThirdPartyAutoComplete
                    className={styles.field}
                    fieldProps={{ placeholder: '第三方卡券' }}
                    autoFocus={focus === "thirdParty"}
                    value={sells.thirdPartyCouponMerchantId}
                    ref={thirdPartyRef}
                    onKeyDown={(event) => handleKeyDown({ event, nextField: "remark" })}
                    name="thirdParty"
                    onChange={(e) => {
                      onCardChange({
                        index,
                        value: {
                          ...sells,
                          thirdPartyCouponMerchantId: e ? e.id : null,
                        },
                      });
                    }}
                    onFocus={(event) => handleFocus({ event, field: "thirdParty" })}
                    inputProps={{
                      "data-testid": `service-${index}-thirdParty`,
                    }}
                  />
                </Field>
              )}
              {teachingMode && <p className={`m-0 ${styles.heading2}`}>勾選將入業績但不收費用**</p>}
              {sells.thirdPartyCouponMerchantId &&
                thirdPartyCoupons.map((data) => {
                  if (data.id === sells.thirdPartyCouponMerchantId) {
                    return (
                      <p key={data.id} className={`m-0 ${styles.heading2}`} style={{ marginTop: '4px' }}>
                        扣完後業績:
                        {/* 比照 Services.js：PERCENT 按比例，其他類型（固定金額）減去手續費 */}
                        {data.type === 'PERCENT'
                          ? formatNumber(Math.round((sells.price * (100 - data.fee)) / 100))
                          : formatNumber(Math.round(sells.price - data.fee))}
                      </p>
                    );
                  }
                  return undefined
                })}
            </div>
            <Field label="備註" className={styles.field}>
              <Input
                value={sells.remark}
                name="remark"
                ref={remarkRef}
                autoFocus={focus === "remark"}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setTimeout(() => {
                      changeRowFocus(index + 1);
                    }, 1)
                  }
                }}
                onChange={(value) => {
                  onChange({
                    index,
                    key: "remark",
                    value: idx(value, (_) => _.target.value),
                  });
                }}
              />
            </Field>
          </React.Fragment>
        ) : (
          ""
        )}

        <RowIconButton
          label="清除此列"
          className={`mr-1.5 ${ROW_ICON_ALIGN}`}
          onClick={function () {
            onClear({ index });
          }}
          data-testid={`merchantSsell-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first ? (
          <RowIconButton
            label="刪除此列"
            className={`mr-1.5 ${ROW_ICON_ALIGN}`}
            onClick={function () {
              removeSells({ index });
            }}
            data-testid={`merchantSsell-${index}-delete`}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        ) : (
          ""
        )}
      </div>
      {last ? (
        <AddRowButton
          onClick={function () {
            addSells();
          }}
          data-testid={`merchantSsell-${index}-add`}
        />
      ) : (
        ""
      )}
      {productsModalOpen && (
        <MemberShipCardSellsModal
          {...pickerModalProps}
          onCardChange={onCardChange}
          sells={sellsItem}
          productLength={productLength}
          sellsItem={sells}
          showEffectiveDays={false}
        />
      )}
    </Fragment>
  );
};

export default MemberShipCardSells;
