import { Box, Text, Container, Flex, Progress } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { Web3Context } from "web3-hooks"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"
import Comment from "./Comment"
import Options from "./Options"

const CommentList = () => {
  const [web3State] = useContext(Web3Context)
  const [, { deleted, listOfComments }] = useSmartGuestBook()
  const [filter, setFilter] = useState(false)

  return (
    <Container maxW="container.lg">
      <Options filter={filter} setFilter={setFilter} />

      {/* CONNECT TO METAMASK TO SEE COMMENT ON BLOCKCHAIN */}
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

      <Box listStyleType="none" as="ul">
        {listOfComments.map((elem) => {
          if (filter) {
            if (elem.owner.toLowerCase() !== web3State.account.toLowerCase()) {
              console.log("FILTERED")
              return ""
            }
          }
          if (!deleted) {
            if (elem.deleted) {
              return ""
            }
          }
          return <Comment elem={elem} />
        })}
      </Box>
    </Container>
  )
}

export default CommentList
