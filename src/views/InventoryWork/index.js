import { openSnackbar } from 'elements/snackbars'
import { TextField } from 'ui/text-field'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import idx from 'idx'
import { startOfMonth, endOfMonth } from 'date-fns'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import { useFetchGetInventorysLazy } from 'hooks/useFetchGetInventorys'
import { Search, ListFilter } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import { Autocomplete } from 'ui/combobox'
import { PageHeader } from 'ui/page-header'

function InventoryWork() {
  const [draftId, setDraftId] = useState(null)
  const [first, setFirst] = useState(1)
  const [creatorId, setCreatorId] = useState(null)
  const [creatorKeyword, setCreatorKeyword] = useState('')
  const [inventorys, setInventorys] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfMonth(new Date()).getTime(),
  })
  const users = useFetchUsersForCreatePicking({
    keyword: '',
    pageLimit: 100,
    pageOffset: 0,
  })
  const [getInventorysLazy, inventorysData] = useFetchGetInventorysLazy({
    input: {
      dateRange: date,
      creatorId: creatorId,
    },
  })

  const handleInputChange = event => {
    idx(event, _ => {
      setCreatorKeyword(_.target.value)
    })
  }

  useEffect(() => {
    if (!inventorysData.loading && inventorysData.data) {
      const data = idx(inventorysData, _ => _.data.getInventorys)
      setInventorys(data.checked)
      setDraftId(data.draft?.id || null)

      if (data.draft !== null && first === 1) {
        openSnackbar({ message: '尚有未完成的盤點草稿，請按右上角按鈕完成盤點。', variant: 'warning' })
        setFirst(2)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [inventorysData.loading] 變動時執行；first、inventorysData 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [inventorysData.loading])

  useEffect(() => {
    getInventorysLazy()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在掛載時執行一次
  }, [])

  return (
    <Page className="ui-root" title="盤點作業">
      <PageHeader
        title="盤點作業"
        actions={
          <>
            <DateSelector date={date} attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']} dateChange={value => setDate(value)} />
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
              <RouterLink to={draftId === null ? '/inventory-work/create' : `/inventory-work/edit/${draftId}`}>
                {draftId === null ? '開始盤點' : '繼續盤點'}
              </RouterLink>
            </Button>
          </>
        }
      />

      {/* 以 hidden 收合（取代 MUI Collapse）：盤點人員 Autocomplete 為非受控，保持掛載，收合後選取內容與舊版一樣保留 */}
      <div hidden={!showFilter}>
        <Card className="mb-6 flex flex-wrap items-center gap-3 p-4">
          <span className="text-label text-text-secondary">篩選條件：</span>
          <Autocomplete
            options={!users.loading && users.data ? idx(users, _ => _.data.users.users) || [] : []}
            disabled={users.loading}
            size="small"
            style={{ width: 220 }}
            autoHighlight
            getOptionLabel={option => (option.designerNo === creatorKeyword ? `${option.designerNo} ${option.name}` : option.name)}
            renderOption={(props, option) => <li {...props} style={{ fontSize: '13px' }}>{`${option.designerNo || ''} ${option.name}`}</li>}
            onChange={(e, value) => {
              setCreatorId(value?.id || null)
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="盤點人員"
                variant="outlined"
                fullWidth
                onChange={handleInputChange}
                InputProps={{
                  ...params.InputProps,
                }}
              />
            )}
          />
          {users.error ? (
            <div role="alert" className="flex flex-wrap items-center gap-2 text-label text-danger">
              <span>無法載入盤點人員</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => users.refetch()}>
                重新查詢盤點人員
              </Button>
            </div>
          ) : null}
          <Button variant="secondary" onClick={() => getInventorysLazy()}>
            <Search strokeWidth={1.75} />
            查詢
          </Button>
        </Card>
      </div>
      {inventorysData.error ? (
        <EmptyState
          title="無法載入盤點資料"
          description="請再試一次。列表不會一直停在載入中。"
          action={
            <Button type="button" variant="secondary" onClick={() => getInventorysLazy()}>
              重新查詢
            </Button>
          }
        />
      ) : !inventorysData.loading && inventorysData.data ? (
        <Results inventorys={inventorys} />
      ) : (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      )}
    </Page>
  )
}

export default InventoryWork
