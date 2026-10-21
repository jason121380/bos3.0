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
import { MobileDatePicker } from 'ui/date-picker'

import MemberShipCardSellsModal from "views/OrderShared/MemberShipCardSellsModal";
import { useMembershipPicker } from "views/OrderShared/useItemPicker";


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
  expanded,
  thirdPartTicket,
  getData
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
  const [dateError, setDateError] = useState('')

  useEffect(() => {
    if (expanded && focusFirstField) {
      idx(employeeRef, (_) => _.current.focus());
      setFocus("employee");
    }
  }, [expanded, focusFirstField]);

  const handleFocus = ({ event, field }) => {
    let setted = false;
    if (!setted) {
      setFocus(field);
      setted = true;
      event.target.focus();
    }
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

  
  const checkMessage = (msg) => {
    switch (msg) {
      case NaN:
        return "時間有誤";
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
      <div className="mb-6 flex flex-wrap items-end justify-start gap-y-[12px]">
        {/* 必填 *：Footer 送出前 helper/billVerify.js checkMembershipOrders 要求 sellerId、membershipUUID 與有效到期日；sellerId 與 membershipUUID 皆空的列會被 handleTidyBill 丟掉，所以該列有填任一欄才標必填 */}
        <Field label="服務人員" required={!!sells.sellerId || !!sells.membershipUUID}>
        <EmployeeAutoComplete
          className="!mr-[12px] flex w-[200px]"
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
        />
        </Field>
        {index === 0 ? (
          <RowIconButton label="從清單選擇會員卡" className="mx-1.5" onClick={handleOpenProductsModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        <Field label="會員卡" required={!!sells.sellerId || !!sells.membershipUUID}>
        <MemberShipCardAutoComplete
          setMembershipAlready={setMembershipAlready}
          className="mr-[12px] flex w-[250px] max-w-full"
          inputProps={{ placeholder: '會員卡名稱/代號' }}
          value={sells.membershipUUID}
          ref={productRef}
          autoFocus={focus === "product"}
          onFocus={(event) => handleFocus({ event, field: "product" })}
          getData={getData}
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
            <Field label="價格" className="!mr-[12px] flex w-[65px]">
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
                onKeyDown={(event) =>
                  handleKeyDown({ event, nextField: "thirdParty" })
                }
                onChange={(value) => {
                  onChange({
                    index,
                    key: "expiryDate",
                    value:
                      sells.expiryDate === null
                        ? sells.validDayCount === undefined
                          ? addDays(new Date(bill.date), sells.effecitveDay).getTime()
                          : sells.validDayCount === null ? addDays(new Date(sells.purchaseDate), sells.effecitveDay).getTime()
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
                  className="!mr-[12px] flex w-[200px]"
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
              {teachingMode && <p className="m-0 text-[0.8125rem] font-bold">勾選將入業績但不收費用**</p>}
              {sells.thirdPartyCouponMerchantId &&
                thirdPartyCoupons.map((data) => {
                  if (data.id === sells.thirdPartyCouponMerchantId) {
                    return (
                      <p className="m-0 text-[0.8125rem] font-bold" key={data.id} style={{ marginTop: '4px' }}>
                        扣完後業績:
                        {Math.round((sells.price * (100 - data.fee)) / 100)}
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
              placeholder="備註"
              name="remark"
              inputRef={remarkRef}
              autoFocus={focus === "remark"}
              InputLabelProps={{
                shrink: true,
              }}
              onKeyDown={(event) => {
                setTimeout(() => {
                  if (event.key === "Enter") {
                    changeRowFocus(index + 1);
                  }
                }, 1)
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
          label="清除此列" className="mr-1.5"
          onClick={function () {
            onClear({ index });
          }}
          data-testid={`merchantSsell-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first ? (
          <RowIconButton
            label="刪除此列" className="mr-1.5"
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
        />
      )}
    </Fragment>
  );
};

export default MemberShipCardSells;
