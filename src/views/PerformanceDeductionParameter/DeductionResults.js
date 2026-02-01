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
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import { useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { useFetchDeleteDeductionSetting } from 'hooks/useFetchSetDeductionSetting'
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
function DeductionResults({ className, deductionData, deduction, ...rest }) {
  const [selected, setSelected] = useState([])
  const { deleteDeductionSetting } = useFetchDeleteDeductionSetting()
  const handleSelectAll = event => {
    const newSelected = event.target.checked ? deductionData.map(payment => payment.id) : []
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
    deleteDeductionSetting(selected)
      .then(() => {
        setSelected([])
        deduction.refetch()
        openSnackbar({ message: '刪除成功抽成方式設定', variant: 'success' })
      }).catch((error) => {
        setSelected([])
        openSnackbar({ message: error.message, variant: 'error' })
      })
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
                          selected.length === deductionData.length && deductionData.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selected.length > 0 && selected.length < deductionData.length
                        }
                        onChange={handleSelectAll}
                        disabled={deductionData.length === 0}
                      />
                    </TableCell>
                    <TableCell style={{ width: '150px' }}>操作</TableCell>
                    <TableCell>編號</TableCell>
                    <TableCell>名稱</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deductionData.map((data, idx) => (
                    <TableRow hover key={`${data.name}-${idx}`} data-testid="table-row">
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          onChange={() => handleSelectOne(data.id)}
                          checked={selected.indexOf(data.id) > -1}
                          inputProps={{
                            'data-testid': `update-deduction-setting-selector-${idx}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/update-deduction-setting/${data.id}`}
                          variant="outlined"
                          data-testid={`update-deduction-setting-${idx}`}
                        >
                          編輯
                        </Button>
                      </TableCell>
                      <TableCell >{data.no}</TableCell>
                      <TableCell data-testid={`update-deduction-setting-${data.name}`}>{data.name}</TableCell>

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

DeductionResults.propTypes = {
  className: PropTypes.object,
  customers: PropTypes.array,
}

DeductionResults.defaultProps = {
  customers: [],
}

export default DeductionResults
