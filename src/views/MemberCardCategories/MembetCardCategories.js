/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'
import { Link as RouterLink } from 'react-router-dom'

import Results from './Results'
import styles from './styles/MemberCardCategories'

function ComodityCategories() {
  // 拿到會員卡全部類別
  const categories = idx(
    useFetchGetMembershipCategories({
      paranoid: true,
    }),
    _ => _.data.membershipCategories
  )
  return (
    <Page css={styles.root} title="會員卡分類設定">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='會員卡分類設定' subTitle='Membership Categories' />
          <Grid item>
            <Button
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/member-card-category/create"
            >
              新增
            </Button>
          </Grid>
        </Grid>
        {!useFetchGetMembershipCategories({ paranoid: true, }).loading ?
          <Results className={styles.results} categories={categories} /> :
          <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}

export default ComodityCategories
