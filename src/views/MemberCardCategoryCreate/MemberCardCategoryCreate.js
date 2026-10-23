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
    // 代號、名稱必填（Jason 2026/10/22「照建議」）
    if (!String(submitValue.no || '').trim()) {
      openSnackbar({ message: '請輸入代號', variant: 'warning' })
      return
    }
    if (!String(submitValue.name || '').trim()) {
      openSnackbar({ message: '請輸入名稱', variant: 'warning' })
      return
    }
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
