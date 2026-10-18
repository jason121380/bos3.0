import { ChevronDown, ChevronUp } from 'lucide-react'
import { Fragment, useState } from 'react'
import clsx from 'clsx';
import { cloneDeep } from 'lodash';
import { format } from 'date-fns';
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'

const arrowUp = <ChevronUp className="h-5 w-5 text-text-secondary" strokeWidth={1.75} />
const arrowDown = <ChevronDown className="h-5 w-5 text-text-secondary" strokeWidth={1.75} />

function EventTicketsRecord({ data }) {
  const { message, customerEventTickets } = data
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
      {customerEventTickets.length > 0 ? (
        <div className="flex flex-col gap-4">
          {/* 手機版：每個活動一張卡片，點擊展開該活動的抽獎券列表 */}
          {customerEventTickets.map(({ eventName, tickets }, i) => {
            const isSelect = selectIds.includes(`${eventName}-${i}`)
            const Icon = () => isSelect ? arrowUp : arrowDown
            return (
              <Fragment key={`${eventName}-${i}`}>
                <Card className="overflow-hidden">
                  <button
                    type="button"
                    className={clsx('flex min-h-11 w-full items-center justify-between gap-3 px-5 py-4 text-left', tickets.length ? 'cursor-pointer hover:bg-surface-hover' : 'cursor-default')}
                    onClick={() => tickets.length && handleSetCollapse(`${eventName}-${i}`)}
                  >
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-caption text-text-secondary">名稱</span>
                      <span className="text-heading text-text">{eventName}</span>
                    </span>
                    {tickets.length ? <Icon /> : ''}
                  </button>
                  {tickets.length ? (
                    selectIds.indexOf(`${eventName}-${i}`) > -1 && (
                      <ul className="border-0 border-t border-solid border-border">
                        {tickets.map(({ serialNumber, consumptionDate, consumptionStoreName }) => (
                          <li key={serialNumber} className="border-0 border-b border-solid border-border px-5 py-3 last:border-b-0">
                            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body">
                              <dt className="text-label text-text-secondary">流水號</dt>
                              <dd className="m-0 break-all text-right tabular-nums text-text">{serialNumber}</dd>
                              <dt className="text-label text-text-secondary">發券日期</dt>
                              <dd className="m-0 text-right tabular-nums text-text">{format(consumptionDate, 'yyyy/M/d')}</dd>
                              <dt className="text-label text-text-secondary">發券店家</dt>
                              <dd className="m-0 text-right text-text">{consumptionStoreName}</dd>
                            </dl>
                          </li>
                        ))}
                      </ul>
                    )
                  ) : null}
                </Card>
              </Fragment>
            )
          })}
        </div>
      ) : (
        <Card>
          <EmptyState title={message} />
        </Card>
      )}
    </Fragment>
  )
}
export default EventTicketsRecord
