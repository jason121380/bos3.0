/** @jsxImportSource @emotion/react */
import { Card, Container, Button, CircularProgress, IconButton, Collapse } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import AdminPageHeader from 'components/AdminPageHeader'
import { css } from '@emotion/react'
import idx from 'idx'
// ... rest of imports
import { useState } from 'react'
import produce from 'immer'
import { useFetchGetMemberships } from 'hooks/useFetchGetMembership'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'
import { Link as RouterLink } from 'react-router-dom'

import Results from './Results'
import styles from './styles/MemberCardRecord'

function MemberCardRecord() {
  // ... state definitions
  // set 類別篩選
  const [categoryFilter, setCategoryFilter] = useState([])

  const [showFilter, setShowFilter] = useState(false)
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
        <AdminPageHeader
          title="會員卡列表"
          sx={{ backgroundColor: 'transparent', mb: 0 }}
          onFilterClick={() => setShowFilter(!showFilter)}
          showFilter={showFilter}
          primaryAction={{
            label: '新增',
            to: '/member-card/create'
          }}
        />

        <Collapse in={showFilter}>
          <div style={{ marginBottom: '8px', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #f0f0f0' }}>
            <SearchBar
              onSearch={event =>
                handlePageChange({
                  key: 'keyword',
                  value: event,
                })
              }
            />
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
                onClick={handleClearCategory}
              >
                清除
              </Button>
            </div>
          </div>
        </Collapse>
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
