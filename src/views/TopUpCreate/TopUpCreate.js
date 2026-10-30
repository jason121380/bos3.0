import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchWalletDeposit from 'hooks/useFetchWalletDeposit'
import { useState } from 'react'
import { useHistory } from 'react-router'
import { useForm, FormProvider } from 'react-hook-form'

import General from './General'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

export default function TopUpCreate() {
  const history = useHistory()
  const [isClick, setIsClick] = useState(false)
  const { walletDeposit } = useFetchWalletDeposit()
  const form = useForm({
    defaultValues: {
      date: new Date().getTime(),
    },
  })
  const { handleSubmit } = form

  const onSubmit = async data => {
    setIsClick(true)
    try {
      const res = await walletDeposit({ input: { ...data } })
      if (res.data.walletDeposit) {
        openSnackbar({ message: '成功新增入金', variant: 'success' })
        history.push('/topup')
      } else throw new Error('新增失敗')
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
      setIsClick(false)
    }
  }

  return (
    <Page title="新增入金" className="ui-root">
      <div className="max-w-lg">
        <PageHeader title="新增入金" />
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <General />
            <div className="flex justify-end">
              <Button disabled={isClick} variant="primary" type="submit">
                新增
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Page>
  )
}
