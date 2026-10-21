// 分類篩選 Autocomplete 保留 MUI
import { TextField } from 'ui/text-field'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import DateSelector from 'components/DateSelector'
import Page from 'components/Page'
import { endOfDay, startOfMonth } from 'date-fns'
import idx from 'idx'
import produce from 'immer'
import React, { useState } from 'react'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import useFetchGetPickingRecords from 'hooks/useFetchGetPickingRecords'
import useFetchGetActionsBannedAfterDailyCheckout from 'hooks/useFetchGetActionsBannedAfterDailyCheckout'
import Autocomplete from 'ui/combobox'
import { Link as RouterLink } from 'react-router-dom'
import { ListFilter, Plus } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { PageHeader, Toolbar, ToolbarSpacer } from 'ui/page-header'

import Results from './Results'

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
  categories != null &&
    categories.forEach(category => {
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
    <Page className="ui-root" title="材料自購登錄">
      <PageHeader
        title="材料自購登錄"
        actions={
          <Button asChild variant="primary">
            <RouterLink to="/employee/picking/create">
              <Plus strokeWidth={1.75} />
              新增
            </RouterLink>
          </Button>
        }
      />
      <Toolbar>
        <DateSelector
          date={pageSetting}
          attributes={[
            'thismonth', 'lastmonth', 'dbyesterday',
            'yesterday', 'today', 'startDate', 'endDate'
          ]}
          dateChange={value => setPageSetting(value)}
        />
        <ToolbarSpacer />
        <Button
          variant="secondary"
          aria-pressed={showFilter}
          className={showFilter ? 'border-text bg-surface-hover' : undefined}
          onClick={() => setShowFilter(!showFilter)}
        >
          <ListFilter strokeWidth={1.75} />
          篩選
        </Button>
      </Toolbar>

      {showFilter && (
        <Card className="mb-6 flex flex-wrap items-center gap-2.5 p-4">
          <div>
            <MerchantSearchBar
              values={pageSetting}
              onFilter={value => setPageSetting(value)}
              outside
              visible={['employee']}
              lastInLeaderBoard={true}
            />
          </div>
          <div className="flex w-[180px] items-center">
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
          </div>
        </Card>
      )}
      {idx(
        getPickingRecords, _ => _.data.pickingRecords &&
          actionsBanned.data.getActionsBannedAfterDailyCheckout && (
            <Results
              pageSetting={pageSetting}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              pickingRecords={_.data.pickingRecords}
              actionsBanned={actionsBanned.data.getActionsBannedAfterDailyCheckout}
            />
          )
      )}
    </Page>
  )
}

export default EmployeePicking
