/** @jsxImportSource @emotion/react */
import { Card, CardHeader, CardContent, Modal, Button, Grid } from '@mui/material'
import PropTypes from 'prop-types'
import { memo } from 'react'
import { red, blue } from '@mui/material/colors'
import _ from 'lodash'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import { DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: 500,
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%',
  }),
  birthday: css({
    width: '100%',
  }),
  actions: css({
    justifyContent: 'flex-end',
  }),
  inner: css({
    minWidth: 700,
  }),
  categorieDiv: css({
    marginBottom: '5px',
  }),
  categorieBtn: css({
    margin: '3px',
  }),
  clickedCategorieBtn: css({
    margin: '3px',
    color: 'white',
  }),
  categorieClear: css({
    backgroundColor: red[500],
    color: 'white',
    '&:hover': {
      backgroundColor: red[700],
    },
  }),
  addBtn: css({
    backgroundColor: blue[500],
    color: 'white',
    '&:hover': {
      backgroundColor: blue[700],
    },
  }),
  confirmBtn: css({
    margin: '7px 0',
    float: 'right',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  backBtn: css({
    margin: '16px 24px',
  }),
  btnDiv: css({
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  rowOfGrid: css({
    margin: '5px 0px',
  }),
  dividerDiv: css({
    margin: '8px 0px',
  }),
  detailBottomCash: css({
    fontSize: '20px',
    fontWeight: 'bold',
  }),
  icons: css({
    cursor: 'pointer',
  }),
}

function AddDesignersModal({
  designers,
  setDesigners,
  openAddDesignerModal,
  onClose,
  modalCardIndex,
  scheduleCard,
  setScheduleCard,
  setOpenAddDesignerModal,
  handleSetSchedule,
  setDisableButton
}) {
  const handleDeleteDesigner = index => {
    const newDesigners = _.cloneDeep(designers)
    newDesigners.splice(index, 1)
    setDesigners(newDesigners)
  }

  const handleDesignerOnChange = (id, index) => {
    const newDesigners = _.cloneDeep(designers)
    if (id !== undefined) {
      newDesigners[index].designerId = id
      if (index === newDesigners.length - 1) {
        newDesigners.push({
          timeAdded: false,
          designerId: '',
          time: 0,
        })
      }
    } else {
      newDesigners.splice(index, 1)
      if (newDesigners.length === 0) {
        newDesigners.push({
          timeAdded: false,
          designerId: '',
          time: 0,
        })
      }
    }
    setDesigners(newDesigners)
  }
  const handleAddDesignersToSchedule = () => {
    setDisableButton(true)
    const newScheduleCard = _.cloneDeep(scheduleCard)
    const newDesigners = designers.filter(
      designer => designer.designerId !== '' || designer === null
    )
    if (newScheduleCard[modalCardIndex].scheduleRow[0].designerId === '') {
      newScheduleCard[modalCardIndex].scheduleRow = [...newDesigners]
    } else {
      newScheduleCard[modalCardIndex].scheduleRow = [
        ...newScheduleCard[modalCardIndex].scheduleRow,
        ...newDesigners,
      ]
    }
    setScheduleCard([...newScheduleCard])
    handleSetSchedule(JSON.stringify(newScheduleCard))
    setOpenAddDesignerModal(false)
    setDesigners([
      {
        timeAdded: false,
        designerId: '',
        time: 0,
      },
    ])
  }

  const keyDownDeleteData = (event, index) => {
    const newDesigners = _.cloneDeep(designers)
    event.preventDefault()
    if (event.keyCode === 8 || event.keyCode === 46) {
      if (newDesigners.length === 1) {
        setDesigners([
          {
            timeAdded: false,
            designerId: '',
            time: 0,
          },
        ])
      } else {
        newDesigners.splice(index, 1)
        if (index === newDesigners.length) {
          newDesigners.push({
            timeAdded: false,
            designerId: '',
            time: 0,
          })
        }
        setDesigners(newDesigners)
      }
    }
  }

  return (
    <Modal open={openAddDesignerModal}>
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader title="新增設計師" />
          <Button color="primary" variant="contained" css={styles.backBtn} onClick={onClose}>
            返回
          </Button>
        </div>
        <CardContent>
          {designers.map((designer, index) => (
            <Grid
              container
              style={{ alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}
              key={`${designer.designerId}-${index}`}
            >
              <Grid item xs={6}>
                <div className="EmployeeScheduleAddDesignersModal">
                  <EmployeeAutoComplete
                    label="服務人員姓名/編號"
                    value={designer.designerId}
                    onKeyDown={event => {
                      keyDownDeleteData(event, index)
                    }}
                    onChange={value => handleDesignerOnChange(value.userId, index)}
                  />
                </div>
              </Grid>
              {designers.length > 1 && (
                <Grid item xs={1}>
                  <DeleteForeverIcon
                    onClick={() => handleDeleteDesigner(index)}
                    css={styles.icons}
                  />
                </Grid>
              )}
            </Grid>
          ))}
        </CardContent>
        <div css={styles.btnDiv}>
          <Button
            color="primary"
            variant="contained"
            size="small"
            onClick={handleAddDesignersToSchedule}
            style={{ margin: '0 3px' }}
            disabled={designers[0].designerId.length === 0}
          >
            新增
          </Button>
        </div>
      </Card>
    </Modal>
  )
}

AddDesignersModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

AddDesignersModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default memo(AddDesignersModal)
