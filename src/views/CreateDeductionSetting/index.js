/** @jsxImportSource @emotion/react */
import { Button, Container, Grid, CircularProgress } from '@mui/material'
import { openSnackbar } from 'elements/snackbars'
import { useFetchCreateDeductionSetting } from 'hooks/useFetchSetDeductionSetting'
import produce from 'immer'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import React from 'react'
import _ from 'lodash'

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
      const data = idx(getAttributionForRake, _ => _.data.getAttributionForRake)
      setAttributions(data)
    }
  }, [getAttributionForRake.loading])
  return (
    <Page css={styles.root} title="抽成方式設定">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='抽成方式設定' subTitle='Deduction Setting' />
          <Grid item>
            <Button color="primary" variant="contained" onClick={handleSave}>
              確認
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

export default Deduction
