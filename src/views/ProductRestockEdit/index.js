import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import ConfirmDeleteDialog from 'components/ConfirmDeleteDialog'
import { useFetchGetPurchaseRecordForEdit } from 'hooks/useFetchGetPurchaseRecords'
import PasswordDialog from 'components/PasswordDialog'
import useFetchDeletePurchase from 'hooks/useFetchDeletePurchase'
import useFetchSetUpdatePurchaseRecord from 'hooks/useFetchSetUpdatePurchaseRecord'
import useFetchSetPurchaseStockIn from 'hooks/useFetchSetPurchaseStockIn'
import useFetchSetPurchaseStockInUndo from 'hooks/useFetchSetPurchaseStockInUndo'
import { useFetchGetStockInIsUsing } from 'hooks/useFetchMerchantPassword'
import idx from 'idx'
import { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import General from './General'
import QueryFailed from 'components/QueryFailed'

export default function ProductRestockEdit() {
  const history = useHistory()
  const params = useParams()
  const [purchaseRecord, setPurchaseRecord] = useState({})
  const [disabled, setDisabled] = useState(true)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [checkPurchaseRecords, setCheckPurchaseRecords] = useState(false)
  const [password, setPassword] = useState('')
  const [isUsing, setIsUsing] = useState({
    stockIn: true,
    stockInUndo: true
  })
  const getPurchaseRecord = useFetchGetPurchaseRecordForEdit({
    purchaseUUId: params.id,
  })
  const getStockInIsUsing = useFetchGetStockInIsUsing()
  const { deletePurchase } = useFetchDeletePurchase()
  const { updatePurchase } = useFetchSetUpdatePurchaseRecord()
  const { setStockIn } = useFetchSetPurchaseStockIn()
  const { setStockInUndo } = useFetchSetPurchaseStockInUndo()

  const handleDelete = () => {
    deletePurchase({
      purchaseUUIds: [purchaseRecord.uuid],
    })
      .then(res => {
        if (res.data.deletePurchase) {
          openSnackbar({ message: '刪除成功', variant: 'success' })
          history.push('/product/restock/')
        }
      })
      .catch(error => {
        // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
      })
  }

  const handleUpdate = () => {
    setCheckPurchaseRecords(true)
    const product = purchaseRecord.purchaseProduct.map(d => {
      return {
        productId: d.productID,
        count: d.count,
        unitPrice: d.unitPrice,
      }
    })

    const submitData = {
      purchaseUUId: purchaseRecord.uuid,
      productList: product,
      remark: purchaseRecord.remark,
    }

    updatePurchase({
      input: submitData
    }).then(res => {
      if (res.data.updatePurchase) {
        openSnackbar({ message: '編輯成功', variant: 'success' })
        history.push('/product/restock/')
      } else {
        openSnackbar({ message: '編輯失敗', variant: 'error' })
        setCheckPurchaseRecords(false)
      }
    })
      .catch(error => {
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
    disabled ? handleStockInUndo() : handleStockIn()
  }

  const handleCheck = () => {
    if (disabled && isUsing.stockInUndo) {
      handleOpenDialog()
    } else if (!disabled && isUsing.stockIn) {
      handleOpenDialog()
    } else {
      disabled ? handleStockInUndo() : handleStockIn()
    }
  }

  const handleStockIn = async () => {
    setCheckPurchaseRecords(true)
    try {
      await setStockIn({
        purchaseUUId: params.id,
        pwd: password
      })
      history.push('/product/restock/')
      openSnackbar({
        variant: 'success',
        message: '入庫成功'
      })
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
      setCheckPurchaseRecords(false)
    }
  }

  const handleStockInUndo = async () => {
    setCheckPurchaseRecords(true)
    try {
      await setStockInUndo({
        purchaseUUId: params.id,
        pwd: password
      })
      openSnackbar({
        variant: 'success',
        message: '取消入庫成功'
      })
      onDialogClose()
      getPurchaseRecord.refetch()
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
    } finally {
      setCheckPurchaseRecords(false)
    }
  }

  useEffect(() => {
    if (!getPurchaseRecord.loading) {
      // 查詢失敗或查無此單時 data 為空：不讓整頁拋錯（維持唯讀）
      const data = idx(getPurchaseRecord, _ => _.data.purchaseRecord)
      if (!data) return
      setDisabled(!!data.stockInDate)
      setPurchaseRecord(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getPurchaseRecord.loading])

  useEffect(() => {
    if (!getPurchaseRecord.loading && !!purchaseRecord.purchaseProduct) {
      const operatorId = purchaseRecord.operatorId === ''
      const productList =
        purchaseRecord.purchaseProduct.filter(d => {
          return d.productID === '' || d.count === 0
        }).length > 0
      setCheckPurchaseRecords(operatorId || productList)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [purchaseRecord] 變動時執行；getPurchaseRecord.loading 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [purchaseRecord])

  useEffect(() => {
    // 查詢失敗時 data 為 undefined：維持預設「需要密碼」，不讓整頁拋錯
    const merchantPassword = idx(getStockInIsUsing, _ => _.data.merchantPassword)
    if (!getStockInIsUsing.loading && merchantPassword) {
      const { purchaseStockIn, purchaseStockInUndo } = merchantPassword
      setIsUsing({
        stockIn: purchaseStockIn.isUsing,
        stockInUndo: purchaseStockInUndo.isUsing
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getStockInIsUsing.loading])

  return (
    <Page title="編輯進貨單" className="ui-root">
      <PageHeader
        title="編輯進貨單"
        actions={
          !disabled && (
            <Button
              variant="danger"
              onClick={() => setConfirmingDelete(true)}
            >
              刪除
            </Button>
          )
        }
      />
      <ConfirmDeleteDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="刪除進貨單"
        message="刪除這張進貨單？"
        consequence="刪除後無法復原，已入庫的數量不會自動退回。"
        onConfirm={() => {
          setConfirmingDelete(false)
          handleDelete()
        }}
      />
      {getPurchaseRecord.error ? (
        <QueryFailed onRetry={() => getPurchaseRecord.refetch()} />
      ) : (
        <>
          {!getPurchaseRecord.loading && purchaseRecord.uuid && (
            <General
              disabled={disabled}
              purchaseRecord={purchaseRecord}
              setPurchaseRecord={setPurchaseRecord}
            />
          )}
          <div className="flex items-center justify-end gap-2 pt-6">
            {!disabled ? (
              <Button
                variant="primary"
                disabled={checkPurchaseRecords}
                onClick={handleUpdate}
              >
                儲存
              </Button>
            ) : <div />}
            {(!getPurchaseRecord.loading && !getStockInIsUsing.loading) && (
              <Button
                variant={disabled ? 'danger' : 'secondary'}
                disabled={checkPurchaseRecords}
                onClick={handleCheck}
              >
                {disabled ? '取消入庫' : '入庫'}
              </Button>
            )}
          </div>
        </>
      )}
      <PasswordDialog
        open={dialogOpen}
        title={disabled ? '進貨單取消入庫' : '進貨單入庫'}
        inputLabel={disabled ? '取消入庫密碼' : '入庫密碼'}
        handleOnCancel={onDialogClose}
        handleOnConfirm={onDialogConfirm}
        isLoading={checkPurchaseRecords}
        inputOnChange={handleSetPassword}
      />
    </Page>
  )
}
