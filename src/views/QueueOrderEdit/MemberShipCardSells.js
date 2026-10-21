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
import produce from "immer";
import TeachingModeContext from "context/teachingModeContext";
import billContext from "context/keyInContext";
import { addDays, addYears, format, startOfDay } from "date-fns";
import { useFetchThirdPartysForCreateOrder } from "hooks/useFetchMerchant";
import { useFetchGetMembershipsForModal } from "hooks/useFetchGetMembership";
import { useFetchGetMembershipCategories } from "hooks/useFetchGetMembershipCategory";
import { MobileDatePicker } from 'ui/date-picker'

import MemberShipCardSellsModal from "views/OrderShared/MemberShipCardSellsModal";

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
  const thirdPartyRef = React.useRef();
  const remarkRef = React.useRef();
  const [focus, setFocus] = React.useState("");
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState([]);
  const [selectedCategorieName, setSelectedCategorieName] = useState([]);
  const [productList, setProductList] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [setting, setSetting] = useState({
    isAvailableForSale: true,
    pageLimit: 50,
    pageOffset: 0,
    keyword: "",
    categoryUUIds: [],
  });
  const [dateError, setDateError] = useState('')
  const products = useFetchGetMembershipsForModal(setting);
  const productCategoriesData = useFetchGetMembershipCategories({});

  useEffect(() => {
    if (!products.loading && !productCategoriesData.loading) {
      const productList = idx(products, (_) => _.data.memberships);
      const productCategories = idx(productCategoriesData, (_) => _.data.membershipCategories);
      setProductList({
        ...productList,
      });
      setProductCategories(productCategories);
    }
  }, [products.loading, products.data, productCategoriesData.loading]);

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

  const handleOpenProductsModal = () => {
    if (!products.loading) {
      setProductsModalOpen(!productsModalOpen);
    }
  };

  const handleCloseProductsModal = () => {
    setProductsModalOpen(false);
    setSelectedCategorie([]);
    setSelectedCategorieName([]);
    setSetting({
      keyword: "",
      categoryUUIds: [],
    });
  };

  const handlePageChange = ({ value, key }) => {
    setSetting(
      produce((draft) => {
        draft[key] = value;
      })
    );
  };
  const selectThirdParty = (e) => {
    if (e !== null) {
      onCardChange({
        index,
        value: {
          ...sells,
          thirdPartyCouponMerchantId: e.id,
        },
      });
    } else {
      onCardChange({
        index,
        value: {
          ...sells,
          thirdPartyCouponMerchantId: null,
        },
      });
    }
  };
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
          <RowIconButton label="從清單選擇會員卡" className="mx-1.5" onClick={handleOpenProductsModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        <Field label="會員卡" required={!!sells.sellerId || !!sells.membershipUUID}>
          <MemberShipCardAutoComplete
            setMembershipAlready={setMembershipAlready}
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
                      onKeyDown: event => handleKeyDown({ event, nextField: "thirdParty" }),
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
                checked={sells.expiryDate === null}
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
          productsModalOpen={productsModalOpen}
          productList={productList}
          productCategories={productCategories}
          closeModal={handleCloseProductsModal}
          selectedCategorie={selectedCategorie}
          setSelectedCategorie={setSelectedCategorie}
          selectedCategorieName={selectedCategorieName}
          setSelectedCategorieName={setSelectedCategorieName}
          setSetting={setSetting}
          onCardChange={onCardChange}
          sells={sellsItem}
          productLength={productLength}
          sellsItem={sells}
          onPageChange={handlePageChange}
          setProductsModalOpen={setProductsModalOpen}
          titleByCategory={false}
        />
      )}
    </Fragment>
  );
};

export default MemberShipCardSells;
