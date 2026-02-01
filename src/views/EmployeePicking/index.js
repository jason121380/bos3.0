/** @jsxImportSource @emotion/react */
import { Container, Grid, TextField, Link, Button } from '@mui/material'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
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
    pageLimit: 500,
    pageOffset: 0,
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    pickerId: '',
  })

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
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='材料自購登錄' subTitle='Employee Picking' />
          <Grid item>
            <Link component={RouterLink} to="/employee/picking/create">
              <Button color="primary" variant="contained" data-testid="createOrder">
                新增
              </Button>
            </Link>
          </Grid>
        </Grid>
        <Grid container style={{ gap: 10 }}>
          <Grid item>
            <MerchantSearchBar
              values={pageSetting}
              onFilter={value => setPageSetting(value)}
              outside
              visible={['datePicker', 'employee']}
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
