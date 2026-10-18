import { openSnackbar } from 'elements/snackbars'
import { useFetchDeductionSetting } from 'hooks/useFetchGetDeductionSettings'
import { useFetchUpdateDeductionSetting } from 'hooks/useFetchSetDeductionSetting'
import produce from 'immer'
import Page from 'components/Page'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'

import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import idx from 'idx'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

// 沒用到的code 大部分是之前用在AboutProfitSharing 留著怕之後改回來
function ProfitSharing({ match }) {
  const { updateDeductionSetting } = useFetchUpdateDeductionSetting()
  const getDeductionSetting = useFetchDeductionSetting(match.params.id)
  const getAttributionForRake = useFetchGetAttributionForRake()
  const [attributions, setAttributions] = React.useState([])
  const [profitSharing, setProfitSharing] = useState({
    id: match.params.id,
    designationUsage: false,
    isSegmented: false,
    nonSegmented: [],
    segmented: [],
    deductionNo: "",
    deductionName: ""
  })
  useEffect(() => {
    if (!getAttributionForRake.loading) {
      const data = idx(getAttributionForRake, _ => _.data.getAttributionForRake)
      setAttributions(data)
    }
  }, [getAttributionForRake.loading])
  useEffect(() => {
    if (!getDeductionSetting.loading) {
      setProfitSharing(
        produce(draft => {
          draft.deductionNo = idx(getDeductionSetting, _ =>
            _.data.getDeductionSetting.no)
          draft.deductionName = idx(getDeductionSetting, _ =>
            _.data.getDeductionSetting.name)
          // 判斷設計師抽成指定不指定
          draft.designationUsage = idx(
            getDeductionSetting,
            _ =>
              !!(
                (_.data.getDeductionSetting.nonSegmented.length > 0 &&
                  _.data.getDeductionSetting.nonSegmented[0].rakeData.designate.length > 0) ||
                (_.data.getDeductionSetting.segmented.length > 0 && _.data.getDeductionSetting.segmented[0].designate.length > 0)
              )
          )
          // 判斷設計師抽成是分段還是全段
          draft.isSegmented = idx(
            getDeductionSetting,
            _ =>
              !!(
                (_.data.getDeductionSetting.segmented.length > 0 && _.data.getDeductionSetting.segmented[0].designate.length > 0) ||
                (_.data.getDeductionSetting.segmented.length > 0 &&
                  _.data.getDeductionSetting.segmented[0].nonDesignate.length > 0) ||
                (_.data.getDeductionSetting.segmented.length > 0 && _.data.getDeductionSetting.segmented[0].nonDistinguish.length) >
                0
              )
          )
          // 判斷設計師是否有設全段抽成資料
          draft.nonSegmented = idx(getDeductionSetting, _ =>
            _.data.getDeductionSetting.nonSegmented.length > 0
              ? _.data.getDeductionSetting.nonSegmented
              : [
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
              ]
          )
          // 判斷設計師是否有設分段抽成資料
          draft.segmented = idx(getDeductionSetting, _ => _.data.getDeductionSetting.segmented)
        })
      )
    }
  }, [getDeductionSetting.loading])
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
    updateDeductionSetting({
      id: profitSharing.id,
      deductionNo: profitSharing.deductionNo,
      deductionName: profitSharing.deductionName,
      nonSegmented: nonSegmentedData,
      segmented: segmentedData
    }).then(() => {
      openSnackbar({ message: '更新成功', variant: 'success' })
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
  return (
    <Page className="ui-root" title="抽成方式設定">
      <div>
        <PageHeader
          title="編輯抽成方式設定"
          actions={
            <Button variant="primary" onClick={handleSave}>
              儲存
            </Button>
          }
        />
        {!getAttributionForRake.loading ? (
          <Results
            profitSharing={profitSharing}
            onChange={handleSalesWayChange}
            attributions={attributions}
          />
        ) : <div className="flex flex-col gap-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-64 w-full" /></div>}
      </div>
    </Page>
  )
}

export default ProfitSharing
