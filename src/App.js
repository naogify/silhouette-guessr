import React, { useRef, useLayoutEffect, useState, useMemo } from "react"
import DeckGL from '@deck.gl/react'
import {TerrainLayer, Tile3DLayer} from '@deck.gl/geo-layers'
import {Tiles3DLoader} from '@loaders.gl/3d-tiles'
import {FirstPersonView} from '@deck.gl/core'
import distance from '@turf/distance';
import {point} from '@turf/helpers';
import Button from 'react-bootstrap/Button';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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

function App() {
  const mapNode = useRef(null)
  const mapDiv = useRef(null)
  const scoreDiv = useRef(null)  
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
  const initialLngLat = useMemo(() => initialLngLats[getRandomInt(14)], [])
  const [guessedLngLat, setGuessedLngLat] = useState(null);
  
  useLayoutEffect(() => {

    if (!mapDiv.current) { return }
    if (mapNode.current !== null) { return }

    mapNode.current = new geolonia.Map({
      container: mapDiv.current,
      style: 'geolonia/basic',
      interactive: true,
      center: [initialLngLat.lng, initialLngLat.lat],
      zoom: 10,
      pitch: 0,
    })

    mapNode.current.on('click', event => {
      guessedMarker
        .setLngLat(event.lngLat)
        .addTo(mapNode.current);
      
      setGuessedLngLat(event.lngLat)
    })

  }, [mapDiv, initialLngLat.lng, initialLngLat.lat])

  const calculateDistance = (initial, guessed) => {

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

  const view = new FirstPersonView({
    // fovy: 100,
    far:10000,
    controller: {
      keyboard: {
        moveSpeed: 100,
      }, 
      inertia: 100
  }});

  const terrainLayer = new TerrainLayer({
    id: "terrain",
    minZoom: 0,
    maxZoom: 14,
    elevationDecoder: {
      rScaler: 6553.6,
      gScaler: 25.6,
      bScaler: 0.1,
      offset: -9965
    },
    elevationData: 'https://tileserver-dev.geolonia.com/gsi-dem/tiles/{z}/{x}/{y}.png',
    texture: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
    wireframe: false,
    color: [255, 255, 255],
    pickable: false,
    opacity: 0.5
  });

  const tile3DLayer = new Tile3DLayer({
    id: 'tile-3d-layer',
    pointSize: 1,
    data: 'https://raw.githubusercontent.com/naogify/silhouette-gusser/main/public/tile3d/tileset.json',
    loader: Tiles3DLoader,
    pickable: true,
    opacity: 0.8
  })

  return (
    <>
      <div
        ref={mapDiv}
        id="mini-map"
      />
      <div
        ref={scoreDiv}
        id="score"
      ></div>
      <Button
        id="guess-btn"
        onClick={()=> calculateDistance(initialLngLat, guessedLngLat)}
        variant="primary"
      >Guess</Button>
      <DeckGL
        views={view}
        mapStyle={'geolonia/gsi'}
        initialViewState={{
          longitude: initialLngLat.lng,
          latitude: initialLngLat.lat,
          pitch: 0,
          bearing: 0,
          maxPitch: 0,
          minPitch: 0,
          position: [0, 0, 100]
        }}
        controller={true}
        layers={[terrainLayer, tile3DLayer]}
      />
    </>
  )
}

export default App;
