import { Fragment } from 'react'
import { TextField } from 'ui/text-field'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'

// 抽成方式設定的分段級距列（自 AboutPerformance.js 原樣搬出）：
// 以函式回傳與原本相同的元素，在 AboutPerformance 原位置呼叫，元素樹不變

// 不分指定：總業績分段
export function renderSegmentedNonDistinguish({ profitSharing, handleAddSegmented, handleDeleteSegmented, handleSegmentedInput }) {
  return (
    profitSharing.segmented[0].nonDistinguish.map((data, index) => (
      <div key={index} className="flex w-full flex-wrap">
        <div className="flex mb-[10px]">
          <span className="ml-[20px]">
            總業績從(含)
          </span>
          <TextField
            className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
            InputProps={{ inputProps: { min: 0 } }}
            type="number"
            variant="outlined"
            label="輸入業績"
            value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
            onChange={event =>
              handleSegmentedInput(event, index, 'thresholdLowerLimit')
            }
            onWheel={() => document.activeElement.blur()}
          />
        </div>
        <div className="flex mb-[10px]">
          <span className="ml-[20px]">
            至
          </span>
          <TextField
            className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap"
            InputProps={{ inputProps: { min: 0 } }}
            type="number"
            variant="outlined"
            label="輸入業績"
            value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
            onChange={event =>
              handleSegmentedInput(event, index, 'thresholdUpperLimit')
            }
            onWheel={() => document.activeElement.blur()}
          />
        </div>
        <div className="flex mb-[10px]">
          <span className="ml-[20px]">
            抽成為
          </span>
          <TextField
            className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
            InputProps={{ inputProps: { min: 0 } }}
            type="number"
            variant="outlined"
            label="輸入抽成(%)"
            value={data.rake ? data.rake : 0}
            onChange={event => handleSegmentedInput(event, index, 'rake')}
            onWheel={() => document.activeElement.blur()}
          />
        </div>
        <div className="flex mb-[10px]">
          <div className="flex items-center [border-bottom:0px] ml-[16px]">
            {index !== 0 && (
              <DeleteForeverIcon
                className="ml-[20px] cursor-pointer"
                onClick={() => handleDeleteSegmented(index)}
              />
            )}
            {index === profitSharing.segmented[0].nonDistinguish.length - 1 && (
              <AddIcon
                className="ml-[20px] cursor-pointer"
                onClick={() => handleAddSegmented('nonDistinguish')}
              />
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
        <h4 className="my-4 text-heading text-text">
          指定業績
        </h4>
      </div>
      {profitSharing.segmented[0].designate.map((data, index) => {
        return (
          <div key={index} className="flex w-full flex-wrap">
            <div className="flex mb-[10px]">
              <span className="ml-[20px]">
                指定業績從(含)
              </span>
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
                variant="outlined"
                label="輸入業績"
                value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                onChange={event =>
                  handleDesignateSegmentedInput(event, index, 'thresholdLowerLimit')
                }
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="flex mb-[10px]">
              <span className="ml-[20px]" >
                至
              </span>
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap"
                variant="outlined"
                label="輸入業績"
                value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                onChange={event =>
                  handleDesignateSegmentedInput(event, index, 'thresholdUpperLimit')
                }
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="flex mb-[10px]">
              <span className="ml-[20px]">
                抽成為
              </span>
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"

                className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
                variant="outlined"
                label="輸入抽成(%)"
                value={data.rake ? data.rake : 0}
                onChange={event =>
                  handleDesignateSegmentedInput(event, index, 'rake')
                }
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="flex mb-[10px]">
              <div className="flex items-center [border-bottom:0px] ml-[16px]">
                {index !== 0 && (
                  <DeleteForeverIcon
                    className="ml-[20px] cursor-pointer"
                    onClick={() => handleDeleteSegmentedDesignate(index)}
                  />
                )}
                {index === profitSharing.segmented[0].designate.length - 1 && (
                  <AddIcon
                    className="ml-[20px] cursor-pointer"
                    onClick={() => handleAddSegmented('designate')}
                  />
                )}
              </div>
            </div>
          </div>
        )
      })}
      <div>
        <h4 className="my-4 text-heading text-text">
          不指定業績
        </h4>
      </div>
      {profitSharing.segmented[0].nonDesignate.map((data, index) => {
        return (
          <div key={index} className="flex w-full flex-wrap">
            <div className="flex mb-[10px]">
              <span className="ml-[20px]">
                不指定業績從(含)
              </span>
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
                variant="outlined"
                label="輸入業績"
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
            </div>
            <div className="flex mb-[10px]">
              <span className="ml-[20px]">
                至
              </span>
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap"
                variant="outlined"
                label="輸入業績"
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
            </div>
            <div className="flex mb-[10px]">
              <span className="ml-[20px]">
                抽成為
              </span>
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
                variant="outlined"
                label="輸入抽成(%)"
                value={data.rake ? data.rake : 0}
                onChange={event =>
                  handleNonDesignateSegmentedInput(event, index, 'rake')
                }
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="flex mb-[10px]">
              <div className="flex items-center [border-bottom:0px] ml-[16px]">
                {index !== 0 && (
                  <DeleteForeverIcon
                    className="ml-[20px] cursor-pointer"
                    onClick={() => handleDeleteSegmentedNonDesignate(index)}
                  />
                )}
                {index === profitSharing.segmented[0].nonDesignate.length - 1 && (
                  <AddIcon
                    className="ml-[20px] cursor-pointer"
                    onClick={() => handleAddSegmented('nonDesignate')}
                  />
                )}
              </div>
            </div>
          </div>
        )
      })}
    </Fragment>
  )
}
