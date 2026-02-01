/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Card, CardContent, TextField, Container, Divider, Button, Avatar,
  CircularProgress, Rating
} from '@mui/material'
import Page from 'components/Page'
import Status from './Status'
import { useParams } from 'react-router'
import styles from './Styles'
import { openSnackbar } from 'elements/snackbars';
import useFetchSetOrderRanking from 'hooks/useFetchSetOrderRanking.js'
import useFetchSetOrderRankingAndComment from 'hooks/useFetchSetOrderRankingAndComment.js'

const index = () => {
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
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <CircularProgress />
    </div>
  )

  return (
    <Page css={styles.root} title='顧客評論'>
      {statusOpen.open ? (
        <Status open={statusOpen.open} isComment={statusOpen.isComment} />
      ) : (
        <Container maxWidth='md'>
          <Card>
            <CardContent css={styles.cardContent} style={{ gap: 12 }} >
              {ratingData.avatar && (
                <Avatar src={ratingData.avatar} css={styles.Avatar} />
              )}
              <div style={{ wordBreak: 'break-word' }}>{`設計師: ${ratingData.designerName}`}</div>
            </CardContent>
            <Divider />
            <CardContent css={styles.cardContent} style={{ gap: 20 }} >
              {ratingData.rank > 0 && (
                <div>
                  <div style={{ marginBottom: 6 }}>{`對於${ratingData.designerName}的服務，您給幾顆星呢？`}</div>
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
              <TextField
                value={ratingData.comment || ''}
                style={{ fontSize: 18 }}
                variant='outlined'
                placeholder='留下您的評論'
                minRows={3}
                multiline
                fullWidth
                onChange={e => {
                  setRatingData({ ...ratingData, comment: e.target.value })
                }}
              />
            </CardContent>
          </Card>
          <Button
            onClick={handleSubmit}
            style={{ width: '100%', marginTop: 12 }}
            variant='contained'
            color='primary'
            disabled={isClick}
          >送出</Button>
        </Container>
      )}
    </Page>
  )
}

export default index