import { Pencil } from 'lucide-react'
import { useState, Fragment } from 'react'
import TrackingEditModal from './TrackingEditModal'
import { Button } from 'ui/button'
import { Card, CardFooter, CardHeader, CardTitle } from 'ui/card'

const optionsArray = [
  { "hairProperties": '髮質屬性' },
  { "scalpProperties": '頭皮屬性' },
  { "permAppliance": '燙髮用具' },
  { "permPotion": '燙髮藥水' },
  { "hairColorCategory": '染髮類別' },
  { "hairColor": '染髮色系' }
]

export default function CustomerTracking({ customerId, className, hairCondition, refetchHairInfo, isLoading, ...rest }) {
  const [open, setOpen] = useState(false)

  const handleOpenModel = () => {
    setOpen(true)
  }
  const handleRenderOptions = data => {
    // 欄位為 null 時留白（原本讀 null.length 整頁錯誤；Jason 2026/10/22 fix all）
    if (!data || !data.length) return ''
    return data.join('、')
  }

  return (
    <Fragment>
      <div {...rest} className="grid grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>髮型狀況</CardTitle>
          </CardHeader>
          <dl className="m-0 px-5">
            {optionsArray.map((d, i) => {
              const [[key, title]] = Object.entries(d)
              const options = hairCondition[key]
              return (
                <div key={`${title}-${i}`} className="flex gap-4 border-0 border-b border-solid border-border py-2.5">
                  <dt className="w-24 shrink-0 whitespace-nowrap text-label text-text-secondary">{`${title}：`}</dt>
                  <dd className="m-0 text-body text-text">{handleRenderOptions(options)}</dd>
                </div>
              )
            })}
            <div className="flex gap-4 py-2.5">
              <dt className="w-24 shrink-0 whitespace-nowrap text-label text-text-secondary">染髮配方：</dt>
              {/* 舊版為唯讀 multiline TextField，改為保留換行的純文字顯示 */}
              <dd className="m-0 whitespace-pre-wrap break-all text-body text-text">{hairCondition.hairDyeFormula}</dd>
            </div>
          </dl>
          <CardFooter className="justify-start">
            <Button variant="ghost" onClick={handleOpenModel}>
              <Pencil strokeWidth={1.75} />
              編輯
            </Button>
          </CardFooter>
        </Card>
      </div>
      <TrackingEditModal
        customerId={customerId}
        open={open}
        setOpen={setOpen}
        optionsArray={optionsArray}
        hairCondition={hairCondition}
        refetchHairInfo={refetchHairInfo}
        isLoading={isLoading}
      />
    </Fragment>
  )
}
