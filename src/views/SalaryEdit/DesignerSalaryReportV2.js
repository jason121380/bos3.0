import React from 'react'
import OverviewV2 from './OverviewV2'

const DesignerSalaryReport = ({ designer, actualTransferFun, memberActive }) => {
  return <OverviewV2 memberActive={memberActive} designer={designer} actualTransferFun={actualTransferFun} />
}

export default DesignerSalaryReport
