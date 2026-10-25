import { Fragment } from 'react'
import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'

// 不分段（全段）級距列（自 Results.js 原樣搬出）：以函式回傳與原本相同的元素，在 Results 原位置呼叫，元素樹不變

// 不分指定：總業績級距
export function renderNonSegmentedNonDistinguish({ profitSharing, deductionIndex, handleAddSetDeductionNum, handleDeleteSetDeductionNum, handleNonSegmentedThresholdInput, handleNonSegmentedRakeInput }) {
  return (
    profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.map(
      (data, index) => (
        <div className="mb-2.5 flex items-center" key={index}>
          <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
            總業績從(含)
          </span>
          <Field label="輸入業績" className="ml-4 min-w-0">
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
          <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
            抽成調整為
          </span>
          <Field label="輸入抽成(%)" className="ml-4 min-w-0">
            <Input
              min={0}
              type="number"
              value={data.rake ? data.rake : 0}
              onChange={event => handleNonSegmentedRakeInput(event, index, 'rake')}
            />
          </Field>
          <div className="ml-4 flex items-center gap-1">
            {index !== 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-text-tertiary hover:text-danger"
                aria-label="刪除此級距"
                onClick={() => handleDeleteSetDeductionNum(index)}
              >
                <DeleteForeverIcon fontSize="small" />
              </Button>
            )}
            {index ===
              profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish
                .length -
                1 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-text-tertiary"
                aria-label="新增級距"
                onClick={() => handleAddSetDeductionNum('nonDistinguish')}
              >
                <AddIcon fontSize="small" />
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
      <div>
        <h3 className="my-4 text-heading text-text">
          指定業績
        </h3>
      </div>
      {profitSharing.nonSegmented[deductionIndex].rakeData.designate.map(
        (data, index) => {
          return (
            <div key={index} className="flex flex-wrap">
              <div className="mb-2.5 flex items-center">
                <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                  總業績從(含)
                </span>
                <Field label="輸入業績" className="ml-4 min-w-0">
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
              <div className="mb-2.5 flex items-center">
                <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                  抽成調整為
                </span>
                <Field label="輸入抽成(%)" className="ml-4 min-w-0">
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
              <div className="mb-2.5 flex items-center">
                <div className="ml-4 flex items-center gap-1">
                  {index !== 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-tertiary hover:text-danger"
                      aria-label="刪除此級距"
                      onClick={() => handleDeleteNonSegmentedDesignate(index)}
                    >
                      <DeleteForeverIcon fontSize="small" />
                    </Button>
                  )}
                  {index ===
                    profitSharing.nonSegmented[deductionIndex].rakeData.designate
                      .length -
                      1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-tertiary"
                      aria-label="新增級距"
                      onClick={() => handleAddSetDeductionNum('designate')}
                    >
                      <AddIcon fontSize="small" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        }
      )}
      <div>
        <h3 className="my-4 text-heading text-text">
          不指定業績
        </h3>
      </div>
      {profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.map(
        (data, index) => {
          return (
            <div key={index} className="flex flex-wrap">
              <div className="mb-2.5 flex items-center">
                <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                  總業績從(含)
                </span>
                <Field label="輸入業績" className="ml-4 min-w-0">
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
              <div className="mb-2.5 flex items-center">
                <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                  抽成調整為
                </span>
                <Field label="輸入抽成(%)" className="ml-4 min-w-0">
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
              <div className="mb-2.5 flex items-center">
                <div className="ml-4 flex items-center gap-1">
                  {index !== 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-tertiary hover:text-danger"
                      aria-label="刪除此級距"
                      onClick={() => handleDeleteNonSegmentedNonDesignate(index)}
                    >
                      <DeleteForeverIcon fontSize="small" />
                    </Button>
                  )}
                  {index ===
                    profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate
                      .length -
                      1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-tertiary"
                      aria-label="新增級距"
                      onClick={() => handleAddSetDeductionNum('nonDesignate')}
                    >
                      <AddIcon fontSize="small" />
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
