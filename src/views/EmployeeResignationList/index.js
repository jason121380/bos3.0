import Page from 'components/Page'
import useFetchGetEmployeeResignationList from 'hooks/useFetchGetEmployeeResignationList'
import idx from 'idx'
import { useState, useEffect } from 'react'
import useFetchMerchantDesigner from 'hooks/useFetchMerchantDesigner'
import useFetchSetCreateResignedUser from 'hooks/useFetchSetCreateResignedUser'

import { Skeleton } from 'ui/skeleton'
import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { PageHeader } from 'ui/page-header'

export default function Employees() {
  const designerId = JSON.parse(localStorage.getItem('user')).id
  const [loginUserAuthName, setLoginUserAuthName] = useState(null)
  const designerDetail = useFetchMerchantDesigner({ designerId })
  const resignationList = useFetchGetEmployeeResignationList()
  const { setCreateResignedUser } = useFetchSetCreateResignedUser()

  useEffect(() => {
    if (!designerDetail.loading) {
      const loginUserAuthName = idx(designerDetail, _ => _.data.merchantDesigner.merchantIdentity.authorityName)
      setLoginUserAuthName(loginUserAuthName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [designerDetail.loading])
  return (
    !designerDetail.loading && (
      <Page className="ui-root" title="員工離職列表">
        <div>
          <PageHeader title="員工離職列表" />
          {resignationList.error ? (
            <QueryFailed onRetry={() => resignationList.refetch()} />
          ) : !resignationList.loading ? (
            idx(resignationList, _ => (
              <Results
                className="mt-4"
                employees={_.data.getEmployeeResignationList}
                setCreateResignedUser={setCreateResignedUser}
                resignationList={resignationList}
              />
            ))
          ) : (
            <Skeleton className="h-64 w-full" />
          )}
        </div>
      </Page>
    )
  )
}
