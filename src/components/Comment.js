import { Badge, Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react"
import { useContext } from "react"
import { Web3Context } from "web3-hooks"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"
import BuyComment from "./BuyComment"
import DeleteComment from "./DeleteComment"
import SellComment from "./SellComment"

const findIndex = (comment, mapping) => {
  let indexList = mapping.map((elem) => elem[0])
  return indexList.indexOf(comment.tokenId)
}

const Comment = ({ elem }) => {
  const [web3State] = useContext(Web3Context)
  const [, { moderator, priceMap, ownerMap, filter }] = useSmartGuestBook()

  function getPrice() {
    let index = findIndex(elem, priceMap)
    if (index === -1) {
      return elem.price
    } else {
      return priceMap[index][1]
    }
  }
  function getOwner() {
    let index = findIndex(elem, ownerMap)
    if (index === -1) {
      return elem.owner.toLowerCase()
    } else {
      return ownerMap[index][1].toLowerCase()
    }
  }

  const debug = async () => {
    console.log(filter)
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
          : getOwner() === web3State.account
          ? "palevioletred"
          : "orange.200"
      }
      p="10"
    >
      <Box pe="4">
        <Button onClick={debug}>Debug</Button>

        <Heading isTruncated>Comment from {elem.author}</Heading>
        <Flex my="4" justifyContent="space-between" flexDirection="row">
          <Box>
            <Badge me="4" bg="teal.800" fontSize="lg" borderRadius="20" p="3">
              {!Number(getPrice()) ? "Not for sale" : `${getPrice()} ETH`}
            </Badge>
            {getOwner() === web3State.account ? (
              ""
            ) : !Number(getPrice()) ? (
              ""
            ) : (
              <BuyComment price={getPrice()} tokenId={elem.tokenId} />
            )}
          </Box>
          <Text alignSelf="start" textAlign="end">
            Comment n°{elem.tokenId}
          </Text>
        </Flex>
        <Text>
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
        <Text>
          {" "}
          <Text as="b">Owner: </Text> {getOwner()}
        </Text>
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
        {getOwner() === web3State.account ? (
          <SellComment price={getPrice()} tokenId={elem.tokenId} />
        ) : (
          ""
        )}

        {moderator && !elem.deleted && (
          <DeleteComment cid={elem.cid} tokenId={elem.tokenId} />
        )}
      </Flex>
    </Box>
  )
}

export default Comment
