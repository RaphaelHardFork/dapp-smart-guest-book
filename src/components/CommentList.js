import {
  Box,
  Text,
  Heading,
  Container,
  Switch,
  FormControl,
  FormLabel,
  Link,
  Flex,
  Button,
} from "@chakra-ui/react"
import { useContext } from "react"
import { Web3Context } from "web3-hooks"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"

const CommentList = () => {
  const [web3State] = useContext(Web3Context)
  const [smartGuestBook, state, dispatch] = useSmartGuestBook()
  const { filter, displayedList, txStatus } = state

  async function handleDeleteComment(tokenId) {
    dispatch({ type: "TX_WAITING" })
    try {
      let tx = await smartGuestBook.deleteComment(tokenId)
      dispatch({ type: "TX_PENDING" })
      await tx.wait()
      dispatch({ type: "TX_SUCCESS" })
    } catch (e) {
      console.log(e)
      dispatch({ type: "TX_FAILURE", payload: e })
    }
  }

  return (
    <Container maxW="container.lg">
      <FormControl
        maxW={{ base: "50%", xl: "20%" }}
        mx={{ base: "auto", xl: "0" }}
        display="flex"
        alignItems="center"
        justifyContent={{ base: "center", xl: "start" }}
        mb="1rem"
      >
        <Switch
          onChange={() => dispatch({ type: "FILTER" })}
          me="0.75rem"
          id="transfer-from"
        />
        <FormLabel my="auto" fontSize="1.2rem" htmlFor="transfer-from">
          {filter ? "My comments" : "All comments"}
        </FormLabel>
      </FormControl>
      {displayedList.map((elem) => {
        return (
          <Box as="ul">
            <Box
              as="li"
              key={elem.hashedComment}
              mb="6"
              color="black"
              borderRadius="30"
              bg={
                elem.author.toLowerCase() === web3State.account
                  ? "palevioletred"
                  : "orange.200"
              }
              p="10"
            >
              <Flex justifyContent="space-between">
                <Box>
                  <Heading>Comment n°{elem.tokenId}</Heading>
                  <Text>Author: {elem.author}</Text>
                  <Text>Hashed comment: {elem.hashedComment}</Text>
                  <Text>Content: {elem.content}</Text>
                  <Link
                    href={`https://rinkeby.etherscan.io/tx/${elem.txHash}`}
                    as="a"
                    isExternal
                  >
                    {elem.txHash}
                  </Link>
                </Box>

                <Button
                  isLoading={
                    txStatus.startsWith("Waiting") ||
                    txStatus.startsWith("Pending")
                  }
                  onClick={() => handleDeleteComment(elem.tokenId)}
                  colorScheme="red"
                >
                  Delete
                </Button>
              </Flex>
            </Box>
          </Box>
        )
      })}
    </Container>
  )
}

export default CommentList
