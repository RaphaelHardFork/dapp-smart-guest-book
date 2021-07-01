import { Heading, Container, Center } from "@chakra-ui/react"
import { Switch, Route } from "react-router-dom"
import Dashboard from "./components/Dashboard"
import CommentList from "./components/CommentList"
import CommentInput from "./components/CommentInput"

const Dapp = () => {
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
              <CommentInput />
            </Container>
          </Center>
          <CommentList />
        </Route>
        <Route exact path="/comment/:id"></Route>
      </Switch>
    </>
  )
}

export default Dapp
