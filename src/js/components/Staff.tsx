import { fabric } from 'fabric';
import * as React from 'react';
import { connect } from 'react-redux';
import {
  isEqual as _isEqual,
  range as _range
} from 'lodash';

const CANVAS_WIDTH : number = 400;

const LINE_GAP_PX : number = 16;
const STAFF_Y_POS : number = 100;

function linearEasing (t: number, b: number, c: number, d: number) {
  return c*t/d + b;
}

function getDistanceFromC (pitch1: string) {
  const note : string = pitch1[0];
  switch (note) {
    case 'C':
      return 0;
    case 'D':
      return 1;
    case 'E':
      return 2;
    case 'F':
      return 3;
    case 'G':
      return 4;
    case 'A':
      return 5;
    case 'B':
      return 6;
    default:
      throw new Error(`Invalid note: ${note}`);
  }
}

function createLedgerLine (y: number) {
  return new fabric.Line([0, y, CANVAS_WIDTH, y], {
    fill: 'black',
    stroke: 'black',
    strokeWidth: 1,
    selectable: false,
    evented: false,
  });
}

function createOutOfRangeLedgerLines (num: number) {
  const positions : Array<number> = _range(num, 0);

  return positions.map((pos: number) => {
    // return new fabric.Line([0, pos * LINE_GAP_PX, 24, pos * LINE_GAP_PX], {
    return new fabric.Line([10, 8, 36, 8], {
      fill: 'black',
      stroke: 'black',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    })
  });
}

function calculateNumberOfLedgerLines (clef: string, pitch: string) {
  if (clef === 'treble') {
    switch (pitch) {
      case 'C#7':
      case 'C7':
      case 'B6':
        return 5;
      case 'A#6':
      case 'A6':
      case 'G#6':
      case 'G6':
        return 4;
      case 'F#6':
      case 'F6':
      case 'E6':
        return 3;
      case 'D#6':
      case 'D6':
      case 'C#6':
      case 'C6':
        return 2;
      case 'B5':
      case 'A#5':
      case 'A5':
        return 1;
      case 'C4':
      case 'B3':
        return -1;
      case 'A#3':
      case 'A3':
      case 'G#3':
      case 'G3':
        return -2;
      case 'F#3':
      case 'F3':
      case 'E3':
        return -3;
      case 'D#3':
      case 'D3':
      case 'C#3':
      case 'C3':
        return -4;
      case 'B2':
        return -5;
    }
  }

  return 0;
}

function mapPitchToYPosition (clef: string, pitch: string) {
  let multiplier : number;

  let base : number;

  if (clef === 'treble') {
    base = -2;
  }

  switch (pitch) {
    case 'A#5':
    case 'A5':
      multiplier = 3;
      break;
    case 'G#5':
    case 'G5':
      multiplier = 2;
      break;
    case 'F5':
      multiplier = 1;
      break;
    case 'E5':
      multiplier = 0;
      break;
    case 'D5':
      multiplier = -1;
      break;
    case 'C5':
      multiplier = -2;
      break;
    case 'B4':
      multiplier = -3;
      break;
    case 'A4':
      multiplier = -4;
      break;
    case 'G4':
      multiplier = -5;
      break;
    case 'F4':
      multiplier = -6;
      break;
    case 'E4':
      multiplier = -7;
      break;
    case 'D4':
      multiplier = -8;
      break;
    case 'C4':
      multiplier = -9;
      break;
    default:
      multiplier = 0;
  }

  return STAFF_Y_POS - (multiplier * (LINE_GAP_PX / 2));
}

class Staff extends React.Component<
  {
    allowedNotes: Array<string>
    clef: string,
    midiKeys: Array<string>
  },
  {
    hasStarted: boolean,
    notes: Array<object>,
    score: number
  }
> {
  wholeNoteSVG : fabric.Object;
  canvas : fabric.StaticCanvas;

  constructor (props) {
    super(props);

    this.state = {
      hasStarted: false,
      notes: [],
      score: 0
    };
  }

  render () {
    return <>
      <div className='mb-4'>
        <button className="btn btn-primary" onClick={() => this.start()}>Start</button>
      </div>

      <h3>Score: {this.state.score}</h3>

      <div className="border">
        <canvas id="c" width={CANVAS_WIDTH} height="400"></canvas>
      </div>
    </>;
  }

  componentDidMount () {
    this.canvas = new fabric.StaticCanvas('c');

    this.canvas.add(
      createLedgerLine(STAFF_Y_POS + (0 * LINE_GAP_PX)),
      createLedgerLine(STAFF_Y_POS + (1 * LINE_GAP_PX)),
      createLedgerLine(STAFF_Y_POS + (2 * LINE_GAP_PX)),
      createLedgerLine(STAFF_Y_POS + (3 * LINE_GAP_PX)),
      createLedgerLine(STAFF_Y_POS + (4 * LINE_GAP_PX)),
    );

    fabric.loadSVGFromURL('./img/whole-note.svg', (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.scale(2.2)
      this.wholeNoteSVG = obj;
    });
  }

  componentDidUpdate (prevProps, prevState) {
    if (!_isEqual(this.props.midiKeys, prevProps.midiKeys)) {
      if (this.props.midiKeys.length > 0) {
        console.log(prevProps.midiKeys, '-->', this.props.midiKeys)
        this.processKeys(this.props.midiKeys)
      }
    }
  }

  // -- Actions

  start () {
    if (this.state.hasStarted) {
      return;
    }

    this.setState({ hasStarted: true });

    setInterval(
      () => this.addNote(),
      2500
    );
  }

  addNote () {
    const clef = this.props.clef;
    const pitches = this.props.allowedNotes;

    this.wholeNoteSVG.clone((newNoteCanvasObject) => {
      const pitch : string = pitches[Math.floor(Math.random() * pitches.length)];
      const numberOfLedgerLines = calculateNumberOfLedgerLines(clef, pitch);
      const additionalLedgerLines = createOutOfRangeLedgerLines(numberOfLedgerLines);
      // const additionalLedgerLines = []

      for (const blah of additionalLedgerLines) {
        blah.set({
          originX: 'center',
          originY: 'top',
        })
      }

      console.log('creating note with pitch', pitch)

      const group = new fabric.Group([ newNoteCanvasObject, ...additionalLedgerLines ], {
        left: CANVAS_WIDTH,
        top: mapPitchToYPosition(clef, pitch),
        hasBorders: true,
        backgroundColor: 'pink'
      });

      newNoteCanvasObject.set({
        top: -LINE_GAP_PX / 2,
        left: 0,
        originX: 'center',
        originY: 'top',
      });

      group.animate('left', `-16`, {
        easing: linearEasing,
        onChange: this.canvas.renderAll.bind(this.canvas),
        onComplete: () => {
          this.expireCurrentNote(group)
        },
        duration: 5000
      });

      const newNote = {
        canvasObject: group,
        pitch
      };

      this.setState({ notes: [...this.state.notes, newNote] }, () => {
        this.canvas.add(group);
      });
    });
  }
newNoteCanvasObject
  processKeys (keys: Array<string>) {
    console.log('processKeys() -- notes.length =', this.state.notes.length)
    let newScore : number = this.state.score;

    if (this.state.notes.length === 0) {
      newScore -= 1;
      this.setState({ score: newScore })
      return;
    }

    const currentNote = this.state.notes[0];
    console.log('currentNote =', currentNote)
    let unshiftCurrentNote : boolean = false;

    for (const key of keys) {
      if (key === currentNote.pitch) {
        newScore += 1;
        unshiftCurrentNote = true;
      } else {
        newScore -= 1;
      }
    }

    const newState = { score: newScore };
    if (unshiftCurrentNote) {
      newState.notes = this.state.notes.slice(1)
    }

    this.setState(newState, () => {
      if (unshiftCurrentNote) {
        this.canvas.remove(currentNote.canvasObject)
      }
    })
  }

  expireCurrentNote (currentNoteCanvasObject) {
    if (this.state.notes.length === 0) {
      return;
    }

    const currentNote = this.state.notes[0]

    if (currentNoteCanvasObject !== currentNote.canvasObject) {
      return;
    }

    console.log('expireCurrentNote()', currentNote)
    this.setState({
      score: this.state.score - 1,
      notes: this.state.notes.slice(1)
    }, () => {
      this.canvas.remove(currentNote.canvasObject)
    })
  }
}

export default connect(
  (state) => {
    return {
      allowedNotes: state.settings.notes,
      clef: state.settings.clef,
      midiKeys: state.midi.midiKeysPressed
    }
  }
)(Staff)
