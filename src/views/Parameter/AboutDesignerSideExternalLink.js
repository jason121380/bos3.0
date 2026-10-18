/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Grid, Divider,
  Button, Typography, createTheme, ThemeProvider
} from '@mui/material'
import { memo, Fragment, useState } from 'react'
import { Add as AddIcon, Edit as EditIcon } from 'ui/icons'
import { teal } from '@mui/material/colors';
import styles from './styles/AboutDesignerSideExternalLink'
import OuterLinkModal from './OuterLinkModal'
import OuterLinkSortModal from './OuterLinkSortModal'

const theme = createTheme({
  palette: {
    primary: {
      main: teal[400]
    },
  },
});

function AboutDesignerSideExternalLink({
  className,
  externalLink,
  inputEnable,
  refetchLink,
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
    !create && setUpdateData({
      id: data.id,
      name: data.name,
      url: data.url,
      userAuthIds: data.userAuth
    })
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
      <CardHeader title="外部連結設定" css={styles.header} action={
        <Button
          disabled={!inputEnable || externalLink.length < 2}
          color='primary'
          variant='contained'
          onClick={() => setOpenSort(true)}>調整排序</Button>
      }/>
      <Divider />
      <CardContent>
        <div css={styles.serviceInputGroup}>
          {externalLink.length ? externalLink.map((data, index) => {
            const {id, name} = data
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
                  </Button>
                </ThemeProvider>
                {index === (externalLink.length - 1) ?
                <AddIcon
                  disabled={!inputEnable}
                  css={styles.pointer}
                  onClick={() => handleOpenModal()}
                /> : ''}
              </Fragment>
            )
          }
          ) :
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
          isCus={false}
          open={openSort}
          onModalClose={() => setOpenSort(false)}
          data={externalLink}
          refetchLink={refetchLink}
        />
      }
    </Card>
  )
}

export default memo(AboutDesignerSideExternalLink)
