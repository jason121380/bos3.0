import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchServices from 'hooks/useFetchServices'
import idx from 'idx'
import produce from 'immer'
import React, { useState, useEffect } from 'react'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import { cn } from 'ui/utils'

import Results from './Results'

function Services() {
  const [pageSetting, setPageSetting] = useState({
    pageLimit: 50,
    pageOffset: 0,
    keyword: '',
    categoryIds: [],
  })
  const [showFilter, setShowFilter] = useState(false)
  const [serviceCategories, setServiceCategories] = useState([])
  const [services, setServices] = useState()
  const [selectedCategorie, setSelectedCategorie] = useState([])

  const servicesData = useFetchServices(pageSetting)
  const serviceCategoriesData = useFetchServiceCategories()

  useEffect(() => {
    if (!serviceCategoriesData.loading && !servicesData.loading) {
      const services = idx(servicesData, _ => _.data.services)
      const serviceCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      setServices(services)
      setServiceCategories(serviceCategories)
    }
  }, [serviceCategoriesData.loading, servicesData.loading])

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
  const handlePageChange = ({ value, key }) => {
    setPageSetting(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleRowsPerPageChange = event => {
    setPageSetting(
      produce(draft => {
        draft.pageLimit = idx(event, _ => _.target.value)
        draft.pageOffset = 0
      })
    )
  }
  return (
    <Page className="ui-root" title="服務項目設定">
      {/* 篩選開關改用 AdminPageHeader 既有的 onFilterClick（舊版傳入的 secondaryAction 不在其 props 內，按鈕未顯示） */}
      <AdminPageHeader
        title="服務項目設定"
        showFilter={showFilter}
        onFilterClick={() => setShowFilter(!showFilter)}
        primaryAction={{
          label: '新增',
          to: '/service/create'
        }}
      />

      {showFilter && (
        <Card className="mb-6 flex flex-col gap-4 px-5 py-4">
          <SearchBar
            onSearch={event =>
              handlePageChange({
                key: 'keyword',
                value: event,
              })
            }
          />
          <div className="flex flex-col gap-2">
            <div className="divText text-caption text-text-secondary">點選服務類別進行篩選</div>
            <div className="flex flex-wrap items-center gap-2">
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
              <Button
                size="sm"
                variant="ghost"
                className="text-danger hover:bg-danger/8"
                onClick={handleClearCategorie}
              >
                清除
              </Button>
            </div>
          </div>
        </Card>
      )}
      {!servicesData.loading ?
        services !== undefined && (
          <Results
            services={services}
            refetchService={servicesData.refetch}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
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
