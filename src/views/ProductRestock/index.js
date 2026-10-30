import { TextField } from 'ui/text-field'
import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect } from 'react'
import useFetchGetPurchaseRecord from 'hooks/useFetchGetPurchaseRecords'
import PasswordDialog from 'components/PasswordDialog'
import { useFetchGetMerchantVendorList } from 'hooks/useFetchGetVendor'
import { useFetchGetStockInIsUsing } from 'hooks/useFetchMerchantPassword'
import useFetchSetPurchaseStockIn from 'hooks/useFetchSetPurchaseStockIn'
import useFetchSetPurchaseStockInUndo from 'hooks/useFetchSetPurchaseStockInUndo'
import Autocomplete from 'ui/combobox'
import { Link as RouterLink } from 'react-router-dom'
import { Search, ListFilter } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import { openSnackbar } from 'elements/snackbars'
import QueryFailed from 'components/QueryFailed'
import { PageHeader } from 'ui/page-header'

function ProductRestock() {
  const [purchaseRecords, setPurchaseRecords] = useState([])
  const [vendorOptions, setVendorOptions] = useState([])
  const [vendorUUId, setVendorUUId] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isClick, setIsClick] = useState(false)
  const [password, setPassword] = useState('')
  const [selectAllRecords, setSelectAllRecords] = useState([])
  const [clickData, setClickData] = useState({
    id: '',
    stockInDate: null,
  })
  const [isUsing, setIsUsing] = useState({
    stockIn: true,
    stockInUndo: true,
  })
  const [showFilter, setShowFilter] = useState(false)
  const [getPurchaseRecordsLazy, getPurchaseRecordsLazyData] = useFetchGetPurchaseRecord({
    input: { status: 'ALL', vendorUUIds: vendorUUId },
  })
  const getMerchantVendor = useFetchGetMerchantVendorList()
  const getStockInIsUsing = useFetchGetStockInIsUsing()
  const { setStockIn } = useFetchSetPurchaseStockIn()
  const { setStockInUndo } = useFetchSetPurchaseStockInUndo()

  const handleSearch = () => {
    getPurchaseRecordsLazy({
      variables: {
        input: {
          status: 'ALL',
          vendorUUIds: vendorUUId,
        },
      },
    })
  }

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const onDialogClose = () => {
    setDialogOpen(false)
    setClickData({
      id: '',
      stockInDate: null,
    })
  }

  const onDialogConfirm = () => {
    clickData.stockInDate ? handleStockInUndo(clickData.id) : handleStockIn(clickData.id)
  }

  const handleSetPassword = value => {
    setPassword(value)
  }

  const handleStockIn = async id => {
    if (isClick) return
    setIsClick(true)
    try {
      await setStockIn({
        purchaseUUId: id,
        pwd: password,
      })
      handleSearch()
      onDialogClose()
      openSnackbar({
        variant: 'success',
        message: '入庫成功',
      })
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message,
      })
    } finally {
      setIsClick(false)
    }
  }

  const handleStockInUndo = async id => {
    if (isClick) return
    setIsClick(true)
    try {
      await setStockInUndo({
        purchaseUUId: id,
        pwd: password,
      })
      handleSearch()
      onDialogClose()
      openSnackbar({
        variant: 'success',
        message: '取消入庫成功',
      })
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message,
      })
    } finally {
      setIsClick(false)
    }
  }

  const handleCheck = ({ uuid, stockInDate }) => {
    if (stockInDate && isUsing.stockInUndo) {
      setClickData({
        id: uuid,
        stockInDate: stockInDate,
      })
      handleOpenDialog()
    } else if (!stockInDate && isUsing.stockIn) {
      setClickData({
        id: uuid,
        stockInDate: stockInDate,
      })
      handleOpenDialog()
    } else {
      stockInDate ? handleStockInUndo(uuid) : handleStockIn(uuid)
    }
  }

  useEffect(() => {
    if (!getPurchaseRecordsLazyData.loading && getPurchaseRecordsLazyData.data) {
      const data = idx(getPurchaseRecordsLazyData, _ => _.data.purchaseRecords)
      const arr = []
      data.forEach(({ stockInDate, uuid }) => !stockInDate && arr.push(uuid))
      setPurchaseRecords(data)
      setSelectAllRecords(arr)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getPurchaseRecordsLazyData.loading])

  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在掛載時執行一次
  }, [])

  useEffect(() => {
    if (!getMerchantVendor.loading) {
      setVendorOptions(idx(getMerchantVendor, _ => _.data.getMerchantVendorList))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantVendor.loading])

  useEffect(() => {
    if (vendorUUId.length === 0) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（handleSearch）；只在 [vendorUUId] 變動時呼叫，補上會每次 render 重跑
  }, [vendorUUId])

  useEffect(() => {
    // 查詢失敗時 data 為 undefined：維持預設「需要密碼」，不讓整頁拋錯
    const merchantPassword = idx(getStockInIsUsing, _ => _.data.merchantPassword)
    if (!getStockInIsUsing.loading && merchantPassword) {
      const { purchaseStockIn, purchaseStockInUndo } = merchantPassword
      setIsUsing({
        stockIn: purchaseStockIn.isUsing,
        stockInUndo: purchaseStockInUndo.isUsing,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getStockInIsUsing.loading])

  return (
    <Page className="ui-root" title="商品進貨作業">
      <PageHeader
        title="商品進貨作業"
        actions={
          <>
            <Button
              variant="secondary"
              aria-pressed={!!showFilter}
              onClick={() => setShowFilter(!showFilter)}
              className={showFilter ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
            >
              <ListFilter strokeWidth={1.75} />
              篩選
            </Button>
            <Button asChild variant="primary">
              <RouterLink to={'/product/restock/create'}>{'新增進貨'}</RouterLink>
            </Button>
          </>
        }
      />

      {/* 以 hidden 收合（取代 MUI Collapse）：廠商 Autocomplete 為非受控，需保持掛載，收合後選取內容與舊版一樣保留 */}
      <div hidden={!showFilter}>
        <Card className="mb-6 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-label text-text-secondary">按廠商篩選</span>
              <Autocomplete
                fullWidth
                multiple
                disableCloseOnSelect
                disabled={dialogOpen}
                options={vendorOptions}
                onChange={(event, value) => {
                  setVendorUUId(value.map(d => d.vendor.uuid))
                }}
                getOptionLabel={option => option.name}
                renderOption={(props, option, { selected }) => <li {...props}>{!!option.nickname.trim() ? option.nickname : option.name}</li>}
                renderInput={params => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="選擇廠商"
                    placeholder="廠商名稱"
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
              />
            </div>
            <Button variant="secondary" className="sm:w-40" onClick={handleSearch}>
              <Search strokeWidth={1.75} />
              搜尋
            </Button>
          </div>
        </Card>
      </div>
      {getPurchaseRecordsLazyData.error ? (
        <QueryFailed onRetry={handleSearch} />
      ) : !getPurchaseRecordsLazyData.loading && purchaseRecords !== undefined ? (
        <Results
          handleSearch={handleSearch}
          purchaseRecords={purchaseRecords}
          setPurchaseRecords={setPurchaseRecords}
          handleCheck={handleCheck}
          selectAllRecords={selectAllRecords}
        />
      ) : (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      )}
      <PasswordDialog
        open={dialogOpen}
        title={clickData.stockInDate ? '進貨單取消入庫' : '進貨單入庫'}
        inputLabel={clickData.stockInDate ? '取消入庫密碼' : '入庫密碼'}
        handleOnCancel={onDialogClose}
        handleOnConfirm={onDialogConfirm}
        isLoading={isClick}
        inputOnChange={handleSetPassword}
      />
    </Page>
  )
}

export default ProductRestock
