import { Field, Input } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import ProductAutoComplete from 'components/ProductAutoComplete'
import ThirdPartyAutoComplete from 'components/ThirdPartyAutoComplete'
import idx from 'idx'
import React, { Fragment, useState, useEffect, useContext, useRef } from 'react'
import TeachingModeContext from 'context/teachingModeContext'
import billContext from 'context/keyInContext'

import ProductsModal from 'views/OrderShared/ProductsModal'
import { useProductPicker } from 'views/OrderShared/useItemPicker'

// 版面比照打帳單（views/OrderCreate/styles/MerchantSells）：欄位上方標籤、靠底對齊、窄螢幕換行不擠壓
// 原 emotion styles 逐值轉 Tailwind（spacing 單位 8px；pxToRem 以 16px 換算）。自動完成元件的 className 原以 css={className} 套在根節點
const styles = {
  merchantSells: 'flex items-end justify-start flex-wrap gap-y-[12px] mb-[24px]',
  field: 'w-[250px] flex mr-[12px]',
  employeeField: 'w-[200px] min-w-[150px] flex mr-[12px]',
  thirdPartyField: 'w-[150px] min-w-[150px] flex mr-[12px]',
  priceField: 'w-[65px] flex mr-[12px]',
  heading2: 'text-[0.8125rem] font-bold',
}

export default function MerchantSells({
  sells,
  expanded,
  onChange,
  onClear,
  index,
  addSells,
  removeSells,
  onProductChange,
  first,
  last,
  sellsItem,
  productLength,
  focusFirstField,
  changeRowFocus,
  focusRow,
  setFocusRow,
  thirdPartTicket,
}) {
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext
  const { thirdPartyCoupons } = useContext(billContext)

  // 「從清單選擇」彈窗的狀態與清單查詢（OrderShared/useItemPicker，四頁共用）
  const { productsModalOpen, handleOpenProductsModal, modalProps: pickerModalProps } = useProductPicker()
  const employeeRef = useRef()
  const productRef = useRef()
  const priceRef = useRef()
  const countRef = useRef()
  const thirdPartyRef = useRef()
  const [focus, setFocus] = useState('')

  useEffect(() => {
    switch (focus) {
      case 'employee':
        idx(employeeRef, _ => _.current.focus())
        break
      case 'product':
        idx(productRef, _ => _.current.focus())
        break
      case 'price':
        idx(priceRef, _ => _.current.focus())
        break
      case 'count':
        idx(countRef, _ => _.current.focus())
        break
      case 'thirdParty':
        idx(thirdPartyRef, _ => _.current.focus())
        break
      default:
        break
    }
  }, [focus])

  useEffect(() => {
    if (expanded && focusFirstField) {
      idx(employeeRef, _ => _.current.focus())
      setFocus('employee')
    }
  }, [expanded, focusFirstField])

  const handleFocus = ({ event, field }) => {
    let setted = false
    if (!setted) {
      setFocus(field)
      setted = true
      event.target.focus()
    }
    if (field === 'price' || field === 'count') {
      event.target.select()
    }
    setFocusRow(index)
  }
  const handleKeyDown = ({ event, nextField }) => {
    if (event.key === 'Enter') {
      setFocus(nextField)
    }
  }

  return (
    <Fragment>
      <div className={styles.merchantSells}>
        {/* 必填 *：helper/billVerify.js checkProductOrders 要求每列有 sellerId 與 productId。
            本頁 PannelMerchantSells 只把 count > 0 的列寫入 bill.productOrders（選了商品才會變成 1），
            handleTidyBill 再丟掉兩欄皆空的列，所以：選了商品、或填了服務人員且數量 > 0 的列才標必填 */}
        <Field label="服務人員" required={!!sells.productId || (!!sells.sellerId && sells.count > 0)}>
          <EmployeeAutoComplete
            className={styles.employeeField}
            placeholder="服務人員姓名/編號"
            value={sells.sellerId}
            ref={employeeRef}
            autoFocus={focus === 'employee'}
            onFocus={event => handleFocus({ event, field: 'employee' })}
            onKeyDown={event => handleKeyDown({ event, nextField: 'product' })}
            onChange={function (value) {
              onChange({
                index,
                key: 'sellerId',
                value: idx(value, _ => _.userId),
              })
            }}
            inputProps={{
              'data-testid': `merchantSsell-${index}-employee`,
            }}
          />
        </Field>
        {index === 0 ? (
          <RowIconButton label="從清單選擇商品" className="mx-1.5" onClick={handleOpenProductsModal}>
            <Copy aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        <Field label="商品" required={!!sells.productId || (!!sells.sellerId && sells.count > 0)}>
          <ProductAutoComplete
            className={styles.field}
            value={sells.productId}
            ref={productRef}
            autoFocus={focus === 'product'}
            onFocus={event => handleFocus({ event, field: 'product' })}
            onKeyDown={event => handleKeyDown({ event, nextField: 'price' })}
            onChange={function (value) {
              idx(value, _ => {
                onProductChange({
                  index,
                  value: {
                    ...sells,
                    productId: _.id,
                    price: _.sellPrice,
                    count: 1,
                    isLocked: _.isLocked,
                  },
                })
              })
            }}
            inputProps={{
              'data-testid': `merchantSsell-${index}-product`,
              placeholder: '商品代號/名稱',
            }}
          />
        </Field>
        {sells.productId ? (
          <React.Fragment>
            <Field label="價格" className={styles.priceField}>
              <Input
                value={sells.price}
                ref={priceRef}
                autoFocus={focus === 'price'}
                onFocus={event => handleFocus({ event, field: 'price' })}
                onKeyDown={event => handleKeyDown({ event, nextField: 'count' })}
                onChange={function (value) {
                  onChange({
                    index,
                    key: 'price',
                    value: idx(value, _ => +_.target.value || 0),
                  })
                }}
                data-testid={`merchantSsell-${index}-price`}
                disabled={!!(sells.isLocked === 'TRUE' || sells.isLocked === 'UNSET')}
              />
            </Field>
            <Field label="數量" className={styles.priceField}>
              <Input
                value={sells.count}
                ref={countRef}
                autoFocus={focus === 'count'}
                onFocus={event => handleFocus({ event, field: 'count' })}
                onKeyDown={event => handleKeyDown({ event, nextField: 'thirdParty' })}
                onChange={function (value) {
                  onChange({
                    index,
                    key: 'count',
                    value: idx(value, _ => +_.target.value || 0),
                  })
                }}
                data-testid={`merchantSsell-${index}-count`}
              />
            </Field>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {thirdPartTicket && (
                <Field label="第三方卡券">
                  <ThirdPartyAutoComplete
                    className={styles.thirdPartyField}
                    fieldProps={{ placeholder: '第三方卡券' }}
                    value={sells.thirdPartyCouponMerchantId}
                    ref={thirdPartyRef}
                    autoFocus={focus === 'thirdParty'}
                    onFocus={event => handleFocus({ event, field: 'thirdParty' })}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        changeRowFocus(index + 1)
                      }
                    }}
                    onChange={e =>
                      idx(e, _ => {
                        onProductChange({
                          index,
                          value: {
                            ...sells,
                            thirdPartyCouponMerchantId: e ? e.id : null,
                          },
                        })
                      })
                    }
                    name="thirdParty"
                    inputProps={{
                      'data-testid': `service-${index}-thirdParty`,
                    }}
                  />
                </Field>
              )}
              {teachingMode && (
                <p className={`m-0 ${styles.heading2}`}>勾選將入業績但不收費用**</p>
              )}
              {sells.thirdPartyCouponMerchantId &&
                thirdPartyCoupons.map(data => {
                  if (data.id === sells.thirdPartyCouponMerchantId) {
                    return (
                      <p className={`m-0 ${styles.heading2}`} style={{ marginTop: '4px' }}>
                        扣完後業績:{Math.round((sells.price * (100 - data.fee)) / 100)}
                      </p>
                    )
                  }
                  return undefined
                })}
            </div>
          </React.Fragment>
        ) : (
          ''
        )}

        <RowIconButton
          label="清除此列"
          className="mr-1.5"
          onClick={function () {
            onClear({ index })
          }}
          data-testid={`merchantSsell-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first ? (
          <RowIconButton
            label="刪除此列"
            className="mr-1.5"
            onClick={function () {
              removeSells({ index })
            }}
            data-testid={`merchantSsell-${index}-delete`}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        ) : (
          ''
        )}
      </div>
      {last ? (
        <AddRowButton
          onClick={function () {
            addSells()
          }}
          data-testid={`merchantSsell-${index}-add`}
        />
      ) : (
        ''
      )}
      {productsModalOpen && (
        <ProductsModal
          {...pickerModalProps}
          onProductChange={onProductChange}
          sells={sellsItem}
          productLength={productLength}
          sellsItem={sells}
        />
      )}
    </Fragment>
  )
}
