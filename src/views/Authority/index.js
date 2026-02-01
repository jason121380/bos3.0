/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(6),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
}

function Authority() {
  const merchantAuthData = useFetchMerchantAuthorities()
  return (
    <Page css={styles.root} title="角色權限管理">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='角色權限管理' subTitle='authority' />
          <Grid item>
            <Button
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/role/create"
            >
              新增
            </Button>
          </Grid>
        </Grid>
        {!merchantAuthData.loading ?
          idx(merchantAuthData, _ => (
            <Results
              className={styles.results}
              merchantAuth={_.data.getMerchantAuthorities}
              merchantAuthDataRefetch={merchantAuthData.refetch}
            />
          )) : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}
      </Container>
    </Page>
  )
}

export default Authority
