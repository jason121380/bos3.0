// 預設權限開關改 ui/switch（onClick 經 props 傳至原生 input，checked 仍由 data.isDefault 控制、點擊行為不變）
import { Switch } from 'ui/switch'
import { Pencil } from 'lucide-react'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import useFetchSettingUpdateDefaultAuthority from 'hooks/useFetchSetUpdateDefaultAuthority'
import useFetchDeleteAuthority from 'hooks/useFetchDeleteAuthority'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { formatNumber } from 'ui/format'

// 權限狀態文字 → Badge 樣式（僅外觀）
const authStatusVariant = status => (status === '完整權限' ? 'success' : status === '部分權限' ? 'warning' : 'neutral')

function Results({ className, merchantAuth, merchantAuthDataRefetch, ...rest }) {
  const [selected, setSelected] = useState([])
  const [authStatus, setAuthStatus] = useState([])
  const { setUpdateDefaultAuthority } = useFetchSettingUpdateDefaultAuthority()
  const { deleteAuthority } = useFetchDeleteAuthority()
  const handleSelectAll = event => {
    const newSelectedAll = event.target.checked
      ? merchantAuth.filter(data => data.authorityName !== '高階主管').map(merchantAuth => merchantAuth.id)
      : []
    setSelected(newSelectedAll)
  }
  const handleSelectOne = id => {
    const newSelect = [...selected],
      index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelected(newSelect)
  }
  const handleSeletedDelete = () => {
    selected.forEach(d => {
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
    <div {...rest}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-baseline gap-3">
            <CardTitle>角色權限列表</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">共 {merchantAuth.length} 筆</span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={selected.length === merchantAuth.filter(d => d.authorityName !== '高階主管').length && merchantAuth.length > 0}
                    indeterminate={selected.length > 0 && selected.length < merchantAuth.filter(d => d.authorityName !== '高階主管').length}
                    onChange={handleSelectAll}
                    disabled={merchantAuth.length === 0}
                  />
                </TableHead>
                <TableHead>操作</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead numeric>目前人數</TableHead>
                <TableHead>是否為預設權限</TableHead>
                <TableHead>狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchantAuth.length > 0 &&
                merchantAuth.map((data, index) => (
                  <TableRow key={data.id} data-state={selected.indexOf(data.id) > -1 ? 'selected' : undefined}>
                    <TableCell>
                      <Checkbox
                        aria-label={`選取 ${data.authorityName}`}
                        onChange={() => handleSelectOne(data.id)}
                        checked={selected.indexOf(data.id) > -1}
                        disabled={data.authorityName === '高階主管'}
                      />
                    </TableCell>
                    <TableCell>
                      {/* 高階主管不可編輯：與舊版相同呈現為停用的按鈕；其他角色為連結 */}
                      {data.authorityName === '高階主管' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-secondary"
                          aria-label="編輯角色"
                          disabled={data.authorityName === '高階主管'}
                        >
                          <Pencil strokeWidth={1.75} />
                        </Button>
                      ) : (
                        <Button asChild variant="ghost" size="icon" className="text-text-secondary">
                          <RouterLink aria-label="編輯角色" to={data.authorityName === '高階主管' ? undefined : `/role/edit/${data.id}`}>
                            <Pencil strokeWidth={1.75} />
                          </RouterLink>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{data.authorityName}</TableCell>
                    <TableCell numeric>{formatNumber(data.usingDesignerCount)}</TableCell>
                    <TableCell>
                      <Switch size="small" checked={data.isDefault} onClick={() => handleSetDefaltAuth(data.id)} />
                    </TableCell>
                    <TableCell>{authStatus[index] && <Badge variant={authStatusVariant(authStatus[index])}>{authStatus[index]}</Badge>}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <TableEditBar selected={selected} onDelete={handleSeletedDelete} confirmDelete />
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
