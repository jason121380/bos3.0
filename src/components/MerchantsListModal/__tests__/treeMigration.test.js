// 直接保護兩種樹使用端的回傳契約：一般版回傳物件、釘選版回傳 id。
import React from 'react'
import { render, fireEvent, screen, within } from '@testing-library/react'
import MerchantsListModal, { managementTreeClasses } from '..'
import PinnedMerchantsListModal from 'components/MerchantListAutocpmpleteForPinnedTable/MerchantsListModal'

const merchant = { id: 'm1', name: '甲店' }
const merchantList = { allMerchants: [merchant], groups: [], merchants: [] }

test.each(['一般', '管理', '釘選'])('%s 店家樹：鍵盤展開／選取／確認保留回傳值', kind => {
  const confirm = jest.fn(), close = jest.fn()
  function Fixture() {
    const [values, setValues] = React.useState([])
    if (kind === '釘選') return <PinnedMerchantsListModal open setOpen={close} merchantList={merchantList} values={values} setValues={setValues} onValueChange={confirm} />
    return <MerchantsListModal open setOpen={close} merchantList={merchantList} values={[]} setValues={confirm} classes={kind === '管理' ? managementTreeClasses : undefined} />
  }
  render(<Fixture />)
  const dialog = screen.getByRole('dialog', { name: '店家列表' })
  expect(within(dialog).getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true')
  const all = within(dialog).getByRole('treeitem', { name: '全部(1)' })
  all.focus()
  fireEvent.keyDown(all, { key: 'ArrowRight' })
  expect(all).toHaveAttribute('aria-expanded', 'true')
  fireEvent.keyDown(all, { key: 'ArrowRight' })
  const item = within(dialog).getByRole('treeitem', { name: '甲店' })
  expect(item).toHaveFocus()
  fireEvent.keyDown(item, { key: 'Enter' })
  expect(item).toHaveAttribute('aria-selected', 'true')
  fireEvent.click(within(dialog).getByRole('button', { name: '確認' }))
  expect(confirm).toHaveBeenLastCalledWith(kind === '釘選' ? ['m1'] : [merchant])
  expect(close).toHaveBeenLastCalledWith(false)
})

test('多選樹明確宣告 aria-multiselectable，兩個已選葉節點均保持選取', () => {
  const second = { id: 'm2', name: '乙店' }
  render(<MerchantsListModal open setOpen={jest.fn()} merchantList={{ allMerchants: [merchant, second], groups: [], merchants: [] }} values={[merchant, second]} setValues={jest.fn()} />)
  fireEvent.click(screen.getByText('全部(2)'))
  expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true')
  expect(screen.getByRole('treeitem', { name: '甲店' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('treeitem', { name: '乙店' })).toHaveAttribute('aria-selected', 'true')
})
