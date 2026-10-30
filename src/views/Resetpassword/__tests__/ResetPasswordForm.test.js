// 忘記密碼：送出鈕停用時要說出還缺什麼（STYLE.md §6）；填了電話號碼就不顯示。
// GraphQL 由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, typeLikeBrowser } from '../../../__tests__/testkit.test'
import ResetPasswordForm from '../ResetPasswordForm'

afterEach(cleanup)

it('電話號碼未填時「發送驗證碼」停用並列出尚缺；填了就可按、原因消失', async () => {
  const utils = renderPage(<ResetPasswordForm />, { route: '/auth/reset-password' })
  await utils.settle()
  const submit = screen.getByRole('button', { name: '發送驗證碼' })
  expect(submit).toBeDisabled()
  const reason = screen.getByText('尚缺：電話號碼')
  expect(reason).toHaveAttribute('role', 'status')
  expect(submit).toHaveAttribute('aria-describedby', reason.id)
  typeLikeBrowser(screen.getByLabelText('電話號碼'), '0912345678')
  expect(submit).not.toBeDisabled()
  expect(screen.queryByText(/^尚缺：/)).toBeNull()
})
