import { Popper, Fade } from 'ui/overlay-compat'
import { useContext, useState, Fragment } from 'react'
import billContext from 'context/keyInContext'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'
import { ReceiptText, Ticket } from 'lucide-react'
import { Button } from 'ui/button'
import { RowIconButton } from 'views/OrderCreate/RowAction'
import { Card } from 'ui/card'
import { Field, Input } from 'ui/input'
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
  // 頁首（STYLE.md §4，比照打帳單）：左側標題（含抽獎流水號）與次要動作「帳單速查／組合商品」，右側帳單流水號（標籤在上）；主要按鈕在下方結帳列
  return (
    <Fragment>
      <div {...rest} className="ui-root noprint flex flex-wrap items-center justify-between gap-4 pb-6">
        <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal} />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 flex items-center gap-2 text-title !font-bold text-text">
            帳單詳細 {orderNo ? `(${orderNo})` : ''}
            {/* 抽獎流水號：原為帶 role="button" 的裸 svg（鍵盤無法觸發），改真 <button>；onClick 照舊（錨點改為按鈕本身） */}
            {bill.raffleRecord.length ?
              <RowIconButton
                label="抽獎流水號"
                aria-describedby={id}
                aria-expanded={open}
                className="mb-0 text-warning hover:text-warning [&_svg]:size-5"
                onClick={handleClick}
              >
                <Ticket aria-hidden="true" strokeWidth={1.75} />
              </RowIconButton>
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
          <Button size="sm" variant="secondary" onClick={() => setOpenModal(true)}>
            <ReceiptText strokeWidth={1.75} />
            帳單速查
          </Button>
          {comboActive && (
            <Button size="sm" variant="secondary" disabled={shortBtnDisable} onClick={() => setShortcutModal(true)}>組合商品</Button>
          )}
        </div>
        {serialNumberUsing && (
          <div className="flex flex-wrap items-end gap-2">
            <Field label="流水號" className="w-[120px]">
              <Input
                disabled={!enable}
                placeholder="流水號"
                className="tabular-nums"
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
            </Field>
          </div>
        )}
      </div>
      <ShortcutDialog open={shortcutModal} handleOnClose={shortCutClose} handleShortcutChange={handleShortcutChange} />
    </Fragment>
  )
}

export default Header
