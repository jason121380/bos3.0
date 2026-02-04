/** @jsxImportSource @emotion/react */
import { Container, Grid, CircularProgress, TextField, Link, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import { useState, useEffect } from 'react'
import useFetchGetPurchaseRecord from 'hooks/useFetchGetPurchaseRecords'
import PasswordDialog from 'components/PasswordDialog'
import { useFetchGetMerchantVendorList } from 'hooks/useFetchGetVendor'
import { useFetchGetStockInIsUsing } from 'hooks/useFetchMerchantPassword'
import useFetchSetPurchaseStockIn from 'hooks/useFetchSetPurchaseStockIn'
import useFetchSetPurchaseStockInUndo from 'hooks/useFetchSetPurchaseStockInUndo'
import Autocomplete from '@mui/material/Autocomplete'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'
import { openSnackbar } from 'elements/snackbars'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
}

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
    stockInDate: null
  })
  const [isUsing, setIsUsing] = useState({
    stockIn: true,
    stockInUndo: true
  })
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
          vendorUUIds: vendorUUId
        }
      }
    })
  }

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const onDialogClose = () => {
    setDialogOpen(false)
    setClickData({
      id: '',
      stockInDate: null
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
        pwd: password
      })
      handleSearch()
      onDialogClose()
      openSnackbar({
        variant: 'success',
        message: '入庫成功'
      })
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
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
        pwd: password
      })
      handleSearch()
      onDialogClose()
      openSnackbar({
        variant: 'success',
        message: '取消入庫成功'
      })
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
    } finally {
      setIsClick(false)
    }
  }

  const handleCheck = ({ uuid, stockInDate }) => {
    if (stockInDate && isUsing.stockInUndo) {
      setClickData({
        id: uuid,
        stockInDate: stockInDate
      })
      handleOpenDialog()
    } else if (!stockInDate && isUsing.stockIn) {
      setClickData({
        id: uuid,
        stockInDate: stockInDate
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
  }, [getPurchaseRecordsLazyData.loading])

  useEffect(() => {
    handleSearch()
  }, [])

  useEffect(() => {
    if (!getMerchantVendor.loading) {
      setVendorOptions(idx(getMerchantVendor, _ => _.data.getMerchantVendorList))
    }
  }, [getMerchantVendor.loading])

  useEffect(() => {
    if (vendorUUId.length === 0) {
      handleSearch()
    }
  }, [vendorUUId])

  useEffect(() => {
    if (!getStockInIsUsing.loading) {
      const { purchaseStockIn, purchaseStockInUndo } = getStockInIsUsing.data.merchantPassword
      setIsUsing({
        stockIn: purchaseStockIn.isUsing,
        stockInUndo: purchaseStockInUndo.isUsing
      })
    }
  }, [getStockInIsUsing.loading])

  return (
    <Page css={styles.root} title="商品進貨作業">
      <Container maxWidth={false} css={styles.container}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='商品進貨作業' subTitle='Product Restock' />
          <Grid item>
            <Link component={RouterLink} to="/product/restock/create">
              <Button color="primary" variant="contained">
                新增
              </Button>
            </Link>
          </Grid>
        </Grid>
        <Grid container style={{ margin: '24px 0 12px', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
          <Grid item container alignItems='center' sm={10} xs={12}>
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
          </Grid>
          <Grid item container sm={1} xs={12} style={{ display: 'flex' }} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
            >
              搜尋
            </Button>
          </Grid>
        </Grid>
        {!getPurchaseRecordsLazyData.loading && purchaseRecords !== undefined ? (
          <Results
            handleSearch={handleSearch}
            purchaseRecords={purchaseRecords}
            setPurchaseRecords={setPurchaseRecords}
            handleCheck={handleCheck}
            selectAllRecords={selectAllRecords}
          />
        ) : (
          <div style={{ width: '100%', textAlign: 'center', marginTop: '100px' }} >
            <CircularProgress />
          </div>
        )}
      </Container>
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
