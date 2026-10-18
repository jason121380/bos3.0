/** @jsxImportSource @emotion/react */
// 頭像（無圖時顯示預設人像）保留 MUI Avatar
import { Avatar } from '@mui/material'
import { Edit as EditIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import TableEditBar from 'components/TableEditBar'
import produce from 'immer'
import _ from 'lodash'
import { useFetchSetUserRake } from 'hooks/useFetchEmployeeSaleSetting'
import { openSnackbar } from 'elements/snackbars'
import EditMultipleDesignersRakeSettingModal from './EditMultipleDesignersRakeSettingModal'
import ProfileImportModal from './ProfileImportModal'
import pagenationLabel from './../../helper/pagenationLabel'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TablePagination, TableRow } from 'ui/table'

export default function Results({
  className,
  employees,
  handleOnChangePage,
  handleOnChangeRowsPerPage,
  page,
  pageCount,
  loginUserAuthName,
  rakeSetAble,
  ...rest
}) {
  const pageRef = useRef(null)
  const [selectedDesigners, setSelectedDesigners] = useState([])
  const [sortedEmployees, setSortedEmployees] = useState([])
  const [openEditRakeSettingModal, setOpenEditRakeSettingModal] = useState(false)
  const [openPersonnelProfile, setOpenPersonnelProfile] = useState(false)
  const [profitSharing, setProfitSharing] = useState({
    designationUsage: false,
    rakeType: 'LADDERED',
    isSegmented: false,
    nonSegmented: [
      {
        attribute: '預設',
        rakeData: {
          designate: [],
          nonDesignate: [],
          nonDistinguish: [{ rake: 0, threshold: 0 }],
        },
      },
    ],
    segmented: [
      {
        designate: [
          {
            rake: 0,
            thresholdLowerLimit: 0,
            thresholdUpperLimit: 0,
          },
        ],
        nonDesignate: [
          {
            rake: 0,
            thresholdLowerLimit: 0,
            thresholdUpperLimit: 0,
          },
        ],
        nonDistinguish: [
          {
            rake: 0,
            thresholdLowerLimit: 0,
            thresholdUpperLimit: 0,
          },
        ],
      },
    ],
  })

  const handleSalesWayChange = ({ key, value }) => {
    setProfitSharing(
      produce(draft => {
        draft[key] = value
      })
    )
  }
  const { fetchSetUserRake } = useFetchSetUserRake()

  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? employees.map(employee => employee.id) : []
    setSelectedDesigners(newSelectedPayment)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedDesigners], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedDesigners(newSelect)
  }

  const handleOpenEditRakeSettingModal = () => {
    setOpenEditRakeSettingModal(true)
  }

  const handleOpenPersonnelProfileModal = () => {
    setOpenPersonnelProfile(true)
  }
  const onCloseEditPersonnelProfile = () => {
    setOpenPersonnelProfile(false)
  }

  // 在編輯設計師抽成Modal中，點選關閉或是儲存會將'抽成設定'的state重置
  const resetProfitSharing = () => {
    setProfitSharing({
      designationUsage: false,
      rakeType: 'LADDERED',
      isSegmented: false,
      nonSegmented: [
        {
          attribute: '預設',
          rakeData: {
            designate: [],
            nonDesignate: [],
            nonDistinguish: [{ rake: 0, threshold: 0 }],
          },
        },
      ],
      segmented: [
        {
          designate: [
            {
              rake: 0,
              thresholdLowerLimit: 0,
              thresholdUpperLimit: 0,
            },
          ],
          nonDesignate: [
            {
              rake: 0,
              thresholdLowerLimit: 0,
              thresholdUpperLimit: 0,
            },
          ],
          nonDistinguish: [
            {
              rake: 0,
              thresholdLowerLimit: 0,
              thresholdUpperLimit: 0,
            },
          ],
        },
      ],
    })
  }

  const handleCloseModal = () => {
    setOpenEditRakeSettingModal(false)
    setSelectedDesigners([])
    resetProfitSharing()
  }

  const handleMultipleRakeSetting = () => {
    // 判斷抽成設定是判斷抽成設定是全段或分段
    const nonSegmentedData =
      profitSharing.nonSegmented.length > 0 && profitSharing.isSegmented === false
        ? profitSharing.nonSegmented
        : []
    const segmentedData =
      profitSharing.segmented.length > 0 && profitSharing.isSegmented === true
        ? profitSharing.segmented
        : []

    fetchSetUserRake({
      userId: selectedDesigners,
      nonSegmented: nonSegmentedData,
      segmented: segmentedData,
    })
      .then(() => {
        setOpenEditRakeSettingModal(false)
        setSelectedDesigners([])
        openSnackbar({ message: '抽成更新成功', variant: 'success' })
      })
      .then(() => {
        resetProfitSharing()
      })
  }

  const handleRenderStatus = ({
    isDisplayOnServiceList, isDisplayOnBookingList,
    isDisplayOnPerformanceList, isDisplayOnBookingRecord
  }) => {
    const arr = []
    if (isDisplayOnServiceList) arr.push('可打單')
    if (isDisplayOnBookingList) arr.push('可被預約')
    if (isDisplayOnBookingRecord) arr.push('出現於預約列表')
    if (isDisplayOnPerformanceList) arr.push('出現於報表')
    return arr.length ? arr.join('/') : ''
  }

  const isDeductionWaySet = (deductionWay) =>
    deductionWay && deductionWay !== '' && deductionWay !== '無扣項'

  const getMessage = (isUserRakeSet, deductionWay) => {
    const msg = []
    if (!isUserRakeSet) msg.push('尚未設定抽成')
    if (!isDeductionWaySet(deductionWay)) msg.push('尚未設定服務扣項方式')
    return msg.join('/')
  }

  useEffect(() => {
    const filteredEmployeeHaveDesignerNoIsNum = employees
      .filter(d => d.designerNo !== null && d.designerNo.length > 0 && !isNaN(Number(d.designerNo)))
      .sort((a, b) => a.designerNo - b.designerNo)
    const filteredEmployeeHaveDesignerNoIsNotNum = employees
      .filter(d => d.designerNo !== null && d.designerNo.length > 0 && isNaN(Number(d.designerNo)))
      .sort((a, b) => a.designerNo - b.designerNo)
    const filteredEmployeeHaveNoDesignerNo = employees.filter(
      d => d.designerNo === null || d.designerNo.length === 0
    )
    const sortedEmployee = [
      ...filteredEmployeeHaveDesignerNoIsNum,
      ...filteredEmployeeHaveDesignerNoIsNotNum,
      ...filteredEmployeeHaveNoDesignerNo,
    ]
    setSortedEmployees(sortedEmployee)
  }, [employees])

  return (
    <div {...rest} css={className}>
      <Card>
        <CardHeader className="items-center pb-4">
          <div className="flex items-baseline gap-3">
            <CardTitle>員工管理列表</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">共 {employees.length} 筆</span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[1150px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {rakeSetAble && (
                  <TableHead className="w-12">
                    <Checkbox
                      aria-label="全選"
                      checked={selectedDesigners.length === employees.length && employees.length > 0}
                      indeterminate={selectedDesigners.length > 0 && selectedDesigners.length < employees.length}
                      onChange={handleSelectAll}
                      disabled={employees.length === 0}
                    />
                  </TableHead>
                )}
                <TableHead>操作</TableHead>
                <TableHead>姓名/電話</TableHead>
                <TableHead>設計師編號</TableHead>
                <TableHead>暱稱</TableHead>
                <TableHead>權限設定</TableHead>
                <TableHead>帳號狀態</TableHead>
                <TableHead>設定狀態</TableHead>
                <TableHead>設置</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.map((data, idx) => (
                <TableRow key={`employee-item-${idx}`} data-state={selectedDesigners.indexOf(data.id) > -1 ? 'selected' : undefined}>
                  {rakeSetAble && (
                    <TableCell className="w-12">
                      <Checkbox
                        aria-label={`選取 ${data.lastName}${data.firstName}`}
                        checked={selectedDesigners.indexOf(data.id) > -1}
                        onChange={() => handleSelectOne(data.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    {/* 無權限時與舊版 IconButton disabled 相同：不可點（pointer-events-none）、不可聚焦 */}
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary aria-disabled:pointer-events-none aria-disabled:opacity-40">
                      <RouterLink
                        aria-label="編輯員工"
                        to={`/management/employee/${data.id}/general`}
                        aria-disabled={(loginUserAuthName !== '高階主管' && data.merchantIdentity.authorityName === '高階主管') || undefined}
                        tabIndex={loginUserAuthName !== '高階主管' && data.merchantIdentity.authorityName === '高階主管' ? -1 : undefined}
                      >
                        <EditIcon />
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar sx={{ width: 36, height: 36 }} src={data.avatar} />
                      <div>
                        <RouterLink
                          className="font-medium text-text no-underline hover:underline"
                          to={`/management/employee/${data.id}/general`}
                        >
                          {data.lastName}
                          {data.firstName}
                          {data.status === 'pending' && (
                            <span className="ml-1 text-caption text-warning">未設定抽成</span>
                          )}
                        </RouterLink>
                        <div className="text-caption tabular-nums text-text-secondary">{data.cellphone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{data.designerNo}</TableCell>
                  <TableCell>{data.nickName}</TableCell>
                  <TableCell>
                    {data.merchantIdentity.authorityName.length > 0
                      ? data.merchantIdentity.authorityName
                      : '無設定'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={data.status === 'ok' || data.status === 'pending' ? 'success' : 'neutral'}>
                      {data.status === 'ok' || data.status === 'pending' ? '可登入' : '不可登入'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {data.isUserRakeSet && isDeductionWaySet(data.deductionWay) ? (
                      '設定完成'
                    ) : (
                      <span className="font-medium text-danger">
                        {getMessage(data.isUserRakeSet, data.deductionWay)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-text-secondary">{handleRenderStatus(data)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            count={employees.length}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={page.offset}
            rowsPerPage={page.limit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </div>
      </Card>
      {rakeSetAble && (
        <>
          <TableEditBar
            selected={selectedDesigners}
            onEditRakeSetting={handleOpenEditRakeSettingModal}
            onEditPersonnelProfile={handleOpenPersonnelProfileModal}
          />
          {openEditRakeSettingModal && (
            <EditMultipleDesignersRakeSettingModal
              openEditRakeSettingModal={openEditRakeSettingModal}
              onClose={() => handleCloseModal()}
              onChange={handleSalesWayChange}
              profitSharing={profitSharing}
              setProfitSharing={setProfitSharing}
              handleMultipleRakeSetting={handleMultipleRakeSetting}
            />
          )}
          <ProfileImportModal
            open={openPersonnelProfile}
            onClose={onCloseEditPersonnelProfile}
            selectedDesigners={selectedDesigners}
            setSelectedDesigners={setSelectedDesigners}
          />
        </>
      )}
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.string,
  employees: PropTypes.array,
  handleOnChangePage: PropTypes.func,
  handleOnChangeRowsPerPage: PropTypes.func,
  page: PropTypes.object,
  pageCount: PropTypes.number,
  loginUserAuthName: PropTypes.string,
  rakeSetAble: PropTypes.bool,
}

Results.defaultProps = {
  employees: [],
}
