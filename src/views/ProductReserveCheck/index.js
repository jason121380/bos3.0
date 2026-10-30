import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import React, { useState, useEffect } from 'react'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { useFetchProductsInAutoComplete } from 'hooks/useFetchProducts'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchGetProductReserveCheck from 'hooks/useFetchGetProductReserveCheck'
import idx from 'idx'
import Results from './Results'
import { Button } from 'ui/button'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'
import { Autocomplete } from 'ui/combobox'
import QueryFailed from 'components/QueryFailed'

const ProductReserveCheck = () => {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const urlParams = new URLSearchParams(window.location.search)

  const getAllProducts = useFetchProductsInAutoComplete()
  const [getProductReserve, productReserveData] = useFetchGetProductReserveCheck()
  const [productsOptions, setProductOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [reportData, setReportData] = useState({
    reserveCheckSummary: [],
    productReserveChecks: [],
  })
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })
  const [productIds, setProductIds] = useState([])

  const selectAll = event => {
    event.stopPropagation()
    const data = idx(getAllProducts, _ => _.data.products.data)
    setProductIds(data)
  }

  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（handleSearch）；只在 [date] 變動時呼叫，補上會每次 render 重跑
  }, [date])

  useEffect(() => {
    if (!getAllProducts.loading) {
      const data = idx(getAllProducts, _ => _.data.products.data)
      setProductOptions(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getAllProducts.loading])

  useEffect(() => {
    if (!productReserveData.loading && productReserveData.error) {
      setReportData({
        reserveCheckSummary: [],
        productReserveChecks: [],
      })
      return
    }
    if (!productReserveData.loading && productReserveData.data !== undefined) {
      // 後端回 null（沒有報表）時當作沒有資料，不讓整頁拋錯
      const data = idx(productReserveData, _ => _.data.productReserveCheck)
      setReportData(data || { reserveCheckSummary: [], productReserveChecks: [] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [productReserveData.loading])

  useEffect(() => {
    if (productIds.length === 0) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（handleSearch）；只在 [productIds] 變動時呼叫，補上會每次 render 重跑
  }, [productIds])

  const handleSearch = (inputDate = date) => {
    const productId = productIds.map(d => d.id)
    getProductReserve({
      variables: {
        input: {
          dateRange: inputDate,
          productIds: productId,
        },
      },
    })
  }

  return (
    <Page className="ui-root" title="商品庫存盤點表">
      <PageHeader title="商品庫存盤點表" />
      <ReportToolbar
        date={
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />
        }
      />
      <div className="flex items-center gap-2.5 pb-6">
        <Autocomplete
          multiple
          fullWidth
          popupIcon={
            // 全選鈕：每頁只有一顆 primary（搜尋），故用 secondary（STYLE §2）
            <Button
              variant="secondary"
              size="sm"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
              disabled={getAllProducts.loading || productReserveData.loading || (productReserveData.data === undefined && !productReserveData.error)}
              onClick={selectAll}
            >
              全選
            </Button>
          }
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          value={productIds}
          options={productsOptions}
          disableCloseOnSelect
          getOptionLabel={option => option.name}
          onChange={(event, value) => setProductIds(value)}
          renderOption={(props, option, { selected }) => {
            props.key = props.id
            return (
              <li {...props}>
                <Checkbox style={{ color: 'rgb(var(--text))', marginRight: 8 }} icon={icon} checkedIcon={checkedIcon} checked={selected} />
                {/* 選項已先排除沒有代號的商品（filterOptions） */}
                {`${option.no} - ${option.name}`}
              </li>
            )
          }}
          filterOptions={(options, { inputValue }) => {
            const keyWord = inputValue.toLocaleLowerCase()
            const newOptions = options.filter(d => {
              if (d.no) {
                const no = d.no.toLocaleLowerCase()
                const name = d.name.toLocaleLowerCase()
                return no.includes(keyWord) || name.includes(keyWord)
              }
              return false
            })
            return newOptions
          }}
          renderInput={params => (
            <TextField
              {...params}
              variant="outlined"
              label="加入商品"
              placeholder="商品名稱"
              InputProps={{
                ...params.InputProps,
              }}
            />
          )}
        />
        <div className="flex items-center">
          <Button
            variant="primary"
            onClick={() => handleSearch()}
            className="w-[100px]"
            disabled={getAllProducts.loading || productReserveData.loading || (productReserveData.data === undefined && !productReserveData.error)}
          >
            搜尋
          </Button>
        </div>
      </div>
      {productReserveData.error ? (
        <QueryFailed onRetry={() => handleSearch()} />
      ) : productReserveData.loading || (productReserveData.data === undefined && !productReserveData.error) ? (
        <Skeleton className="h-96" aria-busy="true" />
      ) : (
        <Results reportData={reportData} />
      )}
    </Page>
  )
}

export default ProductReserveCheck
