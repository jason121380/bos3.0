/** @jsxImportSource @emotion/react */
import {
  Card,
  CardHeader,
  CardContent,
  Modal,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import PropTypes from 'prop-types'
import _ from 'lodash'

import styles from './styles/EditMemberCardRecordModal'

function EditMemberCardRecordModal({
  openEditMembershipsCategoryModal,
  onClose,
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  handleUpdateMembershipsCategory,
}) {
  const handleSelectCategoryId = event => {
    setSelectedCategoryId(event.target.value)
  }

  return (
    <Modal open={openEditMembershipsCategoryModal}>
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader title="編輯會員卡" />
          <Button
            color="primary"
            variant="contained"
            css={styles.closeAtTop}
            onClick={onClose}
          >
            關閉
          </Button>
        </div>

        <CardContent>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>會員卡</InputLabel>
            <Select
              label='會員卡'
              value={selectedCategoryId}
              onChange={event => handleSelectCategoryId(event)}
            >
              {categories.map((data, idx) => (
                <MenuItem key={`${data.uuid}-${idx}`} value={data.uuid}>
                  {data.no} {data.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
        <Button
          color="primary"
          variant="contained"
          css={styles.saveAtBottom}
          onClick={handleUpdateMembershipsCategory}
        >
          儲存
        </Button>
      </Card>
    </Modal>
  )
}

EditMemberCardRecordModal.propTypes = {
  className: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

EditMemberCardRecordModal.defaultProps = {
  open: false,
  onClose: () => {},
}

export default EditMemberCardRecordModal
