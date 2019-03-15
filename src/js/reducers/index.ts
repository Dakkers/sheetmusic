import { combineReducers } from 'redux'
import modalVisibility from './todos'
import main from './main'

export default combineReducers({
  main,
  modalVisibility
})
