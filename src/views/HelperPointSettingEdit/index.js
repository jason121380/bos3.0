
/** @jsxImportSource @emotion/react */
import { Button, Container, Grid, CircularProgress } from '@mui/material'
import { useFetchGetMerchantPointValueSettingsForEdit } from 'hooks/useFetchGetMerchantPointValueSettings'
import useFetchUpdateMerchantPointValueSetting from 'hooks/useFetchUpdateMerchantPointValueSetting'
import { openSnackbar } from 'elements/snackbars'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useHistory } from 'react-router'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import { useState, useEffect } from 'react'
import _ from 'lodash'
import idx from 'idx'

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

function HelperPointSettingEdit({ match }) {
  const history = useHistory()
  const settingId = match.params.id
  const getMerchantPointValueSettingsForEdit = useFetchGetMerchantPointValueSettingsForEdit(settingId)
  const { updateMerchantPointValueSetting } = useFetchUpdateMerchantPointValueSetting()
  const [isclick, setIsClick] = useState(false)
  const [submitData, setSubmitData] = useState({
    name: '',
    paidFixed: 0,
    retrieveFixed: 0,
    retrievePointWay: 'FIXED',
    NONSEGMENTED: [{ threshold: 0, price: 0 }],
    SEGMENTED: [{ threshold: 0, price: 0 }],
    isAccordingToHelper: false
  })

  useEffect(() => {
    if (!getMerchantPointValueSettingsForEdit.loading) {
      const data = idx(getMerchantPointValueSettingsForEdit, _ => _.data.getMerchantPointValueSetting)
      const newSubmitData = _.cloneDeep(submitData)
      newSubmitData.name = data.name
      newSubmitData.paidFixed = data.paidFixed
      newSubmitData.retrieveFixed = data.retrieveFixed
      newSubmitData.retrievePointWay = data.retrievePointWay
      newSubmitData.isAccordingToHelper = data.isAccordingToHelper
      if (newSubmitData[data.retrievePointWay]) newSubmitData[data.retrievePointWay] = data.retrieveSegmentSetting
      setSubmitData(newSubmitData)
    }
  }, [getMerchantPointValueSettingsForEdit.loading])

  const handleUpdate = () => {
    setIsClick(true)
    const data = {
      name: submitData.name,
      paidFixed: submitData.paidFixed,
      retrievePointWay: submitData.retrievePointWay,
      isAccordingToHelper: submitData.isAccordingToHelper
    }
    if (data.retrievePointWay === 'FIXED') {
      data.retrieveFixed = submitData.retrieveFixed
    } else {
      data.retrieveSegmentSetting = submitData[data.retrievePointWay]
    }
    const inputValue = {
      updateSettingId: settingId,
      updateSettingData: data,
    }
    updateMerchantPointValueSetting(inputValue).then(res => {
      if (res.data.updateMerchantPointValueSetting) {
        openSnackbar({
          variant: 'success',
          message: '儲存成功',
        })
        history.push('/performanceDeductionParameter')
      } else {
        openSnackbar({
          variant: 'warning',
          message: '儲存失敗',
        })
        setIsClick(false)
      }
    }).catch(error => {
      openSnackbar({
        variant: 'error',
        message: error.message,
      })
      setIsClick(false)
    })
  }
  return (
    <Page css={styles.root} title="編輯互助點數設定">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='編輯互助點數設定' subTitle='helper point setting create' />
          <Grid item>
            <Button disabled={isclick} onClick={handleUpdate} color="primary" variant="contained">
              儲存
            </Button>
          </Grid>
        </Grid>
        {!getMerchantPointValueSettingsForEdit.loading ?
          <Results
            status={submitData.retrievePointWay}
            submitData={submitData}
            setSubmitData={setSubmitData}
            className={styles.about}
          /> : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}
      </Container>
    </Page>
  )
}

export default HelperPointSettingEdit
