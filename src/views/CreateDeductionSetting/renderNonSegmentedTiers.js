import { Fragment } from 'react'
import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'
import { Plus, Trash2 } from 'lucide-react'

// 不分段（全段）級距列（自 Results.js 原樣搬出）：以函式回傳與原本相同的元素，在 Results 原位置呼叫，元素樹不變

// 不分指定：總業績級距
export function renderNonSegmentedNonDistinguish({ profitSharing, deductionIndex, handleAddSetDeductionNum, handleDeleteSetDeductionNum, handleNonSegmentedThresholdInput, handleNonSegmentedRakeInput }) {
  return (
    profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.map(
      (data, index) => (
        <div className="flex items-center gap-3" key={index}>
          <span className="whitespace-nowrap text-body text-text-secondary">
            總業績從(含)
          </span>
          <Field label="輸入業績" className="min-w-0">
            <Input
              min={0}
              type="number"
              value={data.threshold ? data.threshold : 0}
              onChange={event =>
                handleNonSegmentedThresholdInput(event, index, 'threshold')
              }
              onWheel={() => document.activeElement.blur()}
            />
          </Field>
          <span className="whitespace-nowrap text-body text-text-secondary">
            抽成調整為
          </span>
          <Field label="輸入抽成(%)" className="min-w-0">
            <Input
              min={0}
              type="number"
              value={data.rake ? data.rake : 0}
              onChange={event => handleNonSegmentedRakeInput(event, index, 'rake')}
              onWheel={() => document.activeElement.blur()}
            />
          </Field>
          <div className="flex items-center gap-1">
            {index !== 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-text-secondary hover:text-danger"
                aria-label="刪除此級距"
                onClick={() => handleDeleteSetDeductionNum(index)}
              >
                <Trash2 strokeWidth={1.75} />
              </Button>
            )}
            {index ===
              profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish
                .length -
              1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-secondary"
                  aria-label="新增級距"
                  onClick={() => handleAddSetDeductionNum('nonDistinguish')}
                >
                  <Plus strokeWidth={1.75} />
                </Button>
              )}
          </div>
        </div>
      )
    )
  )
}

// 分指定／不指定：各自的級距
export function renderNonSegmentedDesignation({ profitSharing, deductionIndex, handleAddSetDeductionNum, handleDeleteNonSegmentedDesignate, handleDeleteNonSegmentedNonDesignate, handleNonSegmentedDesignateThresholdInput, handleNonSegmentedNonDesignateThresholdInput, handleNonSegmentedDesignateRakeInput, handleNonSegmentedNonDesignateRakeInput }) {
  return (
    <Fragment>
      <div className="pt-3">
        <h3 className="text-heading text-text">
          指定業績
        </h3>
      </div>
      {profitSharing.nonSegmented[deductionIndex].rakeData.designate.map(
        (data, index) => {
          return (
            <div key={index} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap text-body text-text-secondary">
                  總業績從(含)
                </span>
                <Field label="輸入業績" className="min-w-0">
                  <Input
                    min={0}
                    type="number"
                    value={data.threshold ? data.threshold : 0}
                    onChange={event =>
                      handleNonSegmentedDesignateThresholdInput(
                        event,
                        index,
                        'threshold'
                      )
                    }
                    onWheel={() => document.activeElement.blur()}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap text-body text-text-secondary">
                  抽成調整為
                </span>
                <Field label="輸入抽成(%)" className="min-w-0">
                  <Input
                    min={0}
                    type="number"
                    value={data.rake ? data.rake : 0}
                    onChange={event =>
                      handleNonSegmentedDesignateRakeInput(event, index, 'rake')
                    }
                    onWheel={() => document.activeElement.blur()}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {index !== 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-secondary hover:text-danger"
                      aria-label="刪除此級距"
                      onClick={() => handleDeleteNonSegmentedDesignate(index)}
                    >
                      <Trash2 strokeWidth={1.75} />
                    </Button>
                  )}
                  {index ===
                    profitSharing.nonSegmented[deductionIndex].rakeData.designate
                      .length -
                    1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-text-secondary"
                        aria-label="新增級距"
                        onClick={() => handleAddSetDeductionNum('designate')}
                      >
                        <Plus strokeWidth={1.75} />
                      </Button>
                    )}
                </div>
              </div>
            </div>
          )
        }
      )}
      <div className="pt-3">
        <h3 className="text-heading text-text">
          不指定業績
        </h3>
      </div>
      {profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.map(
        (data, index) => {
          return (
            <div key={index} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap text-body text-text-secondary">
                  總業績從(含)
                </span>
                <Field label="輸入業績" className="min-w-0">
                  <Input
                    min={0}
                    type="number"
                    value={data.threshold ? data.threshold : 0}
                    onChange={event =>
                      handleNonSegmentedNonDesignateThresholdInput(
                        event,
                        index,
                        'threshold'
                      )
                    }
                    onWheel={() => document.activeElement.blur()}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap text-body text-text-secondary">
                  抽成調整為
                </span>
                <Field label="輸入抽成(%)" className="min-w-0">
                  <Input
                    min={0}
                    type="number"
                    value={data.rake ? data.rake : 0}
                    onChange={event =>
                      handleNonSegmentedNonDesignateRakeInput(event, index, 'rake')
                    }
                    onWheel={() => document.activeElement.blur()}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {index !== 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-secondary hover:text-danger"
                      aria-label="刪除此級距"
                      onClick={() => handleDeleteNonSegmentedNonDesignate(index)}
                    >
                      <Trash2 strokeWidth={1.75} />
                    </Button>
                  )}
                  {index ===
                    profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate
                      .length -
                    1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-text-secondary"
                        aria-label="新增級距"
                        onClick={() => handleAddSetDeductionNum('nonDesignate')}
                      >
                        <Plus strokeWidth={1.75} />
                      </Button>
                    )}
                </div>
              </div>
            </div>
          )
        }
      )}
    </Fragment>
  )
}
