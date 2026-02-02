import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// ==============================================================================
// 🛠️ 이미지 파일 설정 (기존 유지)
// ==============================================================================
const CHARACTER_IMAGE_URL = "/cat_icon.png" 

const MAP_WIDTH = 24
const MAP_HEIGHT = 16
const MAP_ZONES = [
  { id: 'main', x: 0, y: -5, w: 10, h: 4, color: '#10b981', label: 'MAIN STATION' },
  { id: 'gateA', x: -8, y: 4, w: 4, h: 4, color: '#3b82f6', label: 'GATE A' },
  { id: 'gateB', x: 8, y: 4, w: 4, h: 4, color: '#3b82f6', label: 'GATE B' },
]

// ------------------------------------------------------------------
// 🧊 [3D 모드] 귀여운 고양이 로봇 모델 (기존 유지)
// ------------------------------------------------------------------
function CuteCatRobot3D({ position, color }: { position: [number, number, number], color: string }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.y = 0.5 + Math.sin(t * 2) * 0.1 
      groupRef.current.rotation.z = Math.sin(t) * 0.05
    }
  })

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.15} />
      </mesh>

      <group ref={groupRef}>
        <mesh castShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.8, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.3, 1.2, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.15, 0.3, 32]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.3, 1.2, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.15, 0.3, 32]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.9, 0.35]}>
          <sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.4, 0.45]}>
            <boxGeometry args={[0.4, 0.3, 0.1]} />
            <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </group>
  )
}

function Zone3D({ data }: { data: typeof MAP_ZONES[0] }) {
  return (
    <group position={[data.x, 0, data.y]}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[data.w, data.h]} />
        <meshStandardMaterial color={data.color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[data.w, 0.05, data.h]} />
        <meshStandardMaterial color={data.color} />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map((dir, i) => (
        <mesh key={i} position={[dir[0] * data.w/2, 1, dir[1] * data.h/2]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}

// ------------------------------------------------------------------
// 🖼️ [2D 모드] 이미지 맵 뷰어 (기존 유지)
// ------------------------------------------------------------------
function MapView2D({ robots, imageUrl }: { robots: any[], imageUrl: string }) {
  const toPercentX = (x: number) => ((x + MAP_WIDTH / 2) / MAP_WIDTH) * 100
  const toPercentY = (y: number) => ((y + MAP_HEIGHT / 2) / MAP_HEIGHT) * 100

  return (
    <div className="w-full h-full relative bg-slate-100 overflow-hidden select-none font-sans">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {MAP_ZONES.map((zone) => (
        <div
          key={zone.id}
          className="absolute border-2 flex items-center justify-center text-xs font-bold rounded-sm shadow-sm"
          style={{
            left: `${toPercentX(zone.x - zone.w / 2)}%`,
            top: `${toPercentY(zone.y - zone.h / 2)}%`,
            width: `${(zone.w / MAP_WIDTH) * 100}%`,
            height: `${(zone.h / MAP_HEIGHT) * 100}%`,
            borderColor: zone.color,
            backgroundColor: `${zone.color}25`,
            color: zone.color,
          }}
        >
          {zone.label}
        </div>
      ))}

      {robots.map((robot) => (
        <div
          key={robot.id}
          className="absolute flex flex-col items-center justify-center transition-all duration-500 ease-linear z-10"
          style={{
            left: `${toPercentX(robot.position.x / 10)}%`,
            top: `${toPercentY(robot.position.y / 10)}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative group">
            <img 
              src={imageUrl} 
              alt="Robot" 
              className="w-10 h-10 object-contain drop-shadow-lg" 
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-2xl filter drop-shadow-md">🐱</span>
            <span className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              robot.status === 'available' ? 'bg-green-500' : 'bg-amber-500'
            }`} />
          </div>
          
          <span className="text-[10px] font-bold text-slate-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm mt-1 border border-slate-200">
            {robot.id}
          </span>
        </div>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------
// 🚀 메인 스테이지 (수정됨!)
// ------------------------------------------------------------------
export default function RobotStage({ robots = [] }: { robots: any[] }) {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')

  return (
    // 1️⃣ [수정] h-full 추가하여 부모 컨테이너 높이를 100% 사용
    <div className="flex flex-col gap-3 h-full">
      
      {/* 헤더 부분 (높이는 내용물만큼만 차지: flex-none 효과) */}
      <div className="flex justify-between items-center shrink-0">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
          {viewMode === '3d' ? '🪐 3D Monitoring' : '🗺️ 2D Plan View'}
        </h3>
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex gap-1 shadow-sm">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
              viewMode === '2d' 
                ? 'bg-slate-100 text-slate-800 shadow-inner' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>🖼️</span> 2D IMAGE
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
              viewMode === '3d' 
                ? 'bg-blue-50 text-blue-600 shadow-inner' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>🧊</span> 3D ROBOT
          </button>
        </div>
      </div>

      {/* 2️⃣ [수정] 고정 높이(h-[500px]) 삭제 -> flex-1 min-h-0 추가 */}
      {/* 이제 이 영역이 남는 공간을 모두 차지합니다. */}
      <div className="relative w-full flex-1 min-h-0 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-md">
        {viewMode === '2d' ? (
          <MapView2D robots={robots} imageUrl={CHARACTER_IMAGE_URL} />
        ) : (
          <Canvas shadows camera={{ position: [0, 18, 18], fov: 45 }}>
            <color attach="background" args={['#f8fafc']} />
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <gridHelper args={[MAP_WIDTH * 2, 40, 0xcbd5e1, 0xf1f5f9]} />

            {MAP_ZONES.map(zone => <Zone3D key={zone.id} data={zone} />)}

            {robots.map((robot) => (
              <CuteCatRobot3D 
                key={robot.id} 
                position={[robot.position.x / 10, 0, robot.position.y / 10]} 
                color={robot.status === 'available' ? '#3b82f6' : '#f59e0b'}
              />
            ))}
            <OrbitControls maxPolarAngle={Math.PI / 2.2} />
          </Canvas>
        )}
      </div>
    </div>
  )
}