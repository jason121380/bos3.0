import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MerchantBar from '../MerchantBar'

// 為什麼重要：手機上一打開「切換店家」就自動聚焦搜尋框，鍵盤會彈出、擋住半個店家清單（Jason 2026/10/21 截圖）。
// 多數人是直接點選店家，不需要先搜尋；焦點應停在彈窗本身（鍵盤使用者仍在彈窗內，按 Tab 即可進入搜尋框）。

const userMerchants = {
  loading: false,
  data: { getUserMerchant: JSON.stringify({ allMerchants: [{ id: 'm1', name: '甲店' }], groups: [], merchants: [{ id: 'm1', name: '甲店' }] }) },
}

test('開啟切換店家時不自動聚焦搜尋框，焦點停在彈窗', () => {
  render(
    <MemoryRouter>
      <MerchantBar open onClose={() => {}} userMerchants={userMerchants} />
    </MemoryRouter>
  )
  const dialog = screen.getByRole('dialog')
  const search = screen.getByRole('textbox', { name: '搜尋店家' })
  expect(document.activeElement).not.toBe(search)
  expect(document.activeElement).toBe(dialog)
})
