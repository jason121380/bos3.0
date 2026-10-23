import Page from 'components/Page'
import { useFetchGetMerchantVendorList } from 'hooks/useFetchGetVendor'
import idx from 'idx'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Skeleton } from 'ui/skeleton'

import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'

function MerchantVendor() {
  const merchantVendorList = useFetchGetMerchantVendorList()
  const [merchantVendor, setMerchantVendor] = useState([])

  useEffect(() => {
    if (!merchantVendorList.loading) {
      const data = idx(merchantVendorList, _ => _.data.getMerchantVendorList)
      // 查詢失敗時 data 為 undefined：當作沒有廠商，不讓整頁拋錯
      setMerchantVendor(data || [])
    }
  }, [merchantVendorList.loading])

  return (
    <Page className="ui-root" title="廠商列表">
      <AdminPageHeader
        title="廠商列表"
        primaryAction={{
          label: '新增廠商',
          to: '/merchant-vendor/create'
        }}
      />
      {!merchantVendorList.loading ? (
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
