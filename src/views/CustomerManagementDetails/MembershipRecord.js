/** @jsxImportSource @emotion/react */
import {
  Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer,
  Card, Typography
} from '@mui/material'
import { format } from 'date-fns';
import { useEffect } from 'react';
import { Fragment, useState } from 'react'
import { cloneDeep } from 'lodash';
import { css } from '@emotion/react'

const styles = {
  root: css({
    '& td': {
      whiteSpace: 'nowrap !important'
    }
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))',
  }),
}

function MembershipRecord({ records }) {
  const [data, setData] = useState([])

  useEffect(() => {
    if (records.length) {
      const cloneData = cloneDeep(records)
      cloneData.sort((a, b) => b.purchaseDate - a.purchaseDate)
      setData(cloneData)
    }
  }, [records])
  
  return (
    <Fragment>
      {records.length === 0 ?
        <Typography variant="h3" style={{ textAlign: 'center', marginTop: 50 }}>
          無資料
        </Typography> :
        <Card>
          <TableContainer style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table>
              <TableHead>
                <TableRow css={styles.stickyRow}>
                  <TableCell>會員卡名稱</TableCell>
                  <TableCell>購買日期</TableCell>
                  <TableCell>到期日期</TableCell>
                  <TableCell>有效天數</TableCell>
                  <TableCell>備註</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map(({ expiryDay, membershipName, purchaseDate, remark, validityDay }, i) => (
                  <TableRow key={`${expiryDay}-${i}`} hover>
                    <TableCell>{membershipName}</TableCell>
                    <TableCell>{format(purchaseDate, 'yyyy/MM/dd')}</TableCell>
                    <TableCell>{expiryDay ? format(expiryDay, 'yyyy/MM/dd') : '無效期'}</TableCell>
                    <TableCell>{validityDay || '無'}</TableCell>
                    <TableCell>{remark}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      }
    </Fragment>
  )
}

export default MembershipRecord