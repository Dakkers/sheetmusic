import * as React from 'react';
import { fabric } from 'fabric';

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
      multiplier = -0;
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
    default:
      multiplier = 0;
  }

  return STAFF_Y_POS - (multiplier * (LINE_GAP_PX / 2));
}

export default class Staff extends React.Component<
  {
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
      notes: []
    };
  }

  render () {
    return <>
      <div className='mb-4'>
        <button className="btn btn-primary" onClick={() => this.start()}>Start</button>
      </div>

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

  start () {
    if (this.state.hasStarted) {
      return;
    }

    this.setState({ hasStarted: true });

    setInterval(
      () => this.addNote(),
      1000
    );
  }

  addNote () {
    const pitches = [
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

      newNoteCanvasObject.animate('left', `-100`, {
        easing: linearEasing,
        onChange: this.canvas.renderAll.bind(this.canvas),
        onComplete: () => this.canvas.remove(newNoteCanvasObject),
        duration: 5000
      });

      this.canvas.add(newNoteCanvasObject);

      const newNote = {
        canvasObject: newNoteCanvasObject,
        pitch
      };

      this.state.notes.push(newNote);
    });

    // this.canvas.add(this.wholeNoteSVG);
  }
}
