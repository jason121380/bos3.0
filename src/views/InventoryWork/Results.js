/** @jsxImportSource @emotion/react */
import {
  Button, Card, Table, TableBody, TableCell, TableHead,
  TableRow, Typography, TableContainer, CardHeader, IconButton
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility'
import { css } from '@emotion/react'
import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import format from 'date-fns/format'

const localStyles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid #f0f0f0',
    backgroundColor: '#fff',
    overflow: 'hidden',
  }),
  content: css({
    padding: 0,
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
    '&.Mui-selected': {
      backgroundColor: '#f9f9f9 !important',
    },
    '&.Mui-selected:hover': {
      backgroundColor: '#f9f9f9 !important',
    },
  }),
  actionButton: css({
    color: '#9e9e9e',
    padding: '4px',
    '&:hover': {
      color: '#1A73E8',
      backgroundColor: 'rgba(26, 115, 232, 0.04)',
    },
  }),
  statusDraft: css({
    color: '#FF9800',
    fontWeight: 'bold',
  }),
  statusCompleted: css({
    color: '#4CAF50',
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
                <Typography variant="h6" style={{ fontWeight: 'bold', color: '#202124' }}>
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
