import { createActions, handleActions, combineActions } from 'redux-actions';

const { setMidiDevices } = createActions({
  SET_MIDI_DEVICES: (devices) => devices
});

export default handleActions(
  {
    [setMidiDevices]: (state, { payload: { devices } }) => {
      return { ...state, devices };
    },
  },
  {
    devices: []
  }
);
