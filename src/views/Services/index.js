import Page from 'components/Page'
import useFetchServices from 'hooks/useFetchServices'
import idx from 'idx'
import produce from 'immer'
import React, { useState, useEffect } from 'react'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function Services() {
  const [pageSetting, setPageSetting] = useState({
    pageLimit: 50,
    pageOffset: 0,
    keyword: '',
    categoryIds: [],
  })
  const [services, setServices] = useState()

  const servicesData = useFetchServices(pageSetting)
  const serviceCategoriesData = useFetchServiceCategories()

  useEffect(() => {
    if (!serviceCategoriesData.loading && !servicesData.loading) {
      const services = idx(servicesData, _ => _.data.services)
      setServices(services)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [serviceCategoriesData.loading, servicesData.loading])

  const handlePageChange = ({ value, key }) => {
    setPageSetting(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleRowsPerPageChange = event => {
    const pageLimit = idx(event, _ => _.target.value)
    setPageSetting(
      produce(draft => {
        draft.pageLimit = pageLimit
        draft.pageOffset = 0
      })
    )
  }
  return (
    <Page className="ui-root" title="服務項目設定">
      {/* Jason 2026/10/24：服務項目設定不顯示篩選鈕。舊版篩選區（關鍵字、服務類別）開關從未接上，2026/10/22 已刪除；服務類別查詢仍保留在載入條件中 */}
      <PageHeader
        title="服務項目設定"
        actions={
          <>
            <Button asChild variant="primary">
              <RouterLink to={'/service/create'}>{'新增'}</RouterLink>
            </Button>
          </>
        }
      />

      {servicesData.error ? (
        <QueryFailed onRetry={() => servicesData.refetch()} />
      ) : !servicesData.loading ? (
        services !== undefined && (
          <Results
            services={services}
            refetchService={servicesData.refetch}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )
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

export default Services
