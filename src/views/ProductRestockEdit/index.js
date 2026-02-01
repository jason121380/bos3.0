/** @jsxImportSource @emotion/react */
import { Button, Container, Grid } from '@mui/material'
import red from '@mui/material/colors/red'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
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
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import General from './General'

const styles = {
  root: css({}),
  general: css({
    marginTop: theme.spacing(3),
  }),
  action: css({
    marginTop: theme.spacing(3) + '!important',
  }),
  delete: css({
    backgroundColor: red[700] + '!important',
    color: 'white',
    '&:hover, &:active': {
      backgroundColor: red[600] + '!important',
    },
  }),
}

export default function ProductRestockEdit() {
  const history = useHistory()
  const params = useParams()
  const [purchaseRecord, setPurchaseRecord] = useState({})
  const [disabled, setDisabled] = useState(true)
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
        openSnackbar({ message: error.message, variant: 'error' })
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
      const data = idx(getPurchaseRecord, _ => _.data.purchaseRecord)
      setDisabled(!!data.stockInDate)
      setPurchaseRecord(data)
    }
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
  }, [purchaseRecord])

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
    <Page title="編輯進貨單" css={styles.root}>
      <Container style={{ padding: '20px' }}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='編輯進貨單' subTitle='PRODUCT RESTOCK EDIT' />
          <Grid item>
            {!disabled && (
              <Button
                css={styles.delete}
                variant="contained"
                onClick={() => {
                  handleDelete()
                }}
              >
                刪除
              </Button>
            )}
          </Grid>
        </Grid>
        {!getPurchaseRecord.loading && purchaseRecord.uuid && (
          <General
            className={styles.general}
            disabled={disabled}
            purchaseRecord={purchaseRecord}
            setPurchaseRecord={setPurchaseRecord}
          />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {!disabled ? (
            <Button
              color="primary"
              variant="contained"
              css={styles.action}
              disabled={checkPurchaseRecords}
              onClick={handleUpdate}
            >
              儲存
            </Button>
          ) : <div />}
          {(!getPurchaseRecord.loading && !getStockInIsUsing.loading) && (
            <Button
              color={disabled ? 'error' : 'success'}
              variant="contained"
              css={styles.action}
              disabled={checkPurchaseRecords}
              onClick={handleCheck}
            >
              {disabled ? '取消入庫' : '入庫'}
            </Button>
          )}
        </div>
      </Container>
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
