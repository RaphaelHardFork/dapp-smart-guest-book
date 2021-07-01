import { Alert, AlertIcon, Button } from "@chakra-ui/react"
import { usePinataCloud } from "../hooks/usePinataCloud"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"

const DeleteComment = ({ cid, tokenId }) => {
  const [smartGuestBook, { txStatus }, dispatch] = useSmartGuestBook()
  const [, deleteJSON] = usePinataCloud()

  async function handleDeleteComment(cid, tokenId) {
    dispatch({ type: "TX_UNPIN" })
    try {
      await deleteJSON(cid)
    } catch (e) {
      console.error(e)
    }
    try {
      dispatch({ type: "TX_WAITING" })
      let tx = await smartGuestBook.deleteComment(tokenId)
      dispatch({ type: "TX_PENDING" })
      await tx.wait()
      dispatch({ type: "TX_SUCCESS" })
    } catch (e) {
      console.error(e)
      dispatch({ type: "TX_FAILURE", payload: e })
    }
  }
  return (
    <>
      <Button
        me="4"
        size="lg"
        isLoading={
          txStatus.startsWith("Waiting") ||
          txStatus.startsWith("Pending") ||
          txStatus.startsWith("Unpin")
        }
        onClick={() => handleDeleteComment(cid, tokenId)}
        colorScheme="red"
      >
        Delete
      </Button>
      {!!txStatus && (
        <Alert status="error">
          <AlertIcon />
          {txStatus}
        </Alert>
      )}
    </>
  )
}

export default DeleteComment
