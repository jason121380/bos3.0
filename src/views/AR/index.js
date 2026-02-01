/** @jsxImportSource @emotion/react */
import { Container } from '@mui/material'
import Page from 'components/Page'
import { Helmet } from 'react-helmet'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    textAlign: 'center',
  }),
  ar: css({
    width: '540px',
    height: '810px',
    left: 0,
    right: 0,
    margin: 'auto',
  }),
  container: css({
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  ul: css({
    marginTop: 20,
    position: 'absolute',
    left: '1280px',
    top: 0,
  }),
  li: css({
    listStyle: 'none',
    width: 50,
    height: 50,
    borderRadius: '50%',
    // display: 'inline-block',
    marginTop: 10,
    marginRight: 10,
  }),
}

export default function Employees() {
  return (
    <Page css={styles.root} title="AR變髮色">
      <Helmet>
        <title>AR 變髮色</title>
      </Helmet>
      <Container maxWidth={false} css={styles.container}>
        系統優化中
      </Container>
    </Page>
  )
}
