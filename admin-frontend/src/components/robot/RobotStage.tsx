import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Clone, Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { LayoutGrid, Box, Activity, Zap, Radio, Maximize2, AlertTriangle } from 'lucide-react'

// ==============================================================================
// 🛠️ 설정 (맵 레이아웃 재구성)
// ==============================================================================
const ROBOT_GLB_URL = "./models/carryporter.glb"
const CHARACTER_IMAGE_URL = "/cat_icon.png"

const MAP_WIDTH = 24
const MAP_HEIGHT = 16

// 📍 요청하신 이미지 배치에 맞춘 구역 정의
const MAP_ZONES = [
  // 1. 왼쪽 거대 구역: Main Station (충전/복귀)
  { id: 'main', type: 'station', x: -8, y: 0, w: 6, h: 12, color: '#fbbf24', label: 'MAIN STATION' },
  
  // 2. 상단 중앙: Stop-2
  { id: 'stop2', type: 'stop', x: 0, y: -5, w: 3, h: 3, color: '#34d399', label: 'STOP-2' },
  
  // 3. 우측 상단: Gate-1
  { id: 'gate1', type: 'gate', x: 8, y: -5, w: 4, h: 4, color: '#3b82f6', label: 'GATE-1' },

  // 4. 하단 중앙: Stop-1
  { id: 'stop1', type: 'stop', x: 0, y: 5, w: 3, h: 3, color: '#34d399', label: 'STOP-1' },

  // 5. 우측 하단: 장애물 (X 표시)
  { id: 'obstacle', type: 'obstacle', x: 7, y: 4, w: 6, h: 4, color: '#f43f5e', label: 'RESTRICTED' },
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
      // 둥둥 떠있는 효과
      groupRef.current.position.y = Math.sin(t * 2) * 0.1
    }
  })

  const isAvailable = status === 'available'
  // working이면 파란색, available이면 초록색, error면 빨간색 등 상태별 색상
  const statusColor = isAvailable ? '#10b981' : '#3b82f6'

  return (
    <group position={[position[0], 0, position[2]]}>
      <group ref={groupRef}>
        <Clone object={scene} scale={1.5} position={[0, 1.8, 0]} rotation={[0, 0, 0]} />
      </group>

      {/* 바닥 링 (상태 표시) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.5, 0.8, 32]} />
        <meshBasicMaterial color={statusColor} opacity={0.6} transparent />
      </mesh>
      
      {/* 로봇 아래 은은한 빛 */}
      <pointLight position={[0, 1, 0]} color={statusColor} intensity={2} distance={3} decay={2} />

      {/* 3D 라벨 */}
      <Html position={[0, 3.2, 0]} center distanceFactor={12} zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center transform transition-transform hover:scale-110">
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-md border backdrop-blur-md shadow-lg
            ${isAvailable 
              ? 'bg-slate-900/80 border-emerald-500/50 text-emerald-400' 
              : 'bg-slate-900/80 border-blue-500/50 text-blue-400'}
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
// 🧊 [Component] Zone 3D (타입별 렌더링 분리)
// ------------------------------------------------------------------
function Zone3D({ data }: { data: typeof MAP_ZONES[0] }) {
  const isObstacle = data.type === 'obstacle';
  const isStation = data.type === 'station';

  return (
    <group position={[data.x, 0, data.y]}>
      {/* 1. 장애물 구역일 경우: 입체적인 벽으로 표현 */}
      {isObstacle ? (
        <group>
          {/* 위험 구역 박스 */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[data.w, 1, data.h]} />
            <meshStandardMaterial color={data.color} transparent opacity={0.3} wireframe />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
             <boxGeometry args={[data.w * 0.95, 0.9, data.h * 0.95]} />
             <meshStandardMaterial color="#500000" transparent opacity={0.5} />
          </mesh>
          
          {/* 바닥의 X 표시 */}
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
            <planeGeometry args={[Math.min(data.w, data.h), Math.min(data.w, data.h)]} />
            <meshBasicMaterial color={data.color} transparent opacity={0.2} alphaMap={null} />
          </mesh>
          
          {/* 3D 텍스트 "X" */}
          <Text position={[0, 1.5, 0]} fontSize={2} color={data.color} rotation={[-Math.PI/2, 0, 0]}>
            X
          </Text>
        </group>
      ) : (
        // 2. 일반 구역 (Station, Stop, Gate)
        <group>
          {/* 바닥 면 */}
          <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0.01, 0]}>
            <planeGeometry args={[data.w, data.h]} />
            <meshStandardMaterial color={data.color} transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
          
          {/* 테두리 빛나는 효과 */}
          <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0, Math.min(data.w, data.h) / 2, 4]} /> 
            {/* 네모난 테두리를 위해 ringGeometry 대신 boxGeometry 사용 */}
            <boxGeometry args={[data.w, 0.05, data.h]} />
            <meshStandardMaterial color={data.color} opacity={0.4} transparent emissive={data.color} emissiveIntensity={0.5} />
          </mesh>

          {/* 모서리 기둥 (홀로그램 프로젝터 느낌) */}
          {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map((dir, i) => (
            <mesh key={i} position={[dir[0] * data.w / 2, 0.25, dir[1] * data.h / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
              <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={2} />
            </mesh>
          ))}

          {/* Main Station일 경우 바닥 아이콘 추가 */}
          {isStation && (
             <Text position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={2} color={data.color} fillOpacity={0.2}>
               ⚡
             </Text>
          )}
        </group>
      )}

      {/* 라벨 (공통) */}
      <Html position={[0, isObstacle ? 1.5 : 1, 0]} center transform sprite>
        <div className={`
          text-xs font-black tracking-widest whitespace-nowrap pointer-events-none select-none px-2 py-0.5 rounded
          ${isObstacle ? 'bg-red-500/20 text-red-500 border border-red-500/50' : `text-${data.color} opacity-80`}
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
function MapView2D({ robots, imageUrl }: { robots: any[], imageUrl: string }) {
  const toPercentX = (x: number) => ((x + MAP_WIDTH / 2) / MAP_WIDTH) * 100
  const toPercentY = (y: number) => ((y + MAP_HEIGHT / 2) / MAP_HEIGHT) * 100

  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden select-none font-sans group">
      {/* 배경 그리드 패턴 */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* 존 표시 */}
      {MAP_ZONES.map((zone) => {
         const isObstacle = zone.type === 'obstacle';
         return (
          <div key={zone.id} 
            className={`absolute border flex flex-col items-center justify-center text-xs font-bold rounded-md transition-opacity duration-300
              ${isObstacle ? 'opacity-80' : 'opacity-60 hover:opacity-100'}
            `}
            style={{
              left: `${toPercentX(zone.x - zone.w / 2)}%`,
              top: `${toPercentY(zone.y - zone.h / 2)}%`,
              width: `${(zone.w / MAP_WIDTH) * 100}%`,
              height: `${(zone.h / MAP_HEIGHT) * 100}%`,
              borderColor: zone.color,
              backgroundColor: isObstacle 
                ? `repeating-linear-gradient(45deg, ${zone.color}20, ${zone.color}20 10px, ${zone.color}40 10px, ${zone.color}40 20px)`
                : `${zone.color}10`,
              color: zone.color,
              boxShadow: `0 0 20px ${zone.color}15`
            }}>
            {isObstacle && <AlertTriangle className="w-6 h-6 mb-1 animate-pulse" />}
            {zone.label}
          </div>
        )
      })}

      {/* 로봇 표시 */}
      {robots.map((robot) => {
        const xPos = robot.x ?? 0;
        const yPos = robot.y ?? 0;
        const isAvailable = robot.status === 'available';

        return (
          <div key={robot.robotCode || robot.id}
            className="absolute flex flex-col items-center justify-center transition-all duration-700 ease-out z-20"
            style={{
              left: `${toPercentX(xPos / 10)}%`, // 좌표 스케일에 따라 /10 조정 필요
              top: `${toPercentY(yPos / 10)}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* 레이더 파동 효과 */}
            <div className={`absolute w-16 h-16 rounded-full opacity-30 animate-ping ${isAvailable ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            
            {/* 아이콘 */}
            <div className="relative transform hover:scale-110 transition-transform">
              <div className={`w-8 h-8 rounded-full border-2 bg-slate-900 flex items-center justify-center overflow-hidden ${isAvailable ? 'border-emerald-400' : 'border-blue-400'}`}>
                 <img src={imageUrl} alt="Bot" className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}/>
                 <span className="absolute text-lg">🤖</span>
              </div>
            </div>
            
            {/* 이름표 */}
            <span className="text-[9px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded shadow-sm mt-1 border border-slate-700 whitespace-nowrap">
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

  const activeCount = useMemo(() => robots.length, [robots]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden font-sans rounded-xl border border-slate-800 shadow-2xl group">
      
      {/* ✨ 전체 테두리 글로우 효과 */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10">
         <div className="absolute inset-0 rounded-xl border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]" />
      </div>

      {/* ========================================================================
          🛰️ HUD UI Layer (Overlay)
          ======================================================================== */}
      
      {/* 좌측 상단: 상태 패널 */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-50">
        <div className="flex items-center gap-2">
           <motion.div 
             animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
             className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" 
           />
           <span className="text-[10px] font-bold text-slate-400 tracking-widest">LIVE MONITORING</span>
        </div>
        <h2 className="text-xl font-black text-white italic tracking-tighter">
          SECTOR <span className="text-cyan-400">A-1</span>
        </h2>
      </div>

      {/* 우측 상단: 뷰 모드 컨트롤 */}
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-xl flex">
          <button onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === '2d' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <LayoutGrid size={12} /> 2D
          </button>
          <div className="w-[1px] bg-slate-700 mx-1 my-1" />
          <button onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === '3d' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <Box size={12} /> 3D
          </button>
        </div>
      </div>

      {/* 하단 정보 바 */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-50">
          <div className="flex gap-2">
             <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
                ROBOTS: <span className="text-white font-bold">{activeCount}</span>
             </div>
             <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
                STATUS: <span className="text-emerald-400 font-bold">NORMAL</span>
             </div>
          </div>
          <button className="pointer-events-auto p-2 bg-slate-800/80 backdrop-blur text-slate-300 rounded hover:bg-cyan-500 hover:text-white transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
      </div>


      {/* ========================================================================
          🗺️ Main Visual Area
          ======================================================================== */}
      <div className="absolute inset-0 w-full h-full bg-[#0b1121]"> {/* 더 깊은 배경색 */}
        {viewMode === '2d' ? (
          <MapView2D robots={robots} imageUrl={CHARACTER_IMAGE_URL} />
        ) : (
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 22, 18], fov: 40 }}>
            <color attach="background" args={['#0b1121']} />
            <fog attach="fog" args={['#0b1121', 20, 55]} />

            {/* 조명 설정 */}
            <ambientLight intensity={0.4} />
            <pointLight position={[-10, 10, -10]} intensity={1} color="#fbbf24" distance={20} /> {/* Main Station 쪽 따뜻한 빛 */}
            <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" distance={20} /> {/* Gate 쪽 차가운 빛 */}
            <directionalLight position={[5, 20, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
            
            {/* 바닥 그리드 */}
            <gridHelper args={[60, 60, 0x1e293b, 0x111827]} position={[0, -0.01, 0]} />
            
            {/* 바닥 반사 재질 (Cyberpunk feel) */}
            <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -0.02, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
            </mesh>

            {/* 구역 렌더링 */}
            {MAP_ZONES.map(zone => <Zone3D key={zone.id} data={zone} />)}

            {/* 로봇 렌더링 */}
            <Suspense fallback={null}>
              {robots.map((robot) => {
                const xPos = robot.x ?? 0;
                const yPos = robot.y ?? 0;
                return (
                  <GlbRobot3D
                    key={robot.robotCode || robot.id}
                    robotCode={robot.robotCode || robot.id}
                    position={[xPos / 10, 0, yPos / 10]} // 좌표 스케일 유지
                    status={robot.status}
                  />
                );
              })}
            </Suspense>

            <OrbitControls 
               maxPolarAngle={Math.PI / 2.1} // 바닥 뚫기 방지
               minDistance={10} 
               maxDistance={40}
               enablePan={true}
            />
          </Canvas>
        )}
      </div>
    </div>
  )
}