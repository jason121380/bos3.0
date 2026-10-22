import { Fragment } from 'react'
import { TextField } from 'ui/text-field'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'

// 抽成方式設定的不分段（全段）級距列（自 AboutPerformance.js 原樣搬出）：
// 以函式回傳與原本相同的元素，在 AboutPerformance 原位置呼叫，元素樹不變

// 不分指定：總業績級距
export function renderNonSegmentedNonDistinguish({ profitSharing, deductionIndex, handleAddSetDeductionNum, handleDeleteSetDeductionNum, handleNonSegmentedThresholdInput, handleNonSegmentedRakeInput }) {
  return (
    profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.map(
      (data, index) => (
        <div className="flex mb-[10px]" key={index}>
          <span className="ml-[20px]">
            總業績從(含)
          </span>
          <TextField
            InputProps={{ inputProps: { min: 0 } }}
            type="number"
            className="flex items-center [border-bottom:0px] ml-[16px]"
            variant="outlined"
            label="輸入業績"
            value={data.threshold ? data.threshold : 0}
            onChange={event =>
              handleNonSegmentedThresholdInput(event, index, 'threshold')
            }
            onWheel={() => document.activeElement.blur()}
          />
          <span className="ml-[20px]">
            抽成調整為
          </span>
          <TextField
            InputProps={{ inputProps: { min: 0 } }}
            type="number"
            className="flex items-center [border-bottom:0px] ml-[16px]"
            variant="outlined"
            label="輸入抽成(%)"
            value={data.rake ? data.rake : 0}
            onChange={event => handleNonSegmentedRakeInput(event, index, 'rake')}
            onWheel={() => document.activeElement.blur()}
          />
          <div className="flex items-center [border-bottom:0px] ml-[16px]">
            {index !== 0 && (
              <DeleteForeverIcon
                className="ml-[20px] cursor-pointer"
                onClick={() => handleDeleteSetDeductionNum(index)}
              />
            )}
            {index ===
              profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish
                .length -
              1 && (
                <AddIcon
                  className="ml-[20px] cursor-pointer"
                  onClick={() => handleAddSetDeductionNum('nonDistinguish')}
                />
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
        <h4 className="my-4 text-heading text-text">
          指定業績
        </h4>
      </div>
      {profitSharing.nonSegmented[deductionIndex].rakeData.designate.map(
        (data, index) => {
          return (
            <div key={index} className="flex w-full flex-wrap">
              <div className="flex mb-[10px]">
                <span className="ml-[20px]">
                  總業績從(含)
                </span>
                <TextField
                  InputProps={{ inputProps: { min: 0 } }}
                  type="number"
                  className="flex items-center [border-bottom:0px] ml-[16px]"
                  variant="outlined"
                  label="輸入業績"
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
              </div>
              <div className="flex mb-[10px]">
                <span className="ml-[20px]">
                  抽成調整為
                </span>
                <TextField
                  InputProps={{ inputProps: { min: 0 } }}
                  type="number"
                  className="flex items-center [border-bottom:0px] ml-[16px]"
                  variant="outlined"
                  label="輸入抽成(%)"
                  value={data.rake ? data.rake : 0}
                  onChange={event =>
                    handleNonSegmentedDesignateRakeInput(event, index, 'rake')
                  }
                  onWheel={() => document.activeElement.blur()}
                />
              </div>
              <div className="flex mb-[10px]">
                <div className="flex items-center [border-bottom:0px] ml-[16px]">
                  {index !== 0 && (
                    <DeleteForeverIcon
                      className="ml-[20px] cursor-pointer"
                      onClick={() => handleDeleteNonSegmentedDesignate(index)}
                    />
                  )}
                  {index ===
                    profitSharing.nonSegmented[deductionIndex].rakeData.designate
                      .length -
                    1 && (
                      <AddIcon
                        className="ml-[20px] cursor-pointer"
                        onClick={() => handleAddSetDeductionNum('designate')}
                      />
                    )}
                </div>
              </div>
            </div>
          )
        }
      )}
      <div>
        <h4 className="my-4 text-heading text-text">
          不指定業績
        </h4>
      </div>
      {profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.map(
        (data, index) => {
          return (
            <div key={index} className="flex w-full flex-wrap">
              <div className="flex mb-[10px]">
                <span className="ml-[20px]">
                  總業績從(含)
                </span>
                <TextField
                  InputProps={{ inputProps: { min: 0 } }}
                  type="number"
                  className="flex items-center [border-bottom:0px] ml-[16px]"
                  variant="outlined"
                  label="輸入業績"
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
              </div>
              <div className="flex mb-[10px]">
                <span className="ml-[20px]">
                  抽成調整為
                </span>
                <TextField
                  InputProps={{ inputProps: { min: 0 } }}
                  type="number"
                  className="flex items-center [border-bottom:0px] ml-[16px]"
                  variant="outlined"
                  label="輸入抽成(%)"
                  value={data.rake ? data.rake : 0}
                  onChange={event =>
                    handleNonSegmentedNonDesignateRakeInput(event, index, 'rake')
                  }
                  onWheel={() => document.activeElement.blur()}
                />
              </div>
              <div className="flex mb-[10px]">
                <div className="flex items-center [border-bottom:0px] ml-[16px]">
                  {index !== 0 && (
                    <DeleteForeverIcon
                      className="ml-[20px] cursor-pointer"
                      onClick={() => handleDeleteNonSegmentedNonDesignate(index)}
                    />
                  )}
                  {index ===
                    profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate
                      .length -
                    1 && (
                      <AddIcon
                        className="ml-[20px] cursor-pointer"
                        onClick={() => handleAddSetDeductionNum('nonDesignate')}
                      />
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
