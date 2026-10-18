import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import React, { useState } from 'react'
import useFetchCreateMembershipCategory from 'hooks/useFetchCreateMembershipCategory'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { PageHeader } from 'ui/page-header'

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
    <Page className="ui-root" title="新增會員卡分類">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="新增會員卡分類" />
        <Card>
          <CardHeader>
            <CardTitle>一般資訊</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="代號">
              <Input
                name="no"
                onChange={event => setSubmitValue({ ...submitValue, no: event.target.value })}
              />
            </Field>
            <Field label="名稱">
              <Input
                name="name"
                onChange={event => setSubmitValue({ ...submitValue, name: event.target.value })}
              />
            </Field>
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              type="submit"
              data-testid="submit-create"
              onClick={() => onSubmit()}
            >
              新增
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Page>
  )
}

export default MemberCardCategoryCreate
