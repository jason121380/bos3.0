import { format } from 'date-fns';
import { useEffect } from 'react';
import { Fragment, useState } from 'react'
import { cloneDeep } from 'lodash';
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

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
        <Card>
          <EmptyState title="無資料" />
        </Card> :
        <Card className="p-5">
          <Table wrapperClassName="max-h-[calc(100vh-300px)] overflow-auto">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead>會員卡名稱</TableHead>
                <TableHead>購買日期</TableHead>
                <TableHead>到期日期</TableHead>
                <TableHead numeric>有效天數</TableHead>
                <TableHead>備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(({ expiryDay, membershipName, purchaseDate, remark, validityDay }, i) => (
                <TableRow key={`${expiryDay}-${i}`}>
                  <TableCell>{membershipName}</TableCell>
                  <TableCell className="tabular-nums">{format(purchaseDate, 'yyyy/MM/dd')}</TableCell>
                  <TableCell className="tabular-nums">{expiryDay ? format(expiryDay, 'yyyy/MM/dd') : '無效期'}</TableCell>
                  <TableCell numeric>{validityDay || '無'}</TableCell>
                  <TableCell>{remark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      }
    </Fragment>
  )
}

export default MembershipRecord
