/** @jsxImportSource @emotion/react */
import { Container, Button, CircularProgress, Grid } from '@mui/material'
import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import { useState } from 'react'
import produce from 'immer'
import { useFetchGetMemberships } from 'hooks/useFetchGetMembership'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'
import { Link as RouterLink } from 'react-router-dom'

import Results from './Results'
import styles from './styles/MemberCardRecord'

function MemberCardRecord() {
  // set 類別篩選
  const [categoryFilter, setCategoryFilter] = useState([])

  // submit的value
  const [setting, setSetting] = useState({
    // pageLimit: 50,
    pageOffset: 0,
    keyword: '',
    categoryUUIds: categoryFilter,
  })

  // 拿到會員卡
  const memberships = idx(useFetchGetMemberships(setting), _ => _.data.memberships)

  // 拿到會員卡全部類別
  const categories = idx(
    useFetchGetMembershipCategories({
      paranoid: true,
    }),
    _ => _.data.membershipCategories
  )
  // 換頁
  const handlePageChange = ({ key, value }) => {
    setSetting(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  // 選擇類別
  const handleClickCategory = categorieId => {
    setCategoryFilter(categorieId)
    setSetting(pre => {
      return {
        ...pre,
        categoryUUIds: [categorieId],
      }
    })
  }

  // 清楚選擇的類別
  const handleClearCategory = () => {
    setCategoryFilter([])
    setSetting({
      keyword: '',
      categoryUUIds: [],
    })
  }

  return (
    <Page css={styles.root} title="會員卡列表">
      <Container maxWidth={false}>
        <Grid style={{ marginBottom: 24 }} container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='會員卡列表' subTitle='Membership Record' />
          <Grid item>
            <Button
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/member-card/create"
            >
              新增
            </Button>
          </Grid>
        </Grid>
        <SearchBar
          onSearch={event =>
            handlePageChange({
              key: 'keyword',
              value: event,
            })
          }
        />
        <div style={{ marginTop: 12 }}>點選會員卡類別進行篩選</div>
        <div css={styles.categorieDiv}>
          {categories != undefined &&
            categories.map(category => (
              <Button
                variant={categoryFilter.indexOf(category.uuid) !== -1 ? 'contained' : 'outlined'}
                color="primary"
                size="small"
                css={
                  categoryFilter.indexOf(category.uuid) !== -1
                    ? styles.clickedCategorieBtn
                    : styles.categorieBtn
                }
                onClick={() => handleClickCategory(category.uuid, category.name)}
                disabled={categoryFilter.indexOf(category.uuid) !== -1}
                key={category.uuid}
                style={categoryFilter.indexOf(category.uuid) === -1 ? {} : { color: 'white' }}
              >
                {category.name}
              </Button>
            ))}
          <Button
            variant="contained"
            size="small"
            color="error"
            // css={styles.categorieClear}
            onClick={handleClearCategory}
          >
            清除
          </Button>
        </div>
        {memberships !== undefined ? (
            <Results
              className={styles.results}
              memberships={memberships}
              categories={categories}
              setCategoryFilter={setCategoryFilter}
              onPageChange={handlePageChange}
            />
          ) : <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}

export default MemberCardRecord
