
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bluetooth,
  Car,
  ChevronRight,
  MapPin,
  Music,
  Phone,
  Play,
  Radio,
  Settings,
  ShieldCheck,
  Smartphone,
  Volume2,
  Wifi,
} from 'lucide-react'

import MonitorPage from './pages/MonitorPage'
import './App.css'

type Screen = 'home' | 'identity' | 'monitor'

type Role = 'driver' | 'monitor'

function App() {
  const [screen, setScreen] = useState<Screen>('home')

  return (
    <main className="acaid-shell">
      <AnimatePresence mode="wait">

        {screen === 'home' && (
          <HomeScreen
            key="home"
            onEnterAcaid={() => setScreen('identity')}
          />
        )}

        {screen === 'identity' && (
          <IdentityScreen
            key="identity"
            onBack={() => setScreen('home')}
            onContinue={(role) => {
              if (role === 'monitor') {
                setScreen('monitor')
              }
            }}
          />
        )}

        {screen === 'monitor' && (
          <MonitorPage
            key="monitor"
            onBack={() => setScreen('identity')} onOpen={function (_screen: 'camera' | 'trips' | 'calls' | 'insurance'): void {
              throw new Error('Function not implemented.')
            } }          />
        )}

      </AnimatePresence>
    </main>
  )
}

/* ─────────────────────────────────────────────
   STATUS BAR
───────────────────────────────────────────── */

function StatusBar() {
  return (
    <header className="status-bar">
      <div className="brand">
        <div className="brand-mark">
          <ShieldCheck size={19} strokeWidth={2.2} />
        </div>

        <div>
          <span className="brand-name">ACAID</span>
          <span className="brand-subtitle">
            VEHICLE INTELLIGENCE
          </span>
        </div>
      </div>

      <div className="vehicle-status">

        <div className="status-item">
          <Bluetooth size={16} />
          <span>Connected</span>
        </div>

        <div className="status-item">
          <Wifi size={16} />
          <span>LTE</span>
        </div>

        <div className="status-item">
          <Car size={16} />
          <span>Ready</span>
        </div>

        <div className="clock">
          21:42
        </div>

      </div>
    </header>
  )
}

/* ─────────────────────────────────────────────
   HOME
───────────────────────────────────────────── */

function HomeScreen({
  onEnterAcaid,
}: {
  onEnterAcaid: () => void
}) {
  return (
    <motion.section
      className="screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <StatusBar />

      <div className="home-content">

        <section className="welcome">
          <div>
            <p className="eyebrow">
              GOOD EVENING
            </p>

            <h1>
              Welcome back.
            </h1>

            <p className="welcome-copy">
              Your vehicle is connected and ready.
            </p>
          </div>

          <div className="location-pill">
            <MapPin size={15} />
            <span>Gqeberha</span>
          </div>
        </section>

        <section className="home-grid">

          <MusicCard />

          <div className="quick-actions">

            <QuickAction
              icon={<Phone />}
              label="Phone"
              detail="No active call"
            />

            <QuickAction
              icon={<Bluetooth />}
              label="Bluetooth"
              detail="Abonga's phone"
              active
            />

            <QuickAction
              icon={<Radio />}
              label="Media"
              detail="Bluetooth Audio"
            />

            <QuickAction
              icon={<Settings />}
              label="Vehicle"
              detail="System settings"
            />

          </div>

        </section>

        <button
          className="acaid-entry"
          onClick={onEnterAcaid}
        >
          <div className="acaid-entry-icon">
            <ShieldCheck size={25} />
          </div>

          <div className="acaid-entry-text">
            <span>
              ENTER ACAID
            </span>

            <small>
              Vehicle intelligence & protection
            </small>
          </div>

          <ChevronRight size={24} />
        </button>

      </div>

      <footer className="bottom-bar">
        <span>ACAID OS</span>
        <span>
          Vehicle systems operational
        </span>
      </footer>

    </motion.section>
  )
}

/* ─────────────────────────────────────────────
   MUSIC
───────────────────────────────────────────── */

function MusicCard() {
  return (
    <div className="music-card">

      <div className="music-art">
        <Music size={32} />
      </div>

      <div className="music-info">

        <span className="card-label">
          NOW PLAYING
        </span>

        <h2>
          Nothing playing
        </h2>

        <p>
          Connect a device to start listening
        </p>

        <div className="music-controls">

          <button aria-label="Volume">
            <Volume2 size={18} />
          </button>

          <button
            className="play-button"
            aria-label="Play"
          >
            <Play
              size={18}
              fill="currentColor"
            />
          </button>

          <button
            aria-label="Connect device"
          >
            <Smartphone size={18} />
          </button>

        </div>

      </div>

    </div>
  )
}

/* ─────────────────────────────────────────────
   QUICK ACTION
───────────────────────────────────────────── */

function QuickAction({
  icon,
  label,
  detail,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  detail: string
  active?: boolean
}) {
  return (
    <button
      className={`quick-action ${
        active ? 'active' : ''
      }`}
    >

      <div className="quick-icon">
        {icon}
      </div>

      <div className="quick-copy">

        <strong>
          {label}
        </strong>

        <span>
          {detail}
        </span>

      </div>

    </button>
  )
}

/* ─────────────────────────────────────────────
   IDENTITY
───────────────────────────────────────────── */

function IdentityScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void
  onContinue: (role: Role) => void
}) {
  const [selected, setSelected] =
    useState<Role | null>(null)

  return (
    <motion.section
      className="screen identity-screen"
      initial={{
        opacity: 0,
        x: 25,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: -25,
      }}
    >

      <button
        className="back-button"
        onClick={onBack}
      >
        ← Back
      </button>

      <div className="identity-content">

        <p className="eyebrow">
          ACAID ACCESS
        </p>

        <h1>
          Who are you?
        </h1>

        <p className="identity-description">
          Select your role to enter the
          vehicle intelligence system.
        </p>

        <div className="role-grid">

          <RoleCard
            type="driver"
            selected={selected === 'driver'}
            onClick={() =>
              setSelected('driver')
            }
          />

          <RoleCard
            type="monitor"
            selected={selected === 'monitor'}
            onClick={() =>
              setSelected('monitor')
            }
          />

        </div>

        <AnimatePresence>

          {selected && (
            <motion.button
              className="continue-button"
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              onClick={() =>
                onContinue(selected)
              }
            >
              Continue
              <ChevronRight size={20} />
            </motion.button>
          )}

        </AnimatePresence>

      </div>

    </motion.section>
  )
}

/* ─────────────────────────────────────────────
   ROLE CARD
───────────────────────────────────────────── */

function RoleCard({
  type,
  selected,
  onClick,
}: {
  type: Role
  selected: boolean
  onClick: () => void
}) {
  const driver = type === 'driver'

  return (
    <button
      className={`role-card ${
        selected ? 'selected' : ''
      }`}
      onClick={onClick}
    >

      <div className="role-icon">
        {driver ? (
          <Car size={30} />
        ) : (
          <MapPin size={30} />
        )}
      </div>

      <div>

        <h2>
          {driver
            ? 'Driver'
            : 'Monitor'}
        </h2>

        <p>
          {driver
            ? 'Access your vehicle and personal safety controls.'
            : 'Monitor connected vehicles and security events.'}
        </p>

      </div>

      <ChevronRight
        size={22}
        className="role-arrow"
      />

    </button>
  )
}

export default App
