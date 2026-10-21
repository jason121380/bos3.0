import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreatePurchase from 'hooks/useFetchCreatePurchase'
import PasswordDialog from 'components/PasswordDialog'
import useFetchSetPurchaseStockIn from 'hooks/useFetchSetPurchaseStockIn'
import { useFetchGetStockInIsUsing } from 'hooks/useFetchMerchantPassword'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import General from './General'

export default function ProductRestockCreate() {
  const { addPurchase } = useFetchCreatePurchase()
  const history = useHistory()
  const [password, setPassword] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isUsing, setIsUsing] = useState({
    stockIn: true
  })
  const [purchaseRecords, setPurchaseRecords] = useState({
    operatorId: '',
    date: new Date().getTime(),
    productList: [
      {
        productId: '',
        count: 0,
        unitPrice: 0,
      },
    ],
    remark: '',
  })
  const [pageLoading, setPageLoading] = useState(true)
  const [checkPurchaseRecords, setCheckPurchaseRecords] = useState(false)
  const getStockInIsUsing = useFetchGetStockInIsUsing()
  const { setStockIn } = useFetchSetPurchaseStockIn()


  const handleSubmit = () => {
    setCheckPurchaseRecords(true)
    addPurchase({
      input: purchaseRecords,
    }).then(res => {
      if (res.data.createPurchase.length) {
        openSnackbar({ message: '成功新增進貨', variant: 'success' })
        history.push('/product/restock/')
      } else {
        openSnackbar({ message: '新增進貨失敗', variant: 'error' })
        setCheckPurchaseRecords(false)
      }
    }).catch(error => {
      openSnackbar({ message: error.message, variant: 'error' })
      setCheckPurchaseRecords(false)
    })
  }

  const handleSetPassword = value => {
    setPassword(value)
  }

  const onDialogClose = () => {
    setDialogOpen(false)
  }

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const onDialogConfirm = () => {
    handleAddPurchaseAndStockIn()
  }

  const handleCheck = () => {
    if (isUsing.stockIn) {
      handleOpenDialog()
    } else {
      handleAddPurchaseAndStockIn()
    }
  }

  const handleStockIn = async id => {
    await setStockIn({
      purchaseUUId: id,
      pwd: password
    })
  }

  const handleAddPurchaseAndStockIn = async () => {
    setCheckPurchaseRecords(false)

    try {
      const promise = []
      const res = await addPurchase({ input: purchaseRecords })
      if (res.data.createPurchase.length) {
        const ids = res.data.createPurchase
        ids.forEach(id => promise.push(handleStockIn(id)))
        await Promise.all(promise)
        openSnackbar({ message: '成功新增進貨並入庫', variant: 'success' })
        history.push('/product/restock/')
      }
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
      setCheckPurchaseRecords(false)
    }

  }

  useEffect(() => {
    const operatorId = purchaseRecords.operatorId === ''
    const productList =
      purchaseRecords.productList.filter(d => {
        return d.productId === '' || d.count === 0
      }).length > 0
    setCheckPurchaseRecords(operatorId || productList)
  }, [purchaseRecords])

  useEffect(() => {
    if (!getStockInIsUsing.loading) {
      const { purchaseStockIn } = getStockInIsUsing.data.merchantPassword
      setIsUsing({
        stockIn: purchaseStockIn.isUsing,
      })
    }
  }, [getStockInIsUsing.loading])


  return (
    <Page title="新增商品進貨" className="ui-root">
      <PageHeader title="新增商品進貨" />
      <General
        purchaseRecords={purchaseRecords}
        setPurchaseRecords={setPurchaseRecords}
        setPageLoading={setPageLoading}
      />
      {(!pageLoading && !getStockInIsUsing.loading) && (
        <div className="flex items-center justify-end gap-2 pt-6">
          <Button
            variant="secondary"
            disabled={checkPurchaseRecords}
            onClick={handleSubmit}
          >
            新增
          </Button>
          <Button
            variant="primary"
            disabled={checkPurchaseRecords}
            onClick={handleCheck}
          >
            新增並入庫
          </Button>
        </div>
      )}
      <PasswordDialog
        open={dialogOpen}
        title='進貨單入庫'
        inputLabel='入庫密碼'
        handleOnCancel={onDialogClose}
        handleOnConfirm={onDialogConfirm}
        isLoading={checkPurchaseRecords}
        inputOnChange={handleSetPassword}
      />
    </Page>
  )
}
