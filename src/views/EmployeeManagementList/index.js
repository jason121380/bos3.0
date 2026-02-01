/** @jsxImportSource @emotion/react */
import { Card, Container, CircularProgress, Grid, Button, IconButton, Collapse, TextField } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
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
  const [showFilter, setShowFilter] = useState(false)
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
          <Card
            css={css({
              display: 'flex',
              padding: '12px 24px',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#E8F0FE',
              borderRadius: '12px',
              boxShadow: 'none',
              border: 'none !important',
              marginBottom: '12px',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <PageTitle title='員工列表' style={{ color: '#1A73E8' }} />
              <Link component={RouterLink} to="/employee/create" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  css={css({
                    borderRadius: '20px !important',
                    padding: '6px 20px !important',
                    fontSize: '14px !important',
                    boxShadow: 'none !important',
                    fontWeight: 'bold !important',
                    backgroundColor: '#FFFFFF !important',
                    color: '#666 !important',
                    '&:hover': {
                      backgroundColor: '#f8f8f8 !important',
                    }
                  })}
                >
                  新增
                </Button>
              </Link>
              <IconButton
                onClick={() => setShowFilter(!showFilter)}
                css={css({
                  backgroundColor: showFilter ? 'rgba(26, 115, 232, 0.1) !important' : 'transparent !important',
                  color: showFilter ? '#1A73E8 !important' : '#666 !important',
                  marginLeft: '4px !important',
                  '&:hover': {
                    backgroundColor: 'rgba(26, 115, 232, 0.15) !important',
                  }
                })}
              >
                <FilterListIcon />
              </IconButton>
            </div>
          </Card>

          <Collapse in={showFilter}>
            <div style={{ marginBottom: '12px', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #f0f0f0' }}>
              <TextField
                label="搜尋姓名或編號"
                variant="outlined"
                size="small"
                value={page.keyword}
                onChange={e => setPage({ ...page, keyword: e.target.value, offset: 0 })}
                style={{ width: 250 }}
              />
            </div>
          </Collapse>
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
