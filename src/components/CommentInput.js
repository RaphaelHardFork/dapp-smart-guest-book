import { Text, Textarea } from "@chakra-ui/react"
import { ethers } from "ethers"
import { useContext, useState } from "react"
import { Web3Context } from "web3-hooks"
import SendComment from "./SendComment"

const CommentInput = () => {
  const [web3State] = useContext(Web3Context)
  const [comment, setComment] = useState("")
  const [hashedComment, setHashedComment] = useState(
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  )

  function handleChangeComment(e) {
    setComment(e.target.value)
    setHashedComment(ethers.utils.id(e.target.value))
  }

  return (
    <>
      <Textarea
        disabled={web3State.networkName !== "Rinkeby"}
        onChange={handleChangeComment}
        placeholder={
          web3State.networkName !== "Rinkeby"
            ? "The contract work only on Rinkeby"
            : "Type your comment here..."
        }
        value={comment}
        mb="4"
        minH="250"
      />
      <Text mb="4">Your comment:</Text>
      <Text mb="4">
        <Text as="b">{comment}</Text>
      </Text>
      <Text mb="4">Hashed comment:</Text>
      <Text mb="8">
        <Text as="b">{hashedComment}</Text>
      </Text>
      <SendComment comment={comment} hashedComment={hashedComment} />
    </>
  )
}

export default CommentInput
