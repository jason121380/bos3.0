import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { useState, useEffect } from 'react'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import Autocomplete from 'ui/combobox'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { useFetchProductsInAutoComplete } from 'hooks/useFetchProducts'
import { endOfDay, startOfMonth, format } from 'date-fns'
import useFetchGetProductInvoicingRecordReport from 'hooks/useFetchGetProductInvoicingRecordReport'
import idx from 'idx'
import Results from './Results'
import { Printer } from 'lucide-react'
import { Button as UIButton } from 'ui/button'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'
import { ReportToolbar, PageHeader } from 'ui/page-header'

const performanceEnum = [
  { label: '店販', value: 'SALE' },
  { label: '自購', value: 'PICKING' },
  { label: '進貨', value: 'PURCHASE' },
]

const ProductInvoicingRecordReport = () => {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const urlParams = new URLSearchParams(window.location.search)

  const getAllProducts = useFetchProductsInAutoComplete()
  const [invoicingRecordReportLazy, invoicingRecordReportLazyData] = useFetchGetProductInvoicingRecordReport()
  const [productsOptions, setProductOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [reportData, setReportData] = useState([])
  const [date, setDate] = useState({
    startDate: urlParams.has('startDate') && urlParams.has('endDate') ? +urlParams.get('startDate') : startOfMonth(new Date()).getTime(),
    endDate: urlParams.has('startDate') && urlParams.has('endDate') ? +urlParams.get('endDate') : endOfDay(new Date()).getTime()
  })
  const [submitValue, setSubmitValue] = useState({
    selectProduct: [],
    recordType: ['SALE', 'PICKING', 'PURCHASE']
  })

  const selectAll = event => {
    event.stopPropagation()
    const data = idx(getAllProducts, _ => _.data.products.data)
    setSubmitValue({ ...submitValue, selectProduct: data })
  }

  useEffect(() => {
    invoicingRecordReportLazy({
      variables: {
        input: date,
        productId: [],
        recordType: ['SALE', 'PICKING', 'PURCHASE'],
      }
    })
  }, [])

  useEffect(() => {
    if (!getAllProducts.loading) {
      const data = idx(getAllProducts, _ => _.data.products.data)
      setProductOptions(data)
    }
  }, [getAllProducts.loading])

  useEffect(() => {
    if (!invoicingRecordReportLazyData.loading && invoicingRecordReportLazyData.data !== undefined) {
      const data = idx(invoicingRecordReportLazyData, _ => _.data.productInvoicingRecordReport)
      setReportData(data);
    }
  }, [invoicingRecordReportLazyData.loading])

  useEffect(() => {
    if (submitValue.selectProduct.length === 0) {
      handleSearch()
    }
  }, [submitValue.selectProduct])

  useEffect(() => {
    handleSearch()
  }, [date])

  const handleSearch = (inputDate = date) => {
    const productId = submitValue.selectProduct.map(d => d.id)
    invoicingRecordReportLazy({
      variables: {
        input: inputDate,
        productId: productId,
        recordType: submitValue.recordType,
      }
    })
  }

  // 商品清單失敗時，只重跑報表不會清掉 getAllProducts.error，頁面會一直停在失敗畫面
  const retryFailedQueries = () => {
    if (getAllProducts.error) getAllProducts.refetch()
    handleSearch()
  }

  return (
    <Page className='ProductInvoicingRecordReport ui-root' title="商品進銷貨報表">
      <div>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
              '  - ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '商品進銷貨報表'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <PageHeader
          title='商品進銷貨報表'
          actions={
            <>
              <UIButton
                onClick={() => window.print()}
                variant="secondary"
                disabled={getAllProducts.loading || invoicingRecordReportLazyData.loading || invoicingRecordReportLazyData.data === undefined}
              >
                <Printer strokeWidth={1.75} />
                列印
              </UIButton>
            </>
          }
        />
        <ReportToolbar
          date={
            <DateSelector
              date={date}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => setDate(value)}
            />
          }
          filters={
            <>
              <div className='noprint flex flex-wrap items-end gap-3'>
                <div className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary">類型</span>
                  <ToggleGroup
                    size="small"
                    value={submitValue.recordType}
                    onChange={(e, value) => setSubmitValue({ ...submitValue, recordType: value })}
                    disabled={getAllProducts.loading || invoicingRecordReportLazyData.loading || invoicingRecordReportLazyData.data === undefined}
                    exclusive={false}
                  >
                    {performanceEnum.map((data, idx) => (
                      <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                        {data.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>
              <Autocomplete
                multiple
                fullWidth
                popupIcon={
                  // 全選鈕：每頁只有一顆 primary（搜尋），故用 secondary（STYLE §2）
                  <UIButton
                    variant="secondary"
                    size="sm"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    disabled={getAllProducts.loading || invoicingRecordReportLazyData.loading || invoicingRecordReportLazyData.data === undefined}
                    onClick={selectAll}>全選</UIButton>
                }
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                value={submitValue.selectProduct}
                options={productsOptions}
                disableCloseOnSelect
                getOptionLabel={option => option.name}
                onChange={(event, value) => setSubmitValue({ ...submitValue, selectProduct: value })}
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
            </>
          }
          actions={
            <UIButton
              variant="primary"
              onClick={() => handleSearch()}
              className="w-[100px] shrink-0"
              disabled={getAllProducts.loading || invoicingRecordReportLazyData.loading || invoicingRecordReportLazyData.data === undefined}
            >
              搜尋
            </UIButton>
          }
        />
        {invoicingRecordReportLazyData.error || getAllProducts.error ? (
          <QueryFailed onRetry={retryFailedQueries} />
        ) : (!getAllProducts.loading && !invoicingRecordReportLazyData.loading && invoicingRecordReportLazyData.data !== undefined) ?
          <Results reportData={reportData} /> : (
            // 載入中：與舊版 CircularProgress 相同時機顯示
            <div className="noprint mt-3" aria-busy="true" aria-label="載入中">
              <Skeleton className="h-[320px] w-full rounded-lg" />
            </div>
          )
        }
      </div>
    </Page>
  )
}

export default ProductInvoicingRecordReport