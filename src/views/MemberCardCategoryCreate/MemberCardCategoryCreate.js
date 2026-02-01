/** @jsxImportSource @emotion/react */
import { Button, Container, Card, CardContent, CardHeader, TextField } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import React, { useState } from 'react'
import useFetchCreateMembershipCategory from 'hooks/useFetchCreateMembershipCategory'

import styles from './style/MemberCardCategoryCreate'

function MemberCardCategoryCreate() {
  // 新增會員卡類別
  const { createMembershipCategory } = useFetchCreateMembershipCategory()

  // 拿店家ID
  const OfficialBrandMerchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null

  // 儲存要新增的值
  const [submitValue, setSubmitValue] = useState({
    no: '',
    name: '',
    OfficialBrandMerchantId: OfficialBrandMerchantId,
    isUsing: true,
  })

  // 新增會員卡類別submit
  const onSubmit = () => {
    createMembershipCategory(submitValue).then(() => {
      openSnackbar({
        message: '成功新增會員卡類別',
        variant: 'success',
      })
      window.location.href = '/member-card-categories'
    })
  }
  return (
    <Page css={styles.root} title="新增會員卡分類">
      <Container maxWidth="md">
        <PageTitle title='新增會員卡分類' subTitle='Create Membership Categories' />
        <Card css={styles.aboutPayment}>
          <CardHeader title="一般資訊" />
          <CardContent>
            <TextField
              label="代號"
              variant="outlined"
              fullWidth
              css={styles.formGroup}
              name="no"
              onChange={event => setSubmitValue({ ...submitValue, no: event.target.value })}
            />
            <TextField
              label="名稱"
              variant="outlined"
              fullWidth
              css={styles.formGroup}
              name="name"
              onChange={event => setSubmitValue({ ...submitValue, name: event.target.value })}
            />
          </CardContent>
        </Card>
        <div css={styles.actions}>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            data-testid="submit-create"
            onClick={() => onSubmit()}
          >
            新增
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default MemberCardCategoryCreate
