/** @jsxImportSource @emotion/react */
import {
  Container, CircularProgress, Button, TextField,
  Snackbar, Autocomplete, Typography, Collapse
} from '@mui/material'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import idx from 'idx'
import { startOfMonth, endOfMonth } from 'date-fns'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import { useFetchGetInventorysLazy } from 'hooks/useFetchGetInventorys'
import Alert from '@mui/material/Alert';
import { css } from '@emotion/react'
import { theme } from '../../theme'
import AdminPageHeader from 'components/AdminPageHeader'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
  }),
  filterWrap: css({
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #f0f0f0',
  }),
  pillButton: css({
    borderRadius: '20px !important',
    padding: '4px 20px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
  }),
}

function InventoryWork() {
  const [draftId, setDraftId] = useState(null)
  const [open, setOpen] = useState(false)
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
        setOpen(true)
        setFirst(2)
      }
    }
  }, [inventorysData.loading])

  useEffect(() => {
    getInventorysLazy()
  }, [])


  return (
    <Page css={styles.root} title="盤點作業">
      <Snackbar open={open}
        style={{ top: '40vh' }}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Alert variant='filled' severity="warning">尚有未完成的盤點草稿，請按右上角按鈕完成盤點。</Alert>
      </Snackbar>
      <Container maxWidth={false} css={styles.container}>
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

        <Collapse in={showFilter}>
          <div css={styles.filterWrap}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666' }}>篩選條件：</Typography>
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
                    style: { borderRadius: '8px' }
                  }}
                />
              )}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => getInventorysLazy()}
              css={styles.pillButton}
              size="small"
            >
              查詢
            </Button>
          </div>
        </Collapse>
        {(!inventorysData.loading && inventorysData.data) ?
          <Results inventorys={inventorys} /> :
          <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}

export default InventoryWork
