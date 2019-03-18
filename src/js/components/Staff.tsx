import { fabric } from 'fabric';
import * as React from 'react';
import { connect } from 'react-redux';
import { isEqual as _isEqual } from 'lodash';

const CANVAS_WIDTH : number = 400;

const LINE_GAP_PX : number = 16;
const STAFF_Y_POS : number = 100;

function linearEasing (t: number, b: number, c: number, d: number) {
  return c*t/d + b;
}

function createLine (y: number) {
  return new fabric.Line([0, y, CANVAS_WIDTH, y], {
    fill: 'black',
    stroke: 'black',
    strokeWidth: 1,
    selectable: false,
    evented: false,
  });
}

function mapPitchToYPosition (pitch: string) {
  let multiplier : number;

  switch (pitch) {
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
    midiKeys: Array<string>
  },
  {
    hasStarted: boolean,
    notes: Array<object>
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
      createLine(STAFF_Y_POS + (0 * LINE_GAP_PX)),
      createLine(STAFF_Y_POS + (1 * LINE_GAP_PX)),
      createLine(STAFF_Y_POS + (2 * LINE_GAP_PX)),
      createLine(STAFF_Y_POS + (3 * LINE_GAP_PX)),
      createLine(STAFF_Y_POS + (4 * LINE_GAP_PX)),
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
    const pitches = [
      'C4',
      'D4',
      'E4',
      'F4',
      'G4',
      'A4',
      'B4',
      'C5',
      'D5',
      'E5',
      'F5',
      'G5',
    ];

    this.wholeNoteSVG.clone((newNoteCanvasObject) => {
      const pitch : string = pitches[Math.floor(Math.random() * pitches.length)];
      console.log('creating note with pitch', pitch)

      newNoteCanvasObject.set({
        left: CANVAS_WIDTH,
        top: mapPitchToYPosition(pitch)
      });

      newNoteCanvasObject.animate('left', `-16`, {
        easing: linearEasing,
        onChange: this.canvas.renderAll.bind(this.canvas),
        onComplete: (a,b,c,d) => {
          console.log(a,b,c,d)
          this.expireCurrentNote(newNoteCanvasObject)
        },
        duration: 5000
      });

      const newNote = {
        canvasObject: newNoteCanvasObject,
        pitch
      };

      this.setState({ notes: [...this.state.notes, newNote] }, () => {
        this.canvas.add(newNoteCanvasObject);
      });
    });
  }

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
    let unshiftCurrentNote : bool = false;

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
      midiKeys: state.midi.midiKeysPressed
    }
  }
)(Staff)
