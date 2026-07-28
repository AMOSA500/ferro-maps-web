import { useState, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer } from '@react-google-maps/api'
import { MapPin } from 'lucide-react'
import { collection, onSnapshot, GeoPoint } from 'firebase/firestore'
import * as ngeohash from 'ngeohash'
import { db } from '../lib/firebase'
import { useDriverFilters } from '../hooks/useDriverFilters'
import type { ZoneFilter } from '../hooks/useDriverFilters'
import DriverDrawer from './DriverDrawer'
import type { DriverDetail } from './DriverDrawer'

const LONDON_CENTER = { lat: 51.5074, lng: -0.1278 }

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' }

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  fullscreenControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  styles: [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.attraction',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.government',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.medical',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.school',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.sports_complex',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit.station',
      stylers: [{ visibility: 'off' }],
    },
  ],
}


function pinSvg(fillColor: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 22 28"><path d="M11 0C4.925 0 0 4.925 0 11c0 7.7 11 17 11 17s11-9.3 11-17C22 4.925 17.075 0 11 0z" fill="${fillColor}"/><circle cx="11" cy="11" r="4" fill="white"/></svg>`
  )}`
}

const MARKER_ONLINE = pinSvg('#16A34A')
const MARKER_OFFLINE = pinSvg('#6B7892')
const MARKER_SUSPENDED = pinSvg('#DC2626')

function markerIconFor(driver: Driver): string {
  if (driver.isSuspended) return MARKER_SUSPENDED
  if (driver.isOnline) return MARKER_ONLINE
  return MARKER_OFFLINE
}

const STATUS_PILLS = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'suspended', label: 'Suspended' },
] as const

const ZONE_OPTIONS: ZoneFilter[] = ['all', 'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6']

interface Driver extends DriverDetail {
  lat: number
  lng: number
}

function AdminMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'ferro-maps-admin-script',
    googleMapsApiKey: apiKey ?? '',
  })

  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedUid, setSelectedUid] = useState<string | null>(null)
  const [driversLoaded, setDriversLoaded] = useState(false)

  const { statusFilter, setStatusFilter, zoneFilter, setZoneFilter, filteredDrivers } =
    useDriverFilters(drivers)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const all: Driver[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()

          let lat: number | undefined
          let lng: number | undefined

          if (typeof data.location === 'string' && data.location.length > 0) {
            try {
              const decoded = ngeohash.decode(data.location)
              lat = decoded.latitude
              lng = decoded.longitude
            } catch (err) {
              console.warn(`Could not decode geohash for driver ${doc.id}:`, err)
              return
            }
          } else if (data.location instanceof GeoPoint) {
            lat = data.location.latitude
            lng = data.location.longitude
          } else {
            return
          }

          all.push({
            uid: data.uid ?? doc.id,
            name: data.name ?? 'Unknown',
            email: data.email ?? '',
            phoneNumber: data.phoneNumber ?? '',
            ferroBalance: typeof data.ferroBalance === 'number' ? data.ferroBalance : 0,
            country: data.country ?? '',
            lat,
            lng,
            locationUpdatedAt: data.locationUpdatedAt ?? null,
            isOnline: data.isOnline ?? false,
            isSuspended: data.isSuspended ?? false,
            joinedAt: data.joinedAt ?? null,
            suspendedAt: data.suspendedAt ?? null,
          })
        })
        console.log('Drivers loaded:', all.length)

        const groups = new Map<string, Driver[]>()
        for (const d of all) {
          const key = `${d.lat.toFixed(5)},${d.lng.toFixed(5)}`
          const group = groups.get(key) ?? []
          group.push(d)
          groups.set(key, group)
        }
        const OFFSET_DEGREES = 0.0004
        for (const group of groups.values()) {
          if (group.length <= 1) continue
          group.forEach((d, i) => {
            const angle = (2 * Math.PI * i) / group.length
            d.lat += OFFSET_DEGREES * Math.cos(angle)
            d.lng += OFFSET_DEGREES * Math.sin(angle)
          })
        }

        setDrivers(all)
        setDriversLoaded(true)
      },
      (error) => console.error('Firestore snapshot error:', error),
    )
    return unsubscribe
  }, [])

  if (!apiKey) {
    return (
      <div className="w-full h-full rounded-card overflow-hidden bg-neutral-100 flex flex-col items-center justify-center gap-3 p-4">
        <MapPin size={32} className="text-neutral-300" />
        <p className="text-body-sm text-text-tertiary text-center">
          Map not configured — add VITE_GOOGLE_MAPS_API_KEY to apps/admin/.env.local to enable the
          live driver map.
        </p>
      </div>
    )
  }

  const count = filteredDrivers.length
  const driverWord = count === 1 ? 'driver' : 'drivers'
  const statusLabel = statusFilter === 'all' ? '' : ` ${statusFilter}`

  const selectedDriver = selectedUid
    ? (drivers.find((d) => d.uid === selectedUid) ?? null)
    : null

  return (
    <>
      {/* Filter bar — outside the map container */}
      <div className="bg-white px-3 py-2 border-b border-gray-200 flex flex-wrap items-center gap-2 flex-shrink-0">
        <div className="flex gap-1">
          {STATUS_PILLS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === value
                  ? 'bg-ferro-primary text-white border-ferro-primary'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value as ZoneFilter)}
          className="px-2 py-1 text-xs rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-ferro-primary focus:ring-offset-1"
        >
          {ZONE_OPTIONS.map((z) => (
            <option key={z} value={z}>
              {z === 'all' ? 'All Zones' : z}
            </option>
          ))}
        </select>
      </div>

      {/* Map container — fills remaining height */}
      <div className="relative flex-1 w-full rounded-card overflow-hidden">
        <div className="absolute top-3 left-3 z-10">
          {count > 0 ? (
            <span className="bg-white text-ferro-primary text-xs font-medium px-2 py-1 rounded-full shadow-sm">
              {count} {driverWord}{statusLabel}
            </span>
          ) : (
            <span className="bg-white text-text-tertiary text-xs px-2 py-1 rounded-full shadow-sm">
              No drivers shown
            </span>
          )}
        </div>
        {loadError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
            <MapPin size={32} className="text-neutral-300" />
            <p className="text-body-sm text-text-tertiary text-center">
              Failed to load Google Maps — check your API key and network connection.
            </p>
          </div>
        ) : !isLoaded ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-body text-ferro-primary">Loading map...</span>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={LONDON_CENTER}
            zoom={11}
            options={MAP_OPTIONS}
            onClick={() => setSelectedUid(null)}
          >
            <MarkerClusterer
              options={{
                zoomOnClick: true,
                maxZoom: 19,
              }}
            >
              {(clusterer) => (
                <div>
                  {driversLoaded && filteredDrivers.map((driver) => (
                    <Marker
                      key={driver.uid}
                      clusterer={clusterer}
                      position={{ lat: driver.lat, lng: driver.lng }}
                      title={driver.name}
                      icon={{
                        url: markerIconFor(driver),
                        scaledSize: new window.google.maps.Size(22, 28),
                        anchor: new window.google.maps.Point(11, 28),
                      }}
                      onClick={() => setSelectedUid(driver.uid)}
                    />
                  ))}
                </div>
              )}
            </MarkerClusterer>
          </GoogleMap>
        )}
      </div>

      <DriverDrawer driver={selectedDriver} onClose={() => setSelectedUid(null)} />
    </>
  )
}

export default AdminMap
