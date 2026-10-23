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
import AdminPageHeader from 'components/AdminPageHeader'
import { Search } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import { Autocomplete } from 'ui/combobox'

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
      creatorId: creatorId
    }
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
  }, [inventorysData.loading])

  useEffect(() => {
    getInventorysLazy()
  }, [])


  return (
    <Page className="ui-root" title="盤點作業">
      <AdminPageHeader
        title="盤點作業"
        showFilter={showFilter}
        onFilterClick={() => setShowFilter(!showFilter)}
        primaryAction={{
          label: draftId === null ? '開始盤點' : '繼續盤點',
          disabled: inventorysData.loading || !inventorysData.data,
          to: draftId === null ? '/inventory-work/create' : `/inventory-work/edit/${draftId}`
        }}
      >
        <DateSelector
          date={date}
          attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']}
          dateChange={value => setDate(value)}
        />
      </AdminPageHeader>

      {/* 以 hidden 收合（取代 MUI Collapse）：盤點人員 Autocomplete 為非受控，保持掛載，收合後選取內容與舊版一樣保留 */}
      <div hidden={!showFilter}>
        <Card className="mb-6 flex flex-wrap items-center gap-3 p-4">
          <span className="text-label text-text-secondary">篩選條件：</span>
          <Autocomplete
            options={
              !users.loading ? idx(users, _ => _.data.users.users) : []
            }
            disabled={users.loading}
            size="small"
            style={{ width: 220 }}
            autoHighlight
            getOptionLabel={option =>
              option.designerNo === creatorKeyword
                ? `${option.designerNo} ${option.name}`
                : option.name
            }
            renderOption={(props, option) => (
              <li {...props} style={{ fontSize: '13px' }}>{`${option.designerNo || ''} ${option.name}`}</li>
            )}
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
          <Button
            variant="secondary"
            onClick={() => getInventorysLazy()}
          >
            <Search strokeWidth={1.75} />
            查詢
          </Button>
        </Card>
      </div>
      {(!inventorysData.loading && inventorysData.data) ?
        <Results inventorys={inventorys} /> :
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      }
    </Page>
  )
}

export default InventoryWork
