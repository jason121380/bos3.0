import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import AdminPageHeader from 'components/AdminPageHeader'
import idx from 'idx'
// ... rest of imports
import { useState } from 'react'
import produce from 'immer'
import { useFetchGetMemberships } from 'hooks/useFetchGetMembership'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'
import { Link as RouterLink } from 'react-router-dom'

import Results from './Results'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import { cn } from 'ui/utils'

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
    <Page className="ui-root" title="會員卡列表">
      <div>
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

        {showFilter && (
          <Card className="mb-4 p-4">
            <SearchBar
              onSearch={event =>
                handlePageChange({
                  key: 'keyword',
                  value: event,
                })
              }
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {categories != undefined &&
                categories.map(category => (
                  <Button
                    variant="secondary"
                    size="sm"
                    className={cn(categoryFilter.indexOf(category.uuid) !== -1 && 'bg-accent/8 text-accent disabled:opacity-100')}
                    aria-pressed={categoryFilter.indexOf(category.uuid) !== -1}
                    onClick={() => handleClickCategory(category.uuid, category.name)}
                    disabled={categoryFilter.indexOf(category.uuid) !== -1}
                    key={category.uuid}
                  >
                    {category.name}
                  </Button>
                ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-danger"
                onClick={handleClearCategory}
              >
                清除
              </Button>
            </div>
          </Card>
        )}
        {memberships !== undefined ? (
          <Results
            memberships={memberships}
            categories={categories}
            setCategoryFilter={setCategoryFilter}
            onPageChange={handlePageChange}
          />
        ) : <div className="flex flex-col gap-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
        }
      </div>
    </Page>
  )
}

export default MemberCardRecord
