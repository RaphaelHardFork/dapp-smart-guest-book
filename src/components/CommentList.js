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
  Alert,
  AlertIcon,
  Progress,
  Badge,
} from "@chakra-ui/react"
import { ethers } from "ethers"
import { useContext } from "react"
import { Web3Context } from "web3-hooks"
import { usePinataCloud } from "../hooks/usePinataCloud"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"
import SellComment from "./SellComment"

const CommentList = () => {
  const [web3State] = useContext(Web3Context)
  const [, deleteJSON] = usePinataCloud()
  const [smartGuestBook, state, dispatch] = useSmartGuestBook()
  const { filter, deleted, txStatus, moderator, listOfComments } = state

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
      {listOfComments.length ? (
        ""
      ) : (
        <Flex mb="100" justifyContent="center" flexDirection="column">
          <Text textAlign="center" mb="4" fontSize="4xl">
            Loading...
          </Text>
          <Progress minW="25" color="red" size="md" isIndeterminate />
        </Flex>
      )}

      <Box as="ul">
        {listOfComments.map((elem) => {
          if (filter) {
            if (elem.author !== web3State.account.toLowerCase()) {
              return ""
            }
          }
          if (!deleted) {
            if (elem.deleted) {
              return ""
            }
          }
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
                <Flex my="4" justifyContent="space-between" flexDirection="row">
                  <Badge fontSize="lg" borderRadius="20" p="3">
                    {!Number(elem.price)
                      ? "Not for sale"
                      : `${ethers.utils.formatEther(elem.price)} ETH`}
                  </Badge>
                  <Text alignSelf="start" textAlign="end">
                    Comment n°{elem.tokenId}
                  </Text>
                </Flex>
                <Text>
                  {" "}
                  <Text as="b">Hashed comment:</Text> {elem.hashedComment}
                </Text>
                {elem.txHash.map((hash) => {
                  return (
                    <Link
                      key={hash}
                      href={`https://rinkeby.etherscan.io/tx/${hash}`}
                      as="a"
                      isExternal
                    >
                      {hash}
                    </Link>
                  )
                })}

                <Text>{elem.deleted ? "CID not avaliable" : elem.cid}</Text>
                <Heading fontSize="2xl" my="4" as="h3">
                  Content:
                </Heading>
                <Box
                  borderRadius="10"
                  p="4"
                  bg={
                    elem.content === "Content not well pinned yet..."
                      ? "gray.300"
                      : "white"
                  }
                >
                  {elem.deleted ? (
                    <Text as="b" color="red">
                      Comment deleted
                    </Text>
                  ) : elem.content === "Content not well pinned yet..." ? (
                    <Text>
                      Upload on IPFS can take sometime, check the{" "}
                      <Link
                        color="teal.700"
                        fontWeight="bold"
                        as="a"
                        isExternal
                        href={`https://cid.ipfs.io/#${elem.cid}`}
                      >
                        CID inspector
                      </Link>{" "}
                      during this time.
                    </Text>
                  ) : (
                    elem.content
                  )}
                </Box>
              </Box>
              <Flex mt="4">
                <SellComment tokenId={elem.tokenId} />
                {moderator && !elem.deleted && (
                  <>
                    <Button
                      me="4"
                      size="lg"
                      isLoading={
                        txStatus.startsWith("Waiting") ||
                        txStatus.startsWith("Pending") ||
                        txStatus.startsWith("Unpin")
                      }
                      onClick={() =>
                        handleDeleteComment(elem.cid, elem.tokenId)
                      }
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
                )}
              </Flex>
            </Box>
          )
        })}
      </Box>
    </Container>
  )
}

export default CommentList
