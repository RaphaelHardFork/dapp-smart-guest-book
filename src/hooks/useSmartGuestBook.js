import { useContext, useEffect, useReducer } from "react"
import { Web3Context } from "web3-hooks"
import { ContractsContext } from "../contexts/ContractsContext"
import { commentReducer } from "../reducers/commentReducer"

export const useSmartGuestBook = () => {
  const [web3State] = useContext(Web3Context)
  const [contract] = useContext(ContractsContext)

  const initialState = {
    txStatus: "",
    errorMessage: "",
    commentList: [],
    listOfHash: [],
  }
  const [state, dispatch] = useReducer(
    commentReducer,
    initialState,
    (initialState) => {
      let data = JSON.parse(localStorage.getItem("comment-list"))
      if (data === null || data === undefined) {
        data = []
      }
      return {
        ...initialState,
        commentList: data,
      }
    }
  )

  useEffect(() => {
    localStorage.setItem("comment-list", JSON.stringify(state.commentList))
  }, [state.commentList])

  useEffect(() => {
    if (contract) {
      const cb = (author, hashedComment) => {
        if (author.toLowerCase() === web3State.account) {
          dispatch({ type: "COMMENT_LINK", author, hashedComment })
        }
      }
      contract.on("CommentLeaved", cb)
      return () => {
        contract.off("CommentLeaved", cb)
      }
    }
  }, [contract, web3State.account])

  useEffect(() => {
    if (contract) {
      const getHistory = async () => {
        try {
          let commentHistory = await contract.filters.CommentLeaved(
            web3State.account,
            null
          )
          commentHistory = await contract.queryFilter(commentHistory)
          console.log(commentHistory)
          dispatch({ type: "COMMENT_HISTORY", payload: commentHistory })
        } catch (e) {
          console.log(e)
        }
      }
      getHistory()
    }
  }, [contract, web3State.account])

  if (contract === undefined) {
    throw new Error(
      `It seems that you are trying to use ContractContext outside of its provider`
    )
  }

  return [contract, state, dispatch]
}
