import React, { useRef, useLayoutEffect, useState, useMemo, useCallback } from "react"
import DeckGL from '@deck.gl/react'
import {TerrainLayer, Tile3DLayer} from '@deck.gl/geo-layers'
import {Tiles3DLoader} from '@loaders.gl/3d-tiles'
import {FirstPersonView, FlyToInterpolator} from '@deck.gl/core'
import {guessedMarker, getRandomInt, initialLngLats, calculateDistance} from './util'
import Button from 'react-bootstrap/Button';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const { geolonia } = window

function App() {
  const mapNode = useRef(null)
  const mapDiv = useRef(null)
  const scoreDiv = useRef(null)  
  const [guessedLngLat, setGuessedLngLat] = useState(null);

  const initialLngLat = useMemo(() => { 
    return initialLngLats[getRandomInt(14)] 
  }, [])
  
  const [initialViewState, setInitialViewState] = useState({
    longitude: initialLngLat.lng,
    latitude: initialLngLat.lat,
    zoom: 11,
    pitch: 45,
    bearing: 0,
    maxPitch: 50,
    minPitch: 0,
    position: [0, 100, 500]
  });

  const goToStart = useCallback(() => {

    setInitialViewState({
      longitude: initialLngLat.lng,
      latitude: initialLngLat.lat,
      zoom: 11,
      pitch: 45,
      bearing: 0,
      position: [0, 100, 500],
      transitionInterpolator: new FlyToInterpolator()
    })
  }, [initialLngLat]);
  
  useLayoutEffect(() => {

    if (!mapDiv.current) { return }
    if (mapNode.current !== null) { return }

    mapNode.current = new geolonia.Map({
      container: mapDiv.current,
      style: 'geolonia/basic',
      interactive: true,
      center: [initialLngLat.lng, initialLngLat.lat],
      zoom: 11.5,
      pitch: 0,
    })

    mapNode.current.on('click', event => {
      guessedMarker
        .setLngLat(event.lngLat)
        .addTo(mapNode.current);
      
      setGuessedLngLat(event.lngLat)
    })

  }, [mapDiv, initialLngLat.lng, initialLngLat.lat])

  const view = new FirstPersonView({
    far:3000,
    controller: {
      keyboard: {
        moveSpeed: 10000,
      }, 
  }});

  /**
   * このサンプルで使用しているDEMタイルは無料で使っていただいても問題ありませんが、まだテスト中のため予告なく仕様変更されたり、削除されたりする可能性がありますので、あらかじめご了承ください。
   */
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
    elevationData: 'https://tileserver.geolonia.com/gsi-dem/tiles/{z}/{x}/{y}.png?v=1.0.0%2B497d8d48d54c79041032ae681e92e691&key=YOUR-API-KEY',
    texture: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
    wireframe: false,
    material: false,
    color: [211,211,211],
    pickable: false,
    opacity: 0.1
  });

  const tile3DLayer = new Tile3DLayer({
    id: 'tile-3d-layer',
    data: 'https://raw.githubusercontent.com/naogify/silhouette-guessr/main/public/tile3d/tileset.json',
    loader: Tiles3DLoader,
    loadOptions: {
      tileset: {
        throttleRequests: true,
        maxRequests: 500,
        maximumMemoryUsage: 600,
        viewDistanceScale: 0.5,
        updateTransforms: false,
        loadTiles: false
      },
    },
    color: [255,255,255],
    pickable: false,
    opacity: 0.6
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
        onClick={()=> calculateDistance(initialLngLat, guessedLngLat, mapNode, scoreDiv)}
        variant="primary"
      >Guess</Button>
      <Button
        className="return-start-btn"
        onClick={goToStart}
      >Return to Start</Button>
      <DeckGL
        views={view}
        mapStyle={'geolonia/gsi'}
        initialViewState={initialViewState}
        controller={true}
        layers={[terrainLayer, tile3DLayer]}
      />
    </>
  )
}

export default App;
