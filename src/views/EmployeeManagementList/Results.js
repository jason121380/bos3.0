/** @jsxImportSource @emotion/react */
import {
  Avatar,
  Button,
  Checkbox,
  Divider,
  Link,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'
import ManagementTable from 'components/ManagementTable'

const styles = {
  root: css({}),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
  }),
  tableRow: css({
    backgroundColor: 'rgb(var(--background)) !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--background)) !important',
    },
  }),
  compactCell: css({
    padding: '4px 8px !important',
    fontSize: '13px !important',
    whiteSpace: 'nowrap',
  }),
  editIcon: css({
    color: 'rgb(var(--text-tertiary))',
    padding: '4px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  }),
}

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
    <div {...rest} css={css([styles.root, className])}>
      <ManagementTable
        title="員工管理列表"
        totalCount={employees.length}
        pageLimit={page.limit}
        pageOffset={page.offset}
        onPageChange={handleOnChangePage}
        onRowsPerPageChange={handleOnChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        minWidth={1150}
        tableHead={
          <>
            {rakeSetAble && (
              <TableCell padding="checkbox" css={styles.compactCell}>
                <Checkbox
                  checked={selectedDesigners.length === employees.length && employees.length > 0}
                  color="primary"
                  indeterminate={selectedDesigners.length > 0 && selectedDesigners.length < employees.length}
                  onChange={handleSelectAll}
                  disabled={employees.length === 0}
                />
              </TableCell>
            )}
            <TableCell css={styles.compactCell}>操作</TableCell>
            <TableCell css={styles.compactCell}>姓名/電話</TableCell>
            <TableCell css={styles.compactCell}>設計師編號</TableCell>
            <TableCell css={styles.compactCell}>暱稱</TableCell>
            <TableCell css={styles.compactCell}>權限設定</TableCell>
            <TableCell css={styles.compactCell}>帳號狀態</TableCell>
            <TableCell css={styles.compactCell}>設定狀態</TableCell>
            <TableCell css={styles.compactCell}>設置</TableCell>
          </>
        }
      >
        <TableBody>
          {sortedEmployees.map((data, idx) => (
            <TableRow key={`employee-item-${idx}`} css={styles.tableRow}>
              {rakeSetAble && (
                <TableCell padding="checkbox" css={styles.compactCell}>
                  <Checkbox
                    color="primary"
                    checked={selectedDesigners.indexOf(data.id) > -1}
                    onChange={() => handleSelectOne(data.id)}
                  />
                </TableCell>
              )}
              <TableCell css={styles.compactCell}>
                <IconButton
                  component={RouterLink}
                  to={`/management/employee/${data.id}/general`}
                  css={styles.editIcon}
                  size="small"
                  disabled={loginUserAuthName !== '高階主管' && data.merchantIdentity.authorityName === '高階主管'}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell css={styles.compactCell}>
                <div css={styles.nameCell}>
                  <Avatar css={styles.avatar} src={data.avatar} />
                  <div>
                    <Link
                      underline='hover'
                      color="inherit"
                      component={RouterLink}
                      to={`/management/employee/${data.id}/general`}
                      variant="h6"
                    >
                      {data.lastName}
                      {data.firstName}
                      {data.status === 'pending' && (
                        <span css={styles.deductionNotSet}>未設定抽成</span>
                      )}
                    </Link>
                    <div>{data.cellphone}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell css={styles.compactCell}>{data.designerNo}</TableCell>
              <TableCell css={styles.compactCell}>{data.nickName}</TableCell>
              <TableCell css={styles.compactCell}>
                {data.merchantIdentity.authorityName.length > 0
                  ? data.merchantIdentity.authorityName
                  : '無設定'}
              </TableCell>
              <TableCell css={styles.compactCell}>
                {data.status === 'ok' || data.status === 'pending' ? '可登入' : '不可登入'}
              </TableCell>
              <TableCell css={styles.compactCell}>
                {data.isUserRakeSet && isDeductionWaySet(data.deductionWay) ? (
                  '設定完成'
                ) : (
                  <span style={{ color: 'red', fontWeight: 'bold' }}>
                    {getMessage(data.isUserRakeSet, data.deductionWay)}
                  </span>
                )}
              </TableCell>
              <TableCell css={styles.compactCell}>{handleRenderStatus(data)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ManagementTable>
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
