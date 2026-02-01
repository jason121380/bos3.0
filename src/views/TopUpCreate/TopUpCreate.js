/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchWalletDeposit from 'hooks/useFetchWalletDeposit'
import { useState } from 'react'
import { useHistory } from 'react-router'
import { useForm, FormProvider } from 'react-hook-form'

import General from './General'
import styles from './styles/TopupCreate'

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
      const res = await walletDeposit({ input: {...data} })
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
    <Page title="新增入金" css={styles.root}>
      <Container maxWidth="lg">
        <PageTitle title='新增入金' subTitle='Top Up Create' />
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <General />
            <Button disabled={isClick} color="primary" variant="contained" type="submit">
              新增
            </Button>
          </form>
        </FormProvider>
      </Container>
    </Page>
  )
}
