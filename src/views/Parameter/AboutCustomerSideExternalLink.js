/** @jsxImportSource @emotion/react */
import {
  Card,CardContent,CardHeader, Grid, Divider,
  Button, Typography, createTheme, ThemeProvider 
} from '@mui/material'
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { memo, Fragment, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import styles from './styles/AboutDesignerSideExternalLink'
import { teal } from '@mui/material/colors';
import EditIcon from '@mui/icons-material/Edit';
import OuterLinkModal from './OuterLinkModal'
import OuterLinkSortModal from './OuterLinkSortModal'

const theme = createTheme({
  palette: {
    primary: {
      main: teal[400]
    },
  },
});

function AboutCustomerSideExternalLink({
  className, cusExternalLink, inputEnable, refetchLink,
}) {
  const [open, setOpen] = useState(false)
  const [openSort, setOpenSort] = useState(false)
  const [isCreate, setIsCreate] = useState(true)
  const [updateData, setUpdateData] = useState({
    id: '',
    name: '',
    url: '',
    userAuthIds: []
  })

  const handleOpenModal = (create = true, data)=> {
    setOpen(true)
    setIsCreate(create)
    !create && setUpdateData(data)
  }

  const handleCloseModal = () => {
    setOpen(false)
    setUpdateData({
      id: '',
      name: '',
      url: '',
      userAuthIds: []
    })
  }

  return (
    <Card css={className}>
      <CardHeader css={styles.header} title="外部連結設定" action={
        <Button
          disabled={!inputEnable || cusExternalLink.length < 2}
          color='primary'
          variant='contained'
          onClick={() => setOpenSort(true)}>調整排序</Button>
      }/>
      <Divider />
      <CardContent>
        <div css={styles.serviceInputGroup}>
          {cusExternalLink.length ? cusExternalLink.map((data, index) => {
            const {id, name, isTop} = data
            return (
              <Fragment key={id}>
                <ThemeProvider theme={theme}>
                  <Button
                    disabled={!inputEnable}
                    onClick={() => handleOpenModal(false, data)}
                    css={styles.Button}
                    variant='contained'
                    color="primary"
                    size='large'
                  >
                    {name}
                    <EditIcon className='editIcon' fontSize='small'/>
                    {isTop && (
                      <div className="svgWrap">
                        <KeyboardDoubleArrowUpIcon/>
                      </div>
                    )}
                  </Button>
                </ThemeProvider>
                {index === (cusExternalLink.length - 1) ?
                <AddIcon
                  disabled={!inputEnable}
                  css={styles.pointer}
                  onClick={() => handleOpenModal()}
                /> : ''}
              </Fragment>
            )
          }) :
            <Grid container direction="row" alignItems="center" key='無資料'>
              <Typography component="h1" variant="h5">
                無資料
              </Typography>
              <AddIcon
                onClick={() => handleOpenModal()}
                css={styles.icon}
              />
            </Grid>}
        </div>
      </CardContent>
      {open && 
        <OuterLinkModal
          isCus={true}
          open={open}
          onModalClose={handleCloseModal}
          isCreate={isCreate}
          updateData={updateData}
          setUpdateData={setUpdateData}
          refetchLink={refetchLink}
        />
      }
      {openSort && 
        <OuterLinkSortModal
          isCus={true}
          open={openSort}
          onModalClose={() => setOpenSort(false)}
          data={cusExternalLink}
          refetchLink={refetchLink}
        />
      }
    </Card>
  )
}

export default memo(AboutCustomerSideExternalLink)
