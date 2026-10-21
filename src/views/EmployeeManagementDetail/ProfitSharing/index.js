import designerContext from 'context/designerContext'
import { openSnackbar } from 'elements/snackbars'
import { useFetchSetUserRake } from 'hooks/useFetchEmployeeSaleSetting'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchSetUserDeductionWay from 'hooks/useFetchSettingUserDeductionWay'
import { useFetchUpdateUserIdentity } from 'hooks/useFetchEmployeeSaleSetting'
import produce from 'immer'
import { useEffect, useState, useContext } from 'react'
import idx from 'idx'
import { useHistory } from 'react-router'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

import AboutPerformance from './AboutPerformance'
import cloneDeep from 'lodash/cloneDeep'

// 沒用到的code 大部分是之前用在AboutProfitSharing 留著怕之後改回來
function ProfitSharing({ refetch, itemAuthority }) {
  const history = useHistory()
  const { designer } = useContext(designerContext)
  const { fetchSetUserRake } = useFetchSetUserRake()
  const { setUserDeductionWay } = useFetchSetUserDeductionWay()
  const { fetchUpdateUserIdentity } = useFetchUpdateUserIdentity()
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  const merchantJobTitlePointData = useFetchMerchantJobTitlePoint({ merchantId })
  const commissionWay = useFetchMerchantCommissionWay()
  const merchantJobTitlePoints = idx(merchantJobTitlePointData, _ => _.data.merchantJobTitlePoint)
  const getAttributionForRake = useFetchGetAttributionForRake()
  const [settingVisble, setSettingVisble] = useState(false)
  const [attributions, setAttributions] = useState([])
  const [profitSharing, setProfitSharing] = useState({
    userId: designer.id,
    MerchantJobTitlePointId: '',
    designationUsage: false,
    rakeType: 'LADDERED',
    isSegmented: false,
    nonSegmented: [],
    segmented: [],
    deductionWay: '',
  })

  useEffect(() => {
    if (!designer.loading) {
      setProfitSharing(
        produce(draft => {
          // 判斷設計師抽成指定不指定
          draft.designationUsage = idx(
            designer,
            _ =>
              !!(
                (_.userRake.nonSegmented.length > 0 &&
                  _.userRake.nonSegmented[0].rakeData.designate.length > 0) ||
                (_.userRake.segmented.length > 0 && _.userRake.segmented[0].designate.length > 0)
              )
          )
          draft.MerchantJobTitlePointId = idx(designer, _ => _.userCategory.id)
          // 判斷設計師抽成是分段還是全段
          draft.isSegmented = idx(
            designer,
            _ =>
              !!(
                (_.userRake.segmented.length > 0 && _.userRake.segmented[0].designate.length > 0) ||
                (_.userRake.segmented.length > 0 &&
                  _.userRake.segmented[0].nonDesignate.length > 0) ||
                (_.userRake.segmented.length > 0 && _.userRake.segmented[0].nonDistinguish.length) >
                0
              )
          )
          // 判斷設計師是否有設全段抽成資料
          // 先複製再補預設名稱（designer 來自查詢結果，唯讀）
          const nonSegmentedData = cloneDeep(idx(designer, _ => _.userRake.nonSegmented))
          if (nonSegmentedData.length === 1 && nonSegmentedData[0].attribute === '') {
            nonSegmentedData[0].attribute = '預設'
            draft.nonSegmented = nonSegmentedData
          } else {
            draft.nonSegmented = idx(designer, _ =>
              _.userRake.nonSegmented.length > 0
                ? _.userRake.nonSegmented
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
          }
          // 判斷設計師是否有設分段抽成資料
          draft.segmented = idx(designer, _ => _.userRake.segmented)
          draft.deductionWay = idx(designer, _ => (_.deductionWay !== null ? _.deductionWay : ''))
        })
      )
    }
  }, [designer.loading])

  useEffect(() => {
    if (!getAttributionForRake.loading) {
      const data = idx(getAttributionForRake, _ => _.data.getAttributionForRake)
      setAttributions(data)
    }
  }, [getAttributionForRake.loading])

  useEffect(() => {
    if (itemAuthority.length > 0) {
      const index = itemAuthority.findIndex(d => d.pageName === '人員設定')
      if (index > -1) {
        setSettingVisble(itemAuthority[index].authority)
      }
    }
  }, [itemAuthority])

  const handleSave = async () => {
    // 判斷抽成設定是判斷抽成設定是全段或分段
    const nonSegmentedData =
      profitSharing.nonSegmented.length > 0 && profitSharing.isSegmented === false
        ? profitSharing.nonSegmented
        : []

    const segmentedData =
      profitSharing.segmented.length > 0 && profitSharing.isSegmented === true
        ? profitSharing.segmented
        : []

    const deductionWayInput = {
      userId: profitSharing.userId,
      deductionWay: profitSharing.deductionWay,
    }

    const updateUserIdentityData = {
      designerId: profitSharing.userId,
      MerchantJobTitlePointId: profitSharing.MerchantJobTitlePointId,
    }
    try {
      if(profitSharing.deductionWay === '無扣項' || !profitSharing.deductionWay) throw new Error('請選擇服務扣項方式')
      if(!profitSharing.MerchantJobTitlePointId) throw new Error('請選擇互助點數設定依據')
       await Promise.all([
        fetchSetUserRake({
          userId: profitSharing.userId,
          nonSegmented: nonSegmentedData,
          segmented: segmentedData,
        }),
        setUserDeductionWay({ input: deductionWayInput }),
        fetchUpdateUserIdentity(updateUserIdentityData)
      ])
      refetch()
      openSnackbar({ message: '更新成功', variant: 'success' })
      history.push('/management/employee')
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }

  const handleSalesWayChange = ({ key, value }) => {
    setProfitSharing(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_3fr]">
        <div>
          {settingVisble && (
            <Card>
              <CardHeader>
                <CardTitle>人員設定</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <Field label='服務扣項方式'>
                    <NativeSelect
                      value={profitSharing.deductionWay}
                      onChange={event =>
                        handleSalesWayChange({
                          value: idx(event, _ => _.target.value),
                          key: 'deductionWay',
                        })
                      }
                    >
                      <NativeSelectOption value="無扣項">
                        <em>無扣項</em>
                      </NativeSelectOption>
                      {idx(commissionWay, _ =>
                        _.data.merchantCommissionWay.map(data => (
                          <NativeSelectOption key={data.name} value={data.name}>
                            {data.name}
                          </NativeSelectOption>
                        ))
                      )}
                    </NativeSelect>
                  </Field>
                  <Field label='互助點數設定依據'>
                    <NativeSelect
                      value={
                        profitSharing.MerchantJobTitlePointId
                          ? profitSharing.MerchantJobTitlePointId
                          : ''
                      }
                      onChange={event =>
                        handleSalesWayChange({
                          value: idx(event, _ => _.target.value),
                          key: 'MerchantJobTitlePointId',
                        })
                      }
                    >
                      <NativeSelectOption value="">
                        <em>None</em>
                      </NativeSelectOption>
                      {merchantJobTitlePoints?.map((data, index) => (
                        <NativeSelectOption key={`${data.jobTitle}-${index}`} value={data.id}>
                          {data.jobTitle}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="min-w-0">
          {profitSharing.segmented.length > 0 || profitSharing.nonSegmented.length > 0 ? (
            <AboutPerformance
              profitSharing={profitSharing}
              onChange={handleSalesWayChange}
              attributions={attributions}
            />
          ) : (
            ''
          )}
        </div>
      </div>
      <div className="mt-6">
        <Button variant="primary" onClick={handleSave}>
          儲存並返回列表
        </Button>
      </div>
    </div>
  )
}

export default ProfitSharing
