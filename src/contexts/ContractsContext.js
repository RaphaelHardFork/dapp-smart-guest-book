import { createContext } from "react"
import { useContract } from "web3-hooks"
import { contractAddress, contractABI } from "../contracts/SmartGuestBook"

export const ContractsContext = createContext(null)

const ContractsContextProvider = ({ children }) => {
  const contract = useContract(contractAddress, contractABI)

  return (
    <ContractsContext.Provider value={[contract]}>
      {children}
    </ContractsContext.Provider>
  )
}

export default ContractsContextProvider
