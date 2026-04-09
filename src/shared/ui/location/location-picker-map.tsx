import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icon in webpack/vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

type LatLng = {
  lat: number
  lng: number
}

type LocationPickerMapProps = {
  selectedPosition: LatLng | null
  onLocationSelect: (latlng: LatLng) => void
}

// Component to handle map click events
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (latlng: LatLng) => void
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng)
    },
  })
  return null
}

// Component to recenter map when position changes
function MapRecenter({ position }: { position: LatLng | null }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 13)
    }
  }, [map, position])

  return null
}

export default function LocationPickerMap({
  selectedPosition,
  onLocationSelect,
}: LocationPickerMapProps) {
  // Default center (USA center)
  const defaultCenter: LatLng = { lat: 39.8283, lng: -98.5795 }

  return (
    <MapContainer
      center={[defaultCenter.lat, defaultCenter.lng]}
      zoom={4}
      className="h-full w-full"
      style={{ height: '100%', width: '100%' }}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler onLocationSelect={onLocationSelect} />
      <MapRecenter position={selectedPosition} />
      {selectedPosition && (
        <Marker position={[selectedPosition.lat, selectedPosition.lng]} />
      )}
    </MapContainer>
  )
}
