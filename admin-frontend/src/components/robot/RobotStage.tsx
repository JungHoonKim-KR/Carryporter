import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Clone } from '@react-three/drei' // 🔥 useGLTF, Clone 추가
import * as THREE from 'three'

// ==============================================================================
// 🛠️ 설정 (여기에 GLB 파일 경로를 적어주세요)
// ==============================================================================
const ROBOT_GLB_URL = "./models/carryporter.glb" // 👈 public 폴더 기준 경로
const CHARACTER_IMAGE_URL = "/cat_icon.png" 

const MAP_WIDTH = 24
const MAP_HEIGHT = 16
const MAP_ZONES = [
  { id: 'main', x: 0, y: -5, w: 10, h: 4, color: '#10b981', label: 'MAIN STATION' },
  { id: 'gateA', x: -8, y: 4, w: 4, h: 4, color: '#3b82f6', label: 'GATE A' },
  { id: 'gateB', x: 8, y: 4, w: 4, h: 4, color: '#3b82f6', label: 'GATE B' },
]

// ------------------------------------------------------------------
// 🧊 [수정됨] GLB 파일을 사용하는 로봇 컴포넌트
// ------------------------------------------------------------------
function GlbRobot3D({ position, status }: { position: [number, number, number], status: string }) {
  // 1. GLB 모델 불러오기
  const { scene } = useGLTF(ROBOT_GLB_URL)
  const groupRef = useRef<THREE.Group>(null)
  
  // 2. 둥실둥실 떠있는 애니메이션 (선택 사항)
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      // y축 위아래 움직임
      groupRef.current.position.y = Math.sin(t * 2) * 0.1 
      // 약간의 회전
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1
    }
  })

  // 상태에 따른 색상 링 (모델 자체 색을 바꾸긴 어려우니 발밑에 표시)
  const statusColor = status === 'available' ? '#3b82f6' : '#f59e0b'

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 3. 모델 렌더링 (Clone을 써야 여러 대가 독립적으로 나옴) */}
      <group ref={groupRef}>
        <Clone 
          object={scene} 
          scale={1.5}          // 👈 모델 크기가 너무 크면 줄이세요 (0.5, 0.1 등)
          position={[0, 2, 0]} // 모델의 기준점 조정
          rotation={[0, 0, 0]} // 필요시 회전 (모델이 뒤돌아 있으면 돌리기)
        />
      </group>

      {/* 4. 상태 표시 링 (발밑 그림자 겸 상태 표시) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>
      
      {/* 로봇 이름/상태 텍스트 (머리 위에 띄우기) */}
      {/* 필요하다면 Html 컴포넌트를 drei에서 가져와서 추가 가능 */}
    </group>
  )
}

// 성능 향상을 위해 모델 미리 로딩
useGLTF.preload(ROBOT_GLB_URL)

// ------------------------------------------------------------------
// Zone3D 및 MapView2D는 기존 코드 유지...
// ------------------------------------------------------------------
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
      {/* 기둥 장식 */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map((dir, i) => (
        <mesh key={i} position={[dir[0] * data.w/2, 1, dir[1] * data.h/2]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}

function MapView2D({ robots, imageUrl }: { robots: any[], imageUrl: string }) {
  // (기존 코드와 동일하므로 생략 - 위쪽 코드 그대로 사용하세요)
  const toPercentX = (x: number) => ((x + MAP_WIDTH / 2) / MAP_WIDTH) * 100
  const toPercentY = (y: number) => ((y + MAP_HEIGHT / 2) / MAP_HEIGHT) * 100

  return (
    <div className="w-full h-full relative bg-slate-100 overflow-hidden select-none font-sans">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      {MAP_ZONES.map((zone) => (
        <div key={zone.id} className="absolute border-2 flex items-center justify-center text-xs font-bold rounded-sm shadow-sm" style={{ left: `${toPercentX(zone.x - zone.w / 2)}%`, top: `${toPercentY(zone.y - zone.h / 2)}%`, width: `${(zone.w / MAP_WIDTH) * 100}%`, height: `${(zone.h / MAP_HEIGHT) * 100}%`, borderColor: zone.color, backgroundColor: `${zone.color}25`, color: zone.color }}>
          {zone.label}
        </div>
      ))}
      {robots.map((robot) => {
        const xPos = robot.x ?? 0;
        const yPos = robot.y ?? 0;
        return (
          <div key={robot.robotCode || robot.id} className="absolute flex flex-col items-center justify-center transition-all duration-500 ease-linear z-10" style={{ left: `${toPercentX(xPos / 10)}%`, top: `${toPercentY(yPos / 10)}%`, transform: 'translate(-50%, -50%)' }}>
            <div className="relative group">
              <img src={imageUrl} alt="Robot" className="w-10 h-10 object-contain drop-shadow-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
              <span className="hidden text-2xl filter drop-shadow-md">🐱</span>
              <span className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white ${robot.status === 'available' ? 'bg-green-500' : 'bg-amber-500'}`} />
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm mt-1 border border-slate-200">{robot.robotCode || robot.id}</span>
          </div>
        );
      })}
    </div>
  )
}

// ------------------------------------------------------------------
// 🚀 메인 스테이지
// ------------------------------------------------------------------
export default function RobotStage({ 
  robots = [], 
  showDummyIfEmpty = false 
}: { 
  robots: any[]; 
  showDummyIfEmpty?: boolean; // 👈 이 부분이 추가되어야 오류가 사라집니다.
}) {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex justify-between items-center shrink-0">
        <h3 className="text-lg font-bold text-slate-700">Monitoring</h3>
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex gap-1 shadow-sm">
          <button onClick={() => setViewMode('2d')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${viewMode === '2d' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}>2D IMAGE</button>
          <button onClick={() => setViewMode('3d')} className={`px-3 py-1.5 text-xs font-bold rounded-md ${viewMode === '3d' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}>3D ROBOT</button>
        </div>
      </div>

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

            {/* 🔥 기존 CuteCatRobot3D 대신 GlbRobot3D 사용 */}
            {robots.map((robot) => {
              const xPos = robot.x ?? 0;
              const yPos = robot.y ?? 0;
              
              return (
                <GlbRobot3D 
                  key={robot.robotCode || robot.id}
                  position={[xPos / 10, 0, yPos / 10]} 
                  status={robot.status}
                />
              );
            })}
            
            <OrbitControls maxPolarAngle={Math.PI / 2.2} />
          </Canvas>
        )}
      </div>
    </div>
  )
}