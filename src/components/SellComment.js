import { Button, Input } from "@chakra-ui/react"
import { ethers } from "ethers"
import { useState } from "react"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"

const SellComment = ({ tokenId, price }) => {
  const [smartGuestBook, state, dispatch] = useSmartGuestBook()
  const { txStatus } = state
  const [amount, setAmount] = useState()
  async function handleSellComment() {
    if (!Number(price)) {
      // put on sale
      if (!amount) {
        console.log("SET AMOUNT")
        setAmount(0.1)
      } else {
        dispatch({ type: "TX_WAITING" })
        try {
          let tx = await smartGuestBook.sellComment(
            tokenId,
            ethers.utils.parseEther(amount)
          )
          dispatch({ type: "TX_PENDING" })
          await tx.wait()
        } catch (e) {
          console.error(e)
          dispatch({ type: "TX_FAILURE", payload: e })
        }
        setAmount(0)
      }
    } else {
      //remove from sale
      dispatch({ type: "TX_WAITING" })
      try {
        let tx = await smartGuestBook.removeFromSale(tokenId)
        dispatch({ type: "TX_PENDING" })
        await tx.wait()
      } catch (e) {
        console.error(e)
        dispatch({ type: "TX_FAILURE", payload: e })
      }
    }
  }

  return (
    <>
      <Button
        isLoading={
          txStatus.startsWith("Waiting") || txStatus.startsWith("Pending")
        }
        loadingText={txStatus}
        me="4"
        onClick={handleSellComment}
        colorScheme="green"
      >
        {!Number(price) ? "Sell" : "Remove from sale"}
      </Button>
      {!!amount && (
        <Input
          value={amount}
          _placeholder={{ color: "gray" }}
          bg="white"
          placeholder="Price"
          step="0.1"
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          maxW="20"
        />
      )}
    </>
  )
}

export default SellComment
