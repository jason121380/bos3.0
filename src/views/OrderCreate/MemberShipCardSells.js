/** @jsxImportSource @emotion/react */
import { Field, Input } from 'ui/input'
import { CheckboxField } from 'ui/checkbox'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from './RowAction'
import EmployeeAutoComplete from "components/EmployeeAutoComplete";
import MemberShipCardAutoComplete from "components/MemberShipCardAutoComplete";
import ThirdPartyAutoComplete from "components/ThirdPartyAutoComplete";
import idx from "idx";
import React, { Fragment, useState, useEffect, useContext } from "react";
import produce from "immer";
import TeachingModeContext from "context/teachingModeContext";
import { useFetchThirdPartysForCreateOrder } from "hooks/useFetchMerchant";
import { addDays, addYears, format, startOfDay } from "date-fns";
import { useFetchGetMembershipsForModal } from "hooks/useFetchGetMembership";
import { useFetchGetMembershipCategories } from "hooks/useFetchGetMembershipCategory";
import { MobileDatePicker } from '@mui/x-date-pickers'
import billContext from 'context/keyInContext'

import styles from "./styles/MemberShipCardSells";
import MemberShipCardSellsModal from "./MemberShipCardSellsModal";

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
  expanded,
  focusRow,
  changeRowFocus,
  sells,
  productLength,
  thirdPartTicket,
  getData
}) => {
  const techingModeContext = useContext(TeachingModeContext);
  const { teachingMode } = techingModeContext;
  const { bill, setMembershipAlready } = React.useContext(billContext)

  const thirdPartyCouponsData = useFetchThirdPartysForCreateOrder();

  const employeeRef = React.useRef();
  const productRef = React.useRef();
  const priceRef = React.useRef();
  const checkbox = React.useRef();
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
      const productCategories = idx(
        productCategoriesData,
        (_) => _.data.membershipCategories
      );
      setProductList({
        ...productList,
      });
      setProductCategories(productCategories);
    }
  }, [products.loading, products.data, productCategoriesData.loading]);

  React.useEffect(() => {
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
      <div css={styles.merchantSells}>
        {/* 必填 *：helper/billVerify.js checkMembershipOrders 要求 sellerId、membershipUUID、有效到期日；兩者都空的列會被 handleTidyBill 丟掉，所以該列有填任一欄才標必填 */}
        <Field label="服務人員" required={!!sellsItem.sellerId || !!sellsItem.membershipUUID}>
          <EmployeeAutoComplete
            placeholder="服務人員姓名/編號"
            className={styles.field}
            value={sellsItem.sellerId}
            ref={employeeRef}
            onChange={(value) => {
              onChange({
                index,
                key: "sellerId",
                value: idx(value, (_) => _.userId),
              });
            }}
            autoFocus={focus === "employee"}
            onFocus={(event) => handleFocus({ event, field: "employee" })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setTimeout(() => {
                  handleKeyDown({ event, nextField: "product" })
                }, 1)
              }
            }}
            tabIndex={focusRow + "0"}
          />
        </Field>
        {index === 0 ? (
          <RowIconButton label="從清單選擇會員卡" className="mx-1.5" onClick={handleOpenProductsModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        <Field label="會員卡" required={!!sellsItem.sellerId || !!sellsItem.membershipUUID}>
          <MemberShipCardAutoComplete
            className={styles.productField}
            value={sellsItem.membershipUUID}
            ref={productRef}
            autoFocus={focus === "product"}
            onFocus={(event) => handleFocus({ event, field: "product" })}
            tabIndex={focusRow + "1"}
            setMembershipAlready={setMembershipAlready}
            getData={getData}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                if (sellsItem.isLocked !== 'FALSE' && sellsItem.expiryDate === null) {
                  handleKeyDown({ event, nextField: "checkbox" })
                } else if (sellsItem.isLocked === 'FALSE') {
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
                    ...sellsItem,
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
            inputProps={{ placeholder: '會員卡名稱/代號' }}
          />
        </Field>
        {sellsItem.membershipUUID && (
          <React.Fragment>
            <Field label="價格" css={styles.priceField}>
              <Input
                value={sellsItem.price}
                ref={dateRef}
                tabIndex={focusRow + "3"}
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
                  handleKeyDown({ event, nextField: sellsItem.expiryDate === null ? 'checkbox' : 'date' })
                }}
                disabled={!!(sellsItem.isLocked === 'TRUE' || sellsItem.isLocked === 'UNSET')}
              />
            </Field>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Field label="到期日" required={sellsItem.expiryDate !== null}>
                <MobileDatePicker
                  css={styles.dateField}
                  inputRef={dateRef}
                  value={sellsItem.expiryDate}
                  format="yyyy/MM/dd"
                  minDate={addDays(new Date(bill.date), 1)}
                  maxDate={addYears(new Date(bill.date), 50)}
                  disabled={sellsItem.expiryDate === null}
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
                checked={sellsItem.expiryDate === null}
                name="checkbox"
                onFocus={(event) => handleFocus({ event, field: "checkbox" })}
                onKeyDown={(event) =>
                  handleKeyDown({ event, nextField: "thirdParty" })
                }
                onChange={(value) => {
                  onChange({
                    index,
                    key: "expiryDate",
                    value:
                      sellsItem.expiryDate === null
                        ? addDays(new Date(bill.date), sellsItem.effecitveDay).getTime()
                        : null,
                  });
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {thirdPartTicket && (
                <Field label="第三方卡券">
                  <ThirdPartyAutoComplete
                    fieldProps={{ placeholder: '第三方卡券' }}
                    className={styles.field}
                    autoFocus={focus === "thirdParty"}
                    value={sellsItem.thirdPartyCouponMerchantId}
                    ref={thirdPartyRef}
                    onKeyDown={(event) =>
                      handleKeyDown({ event, nextField: "remark" })
                    }
                    name="thirdParty"
                    onChange={(e) => {
                      onCardChange({
                        index,
                        value: {
                          ...sellsItem,
                          thirdPartyCouponMerchantId: e ? e.id : null,
                        },
                      });
                    }}
                    onFocus={(event) => handleFocus({ event, field: "thirdParty" })}
                  />
                </Field>
              )}
              {teachingMode && (
                <p className="m-0" css={styles.heading2}>
                  勾選將入業績但不收費用**
                </p>
              )}
              {!thirdPartyCouponsData.loading &&
                sellsItem.thirdPartyCouponMerchantId &&
                idx(thirdPartyCouponsData, (_) =>
                  _.data.merchant.thirdpartyCoupons.map((data) => {
                    if (data.id === sellsItem.thirdPartyCouponMerchantId) {
                      return (
                        <p className="m-0" key={data.id} css={styles.heading2} style={{ marginTop: '4px' }}>
                          {`扣完後業績:${Math.round((sellsItem.price * (100 - data.fee)) / 100)}`}
                        </p>
                      );
                    }
                  })
                )}
            </div>
            <Field label="備註" css={styles.field}>
              <Input
                value={sellsItem.remark}
                name="remark"
                ref={remarkRef}
                autoFocus={focus === "remark"}
                InputLabelProps={{
                  shrink: true,
                }}
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
        )}

        <RowIconButton
          label="清除此列" className="mr-1.5"
          onClick={() => {
            onClear({ index });
            setFocus("employee");
          }}
          data-testid={`merchantSsell-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first && (
          <RowIconButton
            label="刪除此列" className="mr-1.5"
            onClick={() => {
              removeSells({ index });
              setFocus("employee");
            }}
            data-testid={`merchantSsell-${index}-delete`}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        )}
      </div>
      {last && (
        <AddRowButton
          onClick={() => {
            addSells();
            setFocus("employee");
          }}
          data-testid={`merchantSsell-${index}-add`}
        />
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
          sells={sells}
          productLength={productLength}
          sellsItem={sellsItem}
          onPageChange={handlePageChange}
          setProductsModalOpen={setProductsModalOpen}
        />
      )}
    </Fragment>
  );
};

export default MemberShipCardSells;
