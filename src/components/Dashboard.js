import { Box, Text, Heading, Button, Center } from "@chakra-ui/react"
import { useContext } from "react"
import { Web3Context } from "web3-hooks"

const Dashboard = () => {
  const [web3State, login] = useContext(Web3Context)

  return (
    <Box
      borderRadius="30"
      top="20"
      right="20"
      p="10"
      position="fixed"
      color="black"
      bg="white"
    >
      <Heading mb="4" textAlign="center">
        MetaMask
      </Heading>
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
    </Box>
  )
}

export default Dashboard
