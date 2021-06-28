import {
  Box,
  Text,
  Heading,
  Container,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react"
import { useContext } from "react"
import { Web3Context } from "web3-hooks"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"

const CommentList = () => {
  const [web3State] = useContext(Web3Context)
  const [, state, dispatch] = useSmartGuestBook()
  const { filter, displayedList } = state

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
              <Heading>Comment n°{0}</Heading>
              <Text>Author: {elem.author}</Text>
              <Text>Hashed comment: {elem.hashedComment}</Text>
              <Text>Content: {elem.content}</Text>
              <Text
                href={`https://rinkeby.etherscan.io/tx/${elem.txHash}`}
                as="a"
              >
                {elem.txHash}
              </Text>
            </Box>
          </Box>
        )
      })}
    </Container>
  )
}

export default CommentList
