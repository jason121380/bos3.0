/** @jsxImportSource @emotion/react */
import { Button, Container, Card, CardContent, CardHeader, TextField } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import React, { useState, useEffect } from 'react'
import idx from 'idx'
import { useFetchGetMembershipCategory } from 'hooks/useFetchGetMembershipCategory'
import useFetchUpdateMembershipCategory from 'hooks/useFetchUpdateMembershipCategory'

import styles from './styles/MemberCardCategoryEdit'

function MemberCardCategoryEdit({ match }) {
  // 拿到此會員卡的資料
  const membershipCategory = useFetchGetMembershipCategory(match.params.id)

  // 編輯此會員卡的的mutation
  const { updateMembershipCategory } = useFetchUpdateMembershipCategory()

  // 資料宣告
  const [submitValue, setSubmitValue] = useState({
    itemUUID: '',
    no: '',
    name: '',
    isUsing: true,
  })

  // show出來以及編輯的資料
  useEffect(() => {
    if (!membershipCategory.loading) {
      const membershipInfo = idx(membershipCategory, _ => _.data.membershipCategory)
      setSubmitValue({
        itemUUID: membershipInfo.uuid,
        no: membershipInfo.no,
        name: membershipInfo.name,
        isUsing: membershipInfo.isUsing,
      })
    }
  }, [membershipCategory.loading])

  // 新增的submit
  const onSubmit = () => {
    updateMembershipCategory(submitValue)
      .then(() => {
        openSnackbar({
          message: '成功更新會員卡類別',
          variant: 'success',
        })
        window.location.href = '/member-card-categories'
      })
      .catch(err => {
        openSnackbar({
          message: err.message,
          variant: 'error',
        })
      })
  }
  return (
    <Page css={styles.root} title="編輯會員卡分類">
      <Container maxWidth="md">
        <PageTitle title='編輯會員卡分類' subTitle='Edit Membership Categories' />
        <Card css={styles.aboutPayment}>
          <CardHeader title="一般資訊" />
          <CardContent>
            <TextField
              name="no"
              label="代號"
              variant="outlined"
              fullWidth
              css={styles.formControl}
              value={submitValue.no}
              onChange={event => setSubmitValue({ ...submitValue, no: event.target.value })}
            />
            <TextField
              label="名稱"
              variant="outlined"
              fullWidth
              css={styles.formControl}
              name="name"
              value={submitValue.name}
              onChange={event => setSubmitValue({ ...submitValue, name: event.target.value })}
            />
          </CardContent>
        </Card>
        <div css={styles.actions}>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            data-testid="save"
            onClick={() => onSubmit()}
          >
            儲存
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default MemberCardCategoryEdit
