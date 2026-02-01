/** @jsxImportSource @emotion/react */
import { Container, colors, Grid, FormControlLabel, Checkbox } from '@mui/material'
import Page from 'components/Page'
import { useState } from 'react'
import PageTitle from 'components/PageTitle'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import General from './General'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  tabs: css({
    marginTop: theme.spacing(3),
  }),
  divider: css({
    backgroundColor: colors.grey[300],
  }),
}

export default function AccountingRecordCreate() {
  const stayInCreateAccountInMemory = JSON.parse(localStorage.getItem('stayInCreateAccount'))

  const [stayInCreateAccount, setStayInCreateAccount] = useState(
    stayInCreateAccountInMemory !== null ? stayInCreateAccountInMemory : false
  )

  const handleStayInCreateAccount = () => {
    if (!stayInCreateAccount) {
      setStayInCreateAccount(true)
      localStorage.setItem('stayInCreateAccount', true)
    } else {
      localStorage.removeItem('stayInCreateAccount')
      setStayInCreateAccount(false)
    }
  }
  return (
    <Page css={styles.root} title="新增收借支紀錄">
      <Container maxWidth="md">
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='新增收借支紀錄' subTitle='CREATE ACCOUNTING RECORD' />
          <Grid item>
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label="連續新增收借支"
              checked={stayInCreateAccount}
              onChange={handleStayInCreateAccount}
            />
          </Grid>
        </Grid>
        <General stayInCreateAccount={stayInCreateAccount} />
      </Container>
    </Page>
  )
}
