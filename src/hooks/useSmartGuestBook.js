import { useContext, useEffect, useReducer } from "react"
import { Web3Context } from "web3-hooks"
import { ContractsContext } from "../contexts/ContractsContext"
import { commentReducer } from "../reducers/commentReducer"

export const useSmartGuestBook = () => {
  const [web3State] = useContext(Web3Context)
  const [contract] = useContext(ContractsContext)

  const initialState = {
    commentsData: [],
    listOfArgs: [],
    displayedList: [],
    filter: false,
    txStatus: "",
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
        commentsData: data,
      }
    }
  )
  const { commentsData, listOfArgs, filter } = state

  useEffect(() => {
    if (contract) {
      const cb = (author, hashedComment, tokenId) => {
        if (author.toLowerCase() === web3State.account) {
          dispatch({
            type: "COMMENT_LINK",
            author,
            hashedComment,
            tokenId: tokenId.toString(),
          })
          console.log("linkage")
          localStorage.setItem("comment-list", JSON.stringify(commentsData))
        }
      }
      contract.on("CommentLeaved", cb)
      return () => {
        contract.off("CommentLeaved", cb)
      }
    }
  }, [contract, web3State.account, commentsData])

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
    let linkedHash = commentsData.map((elem) => {
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
          content: commentsData[index].content,
          txHash: commentsData[index].txHash,
          tokenId: commentsData[index].tokenId,
        })
      } else {
        list.push({
          author: arg[0],
          hashedComment: arg[1],
          content: "Content not linked",
          txHash: "TxHash not found yet",
          tokenId: "?",
        })
      }
    }
    dispatch({ type: "DISPLAY_LIST", payload: list })
  }, [filter, listOfArgs, commentsData, dispatch, web3State.account])

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
