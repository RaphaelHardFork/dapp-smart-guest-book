import { Button, Box, Flex, Alert, AlertIcon } from "@chakra-ui/react"
import { useContext } from "react"
import { Web3Context } from "web3-hooks"
import { usePinataCloud } from "../hooks/usePinataCloud"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"

const SendComment = ({ comment, hashedComment }) => {
  const [web3State] = useContext(Web3Context)
  const [pinJSON, readJSON] = usePinataCloud()
  const [smartGuestBook, state, dispatch] = useSmartGuestBook()
  const { txStatus, statusStyle } = state

  async function handleSendComment() {
    dispatch({ type: "TX_PIN" })
    try {
      let author = web3State.account
      let cid = await pinJSON({ author, comment, hashedComment })
      console.log(cid)
      dispatch({ type: "TX_WAITING" })
      let tx = await smartGuestBook.comment(hashedComment, cid)
      dispatch({ type: "TX_PENDING" })
      await tx.wait()
      dispatch({ type: "TX_SUCCESS" })
      /*
      dispatch({
        type: "COMMENT_ADDED",
        comment,
        hashedComment,
        tx,
        author,
      })
      */
    } catch (e) {
      console.log(e)
      dispatch({ type: "TX_FAILURE", payload: e })
    }
  }

  const debug = async () => {
    console.log(state.listOfComments)
  }
  return (
    <>
      <Flex flexDirection="column">
        <Box mb="4" mx="auto">
          <Button
            loadingText={txStatus}
            isLoading={
              txStatus.startsWith("Waiting") ||
              txStatus.startsWith("Pending") ||
              txStatus.startsWith("Pinning")
            }
            onClick={handleSendComment}
            colorScheme="purple"
            disabled={
              !web3State.isLogged ||
              web3State.networkName !== "Rinkeby" ||
              txStatus.startsWith("Waiting") ||
              txStatus.startsWith("Pending") ||
              txStatus.startsWith("Pinning")
            }
          >
            {!web3State.isLogged
              ? "Connect your metamask"
              : web3State.networkName !== "Rinkeby"
              ? `Unvailable on ${web3State.networkName}`
              : "Send Comment"}
          </Button>
          <Button ms="4" onClick={debug}>
            See data
          </Button>
        </Box>
        {txStatus.startsWith("Failed") || txStatus.startsWith("Success") ? (
          <Alert status={statusStyle} borderRadius="10">
            <AlertIcon />
            {txStatus}
          </Alert>
        ) : (
          ""
        )}
      </Flex>
    </>
  )
}

export default SendComment
