import { Fragment } from 'react'
import { TextField } from 'ui/text-field'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'

// 「編輯設計師抽成」彈窗的分段級距列（自 EditMultipleDesignersRakeSettingModal.js 原樣搬出）：
// 以函式回傳與原本相同的元素，在彈窗原位置呼叫，元素樹不變

// 不分指定：總業績分段
export function renderSegmentedNonDistinguish({ profitSharing, handleAddSegmented, handleDeleteSegmented, handleSegmentedInput }) {
  return (
    profitSharing.segmented[0].nonDistinguish.map((data, index) => (
      <div key={`nonDistinguish-${index}`} className="flex">
        <div className="p-4">
          總業績從(含)
          <TextField
            InputProps={{ inputProps: { min: 0 } }}
            type="number"
            className="ml-[20px]"
            variant="outlined"
            label="輸入業績"
            value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
            onChange={event =>
              handleSegmentedInput(event, index, 'thresholdLowerLimit')
            }
            onWheel={() => document.activeElement.blur()}
          />
        </div>
        <div className="p-4 w-[250px] flex items-center [border-bottom:0px] whitespace-nowrap">
          至
          <TextField
            InputProps={{ inputProps: { min: 0 } }}
            type="number"
            className="ml-[20px]"
            variant="outlined"
            label="輸入業績"
            value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
            onChange={event =>
              handleSegmentedInput(event, index, 'thresholdUpperLimit')
            }
            onWheel={() => document.activeElement.blur()}
          />
        </div>
        <div className="p-4">
          抽成為
          <TextField
            InputProps={{ inputProps: { min: 0 } }}
            type="number"
            className="ml-[20px]"
            variant="outlined"
            label="輸入抽成(%)"
            value={data.rake ? data.rake : 0}
            onChange={event => handleSegmentedInput(event, index, 'rake')}
            onWheel={() => document.activeElement.blur()}
          />
        </div>
        <div className="p-4 flex items-center [border-bottom:0px]">
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
          <div key={`designate-${index}`} className="flex">
            <div className="p-4">
              指定業績從(含)
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[20px]"
                variant="outlined"
                label="輸入業績"
                value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                onChange={event =>
                  handleDesignateSegmentedInput(event, index, 'thresholdLowerLimit')
                }
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="p-4 w-[250px] flex items-center [border-bottom:0px] whitespace-nowrap">
              至
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[20px]"
                variant="outlined"
                label="輸入業績"
                value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                onChange={event =>
                  handleDesignateSegmentedInput(event, index, 'thresholdUpperLimit')
                }
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="p-4">
              抽成為
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[20px]"
                variant="outlined"
                label="輸入抽成(%)"
                value={data.rake ? data.rake : 0}
                onChange={event =>
                  handleDesignateSegmentedInput(event, index, 'rake')
                }
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="p-4 flex items-center [border-bottom:0px]">
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
        )
      })}
      <div>
        <h4 className="my-4 text-heading text-text">
          不指定業績
        </h4>
      </div>
      {profitSharing.segmented[0].nonDesignate.map((data, index) => {
        return (
          <div key={`nonDesignate-${index}`} className="flex">
            <div className="p-4">
              不指定業績從(含)
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                // className="ml-[20px]"
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
            <div className="p-4 w-[250px] flex items-center [border-bottom:0px] whitespace-nowrap">
              至
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[20px]"
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
            <div className="p-4">
              抽成為
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[20px]"
                variant="outlined"
                label="輸入抽成(%)"
                value={data.rake ? data.rake : 0}
                onChange={event =>
                  handleNonDesignateSegmentedInput(event, index, 'rake')
                }
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="p-4 flex items-center [border-bottom:0px]">
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
        )
      })}
    </Fragment>
  )
}
