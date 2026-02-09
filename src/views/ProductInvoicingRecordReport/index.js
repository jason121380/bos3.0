/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Container, Button, CircularProgress, Grid, Checkbox, TextField,
  ToggleButton, ToggleButtonGroup
} from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Autocomplete from '@mui/material/Autocomplete'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import { useFetchProductsInAutoComplete } from 'hooks/useFetchProducts'
import { endOfDay, startOfMonth, format } from 'date-fns'
import useFetchGetProductInvoicingRecordReport from 'hooks/useFetchGetProductInvoicingRecordReport'
import idx from 'idx'
import Results from './Results'
import { css } from '@emotion/react'
import { theme } from '../../theme'

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

  return (
    <Page css={styles.root} className='ProductInvoicingRecordReport' title="商品進銷貨報表">
      <Container maxWidth={false} css={styles.container}>
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
        <AdminPageHeader title='商品進銷貨報表' />
        <Grid className="noprint" container style={{ display: 'flex', justifyContent: 'space-between' }}>
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />
          <Grid
            item
            css={styles.grid}
            className='noprint'
          >
            <div style={{ marginTop: -23 }}>
              <div className="divText">類型：</div>
              <ToggleButtonGroup
                size="small"
                value={submitValue.recordType}
                onChange={(e, value) => setSubmitValue({ ...submitValue, recordType: value })}
                disabled={getAllProducts.loading || invoicingRecordReportLazyData.loading || invoicingRecordReportLazyData.data === undefined}
                exclusive={false}
              >
                {performanceEnum.map((data, idx) => (
                  <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                    {data.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
            <div>
              <Button
                onClick={() => window.print()}
                variant="contained"
                color="primary"
                disabled={getAllProducts.loading || invoicingRecordReportLazyData.loading || invoicingRecordReportLazyData.data === undefined}
                css={styles.exportBtn}>
                列印
              </Button>
            </div>
          </Grid>
        </Grid>
        <div className="noprint" style={{ display: 'flex', margin: '10px 0' }}>
          <Autocomplete
            multiple
            fullWidth
            popupIcon={
              <Button
                variant="contained"
                color="primary"
                size="small"
                style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                disabled={getAllProducts.loading || invoicingRecordReportLazyData.loading || invoicingRecordReportLazyData.data === undefined}
                onClick={selectAll}>全選</Button>
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
                    style={{ color: '#202D50', marginRight: 8 }}
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
          <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSearch()}
              css={styles.searchBtn}
              disabled={getAllProducts.loading || invoicingRecordReportLazyData.loading || invoicingRecordReportLazyData.data === undefined}
            >
              搜尋
            </Button>
          </div>
        </div>
        {(!getAllProducts.loading && !invoicingRecordReportLazyData.loading && invoicingRecordReportLazyData.data !== undefined) ?
          <Results reportData={reportData} /> : <div style={{ marginTop: '100px' }} className={styles.noReportDiv}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}

export default ProductInvoicingRecordReport