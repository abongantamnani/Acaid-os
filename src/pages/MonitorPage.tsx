import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Camera,
  Car,
  ChevronRight,
  FileText,
  List,
  Map,
  Maximize2,
  Minimize2,
  PhoneCall,
  Shield,
  ShieldCheck,
  Users,
  Wifi,
  Navigation,
} from 'lucide-react'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'


/* ============================================================
   TYPES
============================================================ */

type Screen = 'camera' | 'trips' | 'calls' | 'insurance'
type ViewMode = 'map' | 'list'


interface MonitorPageProps {
  onBack: () => void
  onOpen: (screen: Screen) => void
}


interface Vehicle {
  id: string
  driver: string
  speed: string
  threat: number
  status: 'NORMAL' | 'WATCH'
  position: [number, number]
}


/* ============================================================
   DEMO FLEET
   Later these coordinates come from ACAID GPS telemetry.
============================================================ */

const vehicles: Vehicle[] = [
  {
    id: 'ACAID-014',
    driver: 'Verified',
    speed: '48 km/h',
    threat: 18,
    status: 'NORMAL',
    position: [-33.9608, 25.6022],
  },
  {
    id: 'ACAID-021',
    driver: 'Verified',
    speed: '72 km/h',
    threat: 46,
    status: 'WATCH',
    position: [-33.9412, 25.5948],
  },
  {
    id: 'ACAID-008',
    driver: 'Verified',
    speed: '31 km/h',
    threat: 8,
    status: 'NORMAL',
    position: [-33.9821, 25.6228],
  },
]


/* ============================================================
   GQEBERHA
============================================================ */

const GQEBERHA_CENTER: [number, number] = [
  -33.9608,
  25.6022,
]


/* ============================================================
   CUSTOM ACAID VEHICLE MARKER
============================================================ */

function createVehicleIcon(vehicle: Vehicle, active: boolean) {
  const watch = vehicle.threat >= 40

  return L.divIcon({
    className: 'acaid-map-marker-wrapper',
    html: `
      <div
        class="
          acaid-map-marker
          ${watch ? 'watch' : ''}
          ${active ? 'selected' : ''}
        "
      >
        <div class="acaid-marker-pulse"></div>

        <div class="acaid-marker-core">
          <div class="acaid-marker-car">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 17h14"/>
              <path d="M6 17l1-5h10l1 5"/>
              <path d="M8 12l1.2-3h5.6l1.2 3"/>
              <circle cx="7.5" cy="17" r="1.5"/>
              <circle cx="16.5" cy="17" r="1.5"/>
            </svg>
          </div>
        </div>

        <div class="acaid-marker-label">
          ${vehicle.id}
        </div>
      </div>
    `,
    iconSize: [90, 70],
    iconAnchor: [45, 35],
    popupAnchor: [0, -35],
  })
}


/* ============================================================
   MAP RESIZE HANDLER
   Important when switching fullscreen.
============================================================ */

function MapResizeHandler({
  fullscreen,
}: {
  fullscreen: boolean
}) {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => window.clearTimeout(timer)
  }, [fullscreen, map])

  return null
}


/* ============================================================
   MONITOR PAGE
============================================================ */

export default function MonitorPage({
  onBack,
  onOpen,
}: MonitorPageProps) {
  const [viewMode, setViewMode] =
    useState<ViewMode>('map')

  const [activeVehicleId, setActiveVehicleId] =
    useState('ACAID-014')

  const [mapFullscreen, setMapFullscreen] =
    useState(false)

  const mapShellRef = useRef<HTMLDivElement>(null)


  const activeVehicle =
    vehicles.find(
      (vehicle) => vehicle.id === activeVehicleId,
    ) ?? vehicles[0]


  /* ==========================================================
     BROWSER FULLSCREEN
  ========================================================== */

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await mapShellRef.current?.requestFullscreen()
        setMapFullscreen(true)
      } else {
        await document.exitFullscreen()
        setMapFullscreen(false)
      }
    } catch {
      setMapFullscreen((current) => !current)
    }
  }


  useEffect(() => {
    const handleFullscreenChange = () => {
      setMapFullscreen(
        document.fullscreenElement === mapShellRef.current,
      )
    }

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange,
    )

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      )
    }
  }, [])


  return (
    <>
      <motion.section
        className="monitor-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="monitor-topbar">

          <div className="monitor-brand">

            <div className="monitor-brand-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>ACAID</strong>
              <span>COMMAND</span>
            </div>

          </div>


          <div className="monitor-status">

            <div>
              <Wifi size={15} />
              <span>LTE</span>
            </div>

            <div>
              <Activity size={15} />
              <span>SYSTEM ONLINE</span>
            </div>

            <button
              className="monitor-exit"
              onClick={onBack}
            >
              Exit
            </button>

          </div>

        </header>


        {/* ==================================================
            MAIN
        ================================================== */}

        <div className="monitor-main">


          {/* =================================================
              FLEET
          ================================================= */}

          <section className="fleet-section">


            <div className="fleet-heading">

              <div>

                <span className="monitor-eyebrow">
                  FLEET OVERVIEW
                </span>

                <h1>
                  Vehicle Network
                </h1>

                <p>
                  Real-time intelligence across connected
                  vehicles.
                </p>

              </div>


              <div className="fleet-count">
                <strong>12</strong>
                <span>ONLINE</span>
              </div>

            </div>


            {/* =================================================
                MAP / LIST SWITCH
            ================================================= */}

            <div className="monitor-view-row">

              <div className="monitor-view-toggle">

                <button
                  className={
                    viewMode === 'map'
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setViewMode('map')
                  }
                >
                  <Map size={14} />
                  Map
                </button>

                <button
                  className={
                    viewMode === 'list'
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setViewMode('list')
                  }
                >
                  <List size={14} />
                  List
                </button>

              </div>

            </div>


            {/* =================================================
                REAL OPENSTREETMAP
            ================================================= */}

            {viewMode === 'map' ? (

              <div
                ref={mapShellRef}
                className={`fleet-map-shell ${
                  mapFullscreen
                    ? 'map-is-fullscreen'
                    : ''
                }`}
              >

                <MapContainer
                  center={GQEBERHA_CENTER}
                  zoom={13}
                  scrollWheelZoom={true}
                  zoomControl={true}
                  className="acaid-leaflet-map"
                >

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />


                  <MapResizeHandler
                    fullscreen={mapFullscreen}
                  />


                  {/* =========================================
                      VEHICLES
                  ========================================= */}

                  {vehicles.map((vehicle) => (

                    <Marker
                      key={vehicle.id}
                      position={vehicle.position}
                      icon={createVehicleIcon(
                        vehicle,
                        vehicle.id === activeVehicleId,
                      )}
                      eventHandlers={{
                        click: () =>
                          setActiveVehicleId(
                            vehicle.id,
                          ),
                      }}
                    >

                      <Popup>

                        <div className="vehicle-popup">

                          <strong>
                            {vehicle.id}
                          </strong>

                          <span>
                            {vehicle.status}
                          </span>

                          <div>
                            Speed&nbsp;
                            {vehicle.speed}
                          </div>

                          <div>
                            Threat&nbsp;
                            {vehicle.threat}/100
                          </div>

                        </div>

                      </Popup>

                    </Marker>

                  ))}

                </MapContainer>


                {/* =========================================
                    MAP TOP LEFT
                ========================================= */}

                <div className="map-overlay map-overlay-top">

                  <div className="map-live-pill">
                    <span />
                    LIVE FLEET DATA
                  </div>

                  <div className="map-location">
                    <Navigation size={13} />
                    GQEBERHA
                  </div>

                </div>


                {/* =========================================
                    FULLSCREEN BUTTON
                ========================================= */}

                <button
                  className="map-fullscreen-button"
                  onClick={toggleFullscreen}
                  title={
                    mapFullscreen
                      ? 'Exit fullscreen'
                      : 'Expand map'
                  }
                  aria-label={
                    mapFullscreen
                      ? 'Exit fullscreen map'
                      : 'Expand map'
                  }
                >

                  {mapFullscreen ? (
                    <Minimize2 size={18} />
                  ) : (
                    <Maximize2 size={18} />
                  )}

                </button>


                {/* =========================================
                    MAP BOTTOM STATUS
                ========================================= */}

                <div className="map-bottom-bar">

                  <div>
                    <span className="map-status-dot" />
                    <span>
                      GPS NETWORK ACTIVE
                    </span>
                  </div>

                  <span>
                    {vehicles.length} VEHICLES TRACKED
                  </span>

                </div>

              </div>

            ) : (

              /* =================================================
                 LIST
              ================================================= */

              <div className="vehicle-list">

                <div className="vehicle-list-header">
                  <span>VEHICLE</span>
                  <span>STATUS</span>
                  <span>THREAT</span>
                </div>


                {vehicles.map((vehicle) => (

                  <button
                    className={`vehicle-list-row ${
                      vehicle.id === activeVehicleId
                        ? 'selected'
                        : ''
                    }`}
                    key={vehicle.id}
                    onClick={() =>
                      setActiveVehicleId(
                        vehicle.id,
                      )
                    }
                  >

                    <div className="vehicle-list-identity">

                      <div className="vehicle-mini-icon">
                        <Car size={16} />
                      </div>

                      <div className="vehicle-mini-info">

                        <strong>
                          {vehicle.id}
                        </strong>

                        <span>
                          {vehicle.driver} driver
                        </span>

                      </div>

                    </div>


                    <div
                      className={`vehicle-status-label ${
                        vehicle.threat >= 40
                          ? 'watch'
                          : ''
                      }`}
                    >
                      <span />
                      {vehicle.status}
                    </div>


                    <div
                      className={`vehicle-threat ${
                        vehicle.threat >= 40
                          ? 'medium'
                          : ''
                      }`}
                    >
                      {vehicle.threat}
                      <small>/100</small>
                    </div>

                  </button>

                ))}

              </div>

            )}

          </section>


          {/* =================================================
              INTELLIGENCE PANEL
          ================================================= */}

          <aside className="intelligence-panel">


            <div className="panel-heading">

              <div>

                <span className="monitor-eyebrow">
                  ACTIVE VEHICLE
                </span>

                <h2>
                  {activeVehicle.id}
                </h2>

              </div>

              <span className="online-pill">
                ONLINE
              </span>

            </div>


            {/* ===============================================
                THREAT
            =============================================== */}

            <div className="threat-overview">

              <div className="threat-top">

                <div>

                  <span>
                    THREAT SCORE
                  </span>

                  <strong>
                    {activeVehicle.threat}
                  </strong>

                  <small>
                    /100
                  </small>

                </div>

                <ShieldCheck size={27} />

              </div>


              <div className="threat-track">

                <div
                  style={{
                    width: `${activeVehicle.threat}%`,
                  }}
                />

              </div>


              <p>
                {activeVehicle.threat < 40
                  ? 'Vehicle operating normally. No active security events.'
                  : 'Elevated risk detected. Continue monitoring vehicle activity.'}
              </p>

            </div>


            {/* ===============================================
                DATA
            =============================================== */}

            <div className="data-grid">

              <div>
                <span>DRIVER</span>
                <strong>
                  {activeVehicle.driver}
                </strong>
              </div>

              <div>
                <span>SPEED</span>
                <strong>
                  {activeVehicle.speed}
                </strong>
              </div>

              <div>
                <span>TRIP</span>
                <strong>
                  18 min
                </strong>
              </div>

              <div>
                <span>GPS</span>
                <strong>
                  Active
                </strong>
              </div>

            </div>


            {/* ===============================================
                OCCUPANTS
            =============================================== */}

            <div className="occupants">

              <div className="section-title">

                <span>
                  <Users size={15} />
                  OCCUPANTS
                </span>

                <strong>
                  3
                </strong>

              </div>


              <div className="occupant">

                <div className="occupant-avatar">
                  D
                </div>

                <div>
                  <strong>Driver</strong>
                  <span>Verified</span>
                </div>

                <ShieldCheck size={15} />

              </div>


              <div className="occupant">

                <div className="occupant-avatar">
                  A
                </div>

                <div>
                  <strong>
                    Passenger A
                  </strong>

                  <span>
                    Phone detected
                  </span>
                </div>

                <span className="safe-dot" />

              </div>


              <div className="occupant">

                <div className="occupant-avatar">
                  B
                </div>

                <div>
                  <strong>
                    Passenger B
                  </strong>

                  <span>
                    No threat detected
                  </span>
                </div>

                <span className="safe-dot" />

              </div>

            </div>


            {/* ===============================================
                EVENT
            =============================================== */}

            <div className="latest-event">

              <div className="event-icon">
                <AlertTriangle size={18} />
              </div>

              <div>

                <span>
                  LATEST EVENT
                </span>

                <strong>
                  Passenger behaviour detected
                </strong>

                <p>
                  Monitoring continues.
                  No immediate threat.
                </p>

              </div>

            </div>

          </aside>

        </div>


        {/* ==================================================
            APPLICATION DOCK
        ================================================== */}

        <footer className="monitor-appbar">

          <MonitorApp
            icon={<Camera size={20} />}
            title="Camera"
            description="Privacy controlled"
            onClick={() =>
              onOpen('camera')
            }
          />

          <MonitorApp
            icon={<FileText size={20} />}
            title="Trips"
            description="Event timeline"
            onClick={() =>
              onOpen('trips')
            }
          />

          <MonitorApp
            icon={<PhoneCall size={20} />}
            title="Calls"
            description="Communications"
            onClick={() =>
              onOpen('calls')
            }
          />

          <MonitorApp
            icon={<Shield size={20} />}
            title="Insurance"
            description="Coverage status"
            onClick={() =>
              onOpen('insurance')
            }
          />

        </footer>

      </motion.section>


      {/* =====================================================
          MONITOR-ONLY CSS
          Everything stays inside MonitorPage.tsx
      ====================================================== */}

      <style>{`

        /* ==================================================
           MAP SHELL
        ================================================== */

        .fleet-map-shell {
          position: relative;
          flex: 1;
          min-height: 300px;
          overflow: hidden;
          border-top: 1px solid #171d22;
          border-bottom: 1px solid #171d22;
          background: #dfe7eb;
        }


        .fleet-map-shell:fullscreen {
          width: 100vw;
          height: 100vh;
          border: 0;
          border-radius: 0;
        }


        .fleet-map-shell.map-is-fullscreen {
          z-index: 9999;
        }


        .acaid-leaflet-map {
          width: 100%;
          height: 100%;
          min-height: 300px;
          z-index: 1;
        }


        /* ==================================================
           OPENSTREETMAP TILE TREATMENT
        ================================================== */

        .acaid-leaflet-map .leaflet-tile {
          filter:
            saturate(0.95)
            contrast(1.02);
        }


        .acaid-leaflet-map .leaflet-control-zoom {
          margin-top: 14px;
          margin-left: 14px;
          border: 0;
          box-shadow: 0 4px 18px rgba(0,0,0,.22);
        }


        .acaid-leaflet-map .leaflet-control-zoom a {
          width: 32px;
          height: 32px;
          line-height: 30px;
          border: 0;
          color: #26313a;
          background: rgba(255,255,255,.92);
        }


        .acaid-leaflet-map .leaflet-control-zoom a:hover {
          background: #ffffff;
        }


        .acaid-leaflet-map .leaflet-control-attribution {
          padding: 3px 7px;
          color: #55616b;
          background: rgba(255,255,255,.86);
          font-size: 9px;
        }


        .acaid-leaflet-map .leaflet-control-attribution a {
          color: #3f596b;
        }


        /* ==================================================
           MAP OVERLAY
        ================================================== */

        .map-overlay {
          position: absolute;
          z-index: 500;
          pointer-events: none;
        }


        .map-overlay-top {
          top: 15px;
          left: 55px;
          display: flex;
          align-items: center;
          gap: 8px;
        }


        .map-live-pill,
        .map-location {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 10px;
          border: 1px solid rgba(20,30,38,.15);
          border-radius: 8px;
          color: #26333d;
          background: rgba(255,255,255,.91);
          box-shadow: 0 4px 16px rgba(0,0,0,.12);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .1em;
          backdrop-filter: blur(8px);
        }


        .map-live-pill span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3f8c68;
          box-shadow: 0 0 0 4px rgba(63,140,104,.14);
        }


        .map-location {
          color: #53616b;
        }


        /* ==================================================
           FULLSCREEN BUTTON
        ================================================== */

        .map-fullscreen-button {
          position: absolute;
          z-index: 700;
          top: 14px;
          right: 14px;

          width: 38px;
          height: 38px;

          display: grid;
          place-items: center;

          border: 1px solid rgba(20,30,38,.16);
          border-radius: 9px;

          color: #26333d;
          background: rgba(255,255,255,.93);

          box-shadow:
            0 4px 18px rgba(0,0,0,.16);

          cursor: pointer;
          transition:
            transform 160ms ease,
            background 160ms ease;
        }


        .map-fullscreen-button:hover {
          transform: translateY(-1px);
          background: #ffffff;
        }


        /* ==================================================
           MAP BOTTOM BAR
        ================================================== */

        .map-bottom-bar {
          position: absolute;
          z-index: 500;
          left: 14px;
          right: 14px;
          bottom: 14px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 8px 10px;

          border: 1px solid rgba(20,30,38,.13);
          border-radius: 8px;

          color: #46545e;
          background: rgba(255,255,255,.88);

          box-shadow:
            0 4px 16px rgba(0,0,0,.12);

          font-size: 8px;
          font-weight: 800;
          letter-spacing: .09em;

          pointer-events: none;
          backdrop-filter: blur(8px);
        }


        .map-bottom-bar > div {
          display: flex;
          align-items: center;
          gap: 7px;
        }


        .map-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4e8e70;
          box-shadow:
            0 0 0 4px rgba(78,142,112,.13);
        }


        /* ==================================================
           ACAID VEHICLE MARKERS
        ================================================== */

        .acaid-map-marker-wrapper {
          background: transparent !important;
          border: 0 !important;
        }


        .acaid-map-marker {
          position: relative;
          width: 90px;
          height: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }


        .acaid-marker-core {
          position: relative;
          z-index: 3;

          width: 36px;
          height: 36px;

          display: grid;
          place-items: center;

          border: 2px solid #ffffff;
          border-radius: 50%;

          color: #ffffff;
          background: #344f61;

          box-shadow:
            0 4px 12px rgba(0,0,0,.35);
        }


        .acaid-marker-car {
          display: grid;
          place-items: center;
        }


        .acaid-marker-pulse {
          position: absolute;
          top: 3px;

          width: 30px;
          height: 30px;

          border-radius: 50%;

          background: rgba(64,112,139,.22);

          animation:
            acaidPulse 2.2s ease-out infinite;
        }


        .acaid-map-marker.watch
          .acaid-marker-core {
          background: #866f3e;
          border-color: #fff8e5;
        }


        .acaid-map-marker.watch
          .acaid-marker-pulse {
          background: rgba(151,122,61,.25);
        }


        .acaid-map-marker.selected
          .acaid-marker-core {
          box-shadow:
            0 0 0 4px rgba(52,91,115,.25),
            0 5px 16px rgba(0,0,0,.38);
        }


        .acaid-marker-label {
          position: relative;
          z-index: 4;

          margin-top: 4px;
          padding: 4px 7px;

          border: 1px solid rgba(25,36,44,.18);
          border-radius: 5px;

          color: #26333c;
          background: rgba(255,255,255,.94);

          box-shadow:
            0 2px 8px rgba(0,0,0,.15);

          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
          white-space: nowrap;
        }


        @keyframes acaidPulse {
          0% {
            transform: scale(.7);
            opacity: .65;
          }

          70% {
            transform: scale(1.45);
            opacity: 0;
          }

          100% {
            transform: scale(1.45);
            opacity: 0;
          }
        }


        /* ==================================================
           POPUP
        ================================================== */

        .vehicle-popup {
          min-width: 145px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          color: #26313a;
          font-family: inherit;
        }


        .vehicle-popup strong {
          font-size: 13px;
          letter-spacing: .04em;
        }


        .vehicle-popup > span {
          width: fit-content;
          padding: 3px 6px;
          border-radius: 4px;
          color: #4c735f;
          background: #edf5ef;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .08em;
        }


        .vehicle-popup div {
          color: #64717a;
          font-size: 10px;
        }


        /* ==================================================
           VIEW TOGGLE
        ================================================== */

        .monitor-view-row {
          padding: 0 22px 14px;
        }


        .monitor-view-toggle {
          display: inline-flex;
          padding: 3px;

          border: 1px solid #242c33;
          border-radius: 9px;

          background: #0d1115;
        }


        .monitor-view-toggle button {
          display: flex;
          align-items: center;
          gap: 6px;

          padding: 7px 10px;

          border: 0;
          border-radius: 6px;

          color: #68737d;
          background: transparent;

          font-size: 9px;
          font-weight: 700;

          cursor: pointer;
          transition: 160ms ease;
        }


        .monitor-view-toggle button:hover {
          color: #b9c1c7;
        }


        .monitor-view-toggle button.active {
          color: #e8edf1;
          background: #1a2026;
          box-shadow:
            0 2px 7px rgba(0,0,0,.2);
        }


        /* ==================================================
           EXIT BUTTON
        ================================================== */

        .monitor-exit {
          padding: 8px 14px;
          border: 1px solid #293139;
          border-radius: 8px;
          color: #8d98a2;
          background: #0d1115;
          cursor: pointer;
        }


        .monitor-exit:hover {
          color: #e5e9ec;
          border-color: #404b55;
        }


        /* ==================================================
           LIST VIEW
        ================================================== */

        .vehicle-list {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          border-top: 1px solid #171d22;
        }


        .vehicle-list-header {
          display: grid;
          grid-template-columns: 1fr 110px 70px;
          padding: 10px 16px;

          color: #505b65;
          border-bottom: 1px solid #1c2329;

          font-size: 7px;
          font-weight: 800;
          letter-spacing: .12em;
        }


        .vehicle-list-row {
          width: 100%;

          display: grid;
          grid-template-columns: 1fr 110px 70px;
          align-items: center;

          padding: 13px 16px;

          border: 0;
          border-bottom: 1px solid #171e24;

          color: #e5eaed;
          background: transparent;

          text-align: left;
          cursor: pointer;
        }


        .vehicle-list-row:hover,
        .vehicle-list-row.selected {
          background: #11171c;
        }


        .vehicle-list-identity {
          display: flex;
          align-items: center;
          gap: 10px;
        }


        .vehicle-mini-icon {
          width: 31px;
          height: 31px;

          display: grid;
          place-items: center;

          border-radius: 8px;

          color: #8b97a1;
          background: #171d23;
        }


        .vehicle-mini-info strong,
        .vehicle-mini-info span {
          display: block;
        }


        .vehicle-mini-info strong {
          font-size: 10px;
        }


        .vehicle-mini-info span {
          margin-top: 4px;
          color: #59646e;
          font-size: 8px;
        }


        .vehicle-status-label {
          display: flex;
          align-items: center;
          gap: 6px;

          color: #7f9689;

          font-size: 8px;
          font-weight: 800;
        }


        .vehicle-status-label span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #708d7e;
        }


        .vehicle-status-label.watch {
          color: #a99970;
        }


        .vehicle-status-label.watch span {
          background: #aa9562;
        }


        .vehicle-threat {
          color: #84978c;
          font-size: 11px;
          font-weight: 800;
        }


        .vehicle-threat.medium {
          color: #b29d6c;
        }


        .vehicle-threat small {
          margin-left: 2px;
          color: #525e67;
          font-size: 7px;
        }


        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 1000px) {

          .monitor-page {
            padding: 18px;
          }


          .monitor-main {
            grid-template-columns: 1fr;
            overflow-y: auto;
          }


          .intelligence-panel {
            max-height: 500px;
          }


          .fleet-map-shell {
            min-height: 360px;
          }


          .monitor-appbar {
            flex-wrap: wrap;
          }

        }


        @media (max-width: 600px) {

          .monitor-status > div {
            display: none;
          }


          .map-overlay-top {
            left: 50px;
            right: 60px;
            overflow: hidden;
          }


          .map-location {
            display: none;
          }


          .map-bottom-bar {
            font-size: 7px;
          }


          .vehicle-list-header,
          .vehicle-list-row {
            grid-template-columns:
              minmax(0, 1fr)
              80px
              55px;
          }

        }

      `}</style>
    </>
  )
}


/* ============================================================
   APPLICATION DOCK
============================================================ */

interface MonitorAppProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}


function MonitorApp({
  icon,
  title,
  description,
  onClick,
}: MonitorAppProps) {
  return (
    <button
      className="monitor-app-btn"
      onClick={onClick}
    >

      <div className="monitor-app-icon">
        {icon}
      </div>

      <div className="monitor-app-details">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <ChevronRight
        size={16}
        className="monitor-app-arrow"
      />

    </button>
  )
}