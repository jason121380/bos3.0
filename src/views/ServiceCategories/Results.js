/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardContent, CardHeader, Checkbox, Divider, Table,
  TableBody, TableCell, TableHead, TableRow, Typography,
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

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 700,
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
      <Typography color="textSecondary" gutterBottom variant="body2">
        {categories.length} 筆資料
      </Typography>
      <Card>
        <CardHeader title="所有服務類別" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCategories.length === categories.length}
                        color="primary"
                        indeterminate={
                          selectedCategories.length > 0 &&
                          selectedCategories.length < categories.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell>代號</TableCell>
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
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/service/category/edit/${data.id}`}
                          variant="outlined"
                          disabled={!data.isUsing}
                        >
                          編輯
                        </Button>
                      </TableCell>
                      <TableCell>{data.no}</TableCell>
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
