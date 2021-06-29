import { Text, Heading, Container, Center, Textarea } from "@chakra-ui/react"
import { Switch, Route } from "react-router-dom"
import { ethers } from "ethers"
import { useContext, useState } from "react"
import Dashboard from "./components/Dashboard"
import SendComment from "./components/SendComment"
import CommentList from "./components/CommentList"
import { Web3Context } from "web3-hooks"

const Dapp = () => {
  const [web3State] = useContext(Web3Context)
  const [comment, setComment] = useState("")
  const [hashedComment, setHashedComment] = useState("0x")

  function handleChangeComment(e) {
    setComment(e.target.value)
    setHashedComment(ethers.utils.id(e.target.value))
  }

  return (
    <>
      <Switch>
        <Route exact path="/">
          <Dashboard />
          <Heading as="h1" textAlign="center" p="10">
            Leave a comment in the Smart Guest Book
          </Heading>
          <Center>
            <Container mt="10">
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
            </Container>
          </Center>
          <Center mb="6">
            <SendComment comment={comment} hashedComment={hashedComment} />
          </Center>
          <CommentList />
        </Route>
        <Route exact path="/comment/:id"></Route>
      </Switch>
    </>
  )
}

export default Dapp
