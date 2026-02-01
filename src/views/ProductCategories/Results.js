/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
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

import styles from './styles/Results'

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
      <Typography color="textSecondary" gutterBottom variant="body2">
        {categories.length} 筆資料
      </Typography>
      <Card>
        <CardHeader title="所有商品類別" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
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
                    <TableCell>操作</TableCell>
                    <TableCell>代號</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>變更者</TableCell>
                    <TableCell>變更時間</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((data, index) => (
                    <TableRow
                      hover
                      key={`${data.name}-${data.no}-${index}`}
                      selected={selectedCategories.indexOf(data.id) > -1 || !data.isUsing}
                      data-testid="category-row"
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          onChange={() => handleSelectOne(data.id)}
                          checked={selectedCategories.indexOf(data.id) > -1}
                          disabled={!data.isUsing}
                          inputProps={{
                            'data-testid': `category-${data.name}-checkbox`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/product/category/edit/${data.id}`}
                          variant="outlined"
                        >
                          編輯
                        </Button>
                      </TableCell>
                      <TableCell>{data.no}</TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{idx(data, _ => _.creator.name)}</TableCell>
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

Results.propTypes = {
  className: PropTypes.object,
  categories: PropTypes.array,
}

Results.defaultProps = {
  categories: [],
}

export default Results
