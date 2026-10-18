/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardContent, CardHeader, Checkbox, Divider, Table,
  TableBody, TableCell, TableHead, TableRow, Typography, IconButton,
} from '@mui/material'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteServiceCategories from 'hooks/useFetchDeleteServiceCategories'
import format from 'date-fns/format'
import React, { useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import EditIcon from '@mui/icons-material/Edit'
import idx from 'idx'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 700,
  }),
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid rgb(var(--border))',
  }),
  header: css({
    padding: '12px 24px 4px 24px',
    '& .MuiCardHeader-title': {
      width: '100%',
    }
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
    '\u0026:hover': {
      backgroundColor: 'transparent !important',
    },
  }),
  actionButton: css({
    padding: '4px !important',
    color: 'rgb(var(--text-tertiary)) !important',
    '&:hover': {
      color: 'rgb(var(--accent)) !important',
      backgroundColor: 'rgba(26, 115, 232, 0.04) !important',
    }
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
}

function Results({ className, categories, refetchCategories, ...rest }) {
  const [selectedCategories, setSelectedCategories] = useState([])
  const { delServiceCategories } = useFetchDeleteServiceCategories()
  const handleSelectAll = event => {
    const selectedCategories = event.target.checked
      ? categories.filter(category => category.isUsing).map(category => category.id)
      : []
    setSelectedCategories(selectedCategories)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedCategories], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedCategories(newSelect)
  }
  const handleDelete = async () => {
    try {
      await delServiceCategories({
        categories: selectedCategories,
      })
      openSnackbar({
        variant: 'success',
        message: '刪除成功',
      })
      refetchCategories()
      setSelectedCategories([])
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }
  return (
    <div {...rest} css={css([styles.root, className])}>
      <Card css={styles.card}>
        <CardHeader
          css={styles.header}
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: '#202124' }}>
                所有服務類別
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {categories.length} 筆
              </Typography>
            </div>
          }
        />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table size="small">
                <TableHead css={styles.tableHead}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCategories.length === categories.length && categories.length > 0}
                        color="primary"
                        indeterminate={
                          selectedCategories.length > 0 &&
                          selectedCategories.length < categories.length
                        }
                        onChange={handleSelectAll}
                        sx={{ padding: '2px' }}
                      />
                    </TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell align="center">代號</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>歸屬</TableCell>
                    <TableCell>備註</TableCell>
                    <TableCell>變更者</TableCell>
                    <TableCell>變更時間</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((data, idx) => (
                    <TableRow
                      hover
                      css={styles.tableRow}
                      key={`service-categories-${idx}`}
                      selected={selectedCategories.indexOf(data.id) !== -1}
                      disabled={!data.isUsing}
                      data-testid="category-row"
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={selectedCategories.indexOf(data.id) !== -1}
                          value={selectedCategories.indexOf(data.id) !== -1}
                          onChange={() => handleSelectOne(data.id)}
                          disabled={!data.isUsing}
                          inputProps={{
                            'data-testid': `category-${data.name}-checkbox`,
                          }}
                          sx={{ padding: '2px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          component={RouterLink}
                          css={styles.actionButton}
                          to={`/service/category/edit/${data.id}`}
                          disabled={!data.isUsing}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">{data.no}</TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.attribution}</TableCell>
                      <TableCell>{data.remark}</TableCell>
                      <TableCell>{data.creator.name}</TableCell>
                      <TableCell>{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
      </Card>
      <TableEditBar selected={selectedCategories} onDelete={handleDelete} />
    </div>
  )
}

export default Results
