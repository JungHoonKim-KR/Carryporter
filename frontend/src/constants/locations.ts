import type { Location } from "../types/mission.types";

/**
 * 정류장 목록 (6개)
 */
export const STATIONS: Location[] = [
    {
        id: 1,
        name: "1번 정류장",
        code: "STATION_1",
        type: "station",
        icon: "🚉",
    },
    {
        id: 2,
        name: "2번 정류장",
        code: "STATION_2",
        type: "station",
        icon: "🚉",
    },
    {
        id: 3,
        name: "3번 정류장",
        code: "STATION_3",
        type: "station",
        icon: "🚉",
    },
    {
        id: 4,
        name: "4번 정류장",
        code: "STATION_4",
        type: "station",
        icon: "🚉",
    },
    {
        id: 5,
        name: "5번 정류장",
        code: "STATION_5",
        type: "station",
        icon: "🚉",
    },
    {
        id: 6,
        name: "6번 정류장",
        code: "STATION_6",
        type: "station",
        icon: "🚉",
    },
];

/**
 * 탑승구 목록 (6개)
 */
export const BOARDING_GATES: Location[] = [
    { id: 7, name: "GATE 1", code: "GATE_1", type: "gate", icon: "🚪" },
    { id: 8, name: "GATE 2", code: "GATE_2", type: "gate", icon: "🚪" },
    { id: 9, name: "GATE 3", code: "GATE_3", type: "gate", icon: "🚪" },
    { id: 10, name: "GATE 4", code: "GATE_4", type: "gate", icon: "🚪" },
    { id: 11, name: "GATE 5", code: "GATE_5", type: "gate", icon: "🚪" },
    { id: 12, name: "GATE 6", code: "GATE_6", type: "gate", icon: "🚪" },
];

/**
 * 전체 위치 목록 (정류장 + 탑승구)
 */
export const ALL_LOCATIONS: Location[] = [...STATIONS, ...BOARDING_GATES];
