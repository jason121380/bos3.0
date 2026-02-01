/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router'
import { useFetchGetCustomerBonusDepositRecord } from 'hooks/useFetchGetCustomerBonusDepositRecords'
import useFetchUpdateBonusDeposit from 'hooks/useFetchUpdateBonusDeposit'
import idx from 'idx'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutMerchantVendorCreate from './AboutCustomerBonusRecordEdit'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  aboutPayment: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
  }),
}

function CustomerBonusRecordCreate() {
  const { id } = useParams()
  const history = useHistory()
  const [isClick, setIsClick] = useState(false)
  const [submitData, setSubmitData] = useState({
    date: new Date().getTime(),
    designerId: '',
    customerId: '',
    bonus: 0,
    remark: ''
  })
  const { updateBonus } = useFetchUpdateBonusDeposit()
  const bonusDepositRecord = useFetchGetCustomerBonusDepositRecord({ bonusId: id })

  useEffect(() => {
    if (!bonusDepositRecord.loading) {
      const data = idx(bonusDepositRecord, _ => _.data.customerBonusDepositRecord)
      setSubmitData(data);
    }
  }, [bonusDepositRecord.loading])

  const handleSubmitData = () => {
    setIsClick(true)
    if (!submitData.date) {
      openSnackbar({
        message: '日期格式有誤',
        variant: 'warning'
      })
      setIsClick(false)
    } else if (!submitData.designerId) {
      openSnackbar({
        message: '請選擇設計師',
        variant: 'warning'
      })
      setIsClick(false)
    } else if (!submitData.customerId) {
      openSnackbar({
        message: '請選擇顧客',
        variant: 'warning'
      })
      setIsClick(false)
    } else if (submitData.bonus === '') {
      openSnackbar({
        message: '請輸入點數',
        variant: 'warning'
      })
      setIsClick(false)
    } else {
      updateBonus({
        input: {
          bonusId: id,
          bonusInput: submitData
        }
      }).then(res => {
        if (res.data.updateBonusDeposit) {
          openSnackbar({
            message: '儲存成功',
            variant: 'success'
          })
          history.push('/customer-bonus-record')
        } else {
          openSnackbar({
            message: '儲存失敗',
            variant: 'error'
          })
          setIsClick(false)
        }
      }).catch(error => {
        openSnackbar({
          message: error.message,
          variant: 'error',
        })
        setIsClick(false)
      })
    }
  }

  return (
    <Page css={styles.root} title="編輯紅利點數紀錄">
      <Container maxWidth="md">
        <PageTitle title='編輯紅利點數紀錄' subTitle='Bonus Record edit' />
        <AboutMerchantVendorCreate
          className={styles.aboutPayment}
          submitData={submitData}
          setSubmitData={setSubmitData}
        />
        <div css={styles.actions}>
          <Button
            disabled={isClick || bonusDepositRecord.loading}
            onClick={handleSubmitData}
            color="primary"
            variant="contained"
          >
            儲存
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default CustomerBonusRecordCreate