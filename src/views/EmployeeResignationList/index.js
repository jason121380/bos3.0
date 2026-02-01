/** @jsxImportSource @emotion/react */
import { Container, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import useFetchGetEmployeeResignationList from 'hooks/useFetchGetEmployeeResignationList'
import idx from 'idx'
import PageTitle from 'components/PageTitle'
import { useState, useEffect } from 'react'
import useFetchMerchantDesigner from 'hooks/useFetchMerchantDesigner'
import useFetchSetCreateResignedUser from 'hooks/useFetchSetCreateResignedUser'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(6),
  }),
  results: css({
    marginTop: theme.spacing(3),
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
      <Page css={styles.root} title="員工離職列表">
        <Container maxWidth={false} css={styles.container}>
          <PageTitle title='員工離職列表' subTitle='Employee Resignation List' />
          {!resignationList.loading ? idx(resignationList, _ => (
            <Results
              className={styles.results}
              employees={_.data.getEmployeeResignationList}
              setCreateResignedUser={setCreateResignedUser}
              resignationList={resignationList}
            />
          )) : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>
          }
        </Container>
      </Page>
    )
  )
}
