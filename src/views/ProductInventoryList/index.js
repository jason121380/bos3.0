import { TextField } from 'ui/text-field'
import { useState, useEffect } from 'react'
import useFetchGetProductInventoryList from 'hooks/useFetchGetProductInventoryList'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import { format } from 'date-fns'
import idx from 'idx'
import Results from './Results'
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import { Autocomplete } from 'ui/combobox'

const sortEnum = [
  { label: '數量', value: 'COUNT' },
  { label: '廠商', value: 'VENDOR' },
  { label: '代號', value: 'PRODUCTNO' },
  { label: '類別', value: 'CATEGORY' },
]

const ProductInventoryList = () => {
  const [sortType, setSortType] = useState('COUNT')
  const [selectCategory, setSelectCategory] = useState(null)
  const [showFilter, setShowFilter] = useState(false)
  const [categoryOption, setCategoryOption] = useState([])
  const [reportData, setReportData] = useState([])
  const productInventoryList = useFetchGetProductInventoryList()
  const productCategories = useFetchProductCategories()

  useEffect(() => {
    if (!productCategories.loading) {
      // 查詢失敗時 data 為 undefined：當作沒有分類，不讓整頁拋錯
      const data = (idx(productCategories, _ => _.data.productCategories) || []).map(d => d.name)
      setCategoryOption(data)
    }
  }, [productCategories.loading])

  useEffect(() => {
    if (!productInventoryList.loading) {
      // 先複製再排序（查詢結果唯讀；原地排序也會改到快取）
      let sortData = [...(idx(productInventoryList, _ => _.data.productInventoryList) || [])]
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
        default:
          // 其他值不處理（與原本沒有 default 時相同）
          break
      }
      if (selectCategory !== null) {
        sortData = sortData.filter(d => d.productCategory === selectCategory)
      }
      setReportData([...sortData])
    }
  }, [productInventoryList.loading, sortType, selectCategory])

  return (
    <Page className='ProductInventoryList ui-root' title="商品庫存表">
      <div>
        <AdminPageHeader
          title='商品庫存表'
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
        >
          <Button
            onClick={() => window.print()}
            variant="secondary"
          >
            <Printer strokeWidth={1.75} />
            列印
          </Button>
        </AdminPageHeader>

        {showFilter && (
          <Card className="mb-3 p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <Autocomplete
                  autoHighlight
                  size="small"
                  style={{ width: 200 }}
                  value={selectCategory}
                  options={categoryOption}
                  getOptionLabel={option => option}
                  onChange={(event, value) => setSelectCategory(value)}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="篩選商品分類"
                    />
                  )}
                />
              </div>
              <div>
                <div className="divText mb-2 text-caption text-text-secondary">排序依據：</div>
                <ToggleGroup
                  size="small"
                  value={sortType}
                  onChange={(e, value) => value && setSortType(value)}
                  exclusive
                >
                  {sortEnum.map((data, idx) => (
                    <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                      {data.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          </Card>
        )}
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
        {!productInventoryList.loading ? <Results reportData={reportData} /> : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div className="noprint" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}

export default ProductInventoryList