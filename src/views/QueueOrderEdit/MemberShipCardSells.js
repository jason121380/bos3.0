import { TextField } from 'ui/text-field'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import EmployeeAutoComplete from "components/EmployeeAutoComplete";
import MemberShipCardAutoComplete from "components/MemberShipCardAutoComplete";
import ThirdPartyAutoComplete from "components/ThirdPartyAutoComplete";
import idx from "idx";
import React, { Fragment, useState, useEffect, useContext } from "react";
import TeachingModeContext from "context/teachingModeContext";
import billContext from "context/keyInContext";
import { addDays, addYears, format, startOfDay } from "date-fns";
import { useFetchThirdPartysForCreateOrder } from "hooks/useFetchMerchant";
import { MobileDatePicker } from 'ui/date-picker'

import MemberShipCardSellsModal from "views/OrderShared/MemberShipCardSellsModal";
import { useMembershipPicker } from "views/OrderShared/useItemPicker";
import { formatNumber } from 'ui/format'
import { ROW_ICON_ALIGN, ROW_ICON_ALIGN_SMALL } from 'views/OrderShared/rowAlign'

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
  const dateRef = React.useRef();
  const checkbox = React.useRef();
  const thirdPartyRef = React.useRef();
  const remarkRef = React.useRef();
  const [focus, setFocus] = React.useState("");
  // 「從清單選擇」彈窗的狀態與清單查詢（OrderShared/useItemPicker，四頁共用）
  const { productsModalOpen, handleOpenProductsModal, modalProps: pickerModalProps } = useMembershipPicker();
  const [dateError, setDateError] = useState('')
  // 會員卡清單（MemberShipCardAutoComplete 載入後回傳）：佇列帶回的會員卡列沒有有效天數，取消「永久會籍」時從清單查
  const [membershipOptions, setMembershipOptions] = useState([])

  useEffect(() => {
    if (expanded && focusFirstField) {
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
      case "date":
        idx(dateRef, (_) => _.current.focus());
        break;
      case "checkbox":
        idx(checkbox, (_) => _.current.focus());
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

  const checkMessage = (msg) => {
    switch (msg) {
      case "invalidDate":
        return "時間有誤";
      case "minDate":
        return `時間不得小於${format(addDays(startOfDay(new Date(bill.date)), 1), 'yyyy/MM/dd')}`
      case "maxDate":
        return `時間不得大於${format(addYears(startOfDay(new Date(bill.date)), 50), 'yyyy/MM/dd')}`
      default:
        return "";
    }
  };
  return (
    <Fragment>
      <div className="mb-6 flex flex-wrap items-start justify-start gap-y-[12px]">
        {/* 必填 *：Footer.js 重試時 helper/billVerify.js checkMembershipOrders 要求 sellerId、membershipUUID、有效到期日；兩者都空的列會被 handleTidyBill 丟掉，所以該列有填任一欄才標必填（同打帳單） */}
        <Field label="服務人員" required={!!sells.sellerId || !!sells.membershipUUID}>
          <EmployeeAutoComplete
            placeholder="服務人員姓名/編號"
            className="!mr-[12px] flex w-[200px]"
            value={sells.sellerId}
            autoFocus={focus === "employee"}
            onFocus={(event) => handleFocus({ event, field: "employee" })}
            onKeyDown={(event) => handleKeyDown({ event, nextField: "product" })}
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
          <RowIconButton label="從清單選擇會員卡" className={`mx-1.5 ${ROW_ICON_ALIGN_SMALL}`} onClick={handleOpenProductsModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className={`mx-1.5 h-8 w-8 shrink-0 ${ROW_ICON_ALIGN_SMALL}`} />
        )}
        <Field label="會員卡" required={!!sells.sellerId || !!sells.membershipUUID}>
          <MemberShipCardAutoComplete
            setMembershipAlready={setMembershipAlready}
            getData={setMembershipOptions}
            className="mr-[12px] flex w-[250px]"
            value={sells.membershipUUID}
            ref={productRef}
            autoFocus={focus === "product"}
            onFocus={(event) => handleFocus({ event, field: "product" })}
            onKeyDown={(event) => handleKeyDown({ event, nextField: "price" })}
            inputProps={{
              "data-testid": `memberShipCardSells-${index}-product`,
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
            }}
          />
        </Field>
        {sells.membershipUUID ? (
          <React.Fragment>
            <Field label="價格" className="!mr-[12px] flex w-[90px]">
              <TextField
                fullWidth
                variant="outlined"
                value={sells.price}
                inputRef={priceRef}
                inputProps={{
                  "data-testid": `memberShipCardSells-${index}-price`,
                }}
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
                onKeyDown={(event) => handleKeyDown({ event, nextField: "date" })}
                disabled={!!(sells.isLocked === 'TRUE' || sells.isLocked === 'UNSET')}
              />
            </Field>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* 必填 *：checkMembershipOrders 要求有效到期日；勾「永久會籍」（expiryDate 為 null）時欄位停用、不必填（同打帳單） */}
              <Field label="到期日" required={sells.expiryDate !== null}>
                <MobileDatePicker
                  className="!mr-[12px] flex w-[200px]"
                  inputRef={dateRef}
                  value={sells.expiryDate}
                  format="yyyy/MM/dd"
                  minDate={addDays(new Date(bill.date), 1)}
                  maxDate={addYears(new Date(bill.date), 50)}
                  disabled={sells.expiryDate === null}
                  autoFocus={focus === "date"}
                  onFocus={(event) => handleFocus({ event, field: "date" })}
                  onError={(error) => setDateError(error)}
                  localeText={{
                    toolbarTitle: '選擇日期'
                  }}
                  slotProps={{
                    textField: {
                      onFocus: event => handleFocus({ event, field: "date" }),
                      // 到期日 Enter 跳到「永久會籍」（同其他三頁；原本跳第三方卡券，沒開第三方卡券時游標停在原地）
                      onKeyDown: event => handleKeyDown({ event, nextField: "checkbox" }),
                      helperText: checkMessage(dateError)
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
                // 永久會籍 Enter：有開第三方卡券時跳第三方卡券，否則跳備註
                onKeyDown={(event) =>
                  handleKeyDown({ event, nextField: thirdPartTicket ? "thirdParty" : "remark" })
                }
                onChange={(value) => {
                  // 取消勾選：到期日＝帳單日＋有效天數（同剛選的卡）。佇列帶回的列沒有有效天數，依會員卡清單查；
                  // 卡已不在清單時查不到，到期日為無效日期待櫃檯選，重試時提示「會員卡到期日有誤」（coverage wave 1，2026/10/22）。
                  // 原本的 validDayCount 分支（帳單詳細的已購會員卡）本頁的列不會有，已移除
                  // 有效天數為 0（終身卡）時沒有可帶的到期日：帳單日當天已早於可選的最早日期，視同查不到，留空待櫃檯選（Codex review PR #265）
                  const effecitveDay = sells.effecitveDay ?? idx(
                    membershipOptions.find((d) => d.uuid === sells.membershipUUID),
                    (_) => _.effecitveDay
                  );
                  onChange({
                    index,
                    key: "expiryDate",
                    value:
                      sells.expiryDate === null
                        ? effecitveDay > 0 ? addDays(new Date(bill.date), effecitveDay).getTime() : NaN
                        : null,
                  });
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              {thirdPartTicket && (
                <Field label="第三方卡券">
                  <ThirdPartyAutoComplete
                    fieldProps={{ placeholder: '第三方卡券' }}
                    className="!mr-[12px] flex w-[200px]"
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
              {teachingMode && <p className="m-0 text-[0.8125rem] font-bold">勾選將入業績但不收費用**</p>}
              {sells.thirdPartyCouponMerchantId &&
                thirdPartyCoupons.map((data) => {
                  if (data.id === sells.thirdPartyCouponMerchantId) {
                    return (
                      <p key={data.id} className="m-0 text-[0.8125rem] font-bold">
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
            <Field label="備註" className="!mr-[12px] flex w-[200px]">
              <TextField
                fullWidth
                value={sells.remark}
                variant="outlined"
                name="remark"
                inputRef={remarkRef}
                autoFocus={focus === "remark"}
                InputLabelProps={{
                  shrink: true,
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    changeRowFocus(index + 1);
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
          label="清除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`}
          onClick={function () {
            onClear({ index });
          }}
          data-testid={`merchantSsell-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first ? (
          <RowIconButton
            label="刪除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`}
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
          titleByCategory={false}
        />
      )}
    </Fragment>
  );
};

export default MemberShipCardSells;
