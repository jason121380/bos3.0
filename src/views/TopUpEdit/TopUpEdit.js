/** @jsxImportSource @emotion/react */
import { Button, Container, Grid } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteWalletDeposit from 'hooks/useFetchDeleteWalletDeposit'
import useFetchUpdateWalletDeposit from 'hooks/useFetchUpdateWalletDeposit'
import useFetchWalletDepositDetail from 'hooks/useFetchWalletDepositDetail'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useForm, FormProvider } from 'react-hook-form'
import idx from 'idx'

import General from './General'
import styles from './styles/TopupEdit'

export default function TopUpCreate({ match }) {
  const history = useHistory()
  const [isClick, setIsClick] = useState(false)
  const [handlingFeeDecountPrice, setHandlingFeeDecountPrice] = useState(0)
  const { updateWalletDeposit } = useFetchUpdateWalletDeposit()
  const { deleteWalletDeposit } = useFetchDeleteWalletDeposit()
  const walletDepositDetail = useFetchWalletDepositDetail({ id: match.params.id })
  const walletDepositDetailId = idx(walletDepositDetail, _ => _.data.walletDepositDetail.id) || ''
  const form = useForm({
    defaultValues: {
      money: 0,
      designerId: '',
      customerId: '',
      payType: '',
      handlingFeeDecountWay: '',
      remark: '',
      date: null,
    },
  })
  const { handleSubmit, reset } = form
  const onSubmit = async data => {
    setIsClick(true)
    try {
      const res = await updateWalletDeposit({
        id: walletDepositDetailId,
        input: {
          ...data,
        },
      })
      if (res.data.updateWalletDeposit) {
        openSnackbar({ message: '儲存入金成功', variant: 'success' })
        history.push('/topup')
      } else throw new Error('儲存入金失敗')
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
      setIsClick(false)
    }
  }
  useEffect(() => {
    if (!walletDepositDetail.loading) {
      const { money, payType } = walletDepositDetail.data.walletDepositDetail
      const customerId = walletDepositDetail.data.walletDepositDetail.Customer.id
      const designerId = walletDepositDetail.data.walletDepositDetail.Maker.id
      const remark = walletDepositDetail.data.walletDepositDetail.remark
      const date = walletDepositDetail.data.walletDepositDetail.date
      const handlingFeeDecountPrice =
        walletDepositDetail.data.walletDepositDetail.handlingFeeDecountPrice
      const handlingFeeDecountWay =
        walletDepositDetail.data.walletDepositDetail.handlingFeeDecountWay
      const values = {
        money:
          handlingFeeDecountWay === 'BYCUSTOMER'
            ? money + Math.abs(handlingFeeDecountPrice)
            : money,
        payType,
        customerId,
        designerId,
        remark,
        date,
        handlingFeeDecountWay,
      }
      reset(values)
      setHandlingFeeDecountPrice(handlingFeeDecountPrice)
    }
  }, [walletDepositDetail.loading])

  const handleDelete = async () => {
    setIsClick(true)
    try {
      const res = await deleteWalletDeposit({ id: walletDepositDetailId, })
      if (res.data.deleteWalletDeposit) {
        openSnackbar({
          message: '刪除入金成功',
          variant: 'success',
        })
        history.push('/topup')
      } else throw new Error('刪除失敗')
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
      setIsClick(false)
    }
  }

  return (
    <Page title="編輯入金" css={styles.root}>
      <Container maxWidth="lg">
        <Grid style={{ maxWidth: 500 }} container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='編輯入金' subTitle='Top Up Edit' />
          <Grid item>
            <Button
              variant="contained"
              css={styles.deleteButton}
              onClick={handleDelete}
              disabled={isClick}
            >
              刪除
            </Button>
          </Grid>
        </Grid>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {walletDepositDetail.loading ? (
              'loading...'
            ) : (
              <>
                <General handlingFeeDecountPrice={handlingFeeDecountPrice} />
                <Button
                  color="primary"
                  variant="contained"
                  type="submit"
                  disabled={isClick}
                >
                  儲存
                </Button>
              </>
            )}
          </form>
        </FormProvider>
      </Container>
    </Page>
  )
}
