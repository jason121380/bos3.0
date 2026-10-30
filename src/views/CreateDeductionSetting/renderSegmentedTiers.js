import { Fragment } from 'react'
import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'
import { Plus, Trash2 } from 'lucide-react'

// 分段級距列（自 Results.js 原樣搬出）：以函式回傳與原本相同的元素，在 Results 原位置呼叫，元素樹不變

// 不分指定：總業績分段
export function renderSegmentedNonDistinguish({ profitSharing, handleAddSegmented, handleDeleteSegmented, handleSegmentedInput }) {
  return profitSharing.segmented[0].nonDistinguish.map((data, index) => (
    <div key={index} className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-body text-text-secondary">總業績從(含)</span>
        <Field label="輸入業績" className="min-w-0">
          <Input
            min={0}
            type="number"
            value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
            onChange={event => handleSegmentedInput(event, index, 'thresholdLowerLimit')}
            onWheel={() => document.activeElement.blur()}
          />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-body text-text-secondary">至</span>
        <Field label="輸入業績" className="min-w-0">
          <Input
            min={0}
            type="number"
            value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
            onChange={event => handleSegmentedInput(event, index, 'thresholdUpperLimit')}
            onWheel={() => document.activeElement.blur()}
          />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-body text-text-secondary">抽成為</span>
        <Field label="輸入抽成(%)" className="min-w-0">
          <Input
            min={0}
            type="number"
            value={data.rake ? data.rake : 0}
            onChange={event => handleSegmentedInput(event, index, 'rake')}
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
              onClick={() => handleDeleteSegmented(index)}
            >
              <Trash2 strokeWidth={1.75} />
            </Button>
          )}
          {index === profitSharing.segmented[0].nonDistinguish.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="text-text-secondary"
              aria-label="新增級距"
              onClick={() => handleAddSegmented('nonDistinguish')}
            >
              <Plus strokeWidth={1.75} />
            </Button>
          )}
        </div>
      </div>
    </div>
  ))
}

// 分指定／不指定：各自分段
export function renderSegmentedDesignation({
  profitSharing,
  handleAddSegmented,
  handleDeleteSegmentedDesignate,
  handleDeleteSegmentedNonDesignate,
  handleDesignateSegmentedInput,
  handleNonDesignateSegmentedInput,
}) {
  return (
    <Fragment>
      <div className="pt-3">
        <h3 className="text-heading text-text">指定業績</h3>
      </div>
      {profitSharing.segmented[0].designate.map((data, index) => {
        return (
          <div key={index} className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-body text-text-secondary">指定業績從(含)</span>
              <Field label="輸入業績" className="min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                  onChange={event => handleDesignateSegmentedInput(event, index, 'thresholdLowerLimit')}
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-body text-text-secondary">至</span>
              <Field label="輸入業績" className="min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                  onChange={event => handleDesignateSegmentedInput(event, index, 'thresholdUpperLimit')}
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-body text-text-secondary">抽成為</span>
              <Field label="輸入抽成(%)" className="min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.rake ? data.rake : 0}
                  onChange={event => handleDesignateSegmentedInput(event, index, 'rake')}
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
                    onClick={() => handleDeleteSegmentedDesignate(index)}
                  >
                    <Trash2 strokeWidth={1.75} />
                  </Button>
                )}
                {index === profitSharing.segmented[0].designate.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-text-secondary"
                    aria-label="新增級距"
                    onClick={() => handleAddSegmented('designate')}
                  >
                    <Plus strokeWidth={1.75} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}
      <div className="pt-3">
        <h3 className="text-heading text-text">不指定業績</h3>
      </div>
      {profitSharing.segmented[0].nonDesignate.map((data, index) => {
        return (
          <div key={index} className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-body text-text-secondary">不指定業績從(含)</span>
              <Field label="輸入業績" className="min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                  onChange={event => handleNonDesignateSegmentedInput(event, index, 'thresholdLowerLimit')}
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-body text-text-secondary">至</span>
              <Field label="輸入業績" className="min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                  onChange={event => handleNonDesignateSegmentedInput(event, index, 'thresholdUpperLimit')}
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-body text-text-secondary">抽成為</span>
              <Field label="輸入抽成(%)" className="min-w-0">
                <Input
                  min={0}
                  type="number"
                  value={data.rake ? data.rake : 0}
                  onChange={event => handleNonDesignateSegmentedInput(event, index, 'rake')}
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
                    onClick={() => handleDeleteSegmentedNonDesignate(index)}
                  >
                    <Trash2 strokeWidth={1.75} />
                  </Button>
                )}
                {index === profitSharing.segmented[0].nonDesignate.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-text-secondary"
                    aria-label="新增級距"
                    onClick={() => handleAddSegmented('nonDesignate')}
                  >
                    <Plus strokeWidth={1.75} />
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
