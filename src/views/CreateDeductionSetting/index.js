import { openSnackbar } from 'elements/snackbars'
import { useFetchCreateDeductionSetting } from 'hooks/useFetchSetDeductionSetting'
import produce from 'immer'
import Page from 'components/Page'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'
import idx from 'idx'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import React from 'react'

import Results from './Results'

// 沒用到的code 大部分是之前用在AboutProfitSharing 留著怕之後改回來
function Deduction() {
  const { createDeductionSetting } = useFetchCreateDeductionSetting()
  const getAttributionForRake = useFetchGetAttributionForRake()

  const [attributions, setAttributions] = React.useState([])
  const [profitSharing, setProfitSharing] = React.useState({
    designationUsage: false,
    isSegmented: false,
    nonSegmented: [
      {
        attribute: '預設',
        rakeData: {
          nonDistinguish: [
            {
              threshold: 0,
              rake: 0,
            },
          ],
          designate: [],
          nonDesignate: [],
        },
      },
    ],
    segmented: [],
    deductionNo: "",
    deductionName: ""
  })
  const handleSave = () => {
    // 判斷抽成設定是判斷抽成設定是全段或分段
    const nonSegmentedData =
      profitSharing.nonSegmented.length > 0 && profitSharing.isSegmented === false
        ? profitSharing.nonSegmented
        : []
    const segmentedData =
      profitSharing.segmented.length > 0 && profitSharing.isSegmented === true
        ? profitSharing.segmented
        : []
    createDeductionSetting({
      deductionNo: profitSharing.deductionNo,
      deductionName: profitSharing.deductionName,
      nonSegmented: nonSegmentedData,
      segmented: segmentedData,
    }).then(() => {
      openSnackbar({ message: '新增成功', variant: 'success' })
      window.location.href = '/performanceDeductionParameter'
    })
  }

  const handleSalesWayChange = ({ key, value }) => {
    setProfitSharing(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  React.useEffect(() => {
    if (!getAttributionForRake.loading) {
      // 查詢失敗時沒有類別分頁（仍可設定預設組），不整頁錯誤
      const data = idx(getAttributionForRake, _ => _.data.getAttributionForRake) || []
      setAttributions(data)
    }
  }, [getAttributionForRake.loading])
  return (
    <Page className="ui-root" title="抽成方式設定">
      <PageHeader
        title='抽成方式設定'
        actions={
          <Button variant="primary" onClick={handleSave}>
            確認
          </Button>
        }
      />
      {!getAttributionForRake.loading ? (
        <Results
          profitSharing={profitSharing}
          onChange={handleSalesWayChange}
          attributions={attributions}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      )}
    </Page>
  )
}

export default Deduction
