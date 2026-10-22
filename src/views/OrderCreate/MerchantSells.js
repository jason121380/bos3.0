import { Field, Input } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from './RowAction'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import ProductAutoComplete from 'components/ProductAutoComplete'
import ThirdPartyAutoComplete from 'components/ThirdPartyAutoComplete'
import idx from 'idx'
import React, { Fragment, useState, useEffect, useContext } from 'react'
import TeachingModeContext from 'context/teachingModeContext'
import { useFetchThirdPartysForCreateOrder } from 'hooks/useFetchMerchant'

import ProductsModal from 'views/OrderShared/ProductsModal'
import { useProductPicker } from 'views/OrderShared/useItemPicker'
import { formatNumber } from 'ui/format'
import { ROW_ICON_ALIGN, ROW_ICON_ALIGN_SMALL } from 'views/OrderShared/rowAlign'

const styles = {
  merchantSells: 'flex items-start justify-start flex-wrap gap-y-[12px] mb-[24px]',
  field: '!min-w-[150px] flex mr-[12px]',
  productField: 'w-[250px] flex mr-[12px]',
  priceField: 'w-[65px] flex !mr-[12px]',
  heading2: 'text-[0.8125rem] font-bold',
}

function MerchantSells({
  sellsItem,
  onChange,
  onClear,
  index,
  addSells,
  removeSells,
  first,
  last,
  onProductChange,
  focusFirstField,
  expanded,
  focusRow,
  changeRowFocus,
  sells,
  productLength,
  thirdPartTicket,
}) {
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext

  const thirdPartyCouponsData = useFetchThirdPartysForCreateOrder()

  const employeeRef = React.useRef()
  const productRef = React.useRef()
  const priceRef = React.useRef()
  const countRef = React.useRef()
  const thirdPartyRef = React.useRef()
  const [focus, setFocus] = React.useState('')
  // 「從清單選擇」彈窗的狀態與清單查詢（OrderShared/useItemPicker，四頁共用）
  const { productsModalOpen, handleOpenProductsModal, modalProps: pickerModalProps } = useProductPicker()

  React.useEffect(() => {
    if (expanded && focusFirstField) {
      idx(employeeRef, _ => _.current.focus())
      setFocus('employee')
    }
  }, [expanded, focusFirstField])

  const handleFocus = ({ event, field }) => {
    setFocus(field)
    event.target.focus()
    if (field === 'price' || field === 'count') {
      event.target.select()
    }
    changeRowFocus(index)
  }
  const handleKeyDown = ({ event, nextField }) => {
    if (event.key === 'Enter') {
      setFocus(nextField)
    }
  }

  React.useEffect(() => {
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

  return (
    <Fragment>
      <div className={styles.merchantSells}>
        {/* 必填 *：helper/billVerify.js checkProductOrders 要求 sellerId 與 productId；兩者都空的列會被 handleTidyBill 丟掉，所以該列有填任一欄才標必填 */}
        <Field label="服務人員" required={!!sellsItem.sellerId || !!sellsItem.productId}>
          <EmployeeAutoComplete
            placeholder="服務人員姓名/編號"
            className={styles.field}
            value={sellsItem.sellerId}
            ref={employeeRef}
            onChange={value => {
              onChange({
                index,
                key: 'sellerId',
                value: idx(value, _ => _.userId),
              })
            }}
            autoFocus={focus === 'employee'}
            onFocus={event => handleFocus({ event, field: 'employee' })}
            onKeyDown={event => handleKeyDown({ event, nextField: 'product' })}
          />
        </Field>
        {index === 0 ? (
          <RowIconButton label="從清單選擇商品" className={`mx-1.5 ${ROW_ICON_ALIGN_SMALL}`} onClick={handleOpenProductsModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className={`mx-1.5 h-8 w-8 shrink-0 ${ROW_ICON_ALIGN_SMALL}`} />
        )}
        <Field label="商品" required={!!sellsItem.sellerId || !!sellsItem.productId}>
          <ProductAutoComplete
            className={styles.productField}
            value={sellsItem.productId}
            ref={productRef}
            autoFocus={focus === 'product'}
            onFocus={event => handleFocus({ event, field: 'product' })}
            onKeyDown={event => handleKeyDown({ event, nextField: 'price' })}
            isPublished
            onChange={value => {
              idx(value, _ => {
                onProductChange({
                  index,
                  value: {
                    ...sellsItem,
                    productId: _.id,
                    price: _.sellPrice,
                    count: 1,
                    isLocked: _.isLocked,
                  },
                })
              })
            }}
            inputProps={{ placeholder: '商品代號/名稱' }}
          />
        </Field>
        {sellsItem.productId && (
          <React.Fragment>
            <Field label="價格" className={styles.priceField}>
              <Input
                value={sellsItem.price}
                ref={priceRef}
                autoFocus={focus === 'price'}
                onFocus={event => handleFocus({ event, field: 'price' })}
                onKeyDown={event => handleKeyDown({ event, nextField: 'count' })}
                data-testid={`merchantSsell-${index}-price`}
                onChange={value => {
                  setFocus('price')
                  onChange({
                    index,
                    key: 'price',
                    value: idx(value, _ => +_.target.value || 0),
                  })
                }}
                disabled={!!(sellsItem.isLocked === 'TRUE' || sellsItem.isLocked === 'UNSET')}
              />
            </Field>
            <Field label="數量" className={styles.priceField}>
              <Input
                value={sellsItem.count}
                ref={countRef}
                autoFocus={focus === 'count'}
                onFocus={event => handleFocus({ event, field: 'count' })}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !thirdPartTicket) {
                    changeRowFocus(index + 1)
                  } else {
                    handleKeyDown({ event, nextField: 'thirdParty' })
                  }
                }}
                data-testid={`merchantSsell-${index}-count`}
                onChange={value => {
                  setFocus('count')
                  onChange({
                    index,
                    key: 'count',
                    value: idx(value, _ => +_.target.value || 0),
                  })
                }}
              />
            </Field>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {thirdPartTicket && (
                <Field label="第三方卡券">
                  <ThirdPartyAutoComplete
                    fieldProps={{ placeholder: '第三方卡券' }}
                    className={styles.field}
                    autoFocus={focus === 'thirdParty'}
                    value={sellsItem.thirdPartyCouponMerchantId}
                    ref={thirdPartyRef}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        changeRowFocus(index + 1)
                      }
                    }}
                    name="thirdParty"
                    onChange={e => {
                      onProductChange({
                        index,
                        value: {
                          ...sellsItem,
                          thirdPartyCouponMerchantId: e ? e.id : null,
                        },
                      })
                    }}
                    inputProps={{
                      'data-testid': `service-${index}-thirdParty`,
                    }}
                  />
                </Field>
              )}
              {!thirdPartyCouponsData.loading &&
                sellsItem.thirdPartyCouponMerchantId &&
                idx(thirdPartyCouponsData, _ =>
                  // 原本少了 .data（永遠讀不到、不顯示），且一律以百分比計算；改與服務項目（Services.js）相同：
                  // PERCENT 依百分比扣、其他（固定金額）直接扣手續費
                  _.data.merchant.thirdpartyCoupons.map(data => {
                    if (data.id === sellsItem.thirdPartyCouponMerchantId) {
                      if (data.type === 'PERCENT') {
                        return (
                          <p className={`m-0 ${styles.heading2}`} key={data.id} style={{ marginTop: '4px' }}>
                            {`扣完後業績:${formatNumber(Math.round((sellsItem.price * (100 - data.fee)) / 100))}`}
                          </p>
                        )
                      } else {
                        return (
                          <p className={`m-0 ${styles.heading2}`} key={data.id} style={{ marginTop: '4px' }}>
                            {`扣完後業績:${formatNumber(Math.round(sellsItem.price - data.fee))}`}
                          </p>
                        )
                      }
                    }
                    return undefined
                  })
                )}
              {teachingMode && (
                <p className={`m-0 ${styles.heading2}`}>勾選將入業績但不收費用**</p>
              )}
            </div>
          </React.Fragment>
        )}

        <RowIconButton
          label="清除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`}
          onClick={() => {
            onClear({ index })
            setFocus('employee')
          }}
          data-testid={`merchantSsell-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first && (
          <RowIconButton
            label="刪除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`}
            onClick={() => {
              removeSells({ index })
              setFocus('employee')
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
            addSells()
            setFocus('employee')
          }}
          data-testid={`merchantSsell-${index}-add`}
        />
      )}
      {productsModalOpen && (
        <ProductsModal
          {...pickerModalProps}
          onProductChange={onProductChange}
          sells={sells}
          productLength={productLength}
          sellsItem={sellsItem}
        />
      )}
    </Fragment>
  )
}

export default React.memo(MerchantSells)
