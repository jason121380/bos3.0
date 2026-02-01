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
import { red, blue } from '@mui/material/colors'
import _ from 'lodash'
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
    width: 912,
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
  closeAtTop: css({
    margin: '16px 24px',
  }),
  deductionTypeFormGroup: css({
    width: '6rem',
  }),
  formGroup: css({
    width: '6rem',
    marginLeft: theme.spacing(3),
  }),
  autocomplete: css({
    marginLeft: theme.spacing(2),
    width: '10rem',
  }),
  service: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  gap: css({
    marginLeft: theme.spacing(3),
  }),
  textField: css({
    marginLeft: theme.spacing(2),
    width: '5rem',
  }),
  icons: css({
    marginLeft: theme.spacing(3),
    cursor: 'pointer',
  }),
  saveAtBottom: css({
    margin: '16px 24px',
    float: 'right',
  }),
  checkboxSpan: css({
    width: '25%',
  }),
}

function EditProductsCategoryModal({
  openEditProductsCategoryModal,
  onClose,
  productCategories,
  selectedCategoryId,
  setSelectedCategoryId,
  handleUpdateProductsCategory,
}) {
  const handleSelectCategoryId = event => {
    setSelectedCategoryId(event.target.value)
  }

  return (
    <Modal open={openEditProductsCategoryModal}>
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader title="編輯商品類別" />
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
            <InputLabel>商品類別</InputLabel>
            <Select
              label='商品類別'
              value={selectedCategoryId}
              onChange={event => handleSelectCategoryId(event)}
            >
              {productCategories.map((data, idx) => (
                <MenuItem key={`${data.id}-${idx}`} value={data.id}>
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
          onClick={handleUpdateProductsCategory}
        >
          儲存
        </Button>
      </Card>
    </Modal>
  )
}

EditProductsCategoryModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

EditProductsCategoryModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default EditProductsCategoryModal
