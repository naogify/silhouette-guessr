import React, { useRef, useLayoutEffect } from "react"
import DeckGL from '@deck.gl/react'
import {TerrainLayer, Tile3DLayer} from '@deck.gl/geo-layers'
import {Tiles3DLoader} from '@loaders.gl/3d-tiles'
import {FirstPersonView} from '@deck.gl/core'
import './App.css';

function App() {
  const mapDiv = useRef(null)
  const longLat = {lon: 139.7673068, lat: 35.6809591}

  const { geolonia } = window

  useLayoutEffect(() => {

    if (!mapDiv.current) { return }

    new geolonia.Map(
      {
        container: mapDiv.current,
        style: 'geolonia/basic',
        interactive: true,
        center: [longLat.lon, longLat.lat],
        zoom: 14,
        pitch: 0,
      })

  }, [mapDiv, geolonia])

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
    data: 'https://raw.githubusercontent.com/naogify/deckgl-3d-tiles/main/tileset.json',
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
      <DeckGL
        views={view}
        mapStyle={'geolonia/gsi'}
        initialViewState={{
          longitude: longLat.lon,
          latitude: longLat.lat,
          zoom: 14,
          pitch: 0,
          bearing: 0,
          maxPitch: 0,
          minPitch: 0,
          position: [0, 0, 70]
        }}
        controller={true}
        layers={[terrainLayer, tile3DLayer]}
      />
    </>
  )
}

export default App;
