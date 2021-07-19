import distance from '@turf/distance';
import {point} from '@turf/helpers';
const { geolonia } = window

const initialMarker = new geolonia.Marker({
  color: "#FF0000",
  draggable: true,
})

const guessedMarker = new geolonia.Marker({
  color: "#FF0000",
  draggable: true
})

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

const initialLngLats = [
  {lng: 139.746247, lat: 35.659103},
  {lng: 139.775039823498, lat: 35.62688839051935},
  {lng: 139.7425465928838, lat: 35.62901450284541},
  {lng: 139.73098887729316, lat: 35.634774933759935},
  {lng: 139.73084512638385, lat: 35.64045446313923},
  {lng: 139.73081620816902, lat: 35.64998949295825},
  {lng: 139.726025422902, lat: 35.652420489771295},
  {lng: 139.7410097090811, lat: 35.65267872518089},
  {lng: 139.75412546592008, lat: 35.665835434143766},
  {lng: 139.73210944808986, lat: 35.67121154298727},
  {lng: 139.7148656884602, lat: 35.66547356765915},
  {lng: 139.7303179953378, lat: 35.676509652592905},
  {lng: 139.75763097559113, lat: 35.665074208904436},
]

const calculateDistance = (initial, guessed, mapNode, scoreDiv) => {

  if (!initial || !guessed) {
    return false
  }

  const fromPoints = [guessed.lng, guessed.lat]
  const toPoints = [initial.lng, initial.lat]

  const from = point(fromPoints);
  const to = point(toPoints);
  const actualDistance = distance(from, to) * 1000

  scoreDiv.current.innerHTML = `${Math.round(actualDistance)}m`

  initialMarker
    .setLngLat(initial)
    .addTo(mapNode.current);

  mapNode.current.addSource('line-marker', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': [fromPoints, toPoints]
        }
      }
  });

  mapNode.current.addLayer({
      'id': 'line',
      'type': 'line',
      'source': 'line-marker',
      'layout': {
      },
      'paint': {
        'line-color': '#000000',
        'line-width': 5
      }
  });
}

export {guessedMarker, getRandomInt, initialLngLats, calculateDistance}