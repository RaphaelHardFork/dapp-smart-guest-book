import {
  Box,
  Text,
  Heading,
  Container,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react"
import { useCallback, useContext, useState } from "react"
import { Web3Context } from "web3-hooks"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"

const CommentList = () => {
  const [filter, setFilter] = useState(false)
  const [web3State] = useContext(Web3Context)
  const [, state] = useSmartGuestBook()
  const { commentList, listOfArgs } = state

  const diplayList = useCallback(
    (listOfArgs) => {
      console.log("useCallback")
      console.log(listOfArgs)
      console.log(commentList)
      const linkedComment = commentList.map((elem) => elem.hash)

      console.log(linkedComment)

      const list = listOfArgs.map((elem) => {
        if (filter) {
          console.log("filter = true")
          if (web3State.account.toLowerCase() === elem[0].toLowerCase()) {
            console.log("FILTERED")
            if (linkedComment.includes(elem[1])) {
              console.log("FINDED")
              let index = linkedComment.indexOf(elem[1])
              return {
                author: commentList[index].author,
                hashedComment: commentList[index].hash,
                content: commentList[index].content,
                txHash: commentList[index].txHash,
              }
            } else {
              return {
                author: elem[0],
                hashedComment: elem[1],
                content: "Content not linked",
                txHash: "Can be found...",
              }
            }
          }
        } else {
          console.log("filter = false")
          if (linkedComment.includes(elem[1])) {
            console.log("FINDED")
            let index = linkedComment.indexOf(elem[1])
            console.log(index)
            console.log(commentList[index])
            return {
              author: commentList[index].author,
              hashedComment: commentList[index].hash,
              content: commentList[index].content,
              txHash: commentList[index].txHash,
            }
          } else {
            return {
              author: elem[0],
              hashedComment: elem[1],
              content: "Content not linked",
              txHash: "",
            }
          }
        }
      })
      console.log(list)
      return list
    },
    [commentList, filter]
  )

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
          onChange={() => setFilter(!filter)}
          me="0.75rem"
          id="transfer-from"
        />
        <FormLabel my="auto" fontSize="1.2rem" htmlFor="transfer-from">
          {filter ? "My comments" : "All comments"}
        </FormLabel>
      </FormControl>
      {diplayList(listOfArgs).map((elem) => {
        return (
          <Box
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
        )
      })}
      {/*listOfArgs.map((elem) => {
        for (let comment of commentList) {
          if (comment.hash === elem[1]) {
            return (
              <Box
                mb="6"
                color="black"
                borderRadius="30"
                bg={
                  elem[0].toLowerCase() === web3State.account
                    ? "palevioletred"
                    : "orange.200"
                }
                p="10"
              >
                <Heading>Comment n°{0}</Heading>
                <Text>Author: {elem[0]}</Text>
                <Text>Hashed comment: {elem[1]}</Text>
                <Text>Content: {comment.content}</Text>
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
          <Box
            mb="6"
            color="black"
            borderRadius="30"
            bg={
              elem[0].toLowerCase() === web3State.account
                ? "palevioletred"
                : "orange.200"
            }
            p="10"
          >
            <Heading>Comment n°{0}</Heading>
            <Text>Author: {elem[0]}</Text>
            <Text>Hashed comment: {elem[1]}</Text>
            <Text>Content: Data not found :(</Text>
          </Box>
        )
      })*/}
    </Container>
  )
}

export default CommentList
