/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Button, Grid } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import useFetchThirdPartyCoupons from 'hooks/useFetchThirdPartTicket'
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

function ThirdPartyCoupons() {
  const thirdPartyCoupons = useFetchThirdPartyCoupons()

  return (
    <Page css={styles.root} title="第三方卡券設定">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='第三方卡券設定' subTitle='Third Party Coupons' />
          <Grid item>
            <Button
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/thirdPartyCoupon/create"
            >
              新增
            </Button>
          </Grid>
        </Grid>
        {!thirdPartyCoupons.loading ?
          <Results
            className={styles.results}
            thirdPartyCouponList={idx(thirdPartyCoupons, _ => _.data.getThirdPartTicket)}
            thirdPartyCouponsRefetch={thirdPartyCoupons.refetch}
          />
          : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}

      </Container>
    </Page>
  )
}

export default ThirdPartyCoupons
