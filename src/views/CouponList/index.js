import Page from 'components/Page'
import { useFetchTicketsForList } from 'hooks/useFetchTickets'
import idx from 'idx'
import { useState, useEffect } from 'react'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import { cn } from 'ui/utils'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Link as RouterLink } from 'react-router-dom'
import { ListFilter } from 'lucide-react'
import { PageHeader } from 'ui/page-header'

function CouponList() {
  const [pageSetting, setPageSetting] = useState({
    keyword: '',
    categoryIds: [],
  })
  const [showFilter, setShowFilter] = useState(false)

  const couponsData = useFetchTicketsForList(pageSetting)
  const [serviceCategories, setServiceCategories] = useState([])
  const [selectedCategorie, setSelectedCategorie] = useState([])
  const [coupons, setCoupons] = useState([])
  const serviceCategoriesData = useFetchServiceCategories()

  useEffect(() => {
    if (!serviceCategoriesData.loading) {
      const serviceCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      setServiceCategories(serviceCategories)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [serviceCategoriesData.loading])

  useEffect(() => {
    if (!couponsData.loading) {
      // 查詢失敗時以空清單顯示，不整頁錯誤
      setCoupons(idx(couponsData, _ => _.data.ticketsForList) || [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [couponsData.loading])

  const handleClickCategorie = categorieId => {
    setSelectedCategorie([categorieId])
    setPageSetting(pre => {
      return {
        ...pre,
        categoryIds: [categorieId],
      }
    })
  }

  const handleClearCategorie = () => {
    setSelectedCategorie([])
    setPageSetting(pre => {
      return {
        ...pre,
        categoryIds: [],
      }
    })
  }

  return (
    <Page className="ui-root" title="卡券列表">
      <PageHeader
        title="預收卡設定"
        actions={
          <>
            <Button
              variant="secondary"
              aria-pressed={!!showFilter}
              onClick={() => setShowFilter(!showFilter)}
              className={showFilter ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
            >
              <ListFilter strokeWidth={1.75} />
              篩選
            </Button>
            <Button asChild variant="primary">
              <RouterLink to={'/coupon/create'}>{'新增預收卡'}</RouterLink>
            </Button>
          </>
        }
      />
      {showFilter && (
        <Card className="mb-6 flex flex-wrap items-center gap-2 px-5 py-4">
          {serviceCategories.map(serviceCategorie => (
            <Button
              size="sm"
              variant="secondary"
              aria-pressed={selectedCategorie.indexOf(serviceCategorie.id) !== -1}
              className={cn(
                'rounded-md',
                selectedCategorie.indexOf(serviceCategorie.id) !== -1
                  ? 'bg-accent/8 text-accent hover:bg-accent/15'
                  : 'bg-transparent text-text-secondary shadow-[inset_0_0_0_1px_rgb(var(--border))] hover:bg-surface-hover'
              )}
              onClick={() => handleClickCategorie(serviceCategorie.id, serviceCategorie.name)}
              key={serviceCategorie.id}
            >
              {serviceCategorie.name}
            </Button>
          ))}
          <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/8" onClick={handleClearCategorie}>
            清除
          </Button>
        </Card>
      )}
      {couponsData.error ? (
        <QueryFailed onRetry={() => couponsData.refetch()} />
      ) : !couponsData.loading ? (
        <Results refetch={couponsData.refetch} coupons={coupons} />
      ) : (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      )}
    </Page>
  )
}

export default CouponList
