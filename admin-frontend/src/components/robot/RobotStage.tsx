import { useState, useRef, Suspense, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Clone, Html, Text, Environment, Line } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, Box, Maximize2, AlertTriangle, Compass, X } from 'lucide-react'
import RobotDetailModal from './RobotDetailModal'

// ==============================================================================
// 🛠️ 설정 (맵 레이아웃 재구성)
// ==============================================================================
const ROBOT_GLB_URL = "./models/carryporter.glb"
const CHARACTER_IMAGE_URL = "/cat_icon.png"

const MAP_WIDTH = 24
const MAP_HEIGHT = 16

const MAP_ZONES = [
  { id: 'main', type: 'station', x: -8, y: 0, w: 6, h: 12, color: '#fbbf24', label: 'MAIN STATION' },
  { id: 'stop2', type: 'stop', x: 0, y: -5, w: 3, h: 3, color: '#34d399', label: 'STOP-2' },
  { id: 'gate1', type: 'gate', x: 8, y: -5, w: 4, h: 4, color: '#3b82f6', label: 'GATE-1' },
  { id: 'stop1', type: 'stop', x: 0, y: 5, w: 3, h: 3, color: '#34d399', label: 'STOP-1' },
  { id: 'obstacle', type: 'obstacle', x: 7, y: 4, w: 6, h: 4, color: '#f43f5e', label: 'RESTRICTED' },
]

// Zone ID를 좌표로 변환하는 헬퍼 함수
const getZonePosition = (zoneId: string): { x: number, y: number } => {
  const zone = MAP_ZONES.find(z => z.id === zoneId);
  if (zone) {
    return { x: zone.x * 10, y: zone.y * 10 }; // 10배 스케일
  }
  return { x: -80, y: 0 }; // 기본값: MAIN STATION
}

// ------------------------------------------------------------------
// 🧊 [Component] GLB Robot 3D (밝기 최대 강화 버전 + 이동 애니메이션 + 경로 표시)
// ------------------------------------------------------------------
function GlbRobot3D({ 
  position, 
  targetPosition,
  status, 
  robotCode, 
  onClick,
  isGroup = false,
  groupCount = 1,
  showPath = false
}: { 
  position: [number, number, number], 
  targetPosition?: [number, number, number],
  status: string, 
  robotCode: string,
  onClick: () => void,
  isGroup?: boolean,
  groupCount?: number,
  showPath?: boolean
}) {
  const { scene } = useGLTF(ROBOT_GLB_URL)
  const mainGroupRef = useRef<THREE.Group>(null) // 전체를 감싸는 메인 그룹
  const robotGroupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  // ✨ 로봇 재질을 매우 밝게 만들기 + 금속성 강화

  useEffect(() => {

    scene.traverse((child) => {

      if ((child as THREE.Mesh).isMesh) {

        const mesh = child as THREE.Mesh;

        const material = mesh.material as THREE.MeshStandardMaterial;

        // 주변광에 더 잘 반응하도록 설정

        material.envMapIntensity = 1.5;

        // 자체 발광 약간 추가 (너무 어두운 텍스처일 경우 대비)

        material.emissive = new THREE.Color(0x202020);

        material.emissiveIntensity = 0.2;

        material.needsUpdate = true;

      }

    });

  }, [scene]);
  // useEffect(() => {
  //   scene.traverse((child) => {
  //     if ((child as THREE.Mesh).isMesh) {
  //       const mesh = child as THREE.Mesh;
  //       const material = mesh.material as THREE.MeshStandardMaterial;
        
  //       // 금속성과 환경맵 강도 증가
  //       material.metalness = 0.9;
  //       material.roughness = 0.3;
  //       material.envMapIntensity = 2.5;
        
  //       // 자체 발광 강화 (로봇이 스스로 빛을 내는 효과)
  //       material.emissive = new THREE.Color(0x444444);
  //       material.emissiveIntensity = 0.5;
        
  //       // 그림자 활성화
  //       mesh.castShadow = true;
  //       mesh.receiveShadow = true;
        
  //       material.needsUpdate = true;
  //     }
  //   });
  // }, [scene]);

  // 타겟 위치로 부드럽게 이동 (메인 그룹 전체 이동)
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    
    if (mainGroupRef.current && targetPosition) {
      // 메인 그룹 전체를 목표 위치로 부드럽게 이동 (lerp)
      mainGroupRef.current.position.x += (targetPosition[0] - mainGroupRef.current.position.x) * 0.05;
      mainGroupRef.current.position.z += (targetPosition[2] - mainGroupRef.current.position.z) * 0.05;
    }
    
    // 로봇만 위아래 떠다니는 애니메이션
    if (robotGroupRef.current) {
      robotGroupRef.current.position.y = Math.sin(t * 2) * 0.1 + (hovered ? 0.3 : 0);
    }
    
    if (state.gl.domElement) {
      state.gl.domElement.style.cursor = hovered ? 'pointer' : 'auto'
    }
  })

  const isAvailable = status === 'available'
  const statusColor = isAvailable ? '#10b981' : '#3b82f6'

  return (
    <>
      {/* 이동 경로 표시 (고정 위치) */}
      {showPath && targetPosition && (
        <group>
          {/* 경로 라인 */}
          <Line
            points={[
              [position[0], 0.1, position[2]],
              [targetPosition[0], 0.1, targetPosition[2]]
            ]}
            color={statusColor}
            lineWidth={3}
            transparent
            opacity={0.6}
          />
          
          {/* 목표 지점 마커 */}
          <mesh position={[targetPosition[0], 0.05, targetPosition[2]]} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.3, 0.5, 32]} />
            <meshBasicMaterial color={statusColor} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[targetPosition[0], 0.06, targetPosition[2]]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.3, 32]} />
            <meshBasicMaterial color={statusColor} transparent opacity={0.3} />
          </mesh>
        </group>
      )}

      {/* 메인 그룹: 로봇 + 그림자 + 이름표가 함께 이동 */}
      <group ref={mainGroupRef} position={[position[0], 0, position[2]]}>
        
        {/* ✨ 로봇 전용 강력한 조명 (로봇을 매우 밝게) */}
        <spotLight 
          position={[0, 5, 0]} 
          intensity={8}
          distance={10} 
          angle={0.7} 
          penumbra={0.4} 
          color="#ffffff" 
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <pointLight position={[0, 2, 0]} intensity={4} distance={5} color="#ffffff" />
        <pointLight position={[1, 1, 1]} intensity={3} distance={4} color="#aaddff" />
        <pointLight position={[-1, 1, -1]} intensity={3} distance={4} color="#ffddaa" />

        {/* 로봇 그룹 (위아래 떠다님) */}
        <group 
          ref={robotGroupRef}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          {/* 메인 로봇 */}
          <Clone object={scene} scale={hovered ? 1.65 : 1.5} position={[0, 1.8, 0]} rotation={[0, 0, 0]} castShadow receiveShadow />
          
          {/* 그룹일 경우 추가 로봇들 표시 (살짝 뒤에, 작게) */}
          {isGroup && (
            <>
              <group position={[-0.3, 1.6, -0.3]} rotation={[0, Math.PI / 6, 0]}>
                <Clone object={scene} scale={1.3} castShadow />
              </group>
              <group position={[0.3, 1.5, -0.4]} rotation={[0, -Math.PI / 6, 0]}>
                <Clone object={scene} scale={1.2} castShadow />
              </group>
            </>
          )}
        </group>

        {/* 바닥 그림자 (원형) - 고정 위치 */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
          <circleGeometry args={[hovered ? 1.0 : 0.8, 32]} />
          <meshBasicMaterial color="#000000" opacity={0.3} transparent />
        </mesh>

        {/* 바닥 링 - 더 밝고 눈에 띄게 - 고정 위치 */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
          <ringGeometry args={[0.5, hovered ? 1.2 : (isGroup ? 1.0 : 0.8), 32]} />
          <meshBasicMaterial color={statusColor} opacity={hovered ? 0.9 : 0.7} transparent />
        </mesh>
        
        {/* 로봇 아래 강력한 글로우 효과 - 고정 위치 */}
        <pointLight position={[0, 1, 0]} color={statusColor} intensity={hovered ? 6 : 4} distance={4} decay={2} />

        {/* 3D 이름표 (항상 표시) - 고정 위치 */}
        <Html position={[0, 4.2, 0]} center distanceFactor={12} zIndexRange={[0, 0]}>
          <div className="flex flex-col items-center transform transition-all hover:scale-110">
            {/* 이름표 상단 */}
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 backdrop-blur-md shadow-2xl transition-all
              ${isAvailable 
                ? 'bg-emerald-500/95 border-emerald-300 text-white' 
                : 'bg-blue-500/95 border-blue-300 text-white'}
              ${hovered ? 'scale-110 shadow-xl' : ''}
            `}>
              <span className="text-xs font-black tracking-tight drop-shadow-lg">
                {isGroup ? `${groupCount}대` : robotCode}
              </span>
            </div>
            
            {/* 연결선 */}
            <div className={`w-0.5 h-5 ${isAvailable ? 'bg-emerald-400/60' : 'bg-blue-400/60'}`} />
          </div>
        </Html>
      </group>
    </>
  )
}

useGLTF.preload(ROBOT_GLB_URL)

// ------------------------------------------------------------------
// 🧊 [Component] Zone 3D (벽 높이 통일 버전)
// ------------------------------------------------------------------
function Zone3D({ data }: { data: typeof MAP_ZONES[0] }) {
  const isObstacle = data.type === 'obstacle';
  const isStation = data.type === 'station';

  // 모든 존의 벽 높이를 0.5로 통일 (낮고 깔끔하게)
  const wallHeight = 0.5;

  return (
    <group position={[data.x, 0, data.y]}>
      {isObstacle ? (
        <group>
          <mesh position={[0, wallHeight / 2, 0]}>
            <boxGeometry args={[data.w, wallHeight, data.h]} />
            <meshStandardMaterial color={data.color} transparent opacity={0.3} wireframe />
          </mesh>
          <mesh position={[0, wallHeight / 2, 0]}>
             <boxGeometry args={[data.w * 0.95, wallHeight * 0.9, data.h * 0.95]} />
             <meshStandardMaterial color="#500000" transparent opacity={0.5} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
            <planeGeometry args={[Math.min(data.w, data.h), Math.min(data.w, data.h)]} />
            <meshBasicMaterial color={data.color} transparent opacity={0.2} />
          </mesh>
          <Text position={[0, wallHeight + 0.5, 0]} fontSize={1.5} color={data.color} rotation={[-Math.PI/2, 0, 0]}>X</Text>
        </group>
      ) : (
        <group>
          {/* 바닥 평면 */}
          <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0.01, 0]}>
            <planeGeometry args={[data.w, data.h]} />
            <meshStandardMaterial color={data.color} transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
          
          {/* 낮은 테두리 벽 */}
          <mesh position={[0, wallHeight / 2, 0]}>
            <boxGeometry args={[data.w, wallHeight, data.h]} />
            <meshStandardMaterial 
              color={data.color} 
              opacity={0.3} 
              transparent 
              emissive={data.color} 
              emissiveIntensity={0.4}
              wireframe={!isStation}
            />
          </mesh>
          
          {/* 모서리 기둥 (낮게) */}
          {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map((dir, i) => (
            <mesh key={i} position={[dir[0] * data.w / 2, wallHeight / 2, dir[1] * data.h / 2]}>
              <cylinderGeometry args={[0.05, 0.05, wallHeight, 8]} />
              <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={2} />
            </mesh>
          ))}
          
          {isStation && (
             <Text position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={2} color={data.color} fillOpacity={0.3}>⚡</Text>
          )}
        </group>
      )}
      <Html position={[0, isObstacle ? wallHeight + 0.5 : wallHeight + 0.3, 0]} center transform sprite zIndexRange={[0, 0]}>
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
// 🎮 [Component] Camera Reset Button (원점 복귀)
// ------------------------------------------------------------------
function CameraResetButton() {
  const { camera, controls } = useThree();
  
  const resetCamera = () => {
    if (controls) {
      // MAIN STATION을 바라보도록 설정
      camera.position.set(-8, 18, 12);
      (controls as any).target.set(-8, 0, 0);
      (controls as any).update();
    }
  };

  return null; // HTML 버튼은 외부에서 처리
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

      {robots.map((robot) => {
        // 로봇 위치가 없으면 MAIN STATION (-80, 0)을 기본값으로
        const xPos = robot.x ?? -80;
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
                 <span className="absolute text-lg">🤖</span>
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
// 🖼️ [Component] Full Screen Modal
// ------------------------------------------------------------------
function FullScreenModal({ 
  viewMode, 
  robots, 
  groupedRobots,
  robotPositions,
  imageUrl, 
  onClose, 
  onRobotClick 
}: { 
  viewMode: '2d' | '3d', 
  robots: any[],
  groupedRobots: any[],
  robotPositions: Map<string, { x: number; y: number }>,
  imageUrl: string, 
  onClose: () => void,
  onRobotClick: (robot: any) => void 
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute inset-4 bg-slate-950 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-3 bg-slate-800/90 backdrop-blur text-slate-300 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-xl border border-slate-700 hover:border-red-400"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 타이틀 */}
          <div className="absolute top-4 left-4 z-50 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-700">
            <h3 className="text-lg font-black text-white tracking-tight">전체 맵 뷰</h3>
          </div>

          {/* 맵 컨텐츠 */}
          <div className="w-full h-full">
            {viewMode === '2d' ? (
              <MapView2D robots={robots} imageUrl={imageUrl} onRobotClick={onRobotClick} />
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
                  {groupedRobots.map((group, idx) => {
                    const robotId = group.representativeRobot.robotCode || group.representativeRobot.id;
                    const targetPos = robotPositions.get(robotId);
                    const isMoving = !!targetPos;
                    
                    return (
                      <GlbRobot3D
                        key={`robot-group-modal-${idx}`}
                        robotCode={group.isGroup ? `${group.count}대` : (group.representativeRobot.robotCode || group.representativeRobot.id)}
                        position={[group.x / 10, 0, group.y / 10]}
                        targetPosition={targetPos ? [targetPos.x / 10, 0, targetPos.y / 10] : undefined}
                        status={group.representativeRobot.status}
                        onClick={() => onRobotClick(group.representativeRobot)}
                        isGroup={group.isGroup}
                        groupCount={group.count}
                        showPath={isMoving}
                      />
                    );
                  })}
                </Suspense>

                <OrbitControls 
                  maxPolarAngle={Math.PI / 2.1} 
                  minDistance={10} 
                  maxDistance={40} 
                  enablePan={true}
                  target={[0, 0, 0]}
                />
              </Canvas>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ------------------------------------------------------------------
// 🚀 [Main Page] Robot Stage
// ------------------------------------------------------------------
export default function RobotStage({
  robots = [],
  showDummyIfEmpty = false,
  moveCommands = [], // 새로운 prop: { robotId: string, from: string, to: string }[]
  sseMovements = [] // SSE로부터 받은 실시간 이동 데이터: { robotCode: string, x: number, y: number }[]
}: {
  robots: any[];
  showDummyIfEmpty?: boolean;
  moveCommands?: Array<{ robotId: string; from: string; to: string }>;
  sseMovements?: Array<{ robotCode: string; x: number; y: number }>;
}) {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')
  const [selectedRobot, setSelectedRobot] = useState<any | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const activeCount = useMemo(() => robots.length, [robots]);
  const canvasRef = useRef<any>(null);

  // 로봇 위치 상태 관리 (이동 명령에 따라 업데이트)
  const [robotPositions, setRobotPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // moveCommands가 변경되면 로봇 위치 업데이트
  useEffect(() => {
    if (moveCommands.length > 0) {
      const newPositions = new Map(robotPositions);
      
      moveCommands.forEach(cmd => {
        const targetPos = getZonePosition(cmd.to);
        newPositions.set(cmd.robotId, targetPos);
      });
      
      setRobotPositions(newPositions);
    }
  }, [moveCommands]);

  // SSE 이동 데이터가 들어오면 실시간 위치 업데이트
  useEffect(() => {
    if (sseMovements.length > 0) {
      const newPositions = new Map(robotPositions);
      
      sseMovements.forEach(movement => {
        newPositions.set(movement.robotCode, { x: movement.x, y: movement.y });
      });
      
      setRobotPositions(newPositions);
    }
  }, [sseMovements]);

  // 로봇의 현재 위치 또는 목표 위치 가져오기
  const getRobotPosition = (robot: any) => {
    const robotId = robot.robotCode || robot.id;
    const customPos = robotPositions.get(robotId);
    
    if (customPos) {
      return { x: customPos.x, y: customPos.y };
    }
    
    // 기본값: robot.x, robot.y가 있으면 사용, 없으면 MAIN STATION
    return { 
      x: robot.x ?? -80, 
      y: robot.y ?? 0 
    };
  };

  // 같은 위치에 있는 로봇들을 그룹화
  const groupedRobots = useMemo(() => {
    const groups = new Map<string, any[]>();
    
    robots.forEach(robot => {
      const pos = getRobotPosition(robot);
      const key = `${Math.round(pos.x / 10)},${Math.round(pos.y / 10)}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push({ ...robot, x: pos.x, y: pos.y });
    });

    // 그룹을 배열로 변환
    return Array.from(groups.values()).map(group => ({
      robots: group,
      x: group[0].x,
      y: group[0].y,
      count: group.length,
      isGroup: group.length >= 3,
      // 그룹일 경우 대표 로봇 정보
      representativeRobot: group[0]
    }));
  }, [robots, robotPositions]);

  const handleRobotClick = (robot: any) => {
    setSelectedRobot(robot)
  }

  const handleCameraReset = () => {
    if (canvasRef.current) {
      const { camera, controls } = canvasRef.current;
      if (camera && controls) {
        camera.position.set(0, 22, 18);
        controls.target.set(0, 0, 0);
        controls.update();
      }
    }
  }

  return (
    <>
      <div className="relative w-full h-full bg-slate-950 overflow-hidden font-sans rounded-xl border border-slate-800 shadow-2xl group">
        
        {/* UI Layers (HUD) */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10">
           <div className="absolute inset-0 rounded-xl border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]" />
        </div>

        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-[60]">
          <div className="flex items-center gap-2">
             <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
             <span className="text-[10px] font-bold text-slate-400 tracking-widest">LIVE MONITORING</span>
          </div>
          <h2 className="text-xl font-black text-white italic tracking-tighter">SECTOR <span className="text-cyan-400">A-1</span></h2>
        </div>

        <div className="absolute top-4 right-4 flex gap-2 z-[60]">
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

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-[60]">
            <div className="flex gap-2">
               <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded border border-slate-800 text-[10px] text-slate-400 font-mono">ROBOTS: <span className="text-white font-bold">{activeCount}</span></div>
               <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded border border-slate-800 text-[10px] text-slate-400 font-mono">STATUS: <span className="text-emerald-400 font-bold">NORMAL</span></div>
            </div>
            <div className="flex flex-col gap-2 pointer-events-auto z-[60]">
              {viewMode === '3d' && (
                <button 
                  onClick={handleCameraReset}
                  className="p-2 bg-slate-800/80 backdrop-blur text-slate-300 rounded hover:bg-cyan-500 hover:text-white transition-all group"
                  title="원점으로 복귀"
                >
                  <Compass className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              )}
              <button 
                onClick={() => setIsFullScreen(true)}
                className="p-2 bg-slate-800/80 backdrop-blur text-slate-300 rounded hover:bg-cyan-500 hover:text-white transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
        </div>

        {/* 3D Scene Area */}
        <div className="absolute inset-0 w-full h-full bg-[#0b1121]">
          {viewMode === '2d' ? (
            <MapView2D robots={robots} imageUrl={CHARACTER_IMAGE_URL} onRobotClick={handleRobotClick} />
          ) : (
            <Canvas 
              shadows 
              dpr={[1, 2]} 
              camera={{ position: [0, 22, 18], fov: 40 }}
              onCreated={(state) => { canvasRef.current = state; }}
            >
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
                {groupedRobots.map((group, idx) => {
                  const robotId = group.representativeRobot.robotCode || group.representativeRobot.id;
                  const targetPos = robotPositions.get(robotId);
                  const isMoving = !!targetPos; // 목표 위치가 있으면 이동 중
                  
                  return (
                    <GlbRobot3D
                      key={`robot-group-${idx}`}
                      robotCode={group.isGroup ? `${group.count}대` : (group.representativeRobot.robotCode || group.representativeRobot.id)}
                      position={[group.x / 10, 0, group.y / 10]}
                      targetPosition={targetPos ? [targetPos.x / 10, 0, targetPos.y / 10] : undefined}
                      status={group.representativeRobot.status}
                      onClick={() => handleRobotClick(group.representativeRobot)}
                      isGroup={group.isGroup}
                      groupCount={group.count}
                      showPath={isMoving}
                    />
                  );
                })}
              </Suspense>

              <OrbitControls 
                maxPolarAngle={Math.PI / 2.1} 
                minDistance={10} 
                maxDistance={40} 
                enablePan={true}
                target={[0, 0, 0]}
              />
            </Canvas>
          )}
        </div>

        {selectedRobot && <RobotDetailModal robot={selectedRobot} onClose={() => setSelectedRobot(null)} />}
      </div>

      {/* 전체화면 모달 */}
      {isFullScreen && (
        <FullScreenModal
          viewMode={viewMode}
          robots={robots}
          groupedRobots={groupedRobots}
          robotPositions={robotPositions}
          imageUrl={CHARACTER_IMAGE_URL}
          onClose={() => setIsFullScreen(false)}
          onRobotClick={handleRobotClick}
        />
      )}
    </>
  )
}