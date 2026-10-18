/** @jsxImportSource @emotion/react */
import {
  Button, Card, Table, TableBody, TableCell, TableHead,
  TableRow, Typography, TableContainer, CardHeader, IconButton
} from '@mui/material'
import { Edit as EditIcon, Visibility as VisibilityIcon } from 'ui/icons'
import { css } from '@emotion/react'
import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import format from 'date-fns/format'

const localStyles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--background))',
    overflow: 'hidden',
  }),
  content: css({
    padding: 0,
  }),
  tableHead: css({
    backgroundColor: 'rgb(var(--background))',
    '& .MuiTableCell-head': {
      color: 'rgb(var(--text))',
      fontWeight: 'bold',
      borderBottom: '1px solid rgb(var(--border))',
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
      borderBottom: '1px solid rgb(var(--border))',
      fontSize: '14px !important',
      color: 'rgb(var(--text))',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
    '&.Mui-selected': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
  }),
  actionButton: css({
    color: 'rgb(var(--text-tertiary))',
    padding: '4px',
    '&:hover': {
      color: 'rgb(var(--accent))',
      backgroundColor: 'rgba(26, 115, 232, 0.04)',
    },
  }),
  statusDraft: css({
    color: 'rgb(var(--warning))',
    fontWeight: 'bold',
  }),
  statusCompleted: css({
    color: 'rgb(var(--success))',
    fontWeight: 'bold',
  }),
}

function Results({ inventorys }) {
  return (
    <Fragment>
      {inventorys.length === 0 ? (
        <Card css={localStyles.card} style={{ padding: '40px', textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            目前沒有盤點紀錄
          </Typography>
        </Card>
      ) : (
        <Card css={localStyles.card}>
          <CardHeader
            title={
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                  歷史盤點單
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  共 {inventorys.length} 筆資料
                </Typography>
              </div>
            }
          />
          <CardContent css={localStyles.content}>
            <TableContainer>
              <Table size="small">
                <TableHead css={localStyles.tableHead}>
                  <TableRow>
                    <TableCell width={200}>日期時間</TableCell>
                    <TableCell width={120}>狀態</TableCell>
                    <TableCell>建立人員</TableCell>
                    <TableCell align="right" width={80}>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventorys.map(d => (
                    <TableRow key={d.id} css={localStyles.tableRow}>
                      <TableCell style={{ fontWeight: '500' }}>{format(d.date, 'yyyy/MM/dd HH:mm')}</TableCell>
                      <TableCell>
                        <span css={d.isDraft ? localStyles.statusDraft : localStyles.statusCompleted}>
                          {d.isDraft ? '未完成' : '已完成'}
                        </span>
                      </TableCell>
                      <TableCell>{d.creatorName}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          css={localStyles.actionButton}
                          component={RouterLink}
                          size="small"
                          to={d.isDraft ? `inventory-work/edit/${d.id}` : `inventory-work/review/${d.id}`}
                        >
                          {d.isDraft ? <EditIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Fragment>
  )
}
export default Results
