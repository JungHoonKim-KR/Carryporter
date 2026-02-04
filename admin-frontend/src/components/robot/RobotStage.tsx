import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Clone, Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion' // 🔥 애니메이션용 추가
import { LayoutGrid, Box, Activity, Zap, Radio, Maximize2 } from 'lucide-react'

// ==============================================================================
// 🛠️ 설정
// ==============================================================================
const ROBOT_GLB_URL = "./models/carryporter.glb"
const CHARACTER_IMAGE_URL = "/cat_icon.png"

const MAP_WIDTH = 24
const MAP_HEIGHT = 16
const MAP_ZONES = [
  { id: 'main', x: 0, y: -5, w: 10, h: 4, color: '#10b981', label: 'MAIN STATION' },
  { id: 'gateA', x: -8, y: 4, w: 4, h: 4, color: '#3b82f6', label: 'GATE A' },
  { id: 'gateB', x: 8, y: 4, w: 4, h: 4, color: '#3b82f6', label: 'GATE B' },
]

// ------------------------------------------------------------------
// 🧊 [Component] GLB Robot 3D
// ------------------------------------------------------------------
function GlbRobot3D({ position, status, robotCode }: { position: [number, number, number], status: string, robotCode: string }) {
  const { scene } = useGLTF(ROBOT_GLB_URL)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 2) * 0.1
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1
    }
  })

  const isAvailable = status === 'available'
  const statusColor = isAvailable ? '#10b981' : '#f59e0b'

  return (
    <group position={[position[0], 0, position[2]]}>
      <group ref={groupRef}>
        <Clone object={scene} scale={1.5} position={[0, 1.8, 0]} rotation={[0, 0, 0]} />
      </group>

      {/* 바닥 링 */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial color={statusColor} opacity={0.6} transparent />
      </mesh>

      {/* 3D 라벨 (스타일 맞춤) */}
      <Html position={[0, 3.0, 0]} center distanceFactor={10}>
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/80 backdrop-blur-md text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            {robotCode}
          </div>
          <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isAvailable ? 'bg-emerald-400' : 'bg-amber-400'} shadow-[0_0_8px_currentColor]`} />
        </div>
      </Html>
    </group>
  )
}

useGLTF.preload(ROBOT_GLB_URL)

// ------------------------------------------------------------------
// 🧊 [Component] Map Zone 3D
// ------------------------------------------------------------------
function Zone3D({ data }: { data: typeof MAP_ZONES[0] }) {
  return (
    <group position={[data.x, 0, data.y]}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[data.w, data.h]} />
        <meshStandardMaterial color={data.color} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0, Math.min(data.w, data.h) / 2, 4]} />
        <boxGeometry args={[data.w, 0.02, data.h]} />
        <meshStandardMaterial color={data.color} opacity={0.2} transparent emissive={data.color} emissiveIntensity={0.2} />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map((dir, i) => (
        <mesh key={i} position={[dir[0] * data.w / 2, 0.5, dir[1] * data.h / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
          <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={0.8} />
        </mesh>
      ))}
      <Html position={[0, 1, 0]} center transform sprite>
        <div className="text-xs font-black text-cyan-500/50 tracking-widest whitespace-nowrap pointer-events-none select-none uppercase">
          {data.label}
        </div>
      </Html>
    </group>
  )
}

// ------------------------------------------------------------------
// 🗺️ [Component] 2D Map View (Dark Mode)
// ------------------------------------------------------------------
function MapView2D({ robots, imageUrl }: { robots: any[], imageUrl: string }) {
  const toPercentX = (x: number) => ((x + MAP_WIDTH / 2) / MAP_WIDTH) * 100
  const toPercentY = (y: number) => ((y + MAP_HEIGHT / 2) / MAP_HEIGHT) * 100

  return (
    <div className="w-full h-full relative bg-slate-900 overflow-hidden select-none font-sans group">
      {/* 어두운 배경 그리드 */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* 존 표시 */}
      {MAP_ZONES.map((zone) => (
        <div key={zone.id} className="absolute border flex items-center justify-center text-xs font-bold rounded-xl transition-opacity opacity-60"
          style={{
            left: `${toPercentX(zone.x - zone.w / 2)}%`,
            top: `${toPercentY(zone.y - zone.h / 2)}%`,
            width: `${(zone.w / MAP_WIDTH) * 100}%`,
            height: `${(zone.h / MAP_HEIGHT) * 100}%`,
            borderColor: zone.color,
            backgroundColor: `${zone.color}10`,
            color: zone.color,
            boxShadow: `0 0 15px ${zone.color}20`
          }}>
          {zone.label}
        </div>
      ))}

      {/* 로봇 표시 */}
      {robots.map((robot) => {
        const xPos = robot.x ?? 0;
        const yPos = robot.y ?? 0;
        const isAvailable = robot.status === 'available';

        return (
          <div key={robot.robotCode || robot.id}
            className="absolute flex flex-col items-center justify-center transition-all duration-700 ease-out z-10"
            style={{
              left: `${toPercentX(xPos / 10)}%`,
              top: `${toPercentY(yPos / 10)}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`absolute w-12 h-12 rounded-full opacity-20 animate-ping ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div className="relative transform hover:scale-110 transition-transform">
              <img src={imageUrl} alt="Robot" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
              />
              <span className="hidden text-3xl filter drop-shadow-md">🤖</span>
              <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 shadow-sm ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </div>
            <span className="text-[10px] font-bold text-cyan-300 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-lg mt-1 border border-cyan-500/30">
              {robot.robotCode || robot.id}
            </span>
          </div>
        );
      })}
    </div>
  )
}

// ------------------------------------------------------------------
// 🚀 [Main Page] Robot Stage
// ------------------------------------------------------------------
export default function RobotStage({
  robots = [],
  showDummyIfEmpty = false
}: {
  robots: any[];
  showDummyIfEmpty?: boolean;
}) {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')

  // 활성 로봇 수 계산 (Working + active)
  const activeCount = useMemo(() => {
    return robots.length; // 실제 로직에 맞게 필터링 가능 (예: r.status === 'working')
  }, [robots]);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden font-sans rounded-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] group">
      
      {/* ✨ 테두리 빛나는 효과 (전체 컨테이너) */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
         <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 animate-pulse" />
      </div>

      {/* ========================================================================
          🛰️ HUD UI Layer (Overlay)
          ======================================================================== */}
      
      {/* 1. 왼쪽 상단: 스캐닝 & 상태 정보 */}
      <div className="absolute top-3 left-3 flex gap-2 pointer-events-none z-50">
        {/* Scanning Indicator */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-2 text-[10px] font-bold text-cyan-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 shadow-lg"
        >
          <div className="relative">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 bg-cyan-400/50 blur-md rounded-full" />
          </div>
          <span className="tracking-wider">SCANNING AREA</span>
        </motion.div>

        {/* Active Count */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30 shadow-lg"
        >
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>{activeCount} ACTIVE</span>
        </motion.div>
      </div>

      {/* 2. 오른쪽 상단: 2D/3D 전환 버튼 (통일된 디자인) */}
      <div className="absolute top-3 right-3 flex gap-2 z-50">
        <div className="bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-cyan-500/30 shadow-lg flex">
          <button
            onClick={() => setViewMode('2d')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-300
              ${viewMode === '2d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-500 hover:text-cyan-200 hover:bg-white/5 border border-transparent'
              }
            `}
          >
            <LayoutGrid size={12} />
            2D MAP
          </button>
          
          <div className="w-[1px] bg-slate-700 mx-1 my-1" /> {/* 구분선 */}

          <button
            onClick={() => setViewMode('3d')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-300
              ${viewMode === '3d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-500 hover:text-cyan-200 hover:bg-white/5 border border-transparent'
              }
            `}
          >
            <Box size={12} />
            3D VIEW
          </button>
        </div>
      </div>

      {/* 3. 오른쪽 하단: 확장 버튼 */}
      <div className="absolute bottom-3 right-3 z-50">
        <button className="p-2 bg-slate-900/80 backdrop-blur-md shadow-xl rounded-lg hover:scale-110 transition-transform border border-cyan-500/30 hover:border-cyan-400/60 group">
          <Maximize2 className="w-4 h-4 text-cyan-500 group-hover:text-cyan-300" />
        </button>
      </div>


      {/* ========================================================================
          🗺️ Main Visual Area (Dark Theme)
          ======================================================================== */}
      <div className="absolute inset-0 w-full h-full bg-slate-900">
        {viewMode === '2d' ? (
          <MapView2D robots={robots} imageUrl={CHARACTER_IMAGE_URL} />
        ) : (
          <Canvas shadows camera={{ position: [0, 18, 18], fov: 45 }}>
            <color attach="background" args={['#0f172a']} /> {/* Slate-900 */}
            <fog attach="fog" args={['#0f172a', 20, 50]} />

            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            
            {/* Dark Grid */}
            <gridHelper args={[MAP_WIDTH * 3, 60, 0x1e293b, 0x1e293b]} />
            
            {/* Main Ground */}
            <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -0.01, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} />
            </mesh>

            {MAP_ZONES.map(zone => <Zone3D key={zone.id} data={zone} />)}

            <Suspense fallback={null}>
              {robots.map((robot) => {
                const xPos = robot.x ?? 0;
                const yPos = robot.y ?? 0;
                return (
                  <GlbRobot3D
                    key={robot.robotCode || robot.id}
                    robotCode={robot.robotCode || robot.id}
                    position={[xPos / 10, 0, yPos / 10]}
                    status={robot.status}
                  />
                );
              })}
            </Suspense>

            <OrbitControls maxPolarAngle={Math.PI / 2.2} minDistance={5} maxDistance={30} />
          </Canvas>
        )}
      </div>
      
      {/* 맵 하단 부드러운 그라데이션 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none z-10" />
    </div>
  )
}