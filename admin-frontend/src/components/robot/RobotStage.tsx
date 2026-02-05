import { useState, useRef, Suspense, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Clone, Html, Text, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { LayoutGrid, Box, Maximize2, AlertTriangle, RotateCcw } from 'lucide-react' // RotateCcw 아이콘 추가
import RobotDetailModal from './RobotDetailModal'

// ==============================================================================
// 🛠️ 설정
// ==============================================================================
const ROBOT_GLB_URL = "./models/carryporter.glb"
const CHARACTER_IMAGE_URL = "/cat_icon.png"

const MAP_WIDTH = 24
const MAP_HEIGHT = 16

const MAP_ZONES = [
  // 1. 왼쪽 거대 구역: Main Station (충전/복귀) -> 바닥에 납작하게 배치됨
  { id: 'main', type: 'station', x: -8, y: 0, w: 6, h: 12, color: '#fbbf24', label: 'MAIN STATION' },
  // 2. 상단 중앙: Stop-2
  { id: 'stop2', type: 'stop', x: 0, y: -5, w: 3, h: 3, color: '#34d399', label: 'STOP-2' },
  // 3. 우측 상단: Gate-1
  { id: 'gate1', type: 'gate', x: 8, y: -5, w: 4, h: 4, color: '#3b82f6', label: 'GATE-1' },
  // 4. 하단 중앙: Stop-1
  { id: 'stop1', type: 'stop', x: 0, y: 5, w: 3, h: 3, color: '#34d399', label: 'STOP-1' },
  // 5. 우측 하단: 장애물 (이것만 입체적으로 튀어나옴)
  { id: 'obstacle', type: 'obstacle', x: 7, y: 4, w: 6, h: 4, color: '#f43f5e', label: 'RESTRICTED' },
]

// ------------------------------------------------------------------
// 🧊 [Component] GLB Robot 3D
// ------------------------------------------------------------------
function GlbRobot3D({ 
  position, 
  status, 
  robotCode, 
  onClick 
}: { 
  position: [number, number, number], 
  status: string, 
  robotCode: string,
  onClick: () => void
}) {
  const { scene } = useGLTF(ROBOT_GLB_URL)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.envMapIntensity = 1.5; 
        material.emissive = new THREE.Color(0x202020);
        material.emissiveIntensity = 0.2;
        material.needsUpdate = true;
      }
    });
  }, [scene]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 2) * 0.1 + (hovered ? 0.3 : 0)
    }
    if (state.gl.domElement) {
      state.gl.domElement.style.cursor = hovered ? 'pointer' : 'auto'
    }
  })

  const isAvailable = status === 'available'
  const statusColor = isAvailable ? '#10b981' : '#3b82f6'

  return (
    <group position={[position[0], 0, position[2]]}>
      <spotLight position={[0, 4, 0]} intensity={5} distance={8} angle={0.6} penumbra={0.5} color="#ffffff" />
      <pointLight position={[0, 1, 1]} intensity={2} distance={3} color="#ffffff" />

      <group 
        ref={groupRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <Clone object={scene} scale={hovered ? 1.65 : 1.5} position={[0, 1.8, 0]} rotation={[0, 0, 0]} />
      </group>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.5, hovered ? 1.0 : 0.8, 32]} />
        <meshBasicMaterial color={statusColor} opacity={hovered ? 0.8 : 0.6} transparent />
      </mesh>
      
      <pointLight position={[0, 1, 0]} color={statusColor} intensity={hovered ? 4 : 2} distance={3} decay={2} />

      <Html position={[0, 3.5, 0]} center distanceFactor={12} zIndexRange={[0, 0]}>
        <div className="flex flex-col items-center transform transition-transform hover:scale-110">
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-md border backdrop-blur-md shadow-lg transition-all
            ${isAvailable ? 'bg-slate-900/80 border-emerald-500/50 text-emerald-400' : 'bg-slate-900/80 border-blue-500/50 text-blue-400'}
            ${hovered ? 'scale-110 shadow-xl' : ''}
          `}>
            <span className="text-[10px] font-black tracking-tighter">{robotCode}</span>
          </div>
          <div className={`w-0.5 h-4 ${isAvailable ? 'bg-emerald-500/50' : 'bg-blue-500/50'}`} />
        </div>
      </Html>
    </group>
  )
}

useGLTF.preload(ROBOT_GLB_URL)

// ------------------------------------------------------------------
// 🧊 [Component] Zone 3D (수정됨: Station은 바닥에 깔리게)
// ------------------------------------------------------------------
function Zone3D({ data }: { data: typeof MAP_ZONES[0] }) {
  const isObstacle = data.type === 'obstacle';
  const isStation = data.type === 'station';

  return (
    <group position={[data.x, 0, data.y]}>
      {isObstacle ? (
        // [장애물] 기존 스타일 유지 (입체 박스)
        <group>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[data.w, 1, data.h]} />
            <meshStandardMaterial color={data.color} transparent opacity={0.3} wireframe />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
             <boxGeometry args={[data.w * 0.95, 0.9, data.h * 0.95]} />
             <meshStandardMaterial color="#500000" transparent opacity={0.5} />
          </mesh>
          <Text position={[0, 1.5, 0]} fontSize={2} color={data.color} rotation={[-Math.PI/2, 0, 0]}>RESTRICTED</Text>
        </group>
      ) : (
        // [Station & 일반 구역] 납작한 바닥 스타일로 변경
        <group>
          {/* 바닥 면 */}
          <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0.01, 0]}>
            <planeGeometry args={[data.w, data.h]} />
            <meshStandardMaterial 
              color={data.color} 
              transparent 
              opacity={isStation ? 0.2 : 0.1} 
              emissive={data.color}
              emissiveIntensity={isStation ? 0.2 : 0}
            />
          </mesh>
          
          {/* 테두리 라인 */}
          <lineSegments position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
             <edgesGeometry args={[new THREE.PlaneGeometry(data.w, data.h)]} />
             <lineBasicMaterial color={data.color} linewidth={2} />
          </lineSegments>

          {/* 모서리 포인트 */}
          {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map((dir, i) => (
            <mesh key={i} position={[dir[0] * data.w / 2, 0.02, dir[1] * data.h / 2]}>
              <boxGeometry args={[0.4, 0.05, 0.4]} />
              <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={3} />
            </mesh>
          ))}

          {/* Station 전용 아이콘 (바닥 데칼) */}
          {isStation && (
             <group position={[0, 0.03, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <Text fontSize={3} color={data.color} fillOpacity={0.3} position={[0, 0, 0]}>⚡</Text>
                <Text fontSize={0.8} color={data.color} fillOpacity={0.5} position={[0, -2, 0]}>CHARGING ZONE</Text>
             </group>
          )}
        </group>
      )}
      
      {/* 라벨 위치 조정 */}
      <Html position={[0, isObstacle ? 1.5 : 0.5, 0]} center transform sprite zIndexRange={[0, 0]}>
        <div className={`
          text-xs font-black tracking-widest whitespace-nowrap pointer-events-none select-none px-2 py-0.5 rounded
          ${isObstacle ? 'bg-red-500/20 text-red-500 border border-red-500/50' : `text-${data.color} opacity-60`}
        `} style={{ color: data.color, textShadow: `0 0 10px ${data.color}` }}>
          {data.label}
        </div>
      </Html>
    </group>
  )
}

// ------------------------------------------------------------------
// 🗺️ [Component] 2D Map View
// ------------------------------------------------------------------
function MapView2D({ robots, imageUrl, onRobotClick }: { robots: any[], imageUrl: string, onRobotClick: (robot: any) => void }) {
  const toPercentX = (x: number) => ((x + MAP_WIDTH / 2) / MAP_WIDTH) * 100
  const toPercentY = (y: number) => ((y + MAP_HEIGHT / 2) / MAP_HEIGHT) * 100

  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden select-none font-sans group">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {MAP_ZONES.map((zone) => {
         const isObstacle = zone.type === 'obstacle';
         return (
          <div key={zone.id} 
            className={`absolute border flex flex-col items-center justify-center text-xs font-bold rounded-md transition-opacity duration-300
              ${isObstacle ? 'opacity-80' : 'opacity-40'}
            `}
            style={{
              left: `${toPercentX(zone.x - zone.w / 2)}%`,
              top: `${toPercentY(zone.y - zone.h / 2)}%`,
              width: `${(zone.w / MAP_WIDTH) * 100}%`,
              height: `${(zone.h / MAP_HEIGHT) * 100}%`,
              borderColor: zone.color,
              backgroundColor: isObstacle 
                ? `repeating-linear-gradient(45deg, ${zone.color}20, ${zone.color}20 10px, ${zone.color}40 10px, ${zone.color}40 20px)`
                : `${zone.color}05`,
              color: zone.color,
            }}>
            {isObstacle && <AlertTriangle className="w-6 h-6 mb-1 animate-pulse" />}
            {zone.label}
          </div>
        )
      })}

      {robots.map((robot) => {
        const xPos = robot.x ?? 0;
        const yPos = robot.y ?? 0;
        const isAvailable = robot.status === 'available';
        return (
          <button
            key={robot.robotCode || robot.id}
            onClick={() => onRobotClick(robot)}
            className="absolute flex flex-col items-center justify-center transition-all duration-700 ease-out z-20 cursor-pointer hover:scale-110"
            style={{
              left: `${toPercentX(xPos / 10)}%`,
              top: `${toPercentY(yPos / 10)}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`absolute w-16 h-16 rounded-full opacity-30 animate-ping ${isAvailable ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            <div className="relative transform hover:scale-110 transition-transform">
              <div className={`w-8 h-8 rounded-full border-2 bg-slate-900 flex items-center justify-center overflow-hidden ${isAvailable ? 'border-emerald-400' : 'border-blue-400'}`}>
                 <img src={imageUrl} alt="Bot" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}/>
              </div>
            </div>
            <span className="text-[9px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded shadow-sm mt-1 border border-slate-700 whitespace-nowrap">
              {robot.robotCode || robot.id}
            </span>
          </button>
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
  const [selectedRobot, setSelectedRobot] = useState<any | null>(null)
  
  // 🎮 OrbitControls 제어를 위한 Ref
  const controlsRef = useRef<any>(null)

  const activeCount = useMemo(() => robots.length, [robots]);

  const handleRobotClick = (robot: any) => {
    setSelectedRobot(robot)
  }

  // 📷 뷰 리셋 함수
  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset(); // 카메라 초기 위치로 복귀
    }
  }

  // 📍 로봇 좌표 보정 (데이터가 없을 시 메인 스테이션으로)
  const displayRobots = useMemo(() => {
    return robots.map(r => ({
        ...r,
        // 메인 스테이션 좌표 (x: -8)에 맞추기 위해, 화면 비율(1/10) 고려하여 -80으로 설정
        x: (r.x !== undefined && r.x !== null) ? r.x : -80, 
        y: (r.y !== undefined && r.y !== null) ? r.y : 0
    }))
  }, [robots]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden font-sans rounded-xl border border-slate-800 shadow-2xl group">
      
      {/* UI Layers */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10">
         <div className="absolute inset-0 rounded-xl border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]" />
      </div>

      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-50">
        <div className="flex items-center gap-2">
           <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
           <span className="text-[10px] font-bold text-slate-400 tracking-widest">LIVE MONITORING</span>
        </div>
        <h2 className="text-xl font-black text-white italic tracking-tighter">SECTOR <span className="text-cyan-400">A-1</span></h2>
      </div>

      <div className="absolute top-4 right-4 flex gap-2 z-50">
        <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-xl flex">
          <button onClick={() => setViewMode('2d')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === '2d' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <LayoutGrid size={12} /> 2D
          </button>
          <div className="w-[1px] bg-slate-700 mx-1 my-1" />
          <button onClick={() => setViewMode('3d')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === '3d' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <Box size={12} /> 3D
          </button>
        </div>
      </div>

      {/* 하단 컨트롤 바 */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-50">
          <div className="flex gap-2">
             <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded border border-slate-800 text-[10px] text-slate-400 font-mono">ROBOTS: <span className="text-white font-bold">{activeCount}</span></div>
             <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded border border-slate-800 text-[10px] text-slate-400 font-mono">STATUS: <span className="text-emerald-400 font-bold">NORMAL</span></div>
          </div>
          
          <div className="flex gap-2 pointer-events-auto">
            {/* 🔄 원점 복귀(Reset) 버튼 추가 */}
            <button 
                onClick={handleResetView}
                className="p-2 bg-slate-800/80 backdrop-blur text-slate-300 rounded hover:bg-cyan-500 hover:text-white transition-colors border border-slate-700 shadow-lg group/btn"
                title="Reset Camera View"
            >
                <RotateCcw className="w-4 h-4 group-hover/btn:-rotate-180 transition-transform duration-500" />
            </button>

            <button className="p-2 bg-slate-800/80 backdrop-blur text-slate-300 rounded hover:bg-cyan-500 hover:text-white transition-colors border border-slate-700 shadow-lg">
                <Maximize2 className="w-4 h-4" />
            </button>
          </div>
      </div>

      {/* 3D Scene Area */}
      <div className="absolute inset-0 w-full h-full bg-[#0b1121]">
        {viewMode === '2d' ? (
          <MapView2D robots={displayRobots} imageUrl={CHARACTER_IMAGE_URL} onRobotClick={handleRobotClick} />
        ) : (
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 22, 18], fov: 40 }}>
            <color attach="background" args={['#0b1121']} />
            <fog attach="fog" args={['#0b1121', 20, 55]} />

            <Environment preset="city" />

            <ambientLight intensity={0.5} />
            <pointLight position={[-10, 10, -10]} intensity={1} color="#fbbf24" distance={20} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" distance={20} />
            <directionalLight position={[5, 20, 5]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
            
            <gridHelper args={[60, 60, 0x1e293b, 0x111827]} position={[0, -0.01, 0]} />
            
            <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -0.02, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
            </mesh>

            {MAP_ZONES.map(zone => <Zone3D key={zone.id} data={zone} />)}

            <Suspense fallback={null}>
              {displayRobots.map((robot) => {
                const xPos = robot.x ?? 0;
                const yPos = robot.y ?? 0;
                return (
                  <GlbRobot3D
                    key={robot.robotCode || robot.id}
                    robotCode={robot.robotCode || robot.id}
                    position={[xPos / 10, 0, yPos / 10]}
                    status={robot.status}
                    onClick={() => handleRobotClick(robot)}
                  />
                );
              })}
            </Suspense>

            {/* OrbitControls에 ref 연결 */}
            <OrbitControls 
                ref={controlsRef}
                maxPolarAngle={Math.PI / 2.1} 
                minDistance={10} 
                maxDistance={40} 
                enablePan={true} 
            />
          </Canvas>
        )}
      </div>

      {selectedRobot && <RobotDetailModal robot={selectedRobot} onClose={() => setSelectedRobot(null)} />}
    </div>
  )
}