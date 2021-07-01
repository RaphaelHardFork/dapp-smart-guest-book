export const commentReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE":
      return { ...state, txStatus: "", loading: true }

    case "EVENT_LISTENED":
      return {
        ...state,
        success: !state.success,
      }

    case "EVENT_PRICE":
      let newPriceMap = state.priceMap.map((elem) => {
        if (elem[0] === action.tokenId.toString()) {
          return [elem[0], action.price]
        }
        return elem
      })
      return {
        ...state,
        priceMap: newPriceMap,
      }

    case "EVENT_OWNER":
      console.log(action.tokenId)
      console.log(action.owner)
      console.log(state.ownerMap)
      let newOwnerMap = state.ownerMap.map((elem) => {
        if (elem[0] === action.tokenId.toString()) {
          return [elem[0], action.owner]
        }
        return elem
      })
      console.log(newOwnerMap)
      return {
        ...state,
        ownerMap: newOwnerMap,
      }

    case "TX_WAITING":
      return {
        ...state,
        txStatus: "Waiting for confirmation",
      }

    case "TX_PIN":
      return {
        ...state,
        txStatus: "Pinning to IPFS",
      }

    case "TX_UNPIN":
      return {
        ...state,
        txStatus: "Unpinning from IPFS",
      }

    case "TX_PENDING":
      return {
        ...state,
        txStatus: "Pending",
      }

    case "TX_SUCCESS":
      return {
        ...state,
        txStatus: "Success",
      }

    case "TX_FAILURE":
      let message = `Failed with ${action.payload.message}`
      if (action.payload.code === "UNPREDICTABLE_GAS_LIMIT") {
        message = "The comment is already deleted, please refresh your browser"
      }
      return {
        ...state,
        txStatus: message,
      }

    case "FILTER":
      return {
        ...state,
        filter: !state.filter,
      }

    case "DELETED":
      return {
        ...state,
        deleted: !state.deleted,
      }

    case "MODERATOR":
      return {
        ...state,
        moderator: action.payload,
      }

    case "TX_STATUS":
      const statusStyle = (CountStat) => {
        switch (CountStat) {
          case "":
            return "info"
          case "Waiting for confirmation":
            return "info"
          case "Pending":
            return "warning"
          case "Success":
            return "success"
          case "Failed":
            return "error"
          default:
            return "info"
        }
      }
      let style
      if (state.txStatus.startsWith("Failed")) {
        style = statusStyle("Failed")
      } else {
        style = statusStyle(state.txStatus)
      }
      return {
        ...state,
        statusStyle: style,
      }

    case "COMMENT_HISTORY":
      return {
        ...state,
        listOfComments: action.commentsList,
        priceMap: action.mapOfPrice,
        ownerMap: action.mapOfOwner,
        loading: false,
      }

    default:
      throw new Error(
        `commentReducer: wrong input in the reducer ${action.type}`
      )
  }
}
