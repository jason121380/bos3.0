import { Fragment } from 'react'
import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'

// 分段級距列（自 Results.js 原樣搬出）：以函式回傳與原本相同的元素，在 Results 原位置呼叫，元素樹不變

// 不分指定：總業績分段
export function renderSegmentedNonDistinguish({ profitSharing, handleAddSegmented, handleDeleteSegmented, handleSegmentedInput }) {
  return (
    profitSharing.segmented[0].nonDistinguish.map((data, index) => (
      <div key={index} className="flex flex-wrap">
        <div className="mb-2.5 flex items-center">
          <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
            總業績從(含)
          </span>
          <Field label="輸入業績" className="ml-4 min-w-0">
            <Input
              min={0}
              type="number"
              value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
              onChange={event =>
                handleSegmentedInput(event, index, 'thresholdLowerLimit')
              }
              onWheel={() => document.activeElement.blur()}
            />
          </Field>
        </div>
        <div className="mb-2.5 flex items-center">
          <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
            至
          </span>
          <Field label="輸入業績" className="ml-4 min-w-0">
            <Input
              min={0}
              type="number"
              value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
              onChange={event =>
                handleSegmentedInput(event, index, 'thresholdUpperLimit')
              }
              onWheel={() => document.activeElement.blur()}
            />
          </Field>
        </div>
        <div className="mb-2.5 flex items-center">
          <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
            抽成為
          </span>
          <Field label="輸入抽成(%)" className="ml-4 min-w-0">
            <Input
              min={0}
              type="number"
              value={data.rake ? data.rake : 0}
              onChange={event => handleSegmentedInput(event, index, 'rake')}
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
                className="h-8 w-8 text-text-tertiary hover:text-danger"
                aria-label="刪除此級距"
                onClick={() => handleDeleteSegmented(index)}
              >
                <DeleteForeverIcon fontSize="small" />
              </Button>
            )}
            {index === profitSharing.segmented[0].nonDistinguish.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text-tertiary"
                aria-label="新增級距"
                onClick={() => handleAddSegmented('nonDistinguish')}
              >
                <AddIcon fontSize="small" />
              </Button>
            )}
          </div>
        </div>
      </div>
    ))
  )
}

// 分指定／不指定：各自分段
export function renderSegmentedDesignation({ profitSharing, handleAddSegmented, handleDeleteSegmentedDesignate, handleDeleteSegmentedNonDesignate, handleDesignateSegmentedInput, handleNonDesignateSegmentedInput }) {
  return (
    <Fragment>
      <div>
        <h3 className="my-4 text-heading text-text">
          指定業績
        </h3>
      </div>
      {profitSharing.segmented[0].designate.map((data, index) => {
        return (
          <div key={index} className="flex flex-wrap">
            <div className="mb-2.5 flex items-center">
              <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                指定業績從(含)
              </span>
              <Field label="輸入業績" className="ml-4 min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                  onChange={event =>
                    handleDesignateSegmentedInput(event, index, 'thresholdLowerLimit')
                  }
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            </div>
            <div className="mb-2.5 flex items-center">
              <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                至
              </span>
              <Field label="輸入業績" className="ml-4 min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                  onChange={event =>
                    handleDesignateSegmentedInput(event, index, 'thresholdUpperLimit')
                  }
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            </div>
            <div className="mb-2.5 flex items-center">
              <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                抽成為
              </span>
              <Field label="輸入抽成(%)" className="ml-4 min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.rake ? data.rake : 0}
                  onChange={event =>
                    handleDesignateSegmentedInput(event, index, 'rake')
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
                    className="h-8 w-8 text-text-tertiary hover:text-danger"
                    aria-label="刪除此級距"
                    onClick={() => handleDeleteSegmentedDesignate(index)}
                  >
                    <DeleteForeverIcon fontSize="small" />
                  </Button>
                )}
                {index === profitSharing.segmented[0].designate.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-tertiary"
                    aria-label="新增級距"
                    onClick={() => handleAddSegmented('designate')}
                  >
                    <AddIcon fontSize="small" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}
      <div>
        <h3 className="my-4 text-heading text-text">
          不指定業績
        </h3>
      </div>
      {profitSharing.segmented[0].nonDesignate.map((data, index) => {
        return (
          <div key={index} className="flex flex-wrap">
            <div className="mb-2.5 flex items-center">
              <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                不指定業績從(含)
              </span>
              <Field label="輸入業績" className="ml-4 min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                  onChange={event =>
                    handleNonDesignateSegmentedInput(
                      event,
                      index,
                      'thresholdLowerLimit'
                    )
                  }
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            </div>
            <div className="mb-2.5 flex items-center">
              <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                至
              </span>
              <Field label="輸入業績" className="ml-4 min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                  onChange={event =>
                    handleNonDesignateSegmentedInput(
                      event,
                      index,
                      'thresholdUpperLimit'
                    )
                  }
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            </div>
            <div className="mb-2.5 flex items-center">
              <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                抽成為
              </span>
              <Field label="輸入抽成(%)" className="ml-4 min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.rake ? data.rake : 0}
                  onChange={event =>
                    handleNonDesignateSegmentedInput(event, index, 'rake')
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
                    className="h-8 w-8 text-text-tertiary hover:text-danger"
                    aria-label="刪除此級距"
                    onClick={() => handleDeleteSegmentedNonDesignate(index)}
                  >
                    <DeleteForeverIcon fontSize="small" />
                  </Button>
                )}
                {index === profitSharing.segmented[0].nonDesignate.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-tertiary"
                    aria-label="新增級距"
                    onClick={() => handleAddSegmented('nonDesignate')}
                  >
                    <AddIcon fontSize="small" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </Fragment>
  )
}
