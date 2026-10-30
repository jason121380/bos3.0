// 彈窗改 ui/dialog（窗內只有 TextField、Checkbox、ToggleGroup、Tabs，沒有彈出式選單；原 Modal 無 onClose，故不傳 onOpenChange）；
// 抽成級距表單原以 MUI Table 當排版容器（列內直接放標題、儲存格改 flex），改原生 div（儲存格保留 16px 內距，原 emotion 樣式已等值轉為 Tailwind）；
// ToggleButton 為 ui/toggle-group（布林值原樣、handler 不讀參數）；Tabs 為 ui/tabs（value 為字串、activationMode="manual"，onValueChange 以 (null, value) 轉接原 handler）
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'
import idx from 'idx'
import { Button } from 'ui/button'
import { CardContent } from 'ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'ui/dialog'
import { Skeleton } from 'ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from 'ui/tabs'
import createRakeHandlers, { checkInputRangeOnly } from 'views/DeductionSettingShared/createRakeHandlers'
import { renderNonSegmentedDesignation, renderNonSegmentedNonDistinguish } from './rakeSettingNonSegmentedTiers'
import { renderSegmentedDesignation, renderSegmentedNonDistinguish } from './rakeSettingSegmentedTiers'

// checkInput 與欄位 handler 搬到 views/DeductionSettingShared/createRakeHandlers（與新增／編輯抽成設定頁共用，內容不變）；
// 級距列搬到 rakeSettingNonSegmentedTiers／rakeSettingSegmentedTiers；state、handleTabsChange、effect 與彈窗外框仍在此檔

const isSegmented = [
  { label: '全段', value: false },
  { label: '分段', value: true },
]

function EditMultipleDesignersRakeSettingModal({ openEditRakeSettingModal, onClose, onChange, profitSharing, handleMultipleRakeSetting }) {
  const [attributions, setAttributions] = useState([])
  const getAttributionForRake = useFetchGetAttributionForRake()

  const [tabValue, setTabValue] = useState('預設')
  const [deductionIndex, setDeductionIndex] = useState(0)

  // 欄位 handler（與抽成設定頁共用，內容不變）：每次 render 以目前的值重新建立，與原本寫在元件內相同
  const rakeHandlers = createRakeHandlers({
    profitSharing,
    onChange,
    deductionIndex,
    setTabValue,
    setDeductionIndex,
    checkInput: checkInputRangeOnly,
  })
  const { handleDesignateChange, handleToggleButtonChange } = rakeHandlers
  const tierProps = { profitSharing, deductionIndex, ...rakeHandlers }

  const handleTabsChange = (e, value) => {
    const newProfitSharing = cloneDeep(profitSharing)
    if (newProfitSharing.nonSegmented.filter(d => d.attribute === value).length === 0) {
      if (profitSharing.designationUsage && !profitSharing.isSegmented) {
        newProfitSharing.nonSegmented.push({
          attribute: value,
          rakeData: {
            designate: [
              {
                threshold: 0,
                rake: 0,
              },
            ],
            nonDesignate: [
              {
                threshold: 0,
                rake: 0,
              },
            ],
            nonDistinguish: [],
          },
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      } else {
        newProfitSharing.nonSegmented.push({
          attribute: value,
          rakeData: {
            designate: [],
            nonDesignate: [],
            nonDistinguish: [
              {
                threshold: 0,
                rake: 0,
              },
            ],
          },
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    } else {
      newProfitSharing.nonSegmented.forEach((d, index) => {
        if (d.attribute === value && profitSharing.designationUsage) {
          if (newProfitSharing.nonSegmented[index].rakeData.nonDistinguish.length === 0) {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
          } else {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
            onChange({ value: !newProfitSharing.designationUsage, key: 'designationUsage' })
          }
        } else if (d.attribute === value && !profitSharing.designationUsag) {
          if (newProfitSharing.nonSegmented[index].rakeData.designate.length === 0) {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
          } else {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
            onChange({ value: !newProfitSharing.designationUsage, key: 'designationUsage' })
          }
        }
      })
    }
    setTabValue(value)
  }

  useEffect(() => {
    profitSharing.nonSegmented.forEach((d, index) => {
      if (d.attribute === tabValue) {
        setDeductionIndex(index)
      } else if (tabValue === '預設') {
        setDeductionIndex(0)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [tabValue] 變動時執行；profitSharing.nonSegmented 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [tabValue])

  useEffect(() => {
    if (!getAttributionForRake.loading) {
      const data = idx(getAttributionForRake, _ => _.data.getAttributionForRake)
      setAttributions(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getAttributionForRake.loading])

  return (
    <Dialog open={openEditRakeSettingModal}>
      <DialogContent size="lg" hideClose aria-describedby={undefined} className="max-w-[912px]">
        {/* 內層為一般區塊（非 flex）：標題列「關閉」與底部「儲存」沿用原本的 float 排版 */}
        <div className="min-h-0 overflow-y-auto">
          {!getAttributionForRake.loading ? (
            <>
              <div className="justify-between items-center">
                <DialogHeader className="pb-4">
                  <DialogTitle>編輯設計師抽成</DialogTitle>
                </DialogHeader>
                {!profitSharing.isSegmented && (
                  <Tabs value={tabValue} onValueChange={value => handleTabsChange(null, value)} activationMode="manual">
                    <TabsList>
                      {attributions.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}
                <Button variant="secondary" className="my-[16px] mx-[24px] float-right" onClick={onClose}>
                  關閉
                </Button>
              </div>

              <CardContent>
                <div>
                  <div>
                    <Fragment>
                      <div>
                        <h4 className="my-4 text-heading text-text">抽成模式</h4>
                        <ToggleGroup
                          size="small"
                          className="ml-[20px]"
                          value={profitSharing.isSegmented}
                          onChange={handleToggleButtonChange}
                          exclusive
                        >
                          {isSegmented.map((data, idx) => (
                            <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} data-testid={`assign-designer-${data.value}`}>
                              {data.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                        <FormControlLabel
                          className="ml-[5px]"
                          control={<Checkbox color="primary" />}
                          label="分指定/不指定"
                          checked={profitSharing.designationUsage}
                          onClick={handleDesignateChange}
                        />
                      </div>
                      {!profitSharing.designationUsage
                        ? !profitSharing.isSegmented
                          ? renderNonSegmentedNonDistinguish(tierProps)
                          : renderSegmentedNonDistinguish(tierProps)
                        : !profitSharing.isSegmented
                          ? renderNonSegmentedDesignation(tierProps)
                          : renderSegmentedDesignation(tierProps)}
                    </Fragment>
                  </div>
                </div>
              </CardContent>
              <Button variant="primary" className="my-[16px] mx-[24px] float-right" onClick={handleMultipleRakeSetting}>
                儲存
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-4 p-6" aria-busy="true" aria-label="載入中">
              <DialogTitle className="sr-only">編輯設計師抽成</DialogTitle>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-[320px] w-full rounded-lg" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

EditMultipleDesignersRakeSettingModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

EditMultipleDesignersRakeSettingModal.defaultProps = {
  open: false,
  onClose: () => {},
}

export default EditMultipleDesignersRakeSettingModal
