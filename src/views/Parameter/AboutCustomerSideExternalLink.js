/** @jsxImportSource @emotion/react */
import { Button as MuiButton, createTheme, ThemeProvider } from '@mui/material'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { KeyboardDoubleArrowUp as KeyboardDoubleArrowUpIcon, Add as AddIcon, Edit as EditIcon } from 'ui/icons'
import { memo, Fragment, useState } from 'react'
import styles from './styles/AboutDesignerSideExternalLink'
import { teal } from '@mui/material/colors';
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
    <Card>
      <CardHeader action={
        <Button
          variant="secondary"
          size="sm"
          disabled={!inputEnable || cusExternalLink.length < 2}
          onClick={() => setOpenSort(true)}>調整排序</Button>
      }>
        <CardTitle>外部連結設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div css={styles.serviceInputGroup}>
          {cusExternalLink.length ? cusExternalLink.map((data, index) => {
            const {id, name, isTop} = data
            return (
              <Fragment key={id}>
                <ThemeProvider theme={theme}>
                  <MuiButton
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
                  </MuiButton>
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
            <div className="flex items-center" key='無資料'>
              <span className="text-heading text-text">
                無資料
              </span>
              <AddIcon
                onClick={() => handleOpenModal()}
                css={styles.icon}
              />
            </div>}
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
