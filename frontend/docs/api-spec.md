| 기능      | 분류          | Method | Auth | End Point                           |
| ------- | ----------- | ------ | ---- | ----------------------------------- |
| 일반회원 인증 | 간편로그인       | POST   | X    | `/api/auth/login`                   |
|         | 번호 인증       | POST   | X    | `/api/auth/verify`                  |
|         | 로그아웃        | POST   | X    | `/api/auth/logout`                  |
| 관리자 인증  | 관리자 로그인     | POST   | X    | `/api/admin/auth/login`             |
|         | 관리자 로그아웃    | POST   | X    | `/api/admin/auth/logout`            |
|         | 관리자 회원가입    | POST   | X    | `/api/admin/auth/signup`            |
| 티켓      | 티켓 스캔       | POST   | O    | `/api/tickets/scan`                 |
|         | 내 최근 티켓 조회  | GET    | O    | `/api/me/tickets/latest`            |
|         | 최근 티켓 수정    | PATCH  | O    | `/api/me/tickets/latest`            |
|         | 최근 티켓 삭제    | DELETE | O    | `/api/me/tickets/latest`            |
| 사물함     | 내 사물함 이용 조회 | GET    | O    | `/api/me/lockers/histories`         |
|         | 사물함 생성      | POST   | O    | `/api/admin/lockers`                |
|         | 사물함 전체 조회   | GET    | O    | `/api/admin/lockers`                |
|         | 사물함 단건 조회   | GET    | O    | `/api/admin/lockers/{lockerId}`     |
|         | 사물함 수정      | PATCH  | O    | `/api/admin/lockers/{lockerId}`     |
|         | 사물함 삭제      | DELETE | O    | `/api/admin/lockers/{lockerId}`     |
| 미션      | 로봇 호출       | POST   | O    | `/api/missions`                     |
|         | SSE 연결      | GET    | O    | `/api/missions/{missionId}/connect` |
|         | 로봇 잠금       | PATCH  | O    | `/api/missions/{missionId}/lock`    |
|         | 로봇 잠금 해제    | PATCH  | O    | `/api/missions/{missionId}/unlock`  |
|         | 짐 무게 등록     | PATCH  | O    | `/api/missions/{missionId}/weight`  |
|         | 로봇 복귀       | PATCH  | O    | `/api/missions/{missionId}/return`  |
