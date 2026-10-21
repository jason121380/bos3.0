import { ChevronDown, ChevronUp } from 'lucide-react'
import { Fragment, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep';
import { format } from 'date-fns';
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

const arrowUp = <ChevronUp className="h-4 w-4 cursor-pointer text-text-secondary" strokeWidth={1.75} />
const arrowDown = <ChevronDown className="h-4 w-4 cursor-pointer text-text-secondary" strokeWidth={1.75} />

function EventTicketsRecord({ data, isLoading }) {
  const [selectIds, setSelectIds] = useState([])

  const handleSetCollapse = id => {
    const cloneIds = cloneDeep(selectIds)
    const idx = cloneIds.indexOf(id)
    if (idx > -1) {
      cloneIds.splice(idx, 1)
    } else {
      cloneIds.push(id)
    }
    setSelectIds(cloneIds)
  }

  return (
    <Fragment>
      {isLoading ? <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中"><Skeleton className="h-[240px] w-full rounded-lg" /></div> :
        data.length ?
          <Card className="p-5">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>名稱</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(({ eventName, tickets }, i) => {
                  const isSelect = selectIds.includes(`${eventName}-${i}`)
                  const Icon = () => isSelect ? arrowUp : arrowDown
                  return (
                    <Fragment key={`${eventName}-${i}`}>
                      <TableRow className={tickets.length ? 'cursor-pointer' : undefined} onClick={() => tickets.length && handleSetCollapse(`${eventName}-${i}`)}>
                        <TableCell className="w-12">
                          {tickets.length ? <Icon /> : ''}
                        </TableCell>
                        <TableCell>{eventName}</TableCell>
                      </TableRow>
                      {tickets.length ? (
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="h-auto p-0" colSpan={10}>
                            {selectIds.indexOf(`${eventName}-${i}`) > -1 && (
                              <div className="m-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                      <TableHead>流水號</TableHead>
                                      <TableHead>發券日期</TableHead>
                                      <TableHead>發券店家</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {tickets.map(({ serialNumber, consumptionDate, consumptionStoreName }) => (
                                      <TableRow key={serialNumber}>
                                        <TableCell className="tabular-nums">{serialNumber}</TableCell>
                                        <TableCell className="tabular-nums">{format(consumptionDate, 'yyyy/MM/dd')}</TableCell>
                                        <TableCell>{consumptionStoreName}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
          : <Card>
            <EmptyState title="無資料" />
          </Card>
      }
    </Fragment>
  )
}
export default EventTicketsRecord
