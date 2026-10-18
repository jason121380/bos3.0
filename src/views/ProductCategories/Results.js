/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material'
import EditIconSlot from '@mui/icons-material/Edit'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteProductCategory from 'hooks/useFetchDeleteProductCategory'
import idx from 'idx'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
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
  inner: css({
    minWidth: 700,
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
}

function Results({ className, categories, refetchCategories, ...rest }) {
  const [selectedCategories, setSelectedCcategories] = useState([])
  const { deleteProductCategory } = useFetchDeleteProductCategory()
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked
      ? categories.filter(d => d.isUsing).map(payment => payment.id)
      : []
    setSelectedCcategories(newSelectedPayment)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedCategories], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedCcategories(newSelect)
  }
  const handleDelete = async () => {
    try {
      await deleteProductCategory({
        itemIds: selectedCategories,
      })
      refetchCategories()
      setSelectedCcategories([])
      openSnackbar({ message: '成功刪除商品類別', variant: 'success' })
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }
  return (
    <div {...rest} css={css([styles.root, className])}>
      <Card css={styles.card}>
        <CardHeader
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                所有商品類別
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {categories.length} 筆資料
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
                        checked={
                          selectedCategories.length === categories.length && categories.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selectedCategories.length > 0 &&
                          selectedCategories.length < categories.length
                        }
                        onChange={handleSelectAll}
                        disabled={
                          categories.length === 0 ||
                          categories.filter(d => !d.isUsing).length === categories.length
                        }
                      />
                    </TableCell>
                    <TableCell>代號</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>變更者</TableCell>
                    <TableCell>變更時間</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((data, index) => {
                    const isSelected = selectedCategories.indexOf(data.id) > -1
                    return (
                      <TableRow
                        key={`${data.name}-${data.no}-${index}`}
                        css={styles.tableRow}
                        selected={isSelected || !data.isUsing}
                        data-testid="category-row"
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            onChange={() => handleSelectOne(data.id)}
                            checked={isSelected}
                            disabled={!data.isUsing}
                            inputProps={{
                              'data-testid': `category-${data.name}-checkbox`,
                            }}
                          />
                        </TableCell>
                        <TableCell>{data.no}</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }}>{data.name}</TableCell>
                        <TableCell>{idx(data, _ => _.creator.name)}</TableCell>
                        <TableCell>{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            css={styles.actionButton}
                            component={RouterLink}
                            size="small"
                            to={`/product/category/edit/${data.id}`}
                          >
                            <EditIconSlot fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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

Results.propTypes = {
  className: PropTypes.object,
  categories: PropTypes.array,
}

Results.defaultProps = {
  categories: [],
}

export default Results
