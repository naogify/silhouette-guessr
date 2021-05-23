import React, { useRef, useLayoutEffect, useState } from "react"
import DeckGL from '@deck.gl/react'
import {TerrainLayer, Tile3DLayer} from '@deck.gl/geo-layers'
import {Tiles3DLoader} from '@loaders.gl/3d-tiles'
import {FirstPersonView} from '@deck.gl/core'
import distance from '@turf/distance';
import {point} from '@turf/helpers';
import './App.css';

const { geolonia } = window

const initialMarker = new geolonia.Marker({
  color: "#FF0000",
  draggable: true,
})

const guessedMarker = new geolonia.Marker({
  color: "#FF0000",
  draggable: true
})

function App() {
  const mapNode = useRef(null)
  const mapDiv = useRef(null)
  const scoreDiv = useRef(null)  
  const initialLngLat = {lng: 139.746247, lat: 35.659103}
  const [guessedLngLat, setGuessedLngLat] = useState(null);
  
  useLayoutEffect(() => {

    if (!mapDiv.current) { return }
    if (mapNode.current !== null) { return }

    mapNode.current = new geolonia.Map({
      container: mapDiv.current,
      style: 'geolonia/basic',
      interactive: true,
      center: [initialLngLat.lng, initialLngLat.lat],
      zoom: 14,
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
    controller: {
      keyboard: {
        moveSpeed: 100,
      }, 
      inertia: 1
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
      <button
        onClick={()=> calculateDistance(initialLngLat, guessedLngLat)}
        id="guess-btn"
      >
        Guess
      </button>
      <DeckGL
        views={view}
        mapStyle={'geolonia/gsi'}
        initialViewState={{
          longitude: initialLngLat.lng,
          latitude: initialLngLat.lat,
          zoom: 14,
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
