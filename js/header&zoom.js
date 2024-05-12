var prev_state;
var imZooming = false;
var imPanning = false;
var bdActive = false;

function headerOver() {
  prev_state = imZooming;
  imZooming = false;
  imPanning = false;
}

function headerOut() {
  imZooming = prev_state;
  imPanning = false;
}
