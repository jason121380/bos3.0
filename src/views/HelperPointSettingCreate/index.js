/** @jsxImportSource @emotion/react */
import { Button, Container, Grid } from '@mui/material'
import useFetchCreateMerchantPointValueSetting from 'hooks/useFetchCreateMerchantPointValueSetting'
import { openSnackbar } from 'elements/snackbars'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useHistory } from 'react-router'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import { useState } from 'react'
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

function HelperPointSettingCreate() {
  const history = useHistory()
  const { createMerchantPointValueSetting } = useFetchCreateMerchantPointValueSetting()
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

  const handleSubmit = () => {
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
    createMerchantPointValueSetting({ ...data }).then(res => {
      if (res.data.createMerchantPointValueSetting) {
        openSnackbar({
          variant: 'success',
          message: '新增成功',
        })
        history.push('/performanceDeductionParameter')
      } else {
        openSnackbar({
          variant: 'warning',
          message: '新增失敗',
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
    <Page css={styles.root} title="新增互助點數設定">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='新增互助點數設定' subTitle='helper point setting create' />
          <Grid item>
            <Button disabled={isclick} onClick={handleSubmit} color="primary" variant="contained">
              確認
            </Button>
          </Grid>
        </Grid>
        <Results
          status={submitData.retrievePointWay}
          submitData={submitData}
          setSubmitData={setSubmitData}
          className={styles.about}
        />
      </Container>
    </Page>
  )
}

export default HelperPointSettingCreate
