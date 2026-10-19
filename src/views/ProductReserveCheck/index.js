/** @jsxImportSource @emotion/react */
import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import React, { useState, useEffect } from 'react'
// 商品多選 Autocomplete（含 popupIcon 內的全選鈕）保留 MUI
import { Button as MuiButton } from '@mui/material'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { useFetchProductsInAutoComplete } from 'hooks/useFetchProducts'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchGetProductReserveCheck from 'hooks/useFetchGetProductReserveCheck'
import idx from 'idx'
import Results from './Results'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Button } from 'ui/button'
import { PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'
import { Autocomplete } from 'ui/combobox'


const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  searchBtnDiv: css({
    marginBottom: '24px',
  }),
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  searchBtn: css({
    width: '100px',
  }),
  exportBtn: css({
    float: 'right',
  }),
  formGroup: css({
    width: '10rem',
    marginLeft: theme.spacing(3),
  }),
  topDiv: css({
    display: 'flex',
    alignItems: 'center',
  }),
  grid: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px 30px'
  })
}

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
    productReserveChecks: []
  })
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime()
  })
  const [productIds, setProductIds] = useState([])

  const selectAll = event => {
    event.stopPropagation()
    const data = idx(getAllProducts, _ => _.data.products.data)
    setProductIds(data)
  }

  useEffect(() => {
    handleSearch()
  }, [date])

  useEffect(() => {
    if (!getAllProducts.loading) {
      const data = idx(getAllProducts, _ => _.data.products.data)
      setProductOptions(data)
    }
  }, [getAllProducts.loading])

  useEffect(() => {
    if (!productReserveData.loading && productReserveData.error) {
      setReportData({
        reserveCheckSummary: [],
        productReserveChecks: []
      })
      return
    }
    if (!productReserveData.loading && productReserveData.data !== undefined) {
      const data = idx(productReserveData, _ => _.data.productReserveCheck)
      setReportData(data);
    }
  }, [productReserveData.loading])

  useEffect(() => {
    if (productIds.length === 0) {
      handleSearch()
    }
  }, [productIds])

  const handleSearch = (inputDate = date) => {
    const productId = productIds.map(d => d.id)
    getProductReserve({
      variables: {
        input: {
          dateRange: inputDate,
          productIds: productId
        },
      }
    })
  }

  return (
    <Page className="ui-root" title="商品庫存盤點表">
      <PageHeader title="商品庫存盤點表" />
      <Toolbar>
        <DateSelector
          date={date}
          attributes={['lastmonth', 'thismonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
          dateChange={value => setDate(value)}
          margin
        />
      </Toolbar>
      <div className="flex items-center gap-2.5 pb-6">
        <Autocomplete
          multiple
          fullWidth
          popupIcon={
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
              disabled={getAllProducts.loading || productReserveData.loading || (productReserveData.data === undefined && !productReserveData.error)}
              onClick={selectAll}>全選</MuiButton>
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
                <Checkbox
                  style={{ color: 'rgb(var(--text))', marginRight: 8 }}
                  icon={icon}
                  checkedIcon={checkedIcon}
                  checked={selected}
                />
                {`${option.no === null ? '無代號' : option.no} - ${option.name}`}
              </li>
            )
          }
          }
          filterOptions={(options, { inputValue }) => {
            const keyWord = inputValue.toLocaleLowerCase()
            const newOptions = options.filter(d => {
              if (d.no) {
                const no = d.no.toLocaleLowerCase()
                const name = d.name.toLocaleLowerCase()
                return no.includes(keyWord) || name.includes(keyWord)
              }
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
      {productReserveData.loading || (productReserveData.data === undefined && !productReserveData.error) ? (
        <Skeleton className="h-96" aria-busy="true" />
      ) : (
        <Results reportData={reportData} />
      )}
    </Page>
  )
}

export default ProductReserveCheck