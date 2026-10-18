import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import React, { useState, useEffect } from 'react'
import idx from 'idx'
import { useFetchGetMembershipCategory } from 'hooks/useFetchGetMembershipCategory'
import useFetchUpdateMembershipCategory from 'hooks/useFetchUpdateMembershipCategory'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { PageHeader } from 'ui/page-header'

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
    <Page className="ui-root" title="編輯會員卡分類">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="編輯會員卡分類" />
        <Card>
          <CardHeader>
            <CardTitle>一般資訊</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="代號">
              <Input
                name="no"
                value={submitValue.no}
                onChange={event => setSubmitValue({ ...submitValue, no: event.target.value })}
              />
            </Field>
            <Field label="名稱">
              <Input
                name="name"
                value={submitValue.name}
                onChange={event => setSubmitValue({ ...submitValue, name: event.target.value })}
              />
            </Field>
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              type="submit"
              data-testid="save"
              onClick={() => onSubmit()}
            >
              儲存
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Page>
  )
}

export default MemberCardCategoryEdit
