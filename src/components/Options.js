import { Flex, FormControl, FormLabel, Switch } from "@chakra-ui/react"
import { useSmartGuestBook } from "../hooks/useSmartGuestBook"

const Options = ({ setFilter, filter }) => {
  const [, , dispatch] = useSmartGuestBook()

  return (
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
          onChange={() => setFilter(!filter)}
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
  )
}

export default Options
