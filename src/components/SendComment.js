import { Button, Text } from "@chakra-ui/react"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"

const SendComment = ({ comment, hashedComment }) => {
  const [smartGuestBook, state, dispatch] = useSmartGuestBook()

  async function handleSendComment() {
    dispatch({ type: "TX_WAITING" })
    try {
      let tx = await smartGuestBook.comment(hashedComment, "https://ipfs.io")
      dispatch({ type: "TX_PENDING" })
      await tx.wait()
      dispatch({ type: "TX_SUCCESS" })
      await dispatch({
        type: "COMMENT_ADDED",
        comment,
        hashedComment,
        tx,
      })
    } catch (e) {
      console.log(e)
      dispatch({ type: "TX_FAILURE", payload: e })
    }
  }

  const debug = () => {
    console.log(state.commentList)
    console.log(state.listOfHash)
  }
  return (
    <>
      <Button onClick={handleSendComment} colorScheme="purple">
        Send Comment
      </Button>
      <Button ms="4" onClick={debug}>
        See data
      </Button>
      <Text ms="4">{state.txStatus}</Text>
    </>
  )
}

export default SendComment
