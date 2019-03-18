import { createActions, handleActions, combineActions } from 'redux-actions';

const {
  setMidiDevices,
  setMidiKeyUp,
  setMidiKeyDown,
} = createActions({
  SET_MIDI_DEVICES: (midiDevices) => midiDevices,
  SET_MIDI_KEY_UP: (key: string) => key,
  SET_MIDI_KEY_DOWN: (key: string) => key,
});

export {
  setMidiKeyUp,
  setMidiKeyDown,
  setMidiDevices,
};

export default handleActions(
  {
    [setMidiDevices]: (state, { payload: midiDevices }) => {
      return { ...state, midiDevices };
    },
    [setMidiKeyDown]: (state, { payload: key }) => {
      return { ...state, midiKeysPressed: [...state.midiKeysPressed, key] };
    },
    [setMidiKeyUp]: (state, { payload: key }) => {
      return { ...state, midiKeysPressed: state.midiKeysPressed.filter((key2: string) => key2 !== key) };
    },
  },
  {
    midiDevices: [],
    midiKeysPressed: []
  }
);
