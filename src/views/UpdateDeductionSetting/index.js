import { openSnackbar } from 'elements/snackbars'
import { useFetchDeductionSetting } from 'hooks/useFetchGetDeductionSettings'
import { useFetchUpdateDeductionSetting } from 'hooks/useFetchSetDeductionSetting'
import produce from 'immer'
import Page from 'components/Page'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'

import React, { useState, useEffect } from 'react'
import idx from 'idx'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

// 沒用到的code 大部分是之前用在AboutProfitSharing 留著怕之後改回來
function ProfitSharing({ match }) {
  const { updateDeductionSetting } = useFetchUpdateDeductionSetting()
  const getDeductionSetting = useFetchDeductionSetting(match.params.id)
  const getAttributionForRake = useFetchGetAttributionForRake()
  const [attributions, setAttributions] = React.useState([])
  // 原設定已帶入畫面：之前不顯示級距、不能存檔（設定常比已在快取的類別清單晚回來；讀不到時存檔會把空白設定蓋回去）
  const [settingLoaded, setSettingLoaded] = useState(false)
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
      // 查詢失敗時沒有類別分頁（仍可編輯讀到的設定），不整頁錯誤
      const data = idx(getAttributionForRake, _ => _.data.getAttributionForRake) || []
      setAttributions(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getAttributionForRake.loading])
  useEffect(() => {
    if (!getDeductionSetting.loading && idx(getDeductionSetting, _ => _.data.getDeductionSetting)) {
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
      setSettingLoaded(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
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
  // 主要資料讀取失敗：顯示可重試的錯誤狀態，不顯示空白表單（避免把空值存回去）
  if (getDeductionSetting.error) {
    return (
      <Page className="ui-root" title="抽成方式設定">
        <PageHeader title="編輯抽成方式設定" />
        <QueryFailed onRetry={() => getDeductionSetting.refetch()} />
      </Page>
    )
  }

  return (
    <Page className="ui-root" title="抽成方式設定">
      <div>
        <PageHeader
          title="編輯抽成方式設定"
          actions={
            <Button variant="primary" onClick={handleSave} disabled={!settingLoaded}>
              儲存
            </Button>
          }
        />
        {!getAttributionForRake.loading && settingLoaded ? (
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
