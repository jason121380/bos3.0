/** @jsxImportSource @emotion/react */
import { Popper, Fade } from '@mui/material'
import { useContext, useState, Fragment } from 'react'
import billContext from 'context/keyInContext'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'
import { ReceiptText, Ticket } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Input } from 'ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'ui/table'
import produce from 'immer'
import ShortcutDialog from '../../components/ShortcutDialog'

function Header({ ...rest }) {
  const {
    orderNo, bill, setBill, enable, serialNumberUsing, handleShortcutChange,
    comboActive, shortBtnDisable
  } = useContext(billContext)
  const [openModal, setOpenModal] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null);
  const [shortcutModal, setShortcutModal] = useState(false)
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const shortCutClose = () => {
    setShortcutModal(false)
  }
  // 頁首（STYLE.md §4）：左側標題、抽獎流水號與帳單流水號，右側次要動作；主要按鈕在下方結帳列
  return (
    <Fragment>
      <div {...rest} className="ui-root noprint flex flex-wrap items-center justify-between gap-4 pb-6">
        <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal} />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 flex items-center gap-2 text-title !font-bold text-text">
            帳單詳細 {orderNo ? `(${orderNo})` : ''}
            {bill.raffleRecord.length ?
              <Ticket
                role="button"
                aria-label="抽獎流水號"
                aria-describedby={id}
                strokeWidth={1.75}
                className="h-5 w-5 cursor-pointer text-warning"
                onClick={handleClick}
              />
              : ''}
            <Popper open={open} anchorEl={anchorEl} id={id} transition style={{ zIndex: '1'}}>
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Card className="ui-root mt-2.5 max-h-[300px] overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <Table wrapperClassName="rounded-none border-0">
                      <TableHeader className="sticky top-0 z-10">
                        <TableRow>
                          <TableHead>流水號</TableHead>
                          <TableHead>規則名稱</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bill.raffleRecord.map(({ ruleName, number }) => (
                          <TableRow>
                            <TableCell className="tabular-nums">{number}</TableCell>
                            <TableCell>{ruleName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </Fade>
              )}
            </Popper>
          </h1>
          {serialNumberUsing && (
            <label className="flex items-center gap-2 text-label text-text-secondary">
              流水號
              <Input
                disabled={!enable}
                className="w-[100px] tabular-nums"
                value={bill.serialNumber == null ? '' : bill.serialNumber}
                onChange={e => {
                  const value = e.target.value === '' ? null : e.target.value
                  setBill(
                    produce(draft => {
                      draft.serialNumber = value
                    })
                  )
                }}
              />
            </label>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {comboActive && (
            <Button variant="secondary" disabled={shortBtnDisable} onClick={() => setShortcutModal(true)}>組合商品</Button>
          )}
          <Button variant="secondary" onClick={() => setOpenModal(true)}>
            <ReceiptText strokeWidth={1.75} />
            帳單速查
          </Button>
        </div>
      </div>
      <ShortcutDialog open={shortcutModal} handleOnClose={shortCutClose} handleShortcutChange={handleShortcutChange} />
    </Fragment>
  )
}

export default Header
