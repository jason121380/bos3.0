import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect, Fragment } from 'react'
import useFetchGetMerchantParticipatingList from 'hooks/useFetchGetMerchantParticipatingList'
import cloneDeep from 'lodash/cloneDeep'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import { PageHeader } from 'ui/page-header'
import QueryFailed from 'components/QueryFailed'

function MerchantParticipatingList() {
  const merchantParticipatingList = useFetchGetMerchantParticipatingList()
  const [events, setEvents] = useState([])
  const [selectIds, setSelectIds] = useState([])

  const handleSetCollapse = id => {
    const cloneIds = cloneDeep(selectIds)
    const idx = cloneIds.indexOf(id)
    if (idx > -1) {
      cloneIds.splice(idx, 1)
    } else {
      cloneIds.push(id)
    }
    setSelectIds(cloneIds)
  }

  const handleToggleAll = () => {
    if (selectIds.length === events.length) {
      setSelectIds([])
    } else {
      setSelectIds(events.map(e => e.id))
    }
  }

  useEffect(() => {
    if (!merchantParticipatingList.loading) {
      // 查詢失敗時當成沒有資料（原本 events 變 undefined、讀 .length 整頁進入錯誤畫面）
      const data = idx(merchantParticipatingList, _ => _.data.merchantParticipatingList) || []
      setEvents(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantParticipatingList.loading])

  return (
    <Fragment>
      <Page className="ui-root" title="活動店家參與列表">
        <div>
          <PageHeader title="活動店家參與列表" />
          {merchantParticipatingList.error ? (
            <QueryFailed onRetry={() => merchantParticipatingList.refetch()} />
          ) : merchantParticipatingList.loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : (
            <Results
              events={events}
              setCollapse={handleSetCollapse}
              onToggleAll={handleToggleAll}
              isAllExpanded={events.length > 0 && selectIds.length === events.length}
              selectIds={selectIds}
            />
          )}
        </div>
      </Page>
    </Fragment>
  )
}

export default MerchantParticipatingList
