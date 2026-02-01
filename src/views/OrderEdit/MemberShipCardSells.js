/** @jsxImportSource @emotion/react */
import { TextField, Typography, Checkbox, FormControlLabel } from '@mui/material'
import AddIcon from "@mui/icons-material/Add";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EmployeeAutoComplete from "components/EmployeeAutoComplete";
import MemberShipCardAutoComplete from "components/MemberShipCardAutoComplete";
import ThirdPartyAutoComplete from "components/ThirdPartyAutoComplete";
import idx from "idx";
import React, { Fragment, useState, useEffect, useContext } from "react";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import produce from "immer";
import TeachingModeContext from "context/teachingModeContext";
import billContext from "context/keyInContext";
import { addDays, addYears, format, startOfDay } from "date-fns";
import { useFetchGetMembershipsForModal } from "hooks/useFetchGetMembership";
import { useFetchGetMembershipCategories } from "hooks/useFetchGetMembershipCategory";
import { MobileDatePicker } from '@mui/x-date-pickers'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import MemberShipCardSellsModal from "./MemberShipCardSellsModal";

const styles = {
  merchantSells: css({
    display: "flex",
    // alignItems: 'center',
    justifyContent: "flex-start",
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: "200px",
    display: "flex",
    marginRight: "12px !important",
  }),
  priceField: css({
    width: "65px",
    display: "flex",
    marginRight: "12px !important",
  }),
  checkbox: css({
    width: "100px",
    display: "flex",
    marginRight: "12px",
    "&:last-child": {
      marginRight: "0px",
    },
  }),
  action: css({
    width: "50px",
    display: "flex",
    marginRight: "12px",
    marginTop: "13px",
    alignItems: "center",
    cursor: "pointer",
    "&:last-child": {
      marginRight: "0px",
    },
  }),
  createIcon: css({
    cursor: "pointer",
    margin: "10px",
  }),
  heading2: css({
    fontSize: theme.typography.pxToRem(13),
    fontWeight: "bold",
  }),
  productField: css({
    width: "250px",
    display: "flex",
    marginRight: "12px",
  }),
  dateField: css({
    width: "200px",
    display: "flex",
    marginRight: "12px !important",
  }),
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
        <EmployeeAutoComplete
          className={styles.field}
          label="服務人員姓名/編號"
          value={sells.sellerId}
          ref={employeeRef}
          tabIndex={focusRow + "0"}
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
        {index === 0 ? (
          <FilterNoneIcon css={styles.createIcon} onClick={handleOpenProductsModal} />
        ) : (
          <span style={{ margin: "22px" }} />
        )}
        <MemberShipCardAutoComplete
          setMembershipAlready={setMembershipAlready}
          className={styles.productField}
          label="會員卡名稱/代號"
          value={sells.membershipUUID}
          ref={productRef}
          autoFocus={focus === "product"}
          onFocus={(event) => handleFocus({ event, field: "product" })}
          tabIndex={focusRow + "1"}
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
        {sells.membershipUUID ? (
          <React.Fragment>
            <TextField
              variant="outlined"
              label="價格"
              css={styles.priceField}
              value={sells.price}
              inputRef={priceRef}
              tabIndex={focusRow + "2"}
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <MobileDatePicker
                css={styles.dateField}
                label="到期日"
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
              <FormControlLabel
                control={<Checkbox color="primary" />}
                label="永久會籍"
                inputRef={checkbox}
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

            <div style={{ display: "block" }}>
              {thirdPartTicket && (
                <ThirdPartyAutoComplete
                  css={styles.field}
                  label="第三方卡券"
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
              )}
              {teachingMode && <Typography css={styles.heading2}>勾選將入業績但不收費用**</Typography>}
              {sells.thirdPartyCouponMerchantId &&
                thirdPartyCoupons.map((data) => {
                  if (data.id === sells.thirdPartyCouponMerchantId) {
                    return (
                      <Typography key={data.id} css={styles.heading2}>
                        扣完後業績:
                        {Math.round((sells.price * (100 - data.fee)) / 100)}
                      </Typography>
                    );
                  }
                })}
            </div>
            <TextField
              value={sells.remark}
              variant="outlined"
              label="備註"
              name="remark"
              inputRef={remarkRef}
              css={styles.field}
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
          </React.Fragment>
        ) : (
          ""
        )}

        <BackspaceOutlinedIcon
          css={styles.action}
          onClick={function () {
            onClear({ index });
          }}
          data-testid={`merchantSsell-${index}-clear`}
        />
        {!first ? (
          <DeleteForeverIcon
            css={styles.action}
            onClick={function () {
              removeSells({ index });
            }}
            data-testid={`merchantSsell-${index}-delete`}
          />
        ) : (
          ""
        )}
      </div>
      {last ? (
        <AddIcon
          css={styles.action}
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
        />
      )}
    </Fragment>
  );
};

export default MemberShipCardSells;
