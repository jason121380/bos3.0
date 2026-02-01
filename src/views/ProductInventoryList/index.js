/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Container, Button, CircularProgress, Grid, TextField, Autocomplete,
  ToggleButton, ToggleButtonGroup
} from '@mui/material'
import useFetchGetProductInventoryList from 'hooks/useFetchGetProductInventoryList'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { format } from 'date-fns'
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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  })
}

const sortEnum = [
  { label: '數量', value: 'COUNT' },
  { label: '廠商', value: 'VENDOR' },
  { label: '代號', value: 'PRODUCTNO' },
  { label: '類別', value: 'CATEGORY' },
]

const ProductInventoryList = () => {
  const [sortType, setSortType] = useState('COUNT')
  const [selectCategory, setSelectCategory] = useState(null)
  const [categoryOption, setCategoryOption] = useState([])
  const [reportData, setReportData] = useState([])
  const productInventoryList = useFetchGetProductInventoryList()
  const productCategories = useFetchProductCategories()

  useEffect(() => {
    if (!productCategories.loading) {
      const data = idx(productCategories, _ => _.data.productCategories).map(d => d.name)
      setCategoryOption(data)
    }
  }, [productCategories.loading])

  useEffect(() => {
    if (!productInventoryList.loading) {
      let sortData = idx(productInventoryList, _ => _.data.productInventoryList)
      switch (sortType) {
        case 'COUNT':
          sortData = sortData.sort((a, b) => {
            return (a.count < b.count) ? -1 : (a.count > b.count) ? 1 : 0
          })
          break;
        case 'VENDOR':
          sortData = sortData.sort((x, y) => {
            const reg = /[a-zA-Z0-9]/
            const xName = x.vendorName || ''
            const yName = y.vendorName || ''
            if (reg.test(xName) || reg.test(yName)) {
              if (xName > yName) {
                return 1
              } else if (xName < yName) {
                return -1
              } else {
                return 0
              }
            } else {
              return xName.localeCompare(yName)
            }
          })
          const nullData = sortData.filter(d => d.vendorName === null)
          const filterData = sortData.filter(d => d.vendorName !== null)
          sortData = [...filterData, ...nullData]
          break;
        case 'PRODUCTNO':
          sortData = sortData.sort((x, y) => {
            const reg = /[a-zA-Z0-9]/
            const xName = x.productNo || ''
            const yName = y.productNo || ''
            if (reg.test(xName) || reg.test(yName)) {
              if (xName > yName) {
                return 1
              } else if (xName < yName) {
                return -1
              } else {
                return 0
              }
            } else {
              return xName.localeCompare(yName)
            }
          })
          break;
        case 'CATEGORY':
          sortData = sortData.sort((x, y) => {
            const reg = /[a-zA-Z0-9]/
            const xName = x.productCategory || ''
            const yName = y.productCategory || ''
            if (reg.test(xName) || reg.test(yName)) {
              if (xName > yName) {
                return 1
              } else if (xName < yName) {
                return -1
              } else {
                return 0
              }
            } else {
              return xName.localeCompare(yName)
            }
          })
          break;
      }
      if (selectCategory !== null) {
        sortData = sortData.filter(d => d.productCategory === selectCategory)
      }
      setReportData([...sortData])
    }
  }, [productInventoryList.loading, sortType, selectCategory])

  return (
    <Page css={styles.root} className='ProductInventoryList' title="商品庫存表">
      <Container maxWidth={false} css={styles.container}>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name + '   ' + '商品庫存表'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <PageTitle title='商品庫存表' subTitle='product inventoryList' />
        <Grid className="noprint" container style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', gap: '20px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Autocomplete
              autoHighlight
              style={{ width: 200 }}
              value={selectCategory}
              options={categoryOption}
              getOptionLabel={option => option}
              onChange={(event, value) => setSelectCategory(value)}
              renderOption={(props, option) => {
                props.key = props.id
                return (
                  <li {...props}>{option}</li>
                )
              }
              }
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="篩選商品分類"
                  placeholder="分類名稱"
                  InputProps={{
                    ...params.InputProps,
                  }}
                />
              )}
            />
          </div>
          <Grid item css={styles.grid} className='noprint' style={{ gap: 20 }}>
            <div style={{ marginTop: -22 }}>
              <div className="divText">排序依據：</div>
              <ToggleButtonGroup
                size="small"
                value={sortType}
                onChange={(e, value) => value && setSortType(value)}
                exclusive
              >
                {sortEnum.map((data, idx) => (
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
                css={styles.exportBtn}>
                列印
              </Button>
            </div>
          </Grid>
        </Grid>
        {/* <div className="noprint" style={{ display: 'flex', margin: '10px 0' }}>
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
            filterOptions={(options, {inputValue}) => {
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
        </div> */}
        {!productInventoryList.loading ? <Results reportData={reportData} /> : <div style={{ marginTop: '100px' }} css={styles.noReportDiv}><CircularProgress /></div>}
      </Container>
    </Page>
  )
}

export default ProductInventoryList