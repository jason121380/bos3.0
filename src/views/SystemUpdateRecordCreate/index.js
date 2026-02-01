/** @jsxImportSource @emotion/react */
import { Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import General from './General'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
}

const SystemUpdateRecordCreate = () => {
  return (
    <Page css={styles.root} title="新增版本更新紀錄">
      <Container maxWidth={false} css={styles.container}>
        <PageTitle title='新增版本紀錄' subTitle='System Update Record Create' />
        <General />
      </Container>
    </Page>
  )
}

export default SystemUpdateRecordCreate
