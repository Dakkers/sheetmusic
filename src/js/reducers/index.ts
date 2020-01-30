import { combineReducers } from 'redux'
import modalVisibility from './todos'
import midi from './midi'
import settings from './settings'

export default combineReducers({
  midi,
  modalVisibility,
  settings,
})
