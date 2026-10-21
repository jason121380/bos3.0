import useFetchCreateMerchantPointValueSetting from 'hooks/useFetchCreateMerchantPointValueSetting'
import { openSnackbar } from 'elements/snackbars'
import Page from 'components/Page'
import { useHistory } from 'react-router'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import { useState } from 'react'

import Results from './Results'

const styles = {
  about: 'mt-[24px]',
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
    <Page className="ui-root" title="新增互助點數設定">
      <div className="max-w-3xl">
        <PageHeader
          title="新增互助點數設定"
          actions={
            <Button disabled={isclick} onClick={handleSubmit} variant="primary">
              確認
            </Button>
          }
        />
        <Results
          status={submitData.retrievePointWay}
          submitData={submitData}
          setSubmitData={setSubmitData}
          className={styles.about}
        />
      </div>
    </Page>
  )
}

export default HelperPointSettingCreate
