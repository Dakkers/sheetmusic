import { combineReducers } from 'redux'
import modalVisibility from './todos'
import midi from './midi'

export default combineReducers({
  midi,
  modalVisibility
})
