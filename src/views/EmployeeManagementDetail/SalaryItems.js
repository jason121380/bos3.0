/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Button,
  Typography,
} from '@mui/material'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import _ from 'lodash'
import { openSnackbar } from 'elements/snackbars'
import { useHistory } from 'react-router'
import { css } from '@emotion/react'

const styles = {
  content: css({}),
  secondContent: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  secondInput: css({
    width: '150px',
  }),
  icons: css({
    cursor: 'pointer',
  }),
}

export default function SalaryInems({
  salaryIncreaseItemsReformatted,
  setSalaryIncreaseItemsReformatted,
  salaryDecreaseItemsReformatted,
  setSalaryDecreaseItemsReformatted,
  increaseSecondContent,
  setIncreaseSecondContent,
  decreaseSecondContent,
  setDecreaseSecondContent,
  setUserFixedSalaryItem,
  designerId,
}) {
  const history = useHistory()
  const handleIncreaseInput = (e, index) => {
    const newSalaryIncreaseItemsReformatted = _.cloneDeep(salaryIncreaseItemsReformatted)
    switch (e.target.name) {
      case 'price':
        newSalaryIncreaseItemsReformatted.map((data, index2) => {
          if (index === index2) {
            if (e.target.value === '') {
              data.price = 0
            } else {
              data.price = parseFloat(e.target.value)
            }
          }
        })
        setSalaryIncreaseItemsReformatted(newSalaryIncreaseItemsReformatted)
        break
      default:
        console.log(e.target)
        break
    }
  }

  const handleDecreaseInput = (e, index) => {
    const newSalaryDecreaseItemsReformatted = _.cloneDeep(salaryDecreaseItemsReformatted)
    switch (e.target.name) {
      case 'price':
        newSalaryDecreaseItemsReformatted.map((data, index2) => {
          if (index === index2) {
            if (e.target.value === '') {
              data.price = 0
            } else {
              data.price = parseFloat(e.target.value)
            }
          }
        })
        setSalaryDecreaseItemsReformatted(newSalaryDecreaseItemsReformatted)
        break
      default:
        console.log(e.target)
        break
    }
  }

  const handleIncreaseSecondInput = (e, index) => {
    const newIncreaseSecondContent = _.cloneDeep(increaseSecondContent)
    switch (e.target.name) {
      case 'price':
        newIncreaseSecondContent.increaseItems.map((data, index2) => {
          if (index === index2) {
            if (e.target.value === '') {
              data.price = 0
            } else {
              data.price = parseFloat(e.target.value)
            }
          }
        })
        setIncreaseSecondContent(newIncreaseSecondContent)
        break
      case 'itemName':
        newIncreaseSecondContent.increaseItems.map((data, index2) => {
          if (index === index2) {
            data.itemName = e.target.value
          }
        })
        setIncreaseSecondContent(newIncreaseSecondContent)
        break
      default:
        console.log(e.target)
        break
    }
  }

  const handleDecreaseSecondInput = (e, index) => {
    const newDecreaseSecondContent = _.cloneDeep(decreaseSecondContent)
    switch (e.target.name) {
      case 'price':
        newDecreaseSecondContent.decreaseItems.map((data, index2) => {
          if (index === index2) {
            if (e.target.value === '') {
              data.price = 0
            } else {
              data.price = parseFloat(e.target.value)
            }
          }
        })
        setDecreaseSecondContent(newDecreaseSecondContent)
        break
      case 'itemName':
        newDecreaseSecondContent.decreaseItems.map((data, index2) => {
          if (index === index2) {
            data.itemName = e.target.value
          }
        })
        setDecreaseSecondContent(newDecreaseSecondContent)
        break
      default:
        console.log(e.target)
        break
    }
  }

  const handleAddItem = () => {
    const newIncreaseSecondContent = _.cloneDeep(increaseSecondContent)
    newIncreaseSecondContent.increaseItems.push({
      itemName: '',
      price: 0,
      type: 'INCREASE',
    })
    setIncreaseSecondContent(newIncreaseSecondContent)
  }

  const handleDeductIncreaseItem = index => {
    const newIncreaseSecondContent = _.cloneDeep(increaseSecondContent)
    newIncreaseSecondContent.increaseItems.splice(index, 1)
    setIncreaseSecondContent(newIncreaseSecondContent)
  }

  const handleAddDecreaseItem = () => {
    const newDecreaseSecondContent = _.cloneDeep(decreaseSecondContent)
    newDecreaseSecondContent.decreaseItems.push({
      itemName: '',
      price: 0,
      type: 'DECREASE',
    })
    setDecreaseSecondContent(newDecreaseSecondContent)
  }

  const handleDeductDecreaseItem = index => {
    const newDecreaseSecondContent = _.cloneDeep(decreaseSecondContent)
    newDecreaseSecondContent.decreaseItems.splice(index, 1)
    setDecreaseSecondContent(newDecreaseSecondContent)
  }

  const handleSave = () => {
    const filteredSalaryIncreaseItems = salaryIncreaseItemsReformatted.filter(d => d.price > 0)
    const filteredSalaryDecreaseItems = salaryDecreaseItemsReformatted.filter(d => d.price > 0)
    const filteredIncreaseSecondContent = increaseSecondContent.increaseItems.filter(
      d => d.itemName.length > 0 && d.price > 0
    )
    const filteredDecreaseSecondContent = decreaseSecondContent.decreaseItems.filter(
      d => d.itemName.length > 0 && d.price > 0
    )
    let userFixedSalaryItemInputData = [
      ...filteredSalaryIncreaseItems,
      ...filteredSalaryDecreaseItems,
      ...filteredIncreaseSecondContent,
      ...filteredDecreaseSecondContent,
    ]
    // 過濾掉sorting
    userFixedSalaryItemInputData = userFixedSalaryItemInputData.map(({ sorting, ...keep }) => keep)
    const inputData = {
      userId: designerId,
      userFixedSalaryItem: userFixedSalaryItemInputData,
    }
    setUserFixedSalaryItem({
      input: inputData,
    }).then(message => {
      if (message.data.setUserFixedSalaryItem) {
        openSnackbar({
          message: '薪資加扣項儲存成功',
          variant: 'success',
        })
        history.push('/management/employee')
      }
    })
  }
  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <Card>
          <CardHeader
            title={`薪資加項小計:${
              salaryIncreaseItemsReformatted
                .map(data => data.price)
                .reduce((accu, curVal) => (accu += curVal), 0) +
                increaseSecondContent.increaseItems
                  .map(data => data.price)
                  .reduce((accu, curVal) => (accu += curVal), 0) || 0
            }`}
          />
          <Divider />
          <CardContent css={styles.content}>
            <Grid container spacing={4}>
              {salaryIncreaseItemsReformatted
                .sort((a, b) => a.sorting - b.sorting)
                .map((data, index) => {
                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={`increase-${index}`}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Typography
                        variant="h5"
                        display="inline"
                        gutterBottom
                        style={{ margin: '0 5px', width: '25px' }}
                      >
                        {index + 1}
                      </Typography>
                      <TextField
                        variant="outlined"
                        label={data.itemName}
                        type="number"
                        value={data.price || 0}
                        name="price"
                        fullWidth
                        onChange={e => handleIncreaseInput(e, index)}
                        onWheel={() => document.activeElement.blur()}              
                      />
                    </Grid>
                  )
                })}
            </Grid>
          </CardContent>
          <Divider />
          <CardContent css={styles.content}>
            <Grid container spacing={4}>
              {increaseSecondContent.increaseItems.map((data, index) => (
                <Grid item xs={12} key={`increase-${index}`}>
                  <div css={styles.secondContent}>
                    <TextField
                      type="text"
                      variant="outlined"
                      css={styles.secondInput}
                      label="薪資加項科目"
                      name="itemName"
                      value={data.itemName}
                      onChange={e => handleIncreaseSecondInput(e, index)}
                    />
                    <TextField
                      type="number"
                      variant="outlined"
                      css={styles.secondInput}
                      label="加項金額"
                      name="price"
                      value={data.price || 0}
                      onChange={e => handleIncreaseSecondInput(e, index)}
                      onWheel={() => document.activeElement.blur()}              
                    />
                    {increaseSecondContent.increaseItems.length > 1 && (
                      <DeleteForeverIcon
                        css={styles.icons}
                        onClick={() => handleDeductIncreaseItem(index)}
                      />
                    )}
                    {index === increaseSecondContent.increaseItems.length - 1 ? (
                      <AddIcon css={styles.icons} onClick={() => handleAddItem()} />
                    ) : (
                      <span style={{ width: '25px' }} />
                    )}
                  </div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={6}>
        <Card>
          <CardHeader
            title={`薪資扣項小計:${
              salaryDecreaseItemsReformatted
                .map(data => data.price)
                .reduce((accu, curVal) => (accu += curVal), 0) +
                decreaseSecondContent.decreaseItems
                  .map(data => data.price)
                  .reduce((accu, curVal) => (accu += curVal), 0) || 0
            }`}
          />
          <Divider />
          <CardContent css={styles.content}>
            <Grid container spacing={4}>
              {salaryDecreaseItemsReformatted
                .sort((a, b) => a.sorting - b.sorting)
                .map((data, index) => {
                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={`increase-${index}`}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Typography
                        variant="h5"
                        display="inline"
                        gutterBottom
                        style={{ margin: '0 5px', width: '25px' }}
                      >
                        {index + 1}
                      </Typography>
                      <TextField
                        variant="outlined"
                        label={data.itemName}
                        type="number"
                        value={data.price || 0}
                        name="price"
                        fullWidth
                        onChange={e => handleDecreaseInput(e, index)}
                        onWheel={() => document.activeElement.blur()}              
                      />
                    </Grid>
                  )
                })}
            </Grid>
          </CardContent>
          <Divider />
          <CardContent css={styles.content}>
            <Grid container spacing={4}>
              {decreaseSecondContent.decreaseItems.map((data, index) => (
                <Grid item xs={12} key={`decrease-${index}`}>
                  <div css={styles.secondContent}>
                    <TextField
                      type="text"
                      variant="outlined"
                      css={styles.secondInput}
                      label="薪資扣項科目"
                      name="itemName"
                      value={data.itemName}
                      onChange={e => handleDecreaseSecondInput(e, index)}
                    />
                    <TextField
                      type="number"
                      variant="outlined"
                      css={styles.secondInput}
                      label="扣項金額"
                      name="price"
                      value={data.price}
                      onChange={e => handleDecreaseSecondInput(e, index)}
                      onWheel={() => document.activeElement.blur()}              
                    />
                    {decreaseSecondContent.decreaseItems.length > 1 && (
                      <DeleteForeverIcon
                        css={styles.icons}
                        onClick={() => handleDeductDecreaseItem(index)}
                      />
                    )}
                    {index === decreaseSecondContent.decreaseItems.length - 1 ? (
                      <AddIcon css={styles.icons} onClick={() => handleAddDecreaseItem()} />
                    ) : (
                      <span style={{ width: '25px' }} />
                    )}
                  </div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Typography variant="h5" display="inline" gutterBottom>
              {`薪資加項小計:${
                salaryIncreaseItemsReformatted
                  .map(data => data.price)
                  .reduce((accu, curVal) => (accu += curVal), 0) +
                  increaseSecondContent.increaseItems
                    .map(data => data.price)
                    .reduce((accu, curVal) => (accu += curVal), 0) || 0
              }`}
            </Typography>
          </div>
          <div>
            <Typography variant="h5" display="inline" gutterBottom>
              {`薪資扣項小計:${
                salaryDecreaseItemsReformatted
                  .map(data => data.price)
                  .reduce((accu, curVal) => (accu += curVal), 0) +
                  decreaseSecondContent.decreaseItems
                    .map(data => data.price)
                    .reduce((accu, curVal) => (accu += curVal), 0) || 0
              }`}
            </Typography>
          </div>
        </div>
      </Grid>
      <Button
        color="primary"
        variant="contained"
        css={styles.action}
        onClick={handleSave}
        style={{ color: 'white', backgroundColor: 'red' }}
      >
        儲存並返回列表
      </Button>
    </Grid>
  )
}
