# Setup | React Leaflet

  * [](/)
  * Getting started
  * Setup

Version: v5.x

# Setup

  1. Follow all the steps from the [installation page](/docs/start-installation/)
  2. Add the following code to your app and check it displays correctly:

Live Editor

    
    
    <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[51.505, -0.09]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
    

Result

Loading...

If the map is not displayed properly, it is most likely because you haven't
followed all the prerequisites.

  1. Make sure all dependencies are installed and using supported versions
  2. Make sure Leaflet's CSS is loaded
  3. Make sure your map container has a defined height

If you're still having trouble, you can use the [`react-leaflet` tag on Stack
Overflow](https://stackoverflow.com/questions/tagged/react-leaflet).

[PreviousInstallation](/docs/start-installation/)[NextPopup with
Marker](/docs/example-popup-marker/)

# Map creation and interactions | React Leaflet

  * [](/)
  * Public API
  * Map creation and interactions

Version: v5.x

On this page

# Map creation and interactions

## MapContainer​

The `MapContainer` component is responsible for creating the [Leaflet
Map](https://leafletjs.com/reference.html#map) instance and providing it to
its [child components](/docs/api-components/), using a [React
Context](https://react.dev/reference/react/createContext).

When creating a `MapContainer` element, its props are used as options to
[create the Map instance](https://leafletjs.com/reference.html#map-l-map).

The following additional props are supported:

Prop| Type| `bounds`| `LatLngBoundsExpression`| `boundsOptions`|
`FitBoundsOptions`| `children`| `ReactNode`| `className`| `string`| `id`|
`string`| `placeholder`| `ReactNode`| `style`| `CSSProperties`| `whenReady`|
`() => void`  
---|---  
  
Except for its `children`, `MapContainer` props are **immutable** : changing
them after they have been set a first time will have no effect on the Map
instance or its container.  
The Leaflet `Map` instance created by the `MapContainer` element can be
accessed by [child components](/docs/api-components/) using one of the
provided hooks.

  * Absolute specifier import
  * Bare specifier import

    
    
    import { MapContainer } from 'https://cdn.esm.sh/react-leaflet/MapContainer'  
    
    
    
    import { MapContainer } from 'react-leaflet/MapContainer'  
    

## Hooks​

### useMap​

Hook providing the Leaflet `Map` instance in any descendant of a
`MapContainer`.

    
    
    function MyComponent() {  
      const map = useMap()  
      console.log('map center:', map.getCenter())  
      return null  
    }  
      
    function MyMapComponent() {  
      return (  
        <MapContainer center={[50.5, 30.5]} zoom={13}>  
          <MyComponent />  
        </MapContainer>  
      )  
    }  
    

  * Absolute specifier import
  * Bare specifier import

    
    
    import { useMap } from 'https://cdn.esm.sh/react-leaflet/hooks'  
    
    
    
    import { useMap } from 'react-leaflet/hooks'  
    

### useMapEvents​

Hook attaching the provided `LeafletEventHandlerFnMap` event handlers to the
map instance and returning the instance in any descendant of a `MapContainer`.

    
    
    function MyComponent() {  
      const map = useMapEvents({  
        click: () => {  
          map.locate()  
        },  
        locationfound: (location) => {  
          console.log('location found:', location)  
        },  
      })  
      return null  
    }  
      
    function MyMapComponent() {  
      return (  
        <MapContainer center={[50.5, 30.5]} zoom={13}>  
          <MyComponent />  
        </MapContainer>  
      )  
    }  
    

  * Absolute specifier import
  * Bare specifier import

    
    
    import { useMapEvents } from 'https://cdn.esm.sh/react-leaflet/hooks'  
    
    
    
    import { useMapEvents } from 'react-leaflet/hooks'  
    

### useMapEvent​

Hook attaching a single event handler to the map instance and returning the
instance in any descendant of a `MapContainer`.

    
    
    function MyComponent() {  
      const map = useMapEvent('click', () => {  
        map.setView([50.5, 30.5], map.getZoom())  
      })  
      return null  
    }  
      
    function MyMapComponent() {  
      return (  
        <MapContainer center={[50.5, 30.5]} zoom={13}>  
          <MyComponent />  
        </MapContainer>  
      )  
    }  
    

  * Absolute specifier import
  * Bare specifier import

    
    
    import { useMapEvent } from 'https://cdn.esm.sh/react-leaflet/hooks'  
    
    
    
    import { useMapEvent } from 'react-leaflet/hooks'  
    

[PreviousMap placeholder](/docs/example-map-placeholder/)[NextChild
components](/docs/api-components/)

  * MapContainer
  * Hooks
    * useMap
    * useMapEvents
    * useMapEvent

# Child components | React Leaflet

  * [](/)
  * Public API
  * Child components

Version: v5.x

On this page

# Child components

MapContainer required

Child components can only be used as descendants of a [MapContainer
component](/docs/api-map/#mapcontainer).

## Props​

Child components in React Leaflet use their props as options when creating the
corresponding Leaflet instance, as described in [Leaflet's
documentation](https://leafletjs.com/reference.html).

By default these props should be treated as **immutable** , only the props
explicitely documented as **mutable** in this page will affect the Leaflet
element when changed.

## Behaviors​

Child components in React Leaflet support common behaviors described below,
implementing logic related to React or Leaflet.

### ParentComponent behavior​

The component will render its mutable React children components, based on the
`children?: ReactNode` prop.

    
    
    <Marker position={[50.5, 30.5]}>  
      <Popup>Hello world</Popup>  
    </Marker>  
    

### Evented behavior​

Adds support for the `eventHandlers?: LeafletEventHandlerFnMap` prop, adding
and removing event listeners.

    
    
    <Marker  
      position={[50.5, 30.5]}  
      eventHandlers={{  
        click: () => {  
          console.log('marker clicked')  
        },  
      }}  
    />  
    

### Attribution behavior​

Applies to layer components, making their
[`attribution`](https://leafletjs.com/reference.html#layer-attribution) prop
mutable.

    
    
    <GeoJSON attribution="&copy; credits due..." data={...} />  
    

### Pane behavior​

Applies to layer components, adding support for the
[`pane`](https://leafletjs.com/reference.html#layer-pane) prop or context from
a `Pane` component ancestor.

    
    
    <Circle center={[50.5, 30.5]} radius={200} pane="my-existing-pane" />  
    
    
    
    <Pane name="custom" style={{ zIndex: 100 }}>  
      <Circle center={[50.5, 30.5]} radius={200} />  
    </Pane>  
    

### Path behavior​

Applies to vector layer components, adding support for a [`pathOptions:
PathOptions`](https://leafletjs.com/reference.html#path) mutable prop.

    
    
    <Circle center={[50.5, 30.5]} radius={200} pathOptions={{ color: 'blue' }} />  
    

### MediaOverlay behavior​

Applies to components using [Leaflet's ImageOverlay
class](https://leafletjs.com/reference.html#imageoverlay), adding support for
mutable [`bounds:
LatLngBounds`](https://leafletjs.com/reference.html#latlngbounds), [`opacity:
number`](https://leafletjs.com/reference.html#imageoverlay-opacity) and
[`zIndex: number`](https://leafletjs.com/reference.html#imageoverlay-zindex)
props.

    
    
    const bounds = new LatLngBounds([40.712216, -74.22655], [40.773941, -74.12544])  
      
    <ImageOverlay  
      url="http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg"  
      bounds={bounds}  
      opacity={0.5}  
      zIndex={10}  
    />  
    

### CircleMarker behavior​

Applies to components using [Leaflet's CircleMarker
class](https://leafletjs.com/reference.html#circlemarker), adding support for
mutable `center: LatLngExpression` and [`radius:
number`](https://leafletjs.com/reference.html#circlemarker-radius) props.

    
    
    <Circle center={[50.5, 30.5]} radius={200} />  
    

### GridLayer behavior​

Applies to components using [Leaflet's GridLayer
class](https://leafletjs.com/reference.html#gridlayer), adding support for
mutable [`opacity: number`](https://leafletjs.com/reference.html#gridlayer-
opacity) and [`zIndex:
number`](https://leafletjs.com/reference.html#gridlayer-zindex) props.

    
    
    <TileLayer url="..." opacity={0.5} zIndex={10} />  
    

### Control behavior​

Applies to control components, making their [`position:
ControlPosition`](https://leafletjs.com/reference.html#control-position) prop
mutable.

    
    
    <ZoomControl position="bottomleft" />  
    

## UI layers​

### Marker​

[Leaflet reference](https://leafletjs.com/reference.html#marker)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**| Attribution| `children`| `ReactNode`| No| **Yes**| ParentComponent| `draggable`| `boolean`| No| **Yes**| | `eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `icon`| `Leaflet.Icon`| No| **Yes**| | `opacity`| `number`| No| **Yes**| | `pane`| `string`| No| No| Pane| `position`| `LatLngExpression`| **Yes**| **Yes**| | `zIndexOffset`| `number`| No| **Yes**|   
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { Marker } from 'https://cdn.esm.sh/react-leaflet/Marker'  
    
    
    
    import { Marker } from 'react-leaflet/Marker'  
    

### Popup​

[Leaflet reference](https://leafletjs.com/reference.html#popup)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**|
Attribution| `children`| `ReactNode`| No| **Yes**| ParentComponent|
`eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `pane`|
`string`| No| No| Pane| `position`| `LatLngExpression`| No| **Yes**|  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { Popup } from 'https://cdn.esm.sh/react-leaflet/Popup'  
    
    
    
    import { Popup } from 'react-leaflet/Popup'  
    

### Tooltip​

[Leaflet reference](https://leafletjs.com/reference.html#tooltip)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**|
Attribution| `children`| `ReactNode`| No| **Yes**| ParentComponent|
`eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `pane`|
`string`| No| No| Pane| `position`| `LatLngExpression`| No| **Yes**|  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { Tooltip } from 'https://cdn.esm.sh/react-leaflet/Tooltip'  
    
    
    
    import { Tooltip } from 'react-leaflet/Tooltip'  
    

## Raster layers​

### TileLayer​

[Leaflet reference](https://leafletjs.com/reference.html#tilelayer)

**Props**

Prop| Type| Required| Mutable| Behavior| `eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `opacity`| `number`| No| **Yes**| GridLayer| `pane`| `string`| No| No| Pane| `url`| `string`| **Yes**| **Yes**| | `zIndex`| `number`| No| **Yes**| GridLayer  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { TileLayer } from 'https://cdn.esm.sh/react-leaflet/TileLayer'  
    
    
    
    import { TileLayer } from 'react-leaflet/TileLayer'  
    

### WMSTileLayer​

[Leaflet reference](https://leafletjs.com/reference.html#tilelayer-wms)

**Props**

Prop| Type| Required| Mutable| Behavior| `eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `opacity`| `number`| No| **Yes**| GridLayer| `pane`| `string`| No| No| Pane| `params`| `WMSParams`| No| **Yes**| | `url`| `string`| **Yes**|  No| | `zIndex`| `number`| No| **Yes**| GridLayer  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { WMSTileLayer } from 'https://cdn.esm.sh/react-leaflet/WMSTileLayer'  
    
    
    
    import { WMSTileLayer } from 'react-leaflet/WMSTileLayer'  
    

### ImageOverlay​

[Leaflet reference](https://leafletjs.com/reference.html#imageoverlay)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**| Attribution| `bounds`| `LatLngBounds`| **Yes**| **Yes**| MediaOverlay| `children`| `ReactNode`| No| **Yes**| ParentComponent| `eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `opacity`| `number`| No| **Yes**| MediaOverlay| `url`| `string`| **Yes**| **Yes**| | `zIndex`| `number`| No| **Yes**| MediaOverlay  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { ImageOverlay } from 'https://cdn.esm.sh/react-leaflet/ImageOverlay'  
    
    
    
    import { ImageOverlay } from 'react-leaflet/ImageOverlay'  
    

### VideoOverlay​

[Leaflet reference](https://leafletjs.com/reference.html#videooverlay)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**| Attribution| `bounds`| `LatLngBounds`| **Yes**| **Yes**| MediaOverlay| `eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `play`| `boolean`| No| **Yes**| | `url`| `string`, `string[]` or `HTMLVideoElement`| **Yes**| **Yes**| | `zIndex`| `number`| No| **Yes**| MediaOverlay  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { VideoOverlay } from 'https://cdn.esm.sh/react-leaflet/VideoOverlay'  
    
    
    
    import { VideoOverlay } from 'react-leaflet/VideoOverlay'  
    

## Vector layers​

### Circle​

[Leaflet reference](https://leafletjs.com/reference.html#circle)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**| Attribution| `center`| `LatLngExpression`| **Yes**| **Yes**| | `children`| `ReactNode`| No| **Yes**| ParentComponent| `eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `pane`| `string`| No| No| Pane| `pathOptions`| `PathOptions`| No| **Yes**| Path| `radius`| `number`| **Yes**| **Yes**|   
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { Circle } from 'https://cdn.esm.sh/react-leaflet/Circle'  
    
    
    
    import { Circle } from 'react-leaflet/Circle'  
    

### CircleMarker​

[Leaflet reference](https://leafletjs.com/reference.html#circlemarker)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**| Attribution| `center`| `LatLngExpression`| **Yes**| **Yes**| | `children`| `ReactNode`| No| **Yes**| ParentComponent| `eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `pane`| `string`| No| No| Pane| `pathOptions`| `PathOptions`| No| **Yes**| Path| `radius`| `number`| **Yes**| **Yes**|   
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { CircleMarker } from 'https://cdn.esm.sh/react-leaflet/CircleMarker'  
    
    
    
    import { CircleMarker } from 'react-leaflet/CircleMarker'  
    

### Polyline​

[Leaflet reference](https://leafletjs.com/reference.html#polyline)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**|
Attribution| `children`| `ReactNode`| No| **Yes**| ParentComponent|
`eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `pane`|
`string`| No| No| Pane| `pathOptions`| `PathOptions`| No| **Yes**| Path|
`positions`| `LatLngExpression[]` or `LatLngExpression[][]`| **Yes**| **Yes**|  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { Polyline } from 'https://cdn.esm.sh/react-leaflet/Polyline'  
    
    
    
    import { Polyline } from 'react-leaflet/Polyline'  
    

### Polygon​

[Leaflet reference](https://leafletjs.com/reference.html#polygon)

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**|
Attribution| `children`| `ReactNode`| No| **Yes**| ParentComponent|
`eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `pane`|
`string`| No| No| Pane| `pathOptions`| `PathOptions`| No| **Yes**| Path|
`positions`| `LatLngExpression[]`, `LatLngExpression[][]` or
`LatLngExpression[][][]`| **Yes**| **Yes**|  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { Polygon } from 'https://cdn.esm.sh/react-leaflet/Polygon'  
    
    
    
    import { Polygon } from 'react-leaflet/Polygon'  
    

### Rectangle​

[Leaflet reference](https://leafletjs.com/reference.html#rectangle)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**| Attribution| `bounds`| `LatLngBoundsExpression`| **Yes**| **Yes**| | `children`| `ReactNode`| No| **Yes**| ParentComponent| `eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `pane`| `string`| No| No| Pane| `pathOptions`| `PathOptions`| No| **Yes**| Path  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { Rectangle } from 'https://cdn.esm.sh/react-leaflet/Rectangle'  
    
    
    
    import { Rectangle } from 'react-leaflet/Rectangle'  
    

### SVGOverlay​

[Leaflet reference](https://leafletjs.com/reference.html#svgoverlay)

**Props**

The `attributes` must be valid [`SVGSVGElement`
properties](https://developer.mozilla.org/en-US/docs/Web/API/SVGSVGElement).

Prop| Type| Required| Mutable| Behavior| `attributes`| `Record<string, string>`| No| No| | `attribution`| `string`| No| **Yes**| Attribution| `children`| `ReactNode`| No| **Yes**| ParentComponent| `pane`| `string`| No| No| Pane  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { SVGOverlay } from 'https://cdn.esm.sh/react-leaflet/SVGOverlay'  
    
    
    
    import { SVGOverlay } from 'react-leaflet/SVGOverlay'  
    

## Other layers​

### LayerGroup​

[Leaflet reference](https://leafletjs.com/reference.html#layergroup)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**|
Attribution| `children`| `ReactNode`| No| **Yes**| ParentComponent|
`eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `pane`|
`string`| No| No| Pane  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { LayerGroup } from 'https://cdn.esm.sh/react-leaflet/LayerGroup'  
    
    
    
    import { LayerGroup } from 'react-leaflet/LayerGroup'  
    

### FeatureGroup​

[Leaflet reference](https://leafletjs.com/reference.html#featuregroup)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**|
Attribution| `children`| `ReactNode`| No| **Yes**| ParentComponent|
`eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `pane`|
`string`| No| No| Pane  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { FeatureGroup } from 'https://cdn.esm.sh/react-leaflet/FeatureGroup'  
    
    
    
    import { FeatureGroup } from 'react-leaflet/FeatureGroup'  
    

### GeoJSON​

[Leaflet reference](https://leafletjs.com/reference.html#geojson)

**Props**

Prop| Type| Required| Mutable| Behavior| `attribution`| `string`| No| **Yes**| Attribution| `children`| `ReactNode`| No| **Yes**| ParentComponent| `data`| `GeoJsonObject`| **Yes**|  No| | `eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `pane`| `string`| No| No| Pane| `style`| `PathOptions` or `StyleFunction`| No| **Yes**|   
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { GeoJSON } from 'https://cdn.esm.sh/react-leaflet/GeoJSON'  
    
    
    
    import { GeoJSON } from 'react-leaflet/GeoJSON'  
    

## Controls​

### ZoomControl​

[Leaflet reference](https://leafletjs.com/reference.html#control-zoom)

**Props**

Prop| Type| Required| Mutable| Behavior| `eventHandlers`|
`LeafletEventHandlerFnMap`| No| **Yes**| Evented| `position`|
`ControlPosition`| No| **Yes**|  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { ZoomControl } from 'https://cdn.esm.sh/react-leaflet/ZoomControl'  
    
    
    
    import { ZoomControl } from 'react-leaflet/ZoomControl'  
    

### AttributionControl​

[Leaflet reference](https://leafletjs.com/reference.html#control-attribution)

**Props**

Prop| Type| Required| Mutable| Behavior| `eventHandlers`|
`LeafletEventHandlerFnMap`| No| **Yes**| Evented| `position`|
`ControlPosition`| No| **Yes**|  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { AttributionControl } from 'https://cdn.esm.sh/react-leaflet/AttributionControl'  
    
    
    
    import { AttributionControl } from 'react-leaflet/AttributionControl'  
    

### LayersControl​

[Leaflet reference](https://leafletjs.com/reference.html#control-layers)

**Props**

Prop| Type| Required| Mutable| Behavior| `collapsed`| `boolean`| No| **Yes**| | `eventHandlers`| `LeafletEventHandlerFnMap`| No| **Yes**| Evented| `position`| `ControlPosition`| No| **Yes**|   
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { LayersControl } from 'https://cdn.esm.sh/react-leaflet/LayersControl'  
    
    
    
    import { LayersControl } from 'react-leaflet/LayersControl'  
    

### LayersControl.BaseLayer​

Attached to the `LayersControl` component.

Note: a `ref` cannot be attached to this element, it should be attached to the
child element.

**Props**

Prop| Type| Required| Mutable| Behavior| `checked`| `boolean`| No| **Yes**| | `children`| `ReactNode`| No| **Yes**| ParentComponent| `name`| `string`| **Yes**|  No|   
---|---|---|---|---  
  
### LayersControl.Overlay​

Attached to the `LayersControl` component.

Note: a `ref` cannot be attached to this element, it should be attached to the
child element.

**Props**

Prop| Type| Required| Mutable| Behavior| `checked`| `boolean`| No| **Yes**| | `children`| `ReactNode`| No| **Yes**| ParentComponent| `name`| `string`| **Yes**|  No|   
---|---|---|---|---  
  
### ScaleControl​

[Leaflet reference](https://leafletjs.com/reference.html#control-scale)

**Props**

Prop| Type| Required| Mutable| Behavior| `eventHandlers`|
`LeafletEventHandlerFnMap`| No| **Yes**| Evented| `position`|
`ControlPosition`| No| **Yes**|  
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { ScaleControl } from 'https://cdn.esm.sh/react-leaflet/ScaleControl'  
    
    
    
    import { ScaleControl } from 'react-leaflet/ScaleControl'  
    

## Other​

### Pane​

[Leaflet reference](https://leafletjs.com/reference.html#map-pane)

**Props**

caution

The `name` prop must be unique to the pane and different from the [default
Leaflet pane names](https://leafletjs.com/reference.html#map-pane)

Prop| Type| Required| Mutable| Behavior| `children`| `ReactNode`| No| **Yes**| ParentComponent| `className`| `string`| No| No| | `name`| `string`| **Yes**|  No| | `pane`| `string`| No| No| Pane| `style`| `CSSProperties`| No| No|   
---|---|---|---|---  
  
  * Absolute specifier import
  * Bare specifier import

    
    
    import { Pane } from 'https://cdn.esm.sh/react-leaflet/Pane'  
    
    
    
    import { Pane } from 'react-leaflet/Pane'  
    

[PreviousMap creation and interactions](/docs/api-map/)[NextReact Leaflet
Core](/docs/core-introduction/)

  * Props
  * Behaviors
    * ParentComponent behavior
    * Evented behavior
    * Attribution behavior
    * Pane behavior
    * Path behavior
    * MediaOverlay behavior
    * CircleMarker behavior
    * GridLayer behavior
    * Control behavior
  * UI layers
    * Marker
    * Popup
    * Tooltip
  * Raster layers
    * TileLayer
    * WMSTileLayer
    * ImageOverlay
    * VideoOverlay
  * Vector layers
    * Circle
    * CircleMarker
    * Polyline
    * Polygon
    * Rectangle
    * SVGOverlay
  * Other layers
    * LayerGroup
    * FeatureGroup
    * GeoJSON
  * Controls
    * ZoomControl
    * AttributionControl
    * LayersControl
    * LayersControl.BaseLayer
    * LayersControl.Overlay
    * ScaleControl
  * Other
    * Pane

# Popup with Marker | React Leaflet

  * [](/)
  * Examples
  * Popup with Marker

Version: v5.x

# Popup with Marker

Live Editor

    
    
    const position = [51.505, -0.09]
    
    render(
      <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>,
    )
    

Result

Loading...

[PreviousSetup](/docs/start-setup/)[NextEvents](/docs/example-events/)

# Events | React Leaflet

  * [](/)
  * Examples
  * Events

Version: v5.x

# Events

Usage

Click the map to show a marker at your detected location

Live Editor

    
    
    function LocationMarker() {
      const [position, setPosition] = useState(null)
      const map = useMapEvents({
        click() {
          map.locate()
        },
        locationfound(e) {
          setPosition(e.latlng)
          map.flyTo(e.latlng, map.getZoom())
        },
      })
    
      return position === null ? null : (
        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>
      )
    }
    
    render(
      <MapContainer
        center={{ lat: 51.505, lng: -0.09 }}
        zoom={13}
        scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>,
    )
    

Result

Loading...

[PreviousPopup with Marker](/docs/example-popup-marker/)[NextVector
layers](/docs/example-vector-layers/)

# Vector layers | React Leaflet

  * [](/)
  * Examples
  * Vector layers

Version: v5.x

# Vector layers

Live Editor

    
    
    const center = [51.505, -0.09]
    
    const polyline = [
      [51.505, -0.09],
      [51.51, -0.1],
      [51.51, -0.12],
    ]
    
    const multiPolyline = [
      [
        [51.5, -0.1],
        [51.5, -0.12],
        [51.52, -0.12],
      ],
      [
        [51.5, -0.05],
        [51.5, -0.06],
        [51.52, -0.06],
      ],
    ]
    
    const polygon = [
      [51.515, -0.09],
      [51.52, -0.1],
      [51.52, -0.12],
    ]
    
    const multiPolygon = [
      [
        [51.51, -0.12],
        [51.51, -0.13],
        [51.53, -0.13],
      ],
      [
        [51.51, -0.05],
        [51.51, -0.07],
        [51.53, -0.07],
      ],
    ]
    
    const rectangle = [
      [51.49, -0.08],
      [51.5, -0.06],
    ]
    
    const fillBlueOptions = { fillColor: 'blue' }
    const blackOptions = { color: 'black' }
    const limeOptions = { color: 'lime' }
    const purpleOptions = { color: 'purple' }
    const redOptions = { color: 'red' }
    
    render(
      <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle center={center} pathOptions={fillBlueOptions} radius={200} />
        <CircleMarker center={[51.51, -0.12]} pathOptions={redOptions} radius={20}>
          <Popup>Popup in CircleMarker</Popup>
        </CircleMarker>
        <Polyline pathOptions={limeOptions} positions={polyline} />
        <Polyline pathOptions={limeOptions} positions={multiPolyline} />
        <Polygon pathOptions={purpleOptions} positions={polygon} />
        <Polygon pathOptions={purpleOptions} positions={multiPolygon} />
        <Rectangle bounds={rectangle} pathOptions={blackOptions} />
      </MapContainer>,
    )
    

Result

Loading...

[PreviousEvents](/docs/example-events/)[NextSVG Overlay](/docs/example-svg-
overlay/)

# SVG Overlay | React Leaflet

  * [](/)
  * Examples
  * SVG Overlay

Version: v5.x

# SVG Overlay

Live Editor

    
    
    const position = [51.505, -0.09]
    const bounds = [
      [51.49, -0.08],
      [51.5, -0.06],
    ]
    
    render(
      <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SVGOverlay attributes={{ stroke: 'red' }} bounds={bounds}>
          <rect x="0" y="0" width="100%" height="100%" fill="blue" />
          <circle r="5" cx="10" cy="10" fill="red" />
          <text x="50%" y="50%" stroke="white">
            text
          </text>
        </SVGOverlay>
      </MapContainer>,
    )
    

Result

Loading...

[PreviousVector layers](/docs/example-vector-layers/)[NextOther
layers](/docs/example-other-layers/)

# Other layers | React Leaflet

  * [](/)
  * Examples
  * Other layers

Version: v5.x

# Other layers

Live Editor

    
    
    const center = [51.505, -0.09]
    const rectangle = [
      [51.49, -0.08],
      [51.5, -0.06],
    ]
    
    const fillBlueOptions = { fillColor: 'blue' }
    const fillRedOptions = { fillColor: 'red' }
    const greenOptions = { color: 'green', fillColor: 'green' }
    const purpleOptions = { color: 'purple' }
    
    render(
      <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayerGroup>
          <Circle center={center} pathOptions={fillBlueOptions} radius={200} />
          <Circle
            center={center}
            pathOptions={fillRedOptions}
            radius={100}
            stroke={false}
          />
          <LayerGroup>
            <Circle
              center={[51.51, -0.08]}
              pathOptions={greenOptions}
              radius={100}
            />
          </LayerGroup>
        </LayerGroup>
        <FeatureGroup pathOptions={purpleOptions}>
          <Popup>Popup in FeatureGroup</Popup>
          <Circle center={[51.51, -0.06]} radius={200} />
          <Rectangle bounds={rectangle} />
        </FeatureGroup>
      </MapContainer>,
    )
    

Result

Loading...

[PreviousSVG Overlay](/docs/example-svg-overlay/)[NextTooltips](/docs/example-
tooltips/)

# Layers control | React Leaflet

  * [](/)
  * Examples
  * Layers control

Version: v5.x

# Layers control

Live Editor

    
    
    const center = [51.505, -0.09]
    const rectangle = [
      [51.49, -0.08],
      [51.5, -0.06],
    ]
    
    render(
      <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayersControl position="topright">
          <LayersControl.Overlay name="Marker with popup">
            <Marker position={center}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name="Layer group with circles">
            <LayerGroup>
              <Circle
                center={center}
                pathOptions={{ fillColor: 'blue' }}
                radius={200}
              />
              <Circle
                center={center}
                pathOptions={{ fillColor: 'red' }}
                radius={100}
                stroke={false}
              />
              <LayerGroup>
                <Circle
                  center={[51.51, -0.08]}
                  pathOptions={{ color: 'green', fillColor: 'green' }}
                  radius={100}
                />
              </LayerGroup>
            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Feature group">
            <FeatureGroup pathOptions={{ color: 'purple' }}>
              <Popup>Popup in FeatureGroup</Popup>
              <Circle center={[51.51, -0.06]} radius={200} />
              <Rectangle bounds={rectangle} />
            </FeatureGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>,
    )
    

Result

Loading...

[PreviousTooltips](/docs/example-tooltips/)[NextPanes](/docs/example-panes/)

# Panes | React Leaflet

  * [](/)
  * Examples
  * Panes

Version: v5.x

# Panes

Live Editor

    
    
    const outer = [
      [50.505, -29.09],
      [52.505, 29.09],
    ]
    const inner = [
      [49.505, -2.09],
      [53.505, 2.09],
    ]
    
    function BlinkingPane() {
      const [render, setRender] = useState(true)
      const timerRef = useRef()
      useEffect(() => {
        timerRef.current = setInterval(() => {
          setRender((r) => !r)
        }, 5000)
        return () => {
          clearInterval(timerRef.current)
        }
      }, [])
    
      return render ? (
        <Pane name="cyan-rectangle" style={{ zIndex: 500 }}>
          <Rectangle bounds={outer} pathOptions={{ color: 'cyan' }} />
        </Pane>
      ) : null
    }
    
    render(
      <MapContainer bounds={outer} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BlinkingPane />
        <Pane name="yellow-rectangle" style={{ zIndex: 499 }}>
          <Rectangle bounds={inner} pathOptions={{ color: 'yellow' }} />
          <Pane name="purple-rectangle">
            <Rectangle bounds={outer} pathOptions={{ color: 'purple' }} />
          </Pane>
        </Pane>
      </MapContainer>,
    )
    

Result

Loading...

[PreviousLayers control](/docs/example-layers-control/)[NextDraggable
Marker](/docs/example-draggable-marker/)

# Draggable Marker | React Leaflet

  * [](/)
  * Examples
  * Draggable Marker

Version: v5.x

# Draggable Marker

Live Editor

    
    
    const center = {
      lat: 51.505,
      lng: -0.09,
    }
    
    function DraggableMarker() {
      const [draggable, setDraggable] = useState(false)
      const [position, setPosition] = useState(center)
      const markerRef = useRef(null)
      const eventHandlers = useMemo(
        () => ({
          dragend() {
            const marker = markerRef.current
            if (marker != null) {
              setPosition(marker.getLatLng())
            }
          },
        }),
        [],
      )
      const toggleDraggable = useCallback(() => {
        setDraggable((d) => !d)
      }, [])
    
      return (
        <Marker
          draggable={draggable}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}>
          <Popup minWidth={90}>
            <span onClick={toggleDraggable}>
              {draggable
                ? 'Marker is draggable'
                : 'Click here to make marker draggable'}
            </span>
          </Popup>
        </Marker>
      )
    }
    
    render(
      <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker />
      </MapContainer>,
    )
    

Result

Loading...

[PreviousPanes](/docs/example-panes/)[NextView bounds](/docs/example-view-
bounds/)

# View bounds | React Leaflet

  * [](/)
  * Examples
  * View bounds

Version: v5.x

# View bounds

Usage

Click a rectangle to fit the map to its bounds

Live Editor

    
    
    const innerBounds = [
      [49.505, -2.09],
      [53.505, 2.09],
    ]
    const outerBounds = [
      [50.505, -29.09],
      [52.505, 29.09],
    ]
    
    const redColor = { color: 'red' }
    const whiteColor = { color: 'white' }
    
    function SetBoundsRectangles() {
      const [bounds, setBounds] = useState(outerBounds)
      const map = useMap()
    
      const innerHandlers = useMemo(
        () => ({
          click() {
            setBounds(innerBounds)
            map.fitBounds(innerBounds)
          },
        }),
        [map],
      )
      const outerHandlers = useMemo(
        () => ({
          click() {
            setBounds(outerBounds)
            map.fitBounds(outerBounds)
          },
        }),
        [map],
      )
    
      return (
        <>
          <Rectangle
            bounds={outerBounds}
            eventHandlers={outerHandlers}
            pathOptions={bounds === outerBounds ? redColor : whiteColor}
          />
          <Rectangle
            bounds={innerBounds}
            eventHandlers={innerHandlers}
            pathOptions={bounds === innerBounds ? redColor : whiteColor}
          />
        </>
      )
    }
    
    render(
      <MapContainer bounds={outerBounds} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetBoundsRectangles />
      </MapContainer>,
    )
    

Result

Loading...

[PreviousDraggable Marker](/docs/example-draggable-marker/)[NextAnimated
panning](/docs/example-animated-panning/)

# Animated panning | React Leaflet

  * [](/)
  * Examples
  * Animated panning

Version: v5.x

# Animated panning

Usage

Click the map to move to the location

Live Editor

    
    
    function SetViewOnClick({ animateRef }) {
      const map = useMapEvent('click', (e) => {
        map.setView(e.latlng, map.getZoom(), {
          animate: animateRef.current || false,
        })
      })
    
      return null
    }
    
    function AnimateExample() {
      const animateRef = useRef(false)
    
      return (
        <>
          <p>
            <label>
              <input
                type="checkbox"
                onChange={() => {
                  animateRef.current = !animateRef.current
                }}
              />
              Animate panning
            </label>
          </p>
          <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SetViewOnClick animateRef={animateRef} />
          </MapContainer>
        </>
      )
    }
    
    render(<AnimateExample />)
    

Result

Loading...

[PreviousView bounds](/docs/example-view-bounds/)[NextReact
control](/docs/example-react-control/)

# React control | React Leaflet

  * [](/)
  * Examples
  * React control

Version: v5.x

# React control

A custom control displaying a miniature map using React

Live Editor

    
    
    // Classes used by Leaflet to position controls
    const POSITION_CLASSES = {
      bottomleft: 'leaflet-bottom leaflet-left',
      bottomright: 'leaflet-bottom leaflet-right',
      topleft: 'leaflet-top leaflet-left',
      topright: 'leaflet-top leaflet-right',
    }
    
    const BOUNDS_STYLE = { weight: 1 }
    
    function MinimapBounds({ parentMap, zoom }) {
      const minimap = useMap()
    
      // Clicking a point on the minimap sets the parent's map center
      const onClick = useCallback(
        (e) => {
          parentMap.setView(e.latlng, parentMap.getZoom())
        },
        [parentMap],
      )
      useMapEvent('click', onClick)
    
      // Keep track of bounds in state to trigger renders
      const [bounds, setBounds] = useState(parentMap.getBounds())
      const onChange = useCallback(() => {
        setBounds(parentMap.getBounds())
        // Update the minimap's view to match the parent map's center and zoom
        minimap.setView(parentMap.getCenter(), zoom)
      }, [minimap, parentMap, zoom])
    
      // Listen to events on the parent map
      const handlers = useMemo(() => ({ move: onChange, zoom: onChange }), [])
      useEventHandlers({ instance: parentMap }, handlers)
    
      return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />
    }
    
    function MinimapControl({ position, zoom }) {
      const parentMap = useMap()
      const mapZoom = zoom || 0
    
      // Memoize the minimap so it's not affected by position changes
      const minimap = useMemo(
        () => (
          <MapContainer
            style={{ height: 80, width: 80 }}
            center={parentMap.getCenter()}
            zoom={mapZoom}
            dragging={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            attributionControl={false}
            zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MinimapBounds parentMap={parentMap} zoom={mapZoom} />
          </MapContainer>
        ),
        [],
      )
    
      const positionClass =
        (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright
      return (
        <div className={positionClass}>
          <div className="leaflet-control leaflet-bar">{minimap}</div>
        </div>
      )
    }
    
    function ReactControlExample() {
      return (
        <MapContainer center={[51.505, -0.09]} zoom={6} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MinimapControl position="topright" />
        </MapContainer>
      )
    }
    
    render(<ReactControlExample />)
    

Result

Loading...

[PreviousAnimated panning](/docs/example-animated-panning/)[NextExternal
state](/docs/example-external-state/)

# Map placeholder | React Leaflet

  * [](/)
  * Examples
  * Map placeholder

Version: v5.x

# Map placeholder

Live Editor

    
    
    function MapPlaceholder() {
      return (
        <p>
          Map of London.{' '}
          <noscript>You need to enable JavaScript to see this map.</noscript>
        </p>
      )
    }
    
    function MapWithPlaceholder() {
      return (
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          scrollWheelZoom={false}
          placeholder={<MapPlaceholder />}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      )
    }
    
    render(<MapWithPlaceholder />)
    

Result

Loading...

[PreviousExternal state](/docs/example-external-state/)[NextMap creation and
interactions](/docs/api-map/)

# React Leaflet Core | React Leaflet

  * [](/)
  * Core API
  * React Leaflet Core

Version: v5.x

On this page

# React Leaflet Core

## Introduction​

React Leaflet's core APIs are implemented in the `@react-leaflet/core` package
to provide a separation from the public APIs. The goal of this package is to
make most of React Leaflet's internal logic available to developers to easily
implement custom behaviors, such as third-party Leaflet plugins.

## Audience​

You might want to learn about the core APIs if you want to:

  * Customize how public components work, by creating an alternative implementation matching your needs
  * Implement new components not provided by React Leaflet
  * Simply learn more about how React Leaflet works

If you're only interested in using the public APIs of React Leaflet, their
usage is covered in the previous sections of this documentation, notably the
[getting started](/docs/start-introduction/) and [public API](/docs/api-map/)
pages.

## Installation​

The `@react-leaflet/core` package is a dependency of the `react-leaflet` one.
The main [installation steps](/docs/start-installation/) from the getting
started documentation should be followed to use the core APIs.

## Usage​

All the [core APIs](/docs/core-api/) can be imported from the `@react-
leaflet/core` package, such as

  * Absolute specifier import
  * Bare specifier import

    
    
    import { createControlComponent } from 'https://cdn.esm.sh/@react-leaflet/core'  
    import { Control } from 'https://cdn.esm.sh/leaflet'  
      
    export const ZoomControl = createControlComponent(  
      (props) => new Control.Zoom(props),  
    )  
    
    
    
    import { createControlComponent } from '@react-leaflet/core'  
    import { Control } from 'leaflet'  
      
    export const ZoomControl = createControlComponent(  
      (props) => new Control.Zoom(props),  
    )  
    

The following page presents the architecture and usage in more details.

[PreviousChild components](/docs/api-components/)[NextCore
architecture](/docs/core-architecture/)

  * Introduction
  * Audience
  * Installation
  * Usage

# Core architecture | React Leaflet

  * [](/)
  * Core API
  * Core architecture

Version: v5.x

On this page

# Core architecture

## Introduction​

This page describes the core architecture by presenting how to build an
example `Square` layer component using the APIs provided by React Leaflet's
core.

Most of React Leaflet's public APIs are using the core APIs as described in
this page to provide their functionalities.

Bare import identifiers

For simplicity, bare import such as `import L from 'leaflet'` are used in the
following examples rather than absolute imports.

## Identifying necessary Leaflet APIs​

The first step to implement a component in React Leaflet is to identify the
necessary APIs made available by Leaflet and potentially third-party plugins
to achieve the desired functionalities.

For our `Square` component, we'll support two properties: a `center` position
and the square's `size`.

By using [Leaflet's `Rectangle`
class](https://leafletjs.com/reference.html#rectangle), we can add a rectangle
to the map, so this is the base we'll use for our `Square`. Leaflet's
`Rectangle` constructor needs to be provided bounds, so we'll also use the
[`toBounds` method of the `LatLng`
class](https://leafletjs.com/reference.html#latlng-tobounds) to converts our
`center` and `size` props to bounds.

## First version​

To get started, let's simply focus on adding the square to the map, using the
following code:

    
    
    import { useLeafletContext } from '@react-leaflet/core'  
    import L from 'leaflet'  
    import { useEffect } from 'react'  
      
    function Square(props) {  
      const context = useLeafletContext()  
      
      useEffect(() => {  
        const bounds = L.latLng(props.center).toBounds(props.size)  
        const square = new L.Rectangle(bounds)  
        const container = context.layerContainer || context.map  
        container.addLayer(square)  
      
        return () => {  
          container.removeLayer(square)  
        }  
      })  
      
      return null  
    }  
      
    const center = [51.505, -0.09]  
      
    function MyMap() {  
      return (  
        <MapContainer center={center} zoom={13}>  
          <TileLayer  
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'  
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  
          />  
          <Square center={center} size={1000} />  
        </MapContainer>  
      )  
    }  
    

First, we need to access the context created by the [`MapContainer`
component](/docs/api-map/#mapcontainer), by calling the [`useLeafletContext`
hook exported by the core APIs](/docs/core-api/#useleafletcontext):

    
    
    const context = useLeafletContext()  
    

Then, we use [React's `useEffect`
hook](https://react.dev/reference/react/useEffect) to create the square
instance, using the props to calculate the bounds to provide to [Leaflet's
`Rectangle` constructor](https://leafletjs.com/reference.html#rectangle):

    
    
    const bounds = L.latLng(props.center).toBounds(props.size)  
    const square = new L.Rectangle(bounds)  
    

The created layer needs to be added to a container provided in the context,
either a parent container such as a [`LayerGroup`](/docs/api-
components/#layergroup), or the `Map` instance created with the context:

    
    
    const container = context.layerContainer || context.map  
    container.addLayer(square)  
    

We also need to return the cleaning up function for the `useEffect` hook, that
removes the layer from the container:

    
    
    return () => {  
      container.removeLayer(square)  
    }  
    

Finally, the `Square` component needs to return a valid React node, but as the
rendering of the layer is performed by Leaflet, it only returns `null`.

## Improved update logic​

The first version of the code successfully works for simple cases, but it has
a drawback: every time the component is rendered, the `useEffect` callback
will run and add/remove the square to/from the map, possibly unnecessarily if
the props haven't changed.

This is usually not the expected behavior when using React, because the
virtual DOM will check what updates are necessary to apply to the DOM. In
React Leaflet, DOM rendering is performed by Leaflet, so we need to implement
more logic to avoid unnecessary changes to the DOM, as in the following code:

    
    
    import { useLeafletContext } from '@react-leaflet/core'  
    import L from 'leaflet'  
    import { useEffect, useRef } from 'react'  
      
    function getBounds(props) {  
      return L.latLng(props.center).toBounds(props.size)  
    }  
      
    function Square(props) {  
      const context = useLeafletContext()  
      const squareRef = useRef()  
      const propsRef = useRef(props)  
      
      useEffect(() => {  
        squareRef.current = new L.Rectangle(getBounds(props))  
        const container = context.layerContainer || context.map  
        container.addLayer(squareRef.current)  
      
        return () => {  
          container.removeLayer(squareRef.current)  
        }  
      }, [])  
      
      useEffect(() => {  
        if (  
          props.center !== propsRef.current.center ||  
          props.size !== propsRef.current.size  
        ) {  
          squareRef.current.setBounds(getBounds(props))  
        }  
        propsRef.current = props  
      }, [props.center, props.size])  
      
      return null  
    }  
      
    const center = [51.505, -0.09]  
      
    function MyMap() {  
      return (  
        <MapContainer center={center} zoom={13}>  
          <TileLayer  
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'  
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  
          />  
          <Square center={center} size={1000} />  
        </MapContainer>  
      )  
    }  
    

First, we extract the function that returns bounds from props, as this logic
will be needed in two places:

    
    
    function getBounds(props) {  
      return L.latLng(props.center).toBounds(props.size)  
    }  
    

We also need to keep references to the Leaflet element instance and the props,
by leveraging the [`useRef` hook](https://react.dev/reference/react/useRef):

    
    
    const squareRef = useRef()  
    const propsRef = useRef(props)  
    

Finally, we separate the logic for adding and removing the layer from the
logic to update it, by setting the [dependencies argument of the `useEffect`
hook](https://react.dev/reference/react/useEffect#parameters). The first
`useEffect` callback will be only called when the component is mounted and
unmounted (setting the dependencies to `[]`), while the second `useEffect`
callback will be called whenever the props change, and conditionally apply the
update to the layer:

    
    
    useEffect(() => {  
      squareRef.current = new L.Rectangle(getBounds(props))  
      const container = context.layerContainer || context.map  
      container.addLayer(squareRef.current)  
      
      return () => {  
        container.removeLayer(squareRef.current)  
      }  
    }, [])  
      
    useEffect(() => {  
      if (  
        props.center !== propsRef.current.center ||  
        props.size !== propsRef.current.size  
      ) {  
        squareRef.current.setBounds(getBounds(props))  
      }  
      propsRef.current = props  
    }, [props.center, props.size])  
    

## Element hook factory​

The above code gets very repetitive as it's needed for most components in
React Leaflet, this is why the core APIs provide functions such as the
[`createElementHook` factory](/docs/core-api/#createelementhook) to simplify
the process:

    
    
    import {  
      createElementHook,  
      createElementObject,  
      useLeafletContext,  
    } from '@react-leaflet/core'  
    import L from 'leaflet'  
    import { useEffect } from 'react'  
      
    function getBounds(props) {  
      return L.latLng(props.center).toBounds(props.size)  
    }  
      
    function createSquare(props, context) {  
      return createElementObject(new L.Rectangle(getBounds(props)), context)  
    }  
      
    function updateSquare(instance, props, prevProps) {  
      if (props.center !== prevProps.center || props.size !== prevProps.size) {  
        instance.setBounds(getBounds(props))  
      }  
    }  
      
    const useSquareElement = createElementHook(createSquare, updateSquare)  
      
    function Square(props) {  
      const context = useLeafletContext()  
      const elementRef = useSquareElement(props, context)  
      
      useEffect(() => {  
        const container = context.layerContainer || context.map  
        container.addLayer(elementRef.current.instance)  
      
        return () => {  
          container.removeLayer(elementRef.current.instance)  
        }  
      }, [])  
      
      return null  
    }  
      
    const center = [51.505, -0.09]  
      
    function MyMap() {  
      return (  
        <MapContainer center={center} zoom={13}>  
          <TileLayer  
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'  
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  
          />  
          <Square center={center} size={1000} />  
        </MapContainer>  
      )  
    }  
    

First, instead of having the Leaflet element creation and updating logic in
`useEffect` callbacks, we can extract them to standalone functions
implementing the [expected interface](/docs/core-api/#createelementhook) using
the [`createElementObject` function](/docs/core-api/#createelementobject):

    
    
    function createSquare(props, context) {  
      return createElementObject(new L.Rectangle(getBounds(props)), context)  
    }  
      
    function updateSquare(instance, props, prevProps) {  
      if (props.center !== prevProps.center || props.size !== prevProps.size) {  
        instance.setBounds(getBounds(props))  
      }  
    }  
    

Based on these functions, we can create a `useSquareElement` hook:

    
    
    const useSquareElement = createElementHook(createSquare, updateSquare)  
    

This hook will keep track of the element's instance and props, so a single
`useEffect` hook can be used to handle the addition and removal of the layer:

    
    
    const elementRef = useSquareElement(props, context)  
      
    useEffect(() => {  
      const container = context.layerContainer || context.map  
      container.addLayer(elementRef.current.instance)  
      
      return () => {  
        container.removeLayer(elementRef.current.instance)  
      }  
    }, [])  
    

## Layer lifecycle hook​

The core APIs provide additional hooks to handle specific pieces of logic.
Here, we can replace the `useEffect` hook used previously to add and remove
the layer by the [`useLayerLifecycle` hook](/docs/core-
api/#uselayerlifecycle):

    
    
    import {  
      createElementHook,  
      createElementObject,  
      useLayerLifecycle,  
      useLeafletContext,  
    } from '@react-leaflet/core'  
    import L from 'leaflet'  
      
    function getBounds(props) {  
      return L.latLng(props.center).toBounds(props.size)  
    }  
      
    function createSquare(props, context) {  
      return createElementObject(new L.Rectangle(getBounds(props)), context)  
    }  
      
    function updateSquare(instance, props, prevProps) {  
      if (props.center !== prevProps.center || props.size !== prevProps.size) {  
        instance.setBounds(getBounds(props))  
      }  
    }  
      
    const useSquareElement = createElementHook(createSquare, updateSquare)  
      
    function Square(props) {  
      const context = useLeafletContext()  
      const elementRef = useSquareElement(props, context)  
      useLayerLifecycle(elementRef.current, context)  
      
      return null  
    }  
      
    const center = [51.505, -0.09]  
      
    render(  
      <MapContainer center={center} zoom={13}>  
        <TileLayer  
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'  
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  
        />  
        <Square center={center} size={1000} />  
      </MapContainer>,  
    )  
    

## Higher-level createPathHook​

The core APIs also provide higher-level factory functions implementing logic
shared by different hooks, such as [`createPathHook`](/docs/core-
api/#createpathhook). Here we can extract the logic previously implemented in
the component to a hook factory, and simply call the created hook in the
component:

    
    
    import {  
      createElementHook,  
      createElementObject,  
      createPathHook,  
    } from '@react-leaflet/core'  
    import L from 'leaflet'  
      
    function getBounds(props) {  
      return L.latLng(props.center).toBounds(props.size)  
    }  
      
    function createSquare(props, context) {  
      return createElementObject(new L.Rectangle(getBounds(props)), context)  
    }  
      
    function updateSquare(instance, props, prevProps) {  
      if (props.center !== prevProps.center || props.size !== prevProps.size) {  
        instance.setBounds(getBounds(props))  
      }  
    }  
      
    const useSquareElement = createElementHook(createSquare, updateSquare)  
    const useSquare = createPathHook(useSquareElement)  
      
    function Square(props) {  
      useSquare(props)  
      return null  
    }  
      
    const center = [51.505, -0.09]  
      
    function MyMap() {  
      return (  
        <MapContainer center={center} zoom={13}>  
          <TileLayer  
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'  
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  
          />  
          <Square center={center} size={1000} />  
        </MapContainer>  
      )  
    }  
    

[`createPathHook`](/docs/core-api/#createpathhook) also implements further
logic, notably calling the [`useEventHandlers`](/docs/core-
api/#useeventhandlers) and [`useLayerLifecycle`](/docs/core-
api/#uselayerlifecycle) hooks as well.

## Component factory​

Following the changes above, we can see that the `Square` component gets very
simple as all the logic is implemented in the `useSquare` hook. We can replace
it by the [`createLeafComponent` function](/docs/core-
api/#createleafcomponent) that implements similar logic:

    
    
    import {  
      createElementHook,  
      createElementObject,  
      createLeafComponent,  
      createPathHook,  
    } from '@react-leaflet/core'  
    import L from 'leaflet'  
      
    function getBounds(props) {  
      return L.latLng(props.center).toBounds(props.size)  
    }  
      
    function createSquare(props, context) {  
      return createElementObject(new L.Rectangle(getBounds(props)), context)  
    }  
      
    function updateSquare(instance, props, prevProps) {  
      if (props.center !== prevProps.center || props.size !== prevProps.size) {  
        instance.setBounds(getBounds(props))  
      }  
    }  
      
    const useSquareElement = createElementHook(createSquare, updateSquare)  
    const useSquare = createPathHook(useSquareElement)  
    const Square = createLeafComponent(useSquare)  
      
    const center = [51.505, -0.09]  
      
    function MyMap() {  
      return (  
        <MapContainer center={center} zoom={13}>  
          <TileLayer  
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'  
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  
          />  
          <Square center={center} size={1000} />  
        </MapContainer>  
      )  
    }  
    

[`createLeafComponent`](/docs/core-api/#createleafcomponent) also provides
additional logic in order to make the Leaflet element instance available using
React's `ref`.

## Supporting children elements​

All the steps above focus on displaying the `Square` element only. However, it
is common for React Leaflet components to also have children when possible.
Our `Square` being a Leaflet layer, overlays such as [`Popup`](/docs/api-
components/#popup) and [`Tooltip`](/docs/api-components/#tooltip) could be
attached to it:

    
    
    import {  
      createContainerComponent,  
      createElementHook,  
      createElementObject,  
      createPathHook,  
      extendContext,  
    } from '@react-leaflet/core'  
    import L from 'leaflet'  
      
    function getBounds(props) {  
      return L.latLng(props.center).toBounds(props.size)  
    }  
      
    function createSquare(props, context) {  
      const square = new L.Rectangle(getBounds(props))  
      return createElementObject(  
        square,  
        extendContext(context, { overlayContainer: square }),  
      )  
    }  
      
    function updateSquare(instance, props, prevProps) {  
      if (props.center !== prevProps.center || props.size !== prevProps.size) {  
        instance.setBounds(getBounds(props))  
      }  
    }  
      
    const useSquareElement = createElementHook(createSquare, updateSquare)  
    const useSquare = createPathHook(useSquareElement)  
    const Square = createContainerComponent(useSquare)  
      
    const center = [51.505, -0.09]  
      
    function MyMap() {  
      return (  
        <MapContainer center={center} zoom={13}>  
          <TileLayer  
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'  
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  
          />  
          <Square center={center} size={1000}>  
            <Popup>Hello Popup</Popup>  
          </Square>  
        </MapContainer>  
      )  
    }  
    

In order to support these overlays, we need to update the `createSquare`
function to set the created layer as the context's `overlayContainer`. Note
that we use the [`extendContext` function](/docs/core-api/#extendcontext) here
in order to make the extended context immutable.

    
    
    function createSquare(props, context) {  
      const square = new L.Rectangle(getBounds(props))  
      return createElementObject(  
        square,  
        extendContext(context, { overlayContainer: square }),  
      )  
    }  
    

We also need to replace the component factory by one taking care of providing
the changed context and rendering the children,
[`createContainerComponent`](/docs/core-api/#createcontainercomponent):

    
    
    const Square = createContainerComponent(useSquare)  
    

In addition to the `createLeafComponent` and `createContainerComponent`
functions, [`createOverlayComponent`](/docs/core-api/#createoverlaycomponent)
can be used to create overlays such as [`Popup`](/docs/api-components/#popup)
and [`Tooltip`](/docs/api-components/#tooltip).

## Higher-level component factory​

Most of React Leaflet's APIs are React components abstracting the logic of
creating and interacting with Leaflet elements. The different hooks and
factories exposed by the core APIs implement various pieces of logic that need
to be combined to create components, and in some cases the same series of
functions are used to create different components.

In the previous step, we combine the following three functions to create the
component:

    
    
    const useSquareElement = createElementHook(createSquare, updateSquare)  
    const useSquare = createPathHook(useSquareElement)  
    const Square = createContainerComponent(useSquare)  
    

This logic is similar for other types of layers and is therefore provided as a
higher-level component factory, [`createPathComponent`](/docs/core-
api/#createpathcomponent), as used below:

    
    
    import {  
      createElementObject,  
      createPathComponent,  
      extendContext,  
    } from '@react-leaflet/core'  
    import L from 'leaflet'  
      
    function getBounds(props) {  
      return L.latLng(props.center).toBounds(props.size)  
    }  
      
    function createSquare(props, context) {  
      const square = new L.Rectangle(getBounds(props))  
      return createElementObject(  
        square,  
        extendContext(context, { overlayContainer: square }),  
      )  
    }  
      
    function updateSquare(instance, props, prevProps) {  
      if (props.center !== prevProps.center || props.size !== prevProps.size) {  
        instance.setBounds(getBounds(props))  
      }  
    }  
      
    const Square = createPathComponent(createSquare, updateSquare)  
      
    const center = [51.505, -0.09]  
      
    function MyMap() {  
      return (  
        <MapContainer center={center} zoom={13}>  
          <TileLayer  
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'  
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  
          />  
          <Square center={center} size={1000}>  
            <Popup>Hello Popup</Popup>  
          </Square>  
        </MapContainer>  
      )  
    }  
    

The core APIs export other [high-level component factories](/docs/core-
api/#high-level-component-factories) that can be used in a similar way.

[PreviousReact Leaflet Core](/docs/core-introduction/)[NextCore
API](/docs/core-api/)

  * Introduction
  * Identifying necessary Leaflet APIs
  * First version
  * Improved update logic
  * Element hook factory
  * Layer lifecycle hook
  * Higher-level createPathHook
  * Component factory
  * Supporting children elements
  * Higher-level component factory

# Core API | React Leaflet

  * [](/)
  * Core API
  * Core API

Version: v5.x

On this page

# Core API

## Interfaces and types​

### ControlledLayer​

    
    
    type ControlledLayer = {  
      addLayer(layer: Layer): void  
      removeLayer(layer: Layer): void  
    }  
    

### LeafletContextInterface​

    
    
    type LeafletContextInterface = Readonly<{  
      map: Map  
      layerContainer?: ControlledLayer | LayerGroup  
      layersControl?: Control.Layers  
      overlayContainer?: Layer  
      pane?: string  
    }>  
    

### LeafletElement​

    
    
    type LeafletElement<T, C = any> = Readonly<{  
      instance: T  
      context: LeafletContextInterface  
      container?: C | null  
    }>  
    

### ElementHook​

    
    
    type ElementHook<E, P> = (  
      props: P,  
      context: LeafletContextInterface,  
    ) => MutableRefObject<LeafletElement<E>>  
    

### DivOverlay​

    
    
    type DivOverlay = Popup | Tooltip  
    

### SetOpenFunc​

    
    
    type SetOpenFunc = (open: boolean) => void  
    

### DivOverlayLifecycleHook​

    
    
    type DivOverlayLifecycleHook<E, P> = (  
      element: LeafletElement<E>,  
      context: LeafletContextInterface,  
      props: P,  
      setOpen: SetOpenFunc,  
    ) => void  
    

### DivOverlayHook​

    
    
    type DivOverlayHook<E extends DivOverlay, P> = (  
      useElement: ElementHook<E, P>,  
      useLifecycle: DivOverlayLifecycleHook<E, P>,  
    ) => (props: P, setOpen: SetOpenFunc) => ReturnType<ElementHook<E, P>>  
    

### EventedProps​

    
    
    type EventedProps = {  
      eventHandlers?: LeafletEventHandlerFnMap  
    }  
    

### LayerProps​

    
    
    interface LayerProps extends EventedProps, LayerOptions {}  
    

### PathProps​

    
    
    interface PathProps extends EventedProps {  
      pathOptions?: PathOptions  
    }  
    

### CircleMarkerProps​

    
    
    interface CircleMarkerProps extends CircleMarkerOptions, PathProps {  
      center: LatLngExpression  
      children?: ReactNode  
    }  
    

### MediaOverlayProps​

    
    
    interface MediaOverlayProps extends ImageOverlayOptions, EventedProps {  
      bounds: LatLngBoundsExpression  
    }  
    

### PropsWithChildren​

    
    
    type PropsWithChildren = {  
      children?: ReactNode  
    }  
    

### EventedWithChildrenProps​

    
    
    interface EventedWithChildrenProps extends EventedProps, PropsWithChildren {}  
    

### PathWithChildrenProps​

    
    
    interface PathWithChildrenProps extends PathProps, PropsWithChildren {}  
    

## Utilities​

### createElementObject​

**Type parameters**

  1. `T`: Leaflet's element class type
  2. `C = any`: the element's container, if relevant

**Arguments**

  1. `instance: t`
  2. `context: LeafletContextInterface`
  3. `container?: C`

**Returns** `LeafletElement<T, C>`

### extendContext​

**Arguments**

  1. `source: LeafletContextInterface`
  2. `extra: Partial<LeafletContextInterface>`

**Returns** `LeafletContextInterface`

## Context​

### LeafletContext​

[React Context](https://react.dev/reference/react/createContext) used by React
Leaflet, implementing the `LeafletContextInterface`

### createLeafletContext​

**Arguments**

  1. `map: Map`

**Returns** `LeafletContextInterface`

### useLeafletContext​

[React Hook](https://react.dev/reference/react/hooks) returning the
`LeafletContext`. Calling this hook will throw an error if the context is not
provided.

## Hook factories​

The following functions return [React
hooks](https://react.dev/reference/react/hooks) for specific purposes.

### createElementHook​

**Type parameters**

  1. `E`: Leaflet's element class type
  2. `P`: the component's props
  3. `C = any`: the element's container, if relevant

**Arguments**

  1. `createElement: (props: P, context: LeafletContextInterface) => LeafletElement<E>`
  2. `updateElement?: (instance: E, props: P, prevProps: P) => void`

**Returns** `ElementHook<E, P>`

### createControlHook​

**Type parameters**

  1. `E extends Control`: Leaflet's element class type
  2. `P extends ControlOptions`: the component's props

**Arguments**

  1. `useElement: ElementHook<E, P>`

**Returns** `ElementHook<E, P>`

### createDivOverlayHook​

**Type parameters**

  1. `E extends DivOverlay`: Leaflet's element class type
  2. `P extends EventedProps`: the component's props

**Arguments**

  1. `useElement: ElementHook<E, P>`
  2. `useLifecycle: DivOverlayLifecycleHook<E, P>`

**Returns** `ElementHook<E, P>`

### createLayerHook​

**Type parameters**

  1. `E extends Layer`: Leaflet's element class type
  2. `P extends LayerProps`: the component's props

**Arguments**

  1. `useElement: ElementHook<E, P>`

**Returns** `ElementHook<E, P>`

### createPathHook​

**Type parameters**

  1. `E extends FeatureGroup | Path`: Leaflet's element class type
  2. `P extends PathProps`: the component's props

**Arguments**

  1. `useElement: ElementHook<E, P>`

**Returns** `ElementHook<E, P>`

## Lifecycle hooks​

These hooks implement specific pieces of logic used by multiple components.

### useEventHandlers​

This hook adds support for the `eventHandlers` prop, adding and removing event
listeners as needed.

**Arguments**

  1. `element: LeafletElement<Evented>`
  2. `eventHandlers: LeafletEventHandlerFnMap | null | undefined`

**Returns** `void`

### useLayerLifecycle​

This hook adds support for adding and removing the layer to/from its parent
container or the map.

**Arguments**

  1. `element: LeafletElement<Layer>`
  2. `context: LeafletContextInterface`

**Returns** `void`

### usePathOptions​

This hook adds support for the `pathOptions` prop, updating the layer as
needed.

**Arguments**

  1. `element: LeafletElement<FeatureGroup | Path>`
  2. `props: PathProps`

**Returns** `void`

## Update functions​

Shared update logic for different components.

### updateCircle​

Updates the circle's `center` and `radius` if the props change.

**Type parameters**

  1. `E extends CircleMarker`: Leaflet's element class type
  2. `P extends CircleMarkerProps`: the component's props

**Arguments**

  1. `layer: E`
  2. `props: P`
  3. `prevProps: P`

**Returns** `void`

### updateGridLayer​

Updates the layer's `opacity` and `zIndex` if the props change.

**Type parameters**

  1. `E extends GridLayer`: Leaflet's element class type
  2. `P extends GridLayerOptions`: the component's props

**Arguments**

  1. `layer: E`
  2. `props: P`
  3. `prevProps: P`

**Returns** `void`

### updateMediaOverlay​

Updates the overlay's `bounds`, `opacity` and `zIndex` if the props change.

**Type parameters**

  1. `E extends ImageOverlay | SVGOverlay | VideoOverlay`: Leaflet's element class type
  2. `P extends MediaOverlayProps`: the component's props

**Arguments**

  1. `overlay: E`
  2. `props: P`
  3. `prevProps: P`

**Returns** `void`

## DOM interactions​

Utility functions to change the class of a `HTMLElement`.

### addClassName​

**Arguments**

  1. `element: HTMLElement`
  2. `className: string`

**Returns** `void`

### removeClassName​

**Arguments**

  1. `element: HTMLElement`
  2. `className: string`

**Returns** `void`

### updateClassName​

**Arguments**

  1. `element?: HTMLElement`
  2. `prevClassName?: string`
  3. `nextClassName?: string`

**Returns** `void`

## Component factories​

These functions create components from the provided element hook.

### createContainerComponent​

**Type parameters**

  1. `E`: Leaflet's element class type
  2. `P extends PropsWithChildren`: the component's props

**Arguments**

  1. `useElement: ElementHook<E, P>`

**Returns** `ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<E>>`

### createDivOverlayComponent​

**Type parameters**

  1. `E extends DivOverlay`: Leaflet's element class type
  2. `P extends PropsWithChildren`: the component's props

**Arguments**

  1. `useElement: ReturnType<DivOverlayHook<E, P>>`

**Returns** `ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<E>>`

### createLeafComponent​

**Type parameters**

  1. `E`: Leaflet's element class type
  2. `P`: the component's props

**Arguments**

  1. `useElement: ElementHook<E, P>`

**Returns** `ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<E>>`

## High-level component factories​

These functions combine hooks and component factories to provide high-level
factories for common component types.

### createControlComponent​

**Type parameters**

  1. `E extends Control`: Leaflet's element class type
  2. `P extends ControlOptions`: the component's props

**Arguments**

  1. `createInstance: (props: P) => E`

**Returns** `ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<E>>`

### createLayerComponent​

**Type parameters**

  1. `E extends Layer`: Leaflet's element class type
  2. `P extends EventedWithChildrenProps`: the component's props

**Arguments**

  1. `createElement: (props: P, context: LeafletContextInterface) => LeafletElement<E>`
  2. `updateElement?: (instance: E, props: P, prevProps: P) => void`

**Returns** `ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<E>>`

### createOverlayComponent​

**Type parameters**

  1. `E extends DivOverlay`: Leaflet's element class type
  2. `P extends EventedWithChildrenProps`: the component's props

**Arguments**

  1. `createElement: (props: P, context: LeafletContextInterface) => LeafletElement<E>`
  2. `useLifecycle: DivOverlayLifecycleHook<E, P>`

**Returns** `ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<E>>`

### createPathComponent​

**Type parameters**

  1. `E extends FeatureGroup | Path`: Leaflet's element class type
  2. `P extends PathWithChildrenProps`: the component's props

**Arguments**

  1. `createElement: (props: P, context: LeafletContextInterface) => LeafletElement<E>`
  2. `updateElement?: (instance: E, props: P, prevProps: P) => void`

**Returns** `ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<E>>`

### createTileLayerComponent​

**Type parameters**

  1. `E extends Layer`: Leaflet's element class type
  2. `P extends EventedProps`: the component's props

**Arguments**

  1. `createElement: (props: P, context: LeafletContextInterface) => LeafletElement<E>`
  2. `updateElement?: (instance: E, props: P, prevProps: P) => void`

**Returns** `ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<E>>`

[PreviousCore architecture](/docs/core-architecture/)[NextLogo &
Branding](/docs/extra-logo-branding/)

  * Interfaces and types
    * ControlledLayer
    * LeafletContextInterface
    * LeafletElement
    * ElementHook
    * DivOverlay
    * SetOpenFunc
    * DivOverlayLifecycleHook
    * DivOverlayHook
    * EventedProps
    * LayerProps
    * PathProps
    * CircleMarkerProps
    * MediaOverlayProps
    * PropsWithChildren
    * EventedWithChildrenProps
    * PathWithChildrenProps
  * Utilities
    * createElementObject
    * extendContext
  * Context
    * LeafletContext
    * createLeafletContext
    * useLeafletContext
  * Hook factories
    * createElementHook
    * createControlHook
    * createDivOverlayHook
    * createLayerHook
    * createPathHook
  * Lifecycle hooks
    * useEventHandlers
    * useLayerLifecycle
    * usePathOptions
  * Update functions
    * updateCircle
    * updateGridLayer
    * updateMediaOverlay
  * DOM interactions
    * addClassName
    * removeClassName
    * updateClassName
  * Component factories
    * createContainerComponent
    * createDivOverlayComponent
    * createLeafComponent
  * High-level component factories
    * createControlComponent
    * createLayerComponent
    * createOverlayComponent
    * createPathComponent
    * createTileLayerComponent

# Logo & Branding | React Leaflet

  * [](/)
  * Extra
  * Logo & Branding

Version: v5.x

On this page

# Logo & Branding

The React Leaflet logo provides a way for the community to identify and
communicate the technologies used in their mapping applications. While the
library is open source, it's encouraged to follow the best practices defined
below to upload the integrity of the logo itself and what it represents.

## Logo​

### Icon & Wordmark​

The primary use is the icon with wordmark. Given the appropriate space
available and where possible, this variation should be used in most general
applications to represent the full identity of the library.

![React Leaflet Logo](/img/logo-title.svg) ![React Leaflet Logo](/img/logo-
title-alt.svg)

### Icon​

For use cases that permit smaller space, the icon can be used as a standalone
option to represent the React Leaflet library.

![React Leaflet Icon](/img/logo.svg)

### Usage​

The React Leaflet logos should not be modified in any way that distorts the
shape or contents of the logo.

### Credit​

Logo and scheme originally created by [Colby
Fayock](https://www.colbyfayock.com/).

### License​

The React Leaflet logos and assets are licensed under a [Creative Commons
Attribution 4.0 International
License](https://creativecommons.org/licenses/by/4.0/).

### Download​

For convenience, the following are packaged up in a `.zip` to download:

  * react-leaflet-icon-transparent-500x500.png
  * react-leaflet-icon-white-500x500.jpg
  * react-leaflet-icon.eps
  * react-leaflet-icon.svg
  * react-leaflet-logo-transparent-1000x280.png
  * react-leaflet-logo-white-1000x280.jpg
  * react-leaflet-logo.eps
  * react-leaflet-logo.svg

[Download All Assets](/assets/files/react-leaflet-
logo-c762e32a7d07c83c8947178ea78a2683.zip/)

## Colors​

Color usage should follow the values below when working with React Leaflet
branding or validating the integrity of the use of one of its logos.

Color| Hex| | primary| #61BA9E| ![#61BA9E](/assets/swatch-61BA9E-50x50.jpg)| secondary| #2A473E| ![#2A473E](/assets/swatch-2A473E-50x50.jpg)  
---|---|---  
  
[PreviousCore API](/docs/core-api/)[NextThird-party plugins](/docs/extra-
plugins/)

  * Logo
    * Icon & Wordmark
    * Icon
    * Usage
    * Credit
    * License
    * Download
  * Colors

