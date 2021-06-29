import { Flex, Text, Heading, Button, Center } from "@chakra-ui/react"
import { useContext } from "react"
import { Web3Context } from "web3-hooks"

const Dashboard = () => {
  const [web3State, login] = useContext(Web3Context)

  return (
    <Flex
      flexDirection={{ base: "column", lg: "row" }}
      alignItems="center"
      justifyContent="space-between"
      m="10"
      borderRadius="30"
      p="10"
      color="black"
      bg="white"
    >
      <Heading textAlign="center">MetaMask</Heading>
      {web3State.isLogged ? (
        <Text fontSize="lg">
          <Text as="b">Account: </Text>
          {web3State.account}
        </Text>
      ) : (
        <Center>
          <Button size="lg" onClick={login} colorScheme="orange">
            Login
          </Button>
        </Center>
      )}
    </Flex>
  )
}

export default Dashboard
