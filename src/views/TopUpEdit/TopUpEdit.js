import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteWalletDeposit from 'hooks/useFetchDeleteWalletDeposit'
import useFetchUpdateWalletDeposit from 'hooks/useFetchUpdateWalletDeposit'
import useFetchWalletDepositDetail from 'hooks/useFetchWalletDepositDetail'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useForm, FormProvider } from 'react-hook-form'
import idx from 'idx'

import General from './General'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

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
        // replace：列表按上一頁不會再回到這張已編輯的入金（取代列表原本的 history.go(1) 監聽；Jason 2026/10/22 fix all）
        history.replace('/topup')
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
    // 讀取失敗（或查無入金）時保留空白表單（原本直接讀 data.walletDepositDetail 整頁錯誤；Jason 2026/10/22 fix all）
    if (!walletDepositDetail.loading && idx(walletDepositDetail, _ => _.data.walletDepositDetail)) {
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
        history.replace('/topup')
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
    <Page title="編輯入金" className="ui-root">
      <div className="max-w-lg">
        <PageHeader
          title="編輯入金"
          actions={
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isClick}
            >
              刪除
            </Button>
          }
        />
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {walletDepositDetail.loading ? (
              <div className="flex flex-col gap-4"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /></div>
            ) : (
              <>
                <General handlingFeeDecountPrice={handlingFeeDecountPrice} />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isClick}
                  >
                    儲存
                  </Button>
                </div>
              </>
            )}
          </form>
        </FormProvider>
      </div>
    </Page>
  )
}
