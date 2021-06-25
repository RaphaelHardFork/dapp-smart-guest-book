import { Box, Text, Heading, Container } from "@chakra-ui/react"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"

const CommentList = () => {
  const [, state] = useSmartGuestBook()
  const { commentList, listOfHash } = state
  return (
    <Container maxW="container.lg">
      {listOfHash.map((elem) => {
        for (let comment of commentList) {
          if (comment.hash === elem) {
            return (
              <Box
                mb="6"
                color="black"
                borderRadius="30"
                bg="orange.200"
                p="10"
              >
                <Heading>Comment n°{0}</Heading>
                <Text>{elem}</Text>
                <Text>{comment.content}</Text>
                <Text
                  href={`https://rinkeby.etherscan.io/tx/${comment.txHash}`}
                  as="a"
                >
                  {comment.txHash}
                </Text>
              </Box>
            )
          }
        }
        return (
          <Box mb="6" color="black" borderRadius="30" bg="orange.200" p="10">
            <Heading>Comment n°{0}</Heading>
            <Text>{elem}</Text>
            <Text>Data not found :(</Text>
          </Box>
        )
      })}
    </Container>
  )
}

export default CommentList
