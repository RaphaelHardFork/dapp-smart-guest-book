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
  const { filter, displayedList, txStatus, moderator, listOfComments } = state

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
      <Flex justifyContent="space-between">
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
        <FormControl
          minW="35ch"
          maxW={{ base: "50%", xl: "20%" }}
          mx={{ base: "auto", xl: "0" }}
          display="flex"
          alignItems="center"
          justifyContent={{ base: "center", xl: "start" }}
          mb="1rem"
        >
          <Switch
            onChange={() => dispatch({ type: "DELETED" })}
            me="0.75rem"
            id="deleted-comments"
          />
          <FormLabel my="auto" fontSize="1.2rem" htmlFor="deleted-comments">
            See deleted comments
          </FormLabel>
        </FormControl>
      </Flex>
      <Box as="ul">
        {listOfComments.map((elem) => {
          return (
            <Box
              as="li"
              key={elem.hashedComment}
              mb="6"
              color="black"
              borderRadius="30"
              bg={
                elem.deleted
                  ? "whiteAlpha.600"
                  : elem.author === web3State.account
                  ? "palevioletred"
                  : "orange.200"
              }
              p="10"
            >
              <Box pe="4">
                <Heading isTruncated>Comment from {elem.author}</Heading>
                <Text textAlign="end">Comment n°{elem.tokenId}</Text>
                <Text>
                  {" "}
                  <Text as="b">Hashed comment:</Text> {elem.hashedComment}
                </Text>
                <Link
                  href={`https://rinkeby.etherscan.io/tx/${elem.txHash}`}
                  as="a"
                  isExternal
                >
                  {elem.txHash}
                </Link>
                <Text>{elem.cid}</Text>
                <Heading fontSize="2xl" my="4" as="h3">
                  Content:
                </Heading>
                <Box borderRadius="10" p="4" bg="white">
                  <Text>
                    {elem.deleted ? (
                      <Text as="b" color="red">
                        Comment deleted
                      </Text>
                    ) : (
                      elem.content
                    )}
                  </Text>
                </Box>
              </Box>
              {moderator && !elem.deleted && (
                <Button
                  mt="4"
                  size="lg"
                  isLoading={
                    txStatus.startsWith("Waiting") ||
                    txStatus.startsWith("Pending")
                  }
                  onClick={() => handleDeleteComment(elem.tokenId)}
                  colorScheme="red"
                >
                  Delete
                </Button>
              )}
            </Box>
          )
        })}
      </Box>
    </Container>
  )
}

export default CommentList
