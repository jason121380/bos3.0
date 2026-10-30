import Page from 'components/Page'
import { useFetchUsersInEmployeeList } from 'hooks/useFetchUsers'
import idx from 'idx'
import produce from 'immer'
import React, { useState, useEffect } from 'react'
import useFetchMerchantDesigner from 'hooks/useFetchMerchantDesigner'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import { Card } from 'ui/card'
import { Field, Input } from 'ui/input'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Link as RouterLink } from 'react-router-dom'
import { ListFilter } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

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
      const loginUserAuthName = idx(designerDetail, _ => _.data.merchantDesigner.merchantIdentity.authorityName)
      const authorityId = idx(designerDetail, _ => _.data.merchantDesigner.merchantIdentity.authorityId)
      // 找不到角色、或角色缺「員工及薪資」區塊／「批量抽成設定」項目時，視為沒有批量抽成權限（原本直接拋錯，整頁錯誤）
      const merchantAuthorities = idx(authorities, _ => _.data.getMerchantAuthorities)
      const identity = Array.isArray(merchantAuthorities) ? merchantAuthorities.find(d => d.id === authorityId) : undefined
      const authoritySettings = identity ? JSON.parse(identity.authoritySettings) : []
      const editEmployee = authoritySettings.find(d => d.pageTitle === '員工及薪資')?.pageAuthority ?? []
      const editAble = editEmployee.find(d => d.pageName === '批量抽成設定')?.authority ?? false
      setRakeSetAble(editAble)
      setLoginUserAuthName(loginUserAuthName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
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
      <Page className="ui-root" title="員工列表">
        <PageHeader
          title="員工列表"
          actions={
            <>
              <Button
                variant="secondary"
                aria-pressed={!!showFilter}
                onClick={() => setShowFilter(!showFilter)}
                className={showFilter ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
              >
                <ListFilter strokeWidth={1.75} />
                篩選
              </Button>
              <Button asChild variant="primary">
                <RouterLink to={'/employee/create'}>{'新增'}</RouterLink>
              </Button>
            </>
          }
        />

        {showFilter && (
          <Card className="mb-6 p-4">
            <Field label="搜尋姓名或編號" htmlFor="employee-keyword" className="w-[250px]">
              <Input id="employee-keyword" value={page.keyword} onChange={e => setPage({ ...page, keyword: e.target.value, offset: 0 })} />
            </Field>
          </Card>
        )}
        {users.error ? (
          <QueryFailed onRetry={() => users.refetch()} />
        ) : !users.loading ? (
          idx(users, _ => (
            <Results
              employees={_.data.users.users}
              handleOnChangePage={handleOnChangePage}
              handleOnChangeRowsPerPage={handleOnChangeRowsPerPage}
              page={page}
              pageCount={_.data.users.totalCount}
              loginUserAuthName={loginUserAuthName}
              rakeSetAble={rakeSetAble}
            />
          ))
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示（users.loading）
          <div aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[480px] w-full rounded-lg" />
          </div>
        )}
      </Page>
    )
  )
}
