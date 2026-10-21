import { Rating } from 'ui/misc-compat'
import { useState, useEffect } from 'react'
import Page from 'components/Page'
import Status from './Status'
import { useParams } from 'react-router'
import { openSnackbar } from 'elements/snackbars';
import useFetchSetOrderRanking from 'hooks/useFetchSetOrderRanking.js'
import useFetchSetOrderRankingAndComment from 'hooks/useFetchSetOrderRankingAndComment.js'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import { Textarea } from 'ui/input'
import { Skeleton } from 'ui/skeleton'

const CustomerRating = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { orderId, rank } = useParams()
  const { setOrderRanking } = useFetchSetOrderRanking()
  const { setOrderRankingAndComment } = useFetchSetOrderRankingAndComment()
  const [statusOpen, setStatusOpen] = useState({
    open: false,
    isComment: null  // isCommented complete error
  })
  const [ratingData, setRatingData] = useState(null)
  const [isClick, setIsClick] = useState(false)

  const handleSetRatingData = async () => {
    try {
      const res = await setOrderRanking({
        input: {
          orderId,
          rank: Number(rank)
        }
      })
      if (res.data.setOrderRanking.isCommented) {
        setStatusOpen({
          open: true,
          isComment: 'isCommented'
        })
      } else {
        setRatingData(res.data.setOrderRanking)
      }
    } catch (error) {
      setStatusOpen({
        open: true,
        isComment: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsClick(true)
    try {
      const res = await setOrderRankingAndComment({
        input: {
          orderId,
          rank: ratingData.rank,
          comment: ratingData.comment
        }
      })
      if (res.data.setOrderRankingAndComment) {
        setStatusOpen({
          open: true,
          isComment: 'complete'
        })
      } else throw new Error('送出失敗')
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
      setIsClick(false)
    }
  }

  useEffect(() => {
    handleSetRatingData()
  }, [])

  if (isLoading) return (
    <div className="ui-root flex flex-col gap-4">
      <Skeleton className="h-60 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  )

  return (
    <Page className="ui-root" title='顧客評論'>
      {statusOpen.open ? (
        <Status open={statusOpen.open} isComment={statusOpen.isComment} />
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 text-center">
              {ratingData.avatar && (
                <img src={ratingData.avatar} alt="" className="h-[100px] w-[100px] rounded-full object-cover" />
              )}
              <div className="text-heading text-text" style={{ wordBreak: 'break-word' }}>{`設計師: ${ratingData.designerName}`}</div>
            </CardContent>
            <div className="h-px bg-border" />
            <CardContent className="flex flex-col items-center gap-5 text-center">
              {ratingData.rank > 0 && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="text-body text-text">{`對於${ratingData.designerName}的服務，您給幾顆星呢？`}</div>
                  <Rating
                    name='rating'
                    precision={1}
                    size='large'
                    defaultValue={Number(rank)}
                    value={ratingData.rank}
                    onChange={(event, newValue) => {
                      newValue && setRatingData({ ...ratingData, rank: newValue })
                    }}
                  />
                </div>
              )}
              <Textarea
                className="text-left"
                value={ratingData.comment || ''}
                placeholder='留下您的評論'
                rows={3}
                onChange={e => {
                  setRatingData({ ...ratingData, comment: e.target.value })
                }}
              />
            </CardContent>
          </Card>
          <Button
            variant="primary"
            size="lg"
            className="h-11 w-full"
            onClick={handleSubmit}
            disabled={isClick}
          >送出</Button>
        </div>
      )}
    </Page>
  )
}

export default CustomerRating
