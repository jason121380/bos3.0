import Page from 'components/Page'
import { useFetchGetMerchantVendorList } from 'hooks/useFetchGetVendor'
import idx from 'idx'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function MerchantVendor() {
  const merchantVendorList = useFetchGetMerchantVendorList()
  const [merchantVendor, setMerchantVendor] = useState([])

  useEffect(() => {
    if (!merchantVendorList.loading) {
      const data = idx(merchantVendorList, _ => _.data.getMerchantVendorList)
      // 查詢失敗時 data 為 undefined：當作沒有廠商，不讓整頁拋錯
      setMerchantVendor(data || [])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantVendorList.loading])

  return (
    <Page className="ui-root" title="廠商列表">
      <PageHeader
        title="廠商列表"
        actions={
          <>
            <Button asChild variant="primary">
              <RouterLink to={'/merchant-vendor/create'}>{'新增廠商'}</RouterLink>
            </Button>
          </>
        }
      />
      {merchantVendorList.error ? (
          <QueryFailed onRetry={() => merchantVendorList.refetch()} />
        ) : !merchantVendorList.loading ? (
        <Results
          merchantVendor={merchantVendor}
          merchantVendorList={merchantVendorList}
        />
      ) : (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      )}

    </Page>
  )
}

export default MerchantVendor
