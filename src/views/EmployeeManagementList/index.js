/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useFetchUsersInEmployeeList } from 'hooks/useFetchUsers'
import idx from 'idx'
import produce from 'immer'
import React, { useState, useEffect } from 'react'
import useFetchMerchantDesigner from 'hooks/useFetchMerchantDesigner'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(2),
  }),
}

export default function Employees() {
  const designerId = JSON.parse(localStorage.getItem('user')).id
  const [page, setPage] = useState({
    offset: 0,
    limit: 50,
    keyword: '',
  })
  const [loginUserAuthName, setLoginUserAuthName] = React.useState(null)
  const [rakeSetAble, setRakeSetAble] = React.useState(false)

  const designerDetail = useFetchMerchantDesigner({ designerId })
  const authorities = useFetchMerchantAuthorities()

  useEffect(() => {
    if (!designerDetail.loading && !authorities.loading) {
      const loginUserAuthName = idx(
        designerDetail,
        _ => _.data.merchantDesigner.merchantIdentity.authorityName
      )
      const authorityId = idx(
        designerDetail,
        _ => _.data.merchantDesigner.merchantIdentity.authorityId
      )
      const authoritySettings = JSON.parse(idx(authorities, _ => _.data.getMerchantAuthorities).find(d => d.id === authorityId).authoritySettings)
      const editEmployee = authoritySettings.find(d => d.pageTitle === "員工及薪資").pageAuthority
      const editAble = editEmployee.find(d => d.pageName === "批量抽成設定").authority
      setRakeSetAble(editAble)
      setLoginUserAuthName(loginUserAuthName)
    }
  }, [designerDetail.loading, authorities.loading])

  const users = useFetchUsersInEmployeeList({
    pageLimit: page.limit,
    pageOffset: page.offset,
    keyword: page.keyword,
    usagelimit: 'EMPLOYEE_LIST',
  })

  const handleOnChangePage = (_event, newPage) => {
    setPage(
      produce(value => {
        value.offset = newPage
      })
    )
  }

  const handleOnChangeRowsPerPage = event => {
    setPage(
      produce(value => {
        value.limit = event.target.value
      })
    )
  }
  return (
    !designerDetail.loading && (
      <Page css={styles.root} title="員工列表">
        <Container maxWidth={false} css={styles.container}>
          <Grid container item justifyContent='space-between' alignItems='center'>
            <PageTitle title='員工列表' subTitle='Employee Management List' />
            <Button
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/employee/create"
            >
              新增
            </Button>
          </Grid>
          {!users.loading ? idx(users, _ => (
            <Results
              className={styles.results}
              employees={_.data.users.users}
              handleOnChangePage={handleOnChangePage}
              handleOnChangeRowsPerPage={handleOnChangeRowsPerPage}
              page={page}
              pageCount={_.data.users.totalCount}
              loginUserAuthName={loginUserAuthName}
              rakeSetAble={rakeSetAble}
            />
          )) : <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
          }
        </Container>
      </Page>
    )
  )
}
