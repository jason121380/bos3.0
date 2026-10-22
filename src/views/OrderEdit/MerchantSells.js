import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
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
import { formatNumber } from 'ui/format'
import { ROW_ICON_ALIGN } from 'views/OrderShared/rowAlign'


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
  thirdPartTicket,
  getData
}) {
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext
  const { thirdPartyCoupons, setProductAlready } = useContext(billContext)

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
    // 新增列、展開區塊、從上一列按 Enter 移過來時游標跳到服務人員；使用者自己點了這一列的欄位（焦點已在本列欄位上）時不搶焦點
    const fieldFocused = [employeeRef, productRef, priceRef, countRef, thirdPartyRef]
      .some(ref => ref.current && ref.current === document.activeElement)
    if (expanded && focusFirstField && !fieldFocused) {
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

  const selectThirdParty = e => {
    if (e !== null) {
      onProductChange({
        index,
        value: {
          ...sells,
          thirdPartyCouponMerchantId: e.id,
        },
      })
    } else {
      onProductChange({
        index,
        value: {
          ...sells,
          thirdPartyCouponMerchantId: null,
        },
      })
    }
  }
  return (
    <Fragment>
      <div className="mb-6 flex flex-wrap items-start justify-start gap-y-[12px]">
        {/* 必填 *：Footer 送出前 helper/billVerify.js checkProductOrders 要求 sellerId 與 productId；兩者都空的列會被 handleTidyBill 丟掉，所以該列有填任一欄才標必填 */}
        <Field label="服務人員" required={!!sells.sellerId || !!sells.productId}>
        <EmployeeAutoComplete
          // 與同列輸入框同高（36px、手機 40px）
          size="medium"
          className="!mr-[12px] flex !w-[150px] !min-w-[150px]"
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
        />
        </Field>
        {index === 0 ? (
          <RowIconButton label="從清單選擇商品" className={`mx-1.5 ${ROW_ICON_ALIGN}`} onClick={handleOpenProductsModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className={`mx-1.5 h-8 w-8 shrink-0 ${ROW_ICON_ALIGN}`} />
        )}
        <Field label="商品" required={!!sells.sellerId || !!sells.productId}>
        <ProductAutoComplete
          setProductAlready={setProductAlready}
          className="mr-[12px] flex w-[250px] max-w-full"
          inputProps={{ placeholder: '商品代號/名稱' }}
          value={sells.productId}
          ref={productRef}
          autoFocus={focus === 'product'}
          onFocus={event => handleFocus({ event, field: 'product' })}
          onKeyDown={event => handleKeyDown({ event, nextField: 'price' })}
          getData={getData}
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
        />
        </Field>
        {sells.productId ? (
          <React.Fragment>
            <Field label="價格" className="!mr-[12px] flex w-[65px]">
            <TextField
              fullWidth
              variant="outlined"
              value={sells.price}
              inputRef={priceRef}
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
              inputProps={{
                'data-testid': `merchantSsell-${index}-price`,
              }}
              disabled={!!(sells.isLocked === 'TRUE' || sells.isLocked === 'UNSET')}
            />
            </Field>
            <Field label="數量" className="!mr-[12px] flex w-[65px]">
            <TextField
              fullWidth
              variant="outlined"
              value={sells.count}
              inputRef={countRef}
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
              inputProps={{
                'data-testid': `merchantSsell-${index}-count`,
              }}
            />
            </Field>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {thirdPartTicket && (
                <Field label="第三方卡券">
                <ThirdPartyAutoComplete
                  className="!mr-[12px] flex !w-[150px] !min-w-[150px]"
                  fieldProps={{ placeholder: '第三方卡券' }}
                  value={sells.thirdPartyCouponMerchantId}
                  ref={thirdPartyRef}
                  autoFocus={focus === 'thirdParty'}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      changeRowFocus(index + 1)
                    }
                  }}
                  name="thirdParty"
                  onChange={e => selectThirdParty(e)}
                />
                </Field>
              )}
              {teachingMode && (
                <p className="m-0 text-[0.8125rem] font-bold">勾選將入業績但不收費用**</p>
              )}
              {sells.thirdPartyCouponMerchantId &&
                thirdPartyCoupons.map(data => {
                  if (data.id === sells.thirdPartyCouponMerchantId) {
                    return (
                      <p className="m-0 text-[0.8125rem] font-bold" style={{ marginTop: '4px' }}>
                        扣完後業績:
                        {/* 比照打帳單與 Services.js：PERCENT 按比例，其他類型（固定金額）減去手續費 */}
                        {data.type === 'PERCENT'
                          ? formatNumber(Math.round((sells.price * (100 - data.fee)) / 100))
                          : formatNumber(Math.round(sells.price - data.fee))}
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
          label="清除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`}
          onClick={function () {
            onClear({ index })
          }}
          data-testid={`merchantSsell-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first ? (
          <RowIconButton
            label="刪除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`}
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
