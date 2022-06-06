const MDCTextField = mdc.textField.MDCTextField;
const MDCRipple = mdc.ripple.MDCRipple;

let textFields;
let colorField;
let wheel;
let segments = [
  {
    label: 'segment1',
    color: '#ff0000',
    weight: 1,
    multiplier: 1,
    dest: "",
    msg: ""
  },
  {
    label: 'segment2',
    color: '#00ff00',
    weight: 1,
    multiplier: 1,
    dest: "",
    msg: ""
  },
  {
    label: 'segment3',
    color: '#0000ff',
    weight: 1,
    multiplier: 1,
    dest: "",
    msg: ""
  }
]
let selectedSegment = 0;

document.addEventListener('DOMContentLoaded', (event) => {
  let canvas = document.getElementById('canvas');
  textFields = [...document.querySelectorAll('.mdc-text-field')].map(field => new MDCTextField(field));
  colorField = document.querySelector('#color');
  newButton = document.querySelector('#new');
  deleteButton = document.querySelector("#delete");

  createWheel();
  updateConfigString();

  canvas.onclick = (e) => {
    const clickedSegment = wheel.getSegmentNumberAt(e.clientX, e.clientY);
    if (clickedSegment)
      setSelectedSegment(clickedSegment - 1);
  };

  textFields[0].input.onchange = (e) => {
    segments[selectedSegment].label = e.target.value;
    wheel.segments[selectedSegment + 1].text = segment.label;
    wheel.draw();
    updateConfigString();
  };
  textFields[1].input.onchange = (e) => {
    const value = parseInt(e.target.value);
    segments[selectedSegment].weight = !!value ? value : 1;
    textFields[1].value = segments[selectedSegment].weight;
    adjustWeights();
    wheel.draw()
    updateConfigString();
  };
  textFields[2].input.onchange = (e) => {
    const value = parseInt(e.target.value);
    segments[selectedSegment].multiplier = !!value ? value : 1;
    textFields[2].value = segments[selectedSegment].multiplier;
    updateConfigString();
  };
  textFields[3].input.onchange = (e) => {
    segments[selectedSegment].dest = e.target.value;
    updateConfigString();
  };
  textFields[4].input.onchange = (e) => {
    segments[selectedSegment].msg = e.target.value;
    updateConfigString();
  };
  textFields[5].input.onchange = (e) => {
    segments = JSON.parse(e.target.value);
    createWheel();
    updateConfigString();
  };
  colorField.onchange = (e) => {
    segments[selectedSegment].color = e.target.value;
    wheel.segments[selectedSegment + 1].fillStyle = e.target.value;
    wheel.draw();
    updateConfigString();
  }

  newButton.onclick = () => {
    const segment = {
      label: 'newSegment',
      color: random_hex_color_code(),
      weight: 1,
      multiplier: 1,
      dest: "",
      msg: ""
    };
    segments.push(segment)
    wheel.addSegment({
      text: segment.label,
      fillStyle: segment.color,
    })
    adjustWeights();
    setSelectedSegment(segments.length - 1);
    updateConfigString();
  }

  deleteButton.onclick = () => {
    segments.splice(selectedSegment, 1);
    wheel.deleteSegment(selectedSegment + 1);
    adjustWeights();
    setSelectedSegment(segments.length - 1);
    updateConfigString();
  }

});

function createWheel() {
  let sumWeights = getSumWeights();

  const displaySegments = segments.map(segment => ({
    text: segment.label,
    fillStyle: segment.color ?? '#000000',
    size: 360 * segment.weight / sumWeights
  }))
  wheel = new Winwheel({
    outerRadius: 412 / 2,      // Set outer radius so wheel fits inside the background.
    innerRadius: 70,        // Make wheel hollow so segments don't go all way to center.
    textFontSize: 20,          // Set default font size for the segments.
    textOrientation: 'vertical',                  // Make text vertial so goes down from the outside of wheel.
    textAlignment: 'outer',                       // Align text to outside of wheel.
    numSegments: segments.length,                 // Specify number of segments.
    segments: displaySegments,                           // Define segments including colour and text.
    pins: {
      number: 30,
    },
  });
  wheel.draw();
  setSelectedSegment(0);
}

function setSelectedSegment(index) {
  segment = segments[index];
  textFields[0].value = segment.label ?? '';
  textFields[1].value = segment.weight ?? 1;
  textFields[2].value = segment.multiplier ?? 1;
  textFields[3].value = segment.dest ?? '';
  textFields[4].value = segment.msg ?? '';
  colorField.value = segment.color ?? '#000000';

  if (selectedSegment < segments.length)
    wheel.segments[selectedSegment + 1].lineWidth = null;
  wheel.segments[index + 1].lineWidth = 8;

  wheel.draw();
  selectedSegment = index;
}

function updateConfigString() {
  textFields[5].value = JSON.stringify(segments);
}

function adjustWeights() {
  let sumWeights = getSumWeights();
  segments.forEach((segment, index) => wheel.segments[index + 1].size = 360 * segment.weight / sumWeights);
  wheel.updateSegmentSizes();
}

function getSumWeights() {
  let sumWeights = 0;
  const weights = segments.map(segment => segment.weight).filter(s => s);
  if (segments && weights) {
    sumWeights = weights.reduce((sum, weight) => sum + weight, 0);
  }
  return sumWeights;
}

const random_hex_color_code = () => {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return '#' + n.slice(0, 6);
};