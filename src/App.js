import "./App.css"
import Dapp from "./Dapp"
import ContractsContextProvider from "./contexts/ContractsContext"

const App = () => {
  return (
    <ContractsContextProvider>
      <Dapp />
    </ContractsContextProvider>
  )
}

export default App
