/** @jsxImportSource @emotion/react */
import { Button as MuiButton } from 'ui/button-compat'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo, Fragment, useState } from 'react'
import { Add as AddIcon, Edit as EditIcon } from 'ui/icons'
import { teal } from 'ui/colors';
import styles from './styles/AboutDesignerSideExternalLink'
import OuterLinkModal from './OuterLinkModal'
import OuterLinkSortModal from './OuterLinkSortModal'

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
    <Card>
      <CardHeader action={
        <Button
          variant="secondary"
          size="sm"
          disabled={!inputEnable || externalLink.length < 2}
          onClick={() => setOpenSort(true)}>調整排序</Button>
      }>
        <CardTitle>外部連結設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div css={styles.serviceInputGroup}>
          {externalLink.length ? externalLink.map((data, index) => {
            const {id, name} = data
            return (
              <Fragment key={id}>
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
                </MuiButton>
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
