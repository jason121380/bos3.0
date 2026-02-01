/** @jsxImportSource @emotion/react */
import {
  Button, Container, Grid, Card, CardContent,
  FormControl, InputLabel, MenuItem, Select, CardHeader
} from '@mui/material'
import designerContext from 'context/designerContext'
import { openSnackbar } from 'elements/snackbars'
import { useFetchSetUserRake } from 'hooks/useFetchEmployeeSaleSetting'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchSetUserDeductionWay from 'hooks/useFetchSettingUserDeductionWay'
import { useFetchUpdateUserIdentity } from 'hooks/useFetchEmployeeSaleSetting'
import produce from 'immer'
import { useEffect, useState, useContext } from 'react'
import _ from 'lodash'
import idx from 'idx'
import { useHistory } from 'react-router'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

import AboutPerformance from './AboutPerformance'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  about: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
  }),
  action: css({
    width: '100%',
  }),
  content: css({
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    textAlgin: 'center',
  }),
}

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
          const nonSegmentedData = idx(designer, _ => _.userRake.nonSegmented)
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
    <Container >
      <Grid css={styles.about} container spacing={3}>
        <Grid item md={3} sm={12} xs={12}>
          {settingVisble && (
            <Card>
              <CardHeader title="人員設定" />
              <CardContent css={styles.content}>
                <Grid container spacing={4}>
                  <Grid item md={12} css={styles.action}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel>服務扣項方式</InputLabel>
                      <Select
                        label='服務扣項方式'
                        value={profitSharing.deductionWay}
                        onChange={event =>
                          handleSalesWayChange({
                            value: idx(event, _ => _.target.value),
                            key: 'deductionWay',
                          })
                        }
                      >
                        <MenuItem value="無扣項">
                          <em>無扣項</em>
                        </MenuItem>
                        {idx(commissionWay, _ =>
                          _.data.merchantCommissionWay.map(data => (
                            <MenuItem key={data.name} value={data.name}>
                              {data.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item md={12} css={styles.action}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel>互助點數設定依據</InputLabel>
                      <Select
                        label='互助點數設定依據'
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
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {merchantJobTitlePoints?.map((data, index) => (
                          <MenuItem key={`${data.jobTitle}-${index}`} value={data.id}>
                            {data.jobTitle}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
        <Grid item md={9} sm={12} xs={12}>
          {profitSharing.segmented.length > 0 || profitSharing.nonSegmented.length > 0 ? (
            <AboutPerformance
              profitSharing={profitSharing}
              onChange={handleSalesWayChange}
              attributions={attributions}
            />
          ) : (
            ''
          )}
        </Grid>
      </Grid>
      <div css={styles.actions}>
        <Button color="primary" variant="contained" onClick={handleSave}>
          儲存並返回列表
        </Button>
      </div>
    </Container>
  )
}

export default ProfitSharing
