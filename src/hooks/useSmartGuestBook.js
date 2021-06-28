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
    listOfArgs: [],
    displayedList: [],
    filter: false,
    statusStyle: "info",
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
  const { commentList, listOfArgs, filter } = state

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
          let commentHistory = await contract.filters.CommentLeaved(null, null)
          commentHistory = await contract.queryFilter(commentHistory)
          dispatch({ type: "COMMENT_HISTORY", payload: commentHistory })
        } catch (e) {
          console.log(e)
        }
      }
      getHistory()
    }
  }, [contract, web3State.account])

  useEffect(() => {
    let linkedHash = commentList.map((elem) => {
      return elem.hash
    })
    let list = []

    for (let arg of listOfArgs) {
      if (filter) {
        if (arg[0].toLowerCase() !== web3State.account.toLowerCase()) {
          continue
        }
      }
      let index = linkedHash.indexOf(arg[1])
      if (index !== -1) {
        list.push({
          author: arg[0],
          hashedComment: arg[1],
          content: commentList[index].content,
          txHash: commentList[index].txHash,
        })
      } else {
        list.push({
          author: arg[0],
          hashedComment: arg[1],
          content: "Content not linked",
          txHash: "TxHash not found yet",
        })
      }
    }
    dispatch({ type: "DISPLAY_LIST", payload: list })

    /*
        let list = state.commentList.map((elem) => {
      return elem.hash
    })

    console.log(list.indexOf(state.listOfArgs[17][1]))
    console.log(state.commentList[5])
    console.log(state.listOfArgs[17][1])
    */
  }, [filter, listOfArgs, commentList, dispatch, web3State.account])

  useEffect(() => {
    dispatch({ type: "TX_STATUS" })
  }, [state.txStatus])

  if (contract === undefined) {
    throw new Error(
      `It seems that you are trying to use ContractContext outside of its provider`
    )
  }

  return [contract, state, dispatch]
}
