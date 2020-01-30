import { boundMethod } from 'autobind-decorator';
import * as React from 'react';
import { connect } from 'react-redux';

import MIDI_CODE_TO_NOTE_MAPPING from './../constants/midiCodes';
import { setMidiDevices, setMidiKeyUp, setMidiKeyDown } from './../reducers/midi';

class MIDIBinder extends React.Component<{}, {}> {
  render () {
    return null;
  }

  componentDidMount () {
    this.listenForMidiDevices();
  }

  @boundMethod listenForMidiDevices () {
    navigator.requestMIDIAccess()
    .then((access: WebMidi.MIDIAccess) => {
      this.handleDevices(Array.from(access.inputs.values()))

      access.onstatechange = (e: WebMidi.MIDIConnectionEvent) => {
        this.handleDevices(Array.from(e.target.inputs.values()))
      }
    })
  }

  @boundMethod handleMidiInput (device: WebMidi.MIDIInput) {
    device.onmidimessage = (m: WebMidi.MIDIMessageEvent) => {
      const command : number = m.data['0'];
      const key : number = m.data['1'];

      if (command === 144) {
        this.props.onMidiKeyDown(MIDI_CODE_TO_NOTE_MAPPING[key.toString()]);
      } else if(command === 128) {
        this.props.onMidiKeyUp(MIDI_CODE_TO_NOTE_MAPPING[key.toString()]);
      }
    }
  }

  @boundMethod handleDevices (devices: Array<WebMidi.MIDIInput>) {
    this.props.onMidiDevicesChanged(devices)
    for (const d of devices) {
      this.handleMidiInput(d);
    }
  }
}

export default connect(
  null,
  (dispatch) => {
    return {
      onMidiDevicesChanged: (midiDevices: Array<WebMidi.MIDIInput>) => dispatch(setMidiDevices(midiDevices)),
      onMidiKeyUp: (key: string) => dispatch(setMidiKeyUp(key)),
      onMidiKeyDown: (key: string) => dispatch(setMidiKeyDown(key)),
    };
  }
)(MIDIBinder)
