/** @jsxImportSource @emotion/react */
import { Card, Container, Grid, TextField, Link, Button, IconButton, Collapse } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import DateSelector from 'components/DateSelector'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { endOfDay, startOfMonth } from 'date-fns'
import idx from 'idx'
import produce from 'immer'
import React, { useState } from 'react'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import useFetchGetPickingRecords from 'hooks/useFetchGetPickingRecords'
import useFetchGetActionsBannedAfterDailyCheckout from 'hooks/useFetchGetActionsBannedAfterDailyCheckout'
import Autocomplete from '@mui/material/Autocomplete'
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
    marginTop: theme.spacing(3),
  }),
}

function EmployeePicking() {
  const [categoryValue, setCategoryValue] = useState([])
  const [pageSetting, setPageSetting] = React.useState({
    pageLimit: 1000,
    pageOffset: 0,
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    pickerId: '',
  })
  const [showFilter, setShowFilter] = React.useState(false)

  const getPickingRecords = useFetchGetPickingRecords({
    input: {
      pageLimit: pageSetting.pageLimit,
      pageOffset: pageSetting.pageOffset,
      start: pageSetting.startDate,
      end: pageSetting.endDate,
      pickerId: pageSetting.employeeId,
      productCategoryId: categoryValue,
    }
  })

  const actionsBanned = useFetchGetActionsBannedAfterDailyCheckout()

  const handlePageChange = (event, newPage) => {
    setPageSetting(
      produce(draft => {
        draft.pageOffset = newPage
      })
    )
  }
  const handleRowsPerPageChange = event => {
    setPageSetting(
      produce(draft => {
        draft.pageLimit = idx(event, _ => _.target.value)
        draft.pageOffset = 0
      })
    )
  }
  const productCategories = useFetchProductCategories()
  const categories = idx(productCategories, _ => _.data.productCategories)
  const categoriesArr = [{ value: null, label: '全部' }]
  categories != undefined &&
    categories.map(category => {
      categoriesArr.push({
        label: category.name + (category.no === '' ? '' : '/' + category.no),
        value: category.id,
      })
    })
  const handleOnchange = (event, value) => {
    if (value.value === null) {
      setCategoryValue([])
    } else {
      setCategoryValue([value.value])
    }
  }
  return (
    <Page css={styles.root} title="材料自購登錄">
      <Container maxWidth={false} css={styles.container}>
        <Card
          css={css({
            display: 'flex',
            padding: '0 0 24px 0',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            borderRadius: 0,
            boxShadow: 'none',
            border: 'none !important',
            marginBottom: 0,
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PageTitle title='材料自購登錄' style={{ color: '#1A73E8' }} />
            <Link component={RouterLink} to="/employee/picking/create" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                css={css({
                  borderRadius: '20px !important',
                  padding: '6px 20px !important',
                  fontSize: '14px !important',
                  boxShadow: 'none !important',
                  fontWeight: 'bold !important',
                  backgroundColor: 'rgb(var(--background)) !important',
                  color: 'rgb(var(--text-secondary)) !important',
                  '&:hover': {
                    backgroundColor: 'rgb(var(--surface)) !important',
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
                color: showFilter ? 'rgb(var(--accent)) !important' : 'rgb(var(--text-secondary)) !important',
                marginLeft: '4px !important',
                '&:hover': {
                  backgroundColor: 'rgba(26, 115, 232, 0.15) !important',
                }
              })}
            >
              <FilterListIcon />
            </IconButton>
          </div>
          <DateSelector
            date={pageSetting}
            attributes={[
              'thismonth', 'lastmonth', 'dbyesterday',
              'yesterday', 'today', 'startDate', 'endDate'
            ]}
            dateChange={value => setPageSetting(value)}
          />
        </Card>

        <Collapse in={showFilter}>
          <div style={{ marginBottom: '12px', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #f0f0f0' }}>
            <Grid container style={{ gap: 10 }}>
              <Grid item>
                <MerchantSearchBar
                  values={pageSetting}
                  onFilter={value => setPageSetting(value)}
                  outside
                  visible={['employee']}
                  lastInLeaderBoard={true}
                />
              </Grid>
              <Grid item style={{ width: 180, display: 'flex', alignItems: 'center' }}>
                <Autocomplete
                  freeSolo
                  fullWidth
                  disableClearable
                  options={categoriesArr}
                  onChange={(event, value) => handleOnchange(event, value)}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="分類"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        style: { height: '53px' },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </div>
        </Collapse>
        {idx(
          getPickingRecords, _ => _.data.pickingRecords &&
            actionsBanned.data.getActionsBannedAfterDailyCheckout && (
              <Results
                pageSetting={pageSetting}
                className={styles.results}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                pickingRecords={_.data.pickingRecords}
                actionsBanned={actionsBanned.data.getActionsBannedAfterDailyCheckout}
              />
            )
        )}
      </Container>
    </Page>
  )
}

export default EmployeePicking
