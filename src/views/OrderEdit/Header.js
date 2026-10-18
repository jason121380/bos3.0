/** @jsxImportSource @emotion/react */
import {
  Grid, Typography,Table, Popper, Fade, Paper, Button, TextField,
  TableBody, TableCell, TableHead, TableRow, TableContainer
} from '@mui/material'
import { useContext, useState, Fragment } from 'react'
import billContext from 'context/keyInContext'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'
import { ConfirmationNumber as ConfirmationNumberIcon } from 'ui/icons'
import { css } from '@emotion/react'
import produce from 'immer'
import ShortcutDialog from '../../components/ShortcutDialog'

const styles = {
  root: css({}),
  popper: css({
    '& .MuiTableCell-root': {
      padding: '6px 12px !important'
    }
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))',
  }),
  input: css({
    marginLeft: 12,
    width: 100,
    '& input': {
      padding: '8px !important'
    }
  })
}

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
  return (
    <Fragment>
      <div {...rest} css={styles.root}>
        <FastCheckOrdersModal date={bill.date} open={openModal} setOpenModal={setOpenModal} />
        <Grid alignItems="flex-end" container justifyContent="space-between">
          <Grid item direction='row' container alignItems='flex-end' style={{ width: 'fit-content' }} >
            <Grid item>
              <Typography component="h2" gutterBottom variant="overline">
                Order detail
              </Typography>
              <Typography component="h3" variant="h3" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                帳單詳細 {orderNo ? `(${orderNo})` : ''}
                {bill.raffleRecord.length ?
                  <ConfirmationNumberIcon aria-describedby={id} style={{ color: 'gold', cursor: 'pointer' }} onClick={handleClick} />
                  : ''}
                <Popper css={styles.popper} open={open} anchorEl={anchorEl} id={id} transition style={{ zIndex: '1'}}>
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                      <TableContainer component={Paper} style={{ marginTop: 10, maxHeight: 300, overflowY: 'auto' }}>
                        <Table>
                          <TableHead css={styles.stickyRow}>
                            <TableRow>
                              <TableCell>流水號</TableCell>
                              <TableCell>規則名稱</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bill.raffleRecord.map(({ ruleName, number }) => (
                              <TableRow hover>
                                <TableCell>{number}</TableCell>
                                <TableCell>{ruleName}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Fade>
                  )}
                </Popper>
              </Typography>
            </Grid>
            {serialNumberUsing && (
              <TextField
                disabled={!enable}
                css={styles.input}
                variant='outlined'
                label='流水號'
                InputLabelProps={{
                  shrink: true,
                }}
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
            )}
          </Grid>
          <Grid>
            {comboActive && (
              <Button disabled={shortBtnDisable} onClick={() => setShortcutModal(true)} style={{ marginRight: '10px' }} variant='contained' color='primary'>組合商品</Button>
            )}
            <Button onClick={() => setOpenModal(true)} variant='contained' color='primary'>帳單速查</Button>
          </Grid>
        </Grid>
      </div>
      <ShortcutDialog open={shortcutModal} handleOnClose={shortCutClose} handleShortcutChange={handleShortcutChange} />
    </Fragment>
  )
}

export default Header
