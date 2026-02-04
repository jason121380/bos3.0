/** @jsxImportSource @emotion/react */
import { Container, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import idx from 'idx'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'

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
        <AdminPageHeader
          title="會員卡分類設定"
          sx={{ backgroundColor: 'transparent', mb: 0 }}
          primaryAction={{
            label: '新增',
            to: '/member-card-category/create'
          }}
        />
        {!useFetchGetMembershipCategories({ paranoid: true, }).loading ?
          <Results className={styles.results} categories={categories} /> :
          <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}

export default ComodityCategories
