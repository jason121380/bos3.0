/** @jsxImportSource @emotion/react */
import {
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Paper, Collapse, Box, IconButton, Button, Typography, CardHeader, Divider
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIconSlot from '@mui/icons-material/Edit';
import { Link } from 'react-router-dom'
import format from 'date-fns/format';
import getLabel from 'utils/getTransferListLabel'
import { Fragment } from 'react'
import { css } from '@emotion/react'

const styles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid #f0f0f0',
    backgroundColor: '#fff',
    overflow: 'hidden',
    margin: '12px 0',
  }),
  tableHead: css({
    backgroundColor: '#FFFFFF',
    '& .MuiTableCell-head': {
      color: '#212121',
      fontWeight: 'bold',
      borderBottom: '1px solid #f0f0f0',
      height: '40px !important',
      padding: '2px 16px !important',
      fontSize: '14px',
    }
  }),
  tableRow: css({
    height: '40px !important',
    minHeight: '40px !important',
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '14px !important',
      color: '#333',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  }),
  actionButton: css({
    padding: '4px !important',
    color: '#999 !important',
    '&:hover': {
      color: '#1A73E8 !important',
      backgroundColor: 'rgba(26, 115, 232, 0.04) !important',
    }
  }),
  expandButton: css({
    padding: '4px !important',
    color: '#666 !important',
  }),
  header: css({
    padding: '12px 24px 4px 24px',
    '& .MuiCardHeader-title': {
      width: '100%',
    }
  }),
  csvBtn: css({
    borderRadius: '20px !important',
    padding: '6px 20px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    backgroundColor: '#f5f5f5 !important',
    color: '#666 !important',
    '&:hover': {
      backgroundColor: '#eeeeee !important',
    }
  }),
}

export default function Results({ reportData, open, openCollapse, onToggleAll }) {
  const isAllOpen = open.length === reportData.length && reportData.length > 0;

  return reportData.length ? (
    <div css={styles.card}>
      <CardHeader
        css={styles.header}
        action={
          <Button
            variant="contained"
            css={styles.csvBtn}
            size="small"
            onClick={onToggleAll}
          >
            {isAllOpen ? '全部收合' : '全部展開'}
          </Button>
        }
        title={
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <Typography variant="h6" style={{ fontWeight: 'bold', color: '#202124' }}>
              組合設定列表
            </Typography>
            <Typography color="textSecondary" variant="body2">
              共 {reportData.length} 筆
            </Typography>
          </div>
        }
      />
      <Table size="small">
        <TableHead css={styles.tableHead}>
          <TableRow>
            <TableCell className='noprint'>展開</TableCell>
            <TableCell>編輯</TableCell>
            <TableCell>代號</TableCell>
            <TableCell>名稱</TableCell>
            <TableCell>建立者</TableCell>
            <TableCell>建立時間</TableCell>
            <TableCell>編輯者</TableCell>
            <TableCell>編輯時間</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map(d => (
            <Fragment key={d.id}>
              <TableRow css={styles.tableRow}>
                <TableCell className='noprint'>
                  <IconButton
                    onClick={() => openCollapse(d.id)}
                    css={styles.expandButton}
                    size="small"
                  >
                    {open.indexOf(d.id) > -1 ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    css={styles.actionButton}
                    to={`/shortcut/edit/${d.id}`}
                    size="small"
                  >
                    <EditIconSlot fontSize="small" />
                  </IconButton>
                </TableCell>
                <TableCell>{d.no}</TableCell>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.creator.name}</TableCell>
                <TableCell>{format(d.createdAt, 'yyyy/MM/dd HH:mm')}</TableCell>
                <TableCell>{d.editor && d.editor.name}</TableCell>
                <TableCell>{format(d.updatedAt, 'yyyy/MM/dd HH:mm')}</TableCell>
              </TableRow>
              <TableRow className='noprint'>
                <TableCell style={{ padding: 0 }} colSpan={8}>
                  <Collapse timeout="auto" unmountOnExit in={open.indexOf(d.id) > -1}>
                    <Box margin={0} sx={{ borderLeft: '4px solid #1A73E8', ml: '24px', my: 1, pl: 2 }}>
                      {d.collapesData.length ? (
                        <div style={{ border: '1px solid #f0f0f0', borderLeft: 'none', borderRadius: '0 8px 8px 0', overflow: 'hidden' }}>
                          <Table size="small">
                            <TableHead css={styles.tableHead}>
                              <TableRow>
                                <TableCell>服務項目</TableCell>
                                <TableCell>店販銷售</TableCell>
                                <TableCell>預收卡</TableCell>
                                <TableCell>會員卡</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {d.collapesData.map(({
                                service, product, ticket, membership
                              }, i) => (
                                <TableRow key={`${d.id}-${i}-collapesData`} css={styles.tableRow}>
                                  <TableCell>{service && getLabel(service)}</TableCell>
                                  <TableCell>{product && getLabel(product)}</TableCell>
                                  <TableCell>{ticket && getLabel(ticket)}</TableCell>
                                  <TableCell>{membership && getLabel(membership)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <Typography sx={{ p: 2, textAlign: 'center', color: '#999' }} variant="body2">無詳細組合資料</Typography>
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  ) : (
    <Typography variant="h3" component="div">無資料</Typography>
  )
}
