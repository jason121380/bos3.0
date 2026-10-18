import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect, Fragment } from 'react'
import useFetchGetMerchantParticipatingList from 'hooks/useFetchGetMerchantParticipatingList'
import { cloneDeep } from 'lodash'
import AdminPageHeader from 'components/AdminPageHeader'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

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
      const data = idx(merchantParticipatingList, _ => _.data.merchantParticipatingList)
      setEvents(data)
    }
  }, [merchantParticipatingList.loading])

  return (
    <Fragment>
      <Page className="ui-root" title="活動店家參與列表">
        <div>
          <AdminPageHeader title="活動店家參與列表" />
          {merchantParticipatingList.loading ?
            <div className="flex flex-col gap-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
            : <Results
              events={events}
              setCollapse={handleSetCollapse}
              onToggleAll={handleToggleAll}
              isAllExpanded={events.length > 0 && selectIds.length === events.length}
              selectIds={selectIds}
            />
          }

        </div>
      </Page>
    </Fragment>
  )
}

export default MerchantParticipatingList
