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
  Switch,
  IconButton
} from '@mui/material'
import EditIconSlot from '@mui/icons-material/Edit';
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import useFetchSettingUpdateDefaultAuthority from 'hooks/useFetctSetUpdateDefaultAuthority'
import useFetchDeleteAuthority from 'hooks/useFetchDeleteAuthority'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
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
  }),
  actionButton: css({
    padding: '4px !important',
    color: 'rgb(var(--text-tertiary)) !important',
    '&:hover': {
      color: 'rgb(var(--accent)) !important',
      backgroundColor: 'rgba(26, 115, 232, 0.04) !important',
    }
  }),
  switch: css({
    '& .MuiSwitch-track': {
      marginLeft: 0
    },
  }),
  thumb: {
    '& .MuiSwitch-thumb': {
      boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px',
      backgroundColor: 'white'
    }
  }
}

function Results({ className, merchantAuth, merchantAuthDataRefetch, ...rest }) {
  const [selected, setSelected] = useState([])
  const [authStatus, setAuthStatus] = useState([])
  const { setUpdateDefaultAuthority } = useFetchSettingUpdateDefaultAuthority()
  const { deleteAuthority } = useFetchDeleteAuthority()
  const handleSelectAll = event => {
    const newSelectedAll = event.target.checked
      ? merchantAuth
        .filter(data => data.authorityName !== '高階主管')
        .map(merchantAuth => merchantAuth.id)
      : []
    setSelected(newSelectedAll)
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
    selected.map(d => {
      deleteAuthority({ authorityId: d })
        .then(() => {
          setSelected([])
          merchantAuthDataRefetch()
          openSnackbar({ message: '刪除權限成功', variant: 'success' })
        })
        .catch(err => {
          openSnackbar({ message: err.message, variant: 'error' })
        })
    })
  }

  const handleSetDefaltAuth = authId => {
    setUpdateDefaultAuthority({ authorityId: authId }).then(() => {
      merchantAuthDataRefetch()
      openSnackbar({ message: '預設權限設定成功', variant: 'success' })
    })
  }

  useEffect(() => {
    const auth2 = []
    merchantAuth.forEach(data => {
      const auth = []
      let totalPageAuthorityCount = 0
      JSON.parse(data.authoritySettings).forEach(data2 => {
        totalPageAuthorityCount = totalPageAuthorityCount + data2.pageAuthority.length
        data2.pageAuthority.forEach(data3 => {
          if (!data3.authority) {
            auth.push(data2)
          }
        })
      })
      if (auth.length === totalPageAuthorityCount) {
        auth2.push('無權限')
      } else {
        if (auth.length === 0) {
          auth2.push('完整權限')
        } else {
          auth2.push('部分權限')
        }
      }
    })
    setAuthStatus(auth2)
  }, [merchantAuth])

  return (
    <div {...rest} css={css([styles.root, className])}>
      <Card css={styles.card}>
        <CardHeader
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: '#202124' }}>
                角色權限列表
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {merchantAuth.length} 筆
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
                          selected.length ===
                          merchantAuth.filter(d => d.authorityName !== '高階主管').length &&
                          merchantAuth.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selected.length > 0 &&
                          selected.length <
                          merchantAuth.filter(d => d.authorityName !== '高階主管').length
                        }
                        onChange={handleSelectAll}
                        disabled={merchantAuth.length === 0}
                      />
                    </TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>目前人數</TableCell>
                    <TableCell>是否為預設權限</TableCell>
                    <TableCell>狀態</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {merchantAuth.length > 0 &&
                    merchantAuth.map((data, index) => (
                      <TableRow key={data.id} css={styles.tableRow}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            onChange={() => handleSelectOne(data.id)}
                            checked={selected.indexOf(data.id) > -1}
                            disabled={data.authorityName === '高階主管'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            component={data.authorityName === '高階主管' ? undefined : RouterLink}
                            css={styles.actionButton}
                            to={data.authorityName === '高階主管' ? undefined : `/role/edit/${data.id}`}
                            size="small"
                            disabled={data.authorityName === '高階主管'}
                          >
                            <EditIconSlot fontSize="small" />
                          </IconButton>
                        </TableCell>
                        <TableCell>{data.authorityName}</TableCell>
                        <TableCell>{data.usingDesignerCount}</TableCell>
                        <TableCell>
                          <Switch
                            size="small"
                            css={css([styles.switch, data.isDefault ? {} : styles.thumb])}
                            checked={data.isDefault}
                            onClick={() => handleSetDefaltAuth(data.id)}
                          />
                        </TableCell>
                        <TableCell>{authStatus[index]}</TableCell>
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

Results.propTypes = {
  className: PropTypes.object,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
