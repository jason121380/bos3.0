/** @jsxImportSource @emotion/react */
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchGetEmployeeResignationList from 'hooks/useFetchGetEmployeeResignationList'
import idx from 'idx'
import { useState, useEffect } from 'react'
import useFetchMerchantDesigner from 'hooks/useFetchMerchantDesigner'
import useFetchSetCreateResignedUser from 'hooks/useFetchSetCreateResignedUser'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import { Skeleton } from 'ui/skeleton'
import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    padding: '0px !important',
  }),
  results: css({
    marginTop: theme.spacing(2),
  }),
}

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
              className={styles.results}
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
