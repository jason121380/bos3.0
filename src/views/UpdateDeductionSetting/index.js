/** @jsxImportSource @emotion/react */
import { Button, Container, Grid, CircularProgress } from '@mui/material'
import { openSnackbar } from 'elements/snackbars'
import { useFetchDeductionSetting } from 'hooks/useFetchGetDeductionSettings'
import { useFetchUpdateDeductionSetting } from 'hooks/useFetchSetDeductionSetting'
import produce from 'immer'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'

import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

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
}

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
    <Page css={styles.root} title="抽成方式設定">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='編輯抽成方式設定' subTitle='Update Deduction Setting' />
          <Grid item>
            <Button color="primary" variant="contained" onClick={handleSave}>
              儲存
            </Button>
          </Grid>
        </Grid>
        {!getAttributionForRake.loading ? (
          <Results
            className={styles.about}
            profitSharing={profitSharing}
            onChange={handleSalesWayChange}
            attributions={attributions}
          />
        ) : <div style={{ textAlign: 'center', marginTop: 150 }}><CircularProgress /></div>}
      </Container>
    </Page>
  )
}

export default ProfitSharing
