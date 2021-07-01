import { Button } from "@chakra-ui/react"
import { ethers } from "ethers"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"

const BuyComment = ({ price, tokenId }) => {
  const [smartGuestBook, { txStatus }, dispatch] = useSmartGuestBook()

  async function handleBuyComment() {
    dispatch({ type: "TX_WAITING" })
    try {
      let tx = await smartGuestBook.buyComment(tokenId.toString(), {
        value: ethers.utils.parseEther(price),
      })
      dispatch({ type: "TX_PENDING" })
      await tx.wait()
    } catch (e) {
      console.error(e)
      dispatch({ type: "TX_FAILURE", payload: e })
    }
  }
  return (
    <Button
      isLoading={
        txStatus.startsWith("Waiting") || txStatus.startsWith("Pending")
      }
      loadingText={txStatus}
      onClick={handleBuyComment}
      colorScheme="teal"
    >
      Buy
    </Button>
  )
}

export default BuyComment
