import { Fragment } from 'react'
import { TextField } from 'ui/text-field'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'

// 「編輯設計師抽成」彈窗的不分段（全段）級距列（自 EditMultipleDesignersRakeSettingModal.js 原樣搬出）：
// 以函式回傳與原本相同的元素，在彈窗原位置呼叫，元素樹不變

// 不分指定：總業績級距
export function renderNonSegmentedNonDistinguish({
  profitSharing,
  deductionIndex,
  handleAddSetDeductionNum,
  handleDeleteSetDeductionNum,
  handleNonSegmentedThresholdInput,
  handleNonSegmentedRakeInput,
}) {
  return profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.map((data, index) => (
    <div key={`nonSegmented-${index}`} className="flex">
      <div className="p-4 flex items-center [border-bottom:0px]">
        總業績從(含)
        <TextField
          InputProps={{ inputProps: { min: 0 } }}
          type="number"
          className="ml-[20px]"
          variant="outlined"
          label="輸入業績"
          value={data.threshold ? data.threshold : 0}
          onChange={event => handleNonSegmentedThresholdInput(event, index, 'threshold')}
          onWheel={() => document.activeElement.blur()}
        />
      </div>
      <div className="p-4 flex items-center [border-bottom:0px]">
        抽成調整為
        <TextField
          InputProps={{ inputProps: { min: 0 } }}
          type="number"
          className="ml-[20px]"
          variant="outlined"
          label="輸入抽成(%)"
          value={data.rake ? data.rake : 0}
          onChange={event => handleNonSegmentedRakeInput(event, index, 'rake')}
          onWheel={() => document.activeElement.blur()}
        />
      </div>
      <div className="p-4 flex items-center [border-bottom:0px]">
        {index !== 0 && <DeleteForeverIcon className="ml-[20px] cursor-pointer" onClick={() => handleDeleteSetDeductionNum(index)} />}
        {index === profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.length - 1 && (
          <AddIcon className="ml-[20px] cursor-pointer" onClick={() => handleAddSetDeductionNum('nonDistinguish')} />
        )}
      </div>
    </div>
  ))
}

// 分指定／不指定：各自的級距
export function renderNonSegmentedDesignation({
  profitSharing,
  deductionIndex,
  handleAddSetDeductionNum,
  handleDeleteNonSegmentedDesignate,
  handleDeleteNonSegmentedNonDesignate,
  handleNonSegmentedDesignateThresholdInput,
  handleNonSegmentedNonDesignateThresholdInput,
  handleNonSegmentedDesignateRakeInput,
  handleNonSegmentedNonDesignateRakeInput,
}) {
  return (
    <Fragment>
      <div>
        <h4 className="my-4 text-heading text-text">指定業績</h4>
      </div>
      {profitSharing.nonSegmented[deductionIndex].rakeData.designate.map((data, index) => {
        return (
          <div key={`designate-${index}`} className="flex">
            <div className="p-4 flex items-center [border-bottom:0px]">
              總業績從(含)
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[20px]"
                variant="outlined"
                label="輸入業績"
                value={data.threshold ? data.threshold : 0}
                onChange={event => handleNonSegmentedDesignateThresholdInput(event, index, 'threshold')}
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="p-4 flex items-center [border-bottom:0px]">
              抽成調整為
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[20px]"
                variant="outlined"
                label="輸入抽成(%)"
                value={data.rake ? data.rake : 0}
                onChange={event => handleNonSegmentedDesignateRakeInput(event, index, 'rake')}
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="p-4 flex items-center [border-bottom:0px]">
              {index !== 0 && <DeleteForeverIcon className="ml-[20px] cursor-pointer" onClick={() => handleDeleteNonSegmentedDesignate(index)} />}
              {index === profitSharing.nonSegmented[deductionIndex].rakeData.designate.length - 1 && (
                <AddIcon className="ml-[20px] cursor-pointer" onClick={() => handleAddSetDeductionNum('designate')} />
              )}
            </div>
          </div>
        )
      })}
      <div>
        <h4 className="my-4 text-heading text-text">不指定業績</h4>
      </div>
      {profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.map((data, index) => {
        return (
          <div key={`nonDesignate-${index}`} className="flex">
            <div className="p-4 flex items-center [border-bottom:0px]">
              總業績從(含)
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[20px]"
                variant="outlined"
                label="輸入業績"
                value={data.threshold ? data.threshold : 0}
                onChange={event => handleNonSegmentedNonDesignateThresholdInput(event, index, 'threshold')}
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="p-4 flex items-center [border-bottom:0px]">
              抽成調整為
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                type="number"
                className="ml-[20px]"
                variant="outlined"
                label="輸入抽成(%)"
                value={data.rake ? data.rake : 0}
                onChange={event => handleNonSegmentedNonDesignateRakeInput(event, index, 'rake')}
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="p-4 flex items-center [border-bottom:0px]">
              {index !== 0 && <DeleteForeverIcon className="ml-[20px] cursor-pointer" onClick={() => handleDeleteNonSegmentedNonDesignate(index)} />}
              {index === profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.length - 1 && (
                <AddIcon className="ml-[20px] cursor-pointer" onClick={() => handleAddSetDeductionNum('nonDesignate')} />
              )}
            </div>
          </div>
        )
      })}
    </Fragment>
  )
}
