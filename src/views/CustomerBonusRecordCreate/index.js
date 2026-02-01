/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import { useState } from 'react'
import { useHistory, useParams } from 'react-router'
import useFetchAddCustomerBonus from 'hooks/useFetchAddCustomerBonus'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutCustomerBonusRecordCreate from './AboutCustomerBonusRecordCreate'

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
    customerId: id ? id : '',
    bonus: 0,
    remark: ''
  })
  const { AddCustomerBonus } = useFetchAddCustomerBonus()
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
      AddCustomerBonus({
        input: { ...submitData, bonus: parseInt(submitData.bonus) }
      }).then(res => {
        if (res.data.addCustomerBonus) {
          openSnackbar({
            message: '新增成功',
            variant: 'success'
          })
          history.push('/customer-bonus-record')
        } else {
          openSnackbar({
            message: '新增失敗',
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
    <Page css={styles.root} title="新增紅利點數">
      <Container maxWidth="md">
        <PageTitle title='新增紅利點數' subTitle='Bonus Record CREATE' />
        <AboutCustomerBonusRecordCreate
          className={styles.aboutPayment}
          submitData={submitData}
          setSubmitData={setSubmitData}
        />
        <div css={styles.actions}>
          <Button
            disabled={isClick}
            onClick={handleSubmitData}
            color="primary"
            variant="contained"
          >
            新增
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default CustomerBonusRecordCreate
