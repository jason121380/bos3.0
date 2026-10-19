import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchGetEmployeeResignationList from 'hooks/useFetchGetEmployeeResignationList'
import idx from 'idx'
import { useState, useEffect } from 'react'
import useFetchMerchantDesigner from 'hooks/useFetchMerchantDesigner'
import useFetchSetCreateResignedUser from 'hooks/useFetchSetCreateResignedUser'

import { Skeleton } from 'ui/skeleton'
import Results from './Results'


export default function Employees() {
  const designerId = JSON.parse(localStorage.getItem('user')).id
  const [loginUserAuthName, setLoginUserAuthName] = useState(null)
  const designerDetail = useFetchMerchantDesigner({ designerId })
  const resignationList = useFetchGetEmployeeResignationList()
  const { setCreateResignedUser } = useFetchSetCreateResignedUser()

  useEffect(() => {
    if (!designerDetail.loading) {
      const loginUserAuthName = idx(
        designerDetail,
        _ => _.data.merchantDesigner.merchantIdentity.authorityName
      )
      setLoginUserAuthName(loginUserAuthName)
    }
  }, [designerDetail.loading])
  return (
    !designerDetail.loading && (
      <Page className="ui-root" title="員工離職列表">
        <div>
          <AdminPageHeader title='員工離職列表' />
          {!resignationList.loading ? idx(resignationList, _ => (
            <Results
              className="mt-4"
              employees={_.data.getEmployeeResignationList}
              setCreateResignedUser={setCreateResignedUser}
              resignationList={resignationList}
            />
          )) : <Skeleton className="h-64 w-full" />
          }
        </div>
      </Page>
    )
  )
}
