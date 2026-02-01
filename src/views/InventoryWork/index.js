/** @jsxImportSource @emotion/react */
import {
  Container, CircularProgress, Button, Grid, TextField,
  Snackbar, Autocomplete
} from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
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

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  filterWrap: css({
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center'
  })
}

function InventoryWork() {
  const [draftId, setDraftId] = useState(null)
  const [open, setOpen] = useState(false)
  const [first, setFirst] = useState(1)
  const [creatorId, setCreatorId] = useState(null)
  const [creatorKeyword, setCreatorKeyword] = useState('')
  const [inventorys, setInventorys] = useState([])
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
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='盤點作業' subTitle='Inventory Work' />
          <Grid item>
            <Button
              disabled={inventorysData.loading || !inventorysData.data}
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to={draftId === null ? '/inventory-work/create' : `/inventory-work/edit/${draftId}`}
            >
              {draftId === null ? '盤點' : '繼續盤點'}
            </Button>
          </Grid>
        </Grid>
        <div css={styles.filterWrap}>
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />
          <Autocomplete
            options={
              !users.loading ? idx(users, _ => _.data.users.users) : []
            }
            disabled={users.loading}
            style={{ width: 180 }}
            autoHighlight
            getOptionLabel={option =>
              option.designerNo === creatorKeyword
                ? `${option.designerNo} ${option.name}`
                : option.name
            }
            renderOption={(props, option) => (
              <li {...props}>{`${option.designerNo || ''} ${option.name}`}</li>
            )}
            onChange={(e, value) => {
              setCreatorId(value?.id || null)
            }
            }
            renderInput={params => (
              <TextField
                {...params}
                label="建立者"
                variant="outlined"
                fullWidth
                onChange={handleInputChange}
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password',
                }}
              />
            )}
          />
        </div>
        {(!inventorysData.loading && inventorysData.data) ?
          <Results inventorys={inventorys} draftLength={idx(inventorysData, _ => _.data.getInventorys)} /> :
          <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}

export default InventoryWork
