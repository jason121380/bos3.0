/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'
import clsx from 'clsx'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import { useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import useFetchDeleteMerchantPointValueSetting from 'hooks/useFetchDeleteMerchantPointValueSetting'
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

function HelperPointResults({ className, merchantPointValueSettings, merchantPointValueData, ...rest }) {
  const [selected, setSelected] = useState([])
  const { deleteMerchantPointValueSetting } = useFetchDeleteMerchantPointValueSetting()
  const handleSelectAll = event => {
    const newSelected = event.target.checked ? merchantPointValueData.map(d => d.id) : []
    setSelected(newSelected)
  }
  const handleSelectOne = id => {
    const newSelect = [...selected], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelected(newSelect)
  }
  const handleSeletedDelete = () => {
    deleteMerchantPointValueSetting(selected)
      .then(res => {
        if (res.data.deleteMerchantPointValueSetting) {
          setSelected([])
          openSnackbar({ message: '刪除成功', variant: 'success' })
          merchantPointValueSettings.refetch()
        } else {
          openSnackbar({ message: '刪除失敗', variant: 'warning' })
        }
      }).catch((error) => {
        setSelected([])
        openSnackbar({ message: error.message, variant: 'error' })
      })
  }
  const retrievePointWay = type => {
    switch (type) {
      case 'FIXED':
        return '固定金額'
      case 'NONSEGMENTED':
        return '全段'
      case 'SEGMENTED':
        return '分段'
      default:
        break;
    }
  }
  return (
    <div {...rest} css={styles.root}>
      <Card>
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          selected.length === merchantPointValueData.length && merchantPointValueData.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selected.length > 0 && selected.length < merchantPointValueData.length
                        }
                        onChange={handleSelectAll}
                        disabled={merchantPointValueData.length === 0}
                      />
                    </TableCell>
                    <TableCell style={{ width: '150px' }}>操作</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>點數使用換算金額</TableCell>
                    <TableCell>類型</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {merchantPointValueData.map((data, idx) => (
                    <TableRow hover key={`${data.name}-${idx}`} data-testid="table-row">
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          onChange={() => handleSelectOne(data.id)}
                          checked={selected.indexOf(data.id) > -1}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/helper-point-setting-edit/${data.id}`}
                          variant="outlined"
                          data-testid={`helper-point-setting-edit-${idx}`}
                        >
                          編輯
                        </Button>
                      </TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.paidFixed}</TableCell>
                      <TableCell>{retrievePointWay(data.retrievePointWay)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
      </Card>
      <TableEditBar selected={selected} onDelete={handleSeletedDelete} />
    </div>
  )
}

export default HelperPointResults