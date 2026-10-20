import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo, Fragment, useState } from 'react'
import { Add as AddIcon, Edit as EditIcon } from 'ui/icons'
import { teal } from 'ui/colors';
import OuterLinkModal from './OuterLinkModal'
import OuterLinkSortModal from './OuterLinkSortModal'

const linkButtonClass =
  'w-[200px] px-[16px] py-[8px] relative normal-case break-all [&_svg.editIcon]:absolute [&_svg.editIcon]:top-0 [&_svg.editIcon]:right-0 [&_svg.editIcon]:[transform:translate(-10%,10%)] [&_svg.editIcon]:hidden [&:hover>svg.editIcon]:block [&_.svgWrap]:w-[25px] [&_.svgWrap]:h-[25px] [&_.svgWrap]:[transform:translate(-50%,-50%)] [&_.svgWrap]:rounded-[50%] [&_.svgWrap]:bg-[#bf3939] [&_.svgWrap]:flex [&_.svgWrap]:justify-center [&_.svgWrap]:items-center [&_.svgWrap]:absolute [&_.svgWrap]:top-0 [&_.svgWrap]:left-0 [&_.svgWrap_svg]:w-[20px] [&_.svgWrap_svg]:h-[20px]'

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
        <div className="flex flex-wrap items-center gap-x-[20px] gap-y-[15px]">
          {externalLink.length ? externalLink.map((data, index) => {
            const {id, name} = data
            return (
              <Fragment key={id}>
                <Button
                  disabled={!inputEnable}
                  onClick={() => handleOpenModal(false, data)}
                  variant="secondary"
                  className={`h-auto min-h-10 whitespace-normal ${linkButtonClass}`}
                >
                  {name}
                  <EditIcon className='editIcon' fontSize='small'/>
                </Button>
                {index === (externalLink.length - 1) ?
                <AddIcon
                  disabled={!inputEnable}
                  className="cursor-pointer"
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
                className="ml-[50px] cursor-pointer"
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
