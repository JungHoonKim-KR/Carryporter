# JIRA 용어

## Project 구조 관련 용어

### Project

- 작업들을 관리하는 최상위 단위
- 보통 하나의 제품이나 서비스 단위로 project 를 생성함.
- 예를 들어 A 라는 프로젝트를 만들면 그 안에서 모든 작업들을 관리하는 것임.

### Issue

- Jira 에서 관리하는 작업의 기본 단위.
- 버그 수정, 기능 개발, 개선 작업 등 모든 할일이 이슈로 생성됨.
- 각 이슈들은 고유한 key (ex: `KEY-123`) 형식을 가짐

### Epic

- 큰 단위의 작업 묶음.
- 여러개의 Story 나 Task 를 포함하는 상위 개념
- 예를 들어 회원 관리 기능 구현 이라는 epic 아래에 회원가입 api, login api, 비밀번호 찾기 같은 하위 이슈들이 들어감.
    - 회원 관리 기능 (epic)
        - 회원 가입
        - 로그인
        - 비밀번호 찾기
        - etc …

## Issue type 용어

### story

- 사용자 관점의 기능 요구 사항
- 주로 “`~ 로서 ~ 를 할 수 있다.`” 형식으로 작성
- 예를 들어 `“사용자로서 영양정보를 조회할 수 있다.”`  같은 것이 바로 story

### Task

- 기술적인 작업이나 story 로 표현하기 애매한 작업들임.
- redis 캐시 설정, db migration 같은 것들이 바로 task

### Bug

- 발견된 결함이나 오류
- production 이나 개발중 발견된 문제를 추적할 떄 사용

### Sub-task

- story 나 task 를 더 작은 단위로 쪼갠 것.
- 예를들어 회원 가입 api 구현 story 아래에 유효성 검증 로직, db 저장 로직, 이메일 인증 같은 sub task 를 만들 수 있음.

## 상태 관리 용어

### Workflow

- 이슈가 거쳐가는 상태의 흐름
- 예를 들어 todo → in progress → in review → done 같은 process 를 나타내는게 바로 workflow

### Status

- issue 의 현재 진행 상태
- 기본적으로
    - todo
    - in progress
    - done
- 이렇게 구성 가능한데 팀에 맞게 변형 가능

### Transition (전환)

- 상태를 변경하는 행위
- 예를 들어 todo 에서 in progress 로 이동하는 것을 바로 transition 이라고 함.

### Blocker / Blocked

- 작업을 막고있는 이슈나 상황
- 예
    - 이 이슈는 NAM-123 이 완료되어야 시작할 수 있어.
    - 이때 NAM-123 이 `Blocker`
- status 에 Blocked 를 추가해서 관리하기도 함.

## Sprint 관련 용어 (Scrum 보드 사용시)

### Sprint

- 정해진 기간동안 완료할 작업들의 묶음.
- 보통 1 - 2 주 단위로 설정.
- 그 기간안에 완료 가능한 이슈들을 할당.

### Backlog

- 아직 스프린트에 할당되지 않은 이슈들이 쌓여있는 곳.
- 우선순위를 정하고 다음 스프린트에 무엇을 할지 여기서 선택

### Board

- 이슈들을 시각적으로 관리하는 공간.
- Scrum board 나 Kanban Board 가 있음.

## Issue 속성

### Assignee

- 담당자.
- 해당 이슈를 처리할 책임이 있는 사람.

### Reporter

- 보고자.
- 이슈를 생성한 사람.
- 예를 들어 버그를 발견해서 이슈를 만든 사람이 reporter

### Priority

- 이슈의 중요도

### Component

- project 의 모듈이나 기능 영역
- Backend Server, Front end, DB 같이 나눌 수 있음

### Label

- 이슈를 분류하기 위한 태그
- `bug` , `enhancement`  등등 라벨을 자유롭게 붙일 수 있음.

### Story point

- 작업의 복잡도나 노력을 추정한 상대적 수치
- **시간이 아닌 상대적 복잡도를 나타냄** (개발자마다 속도는 다르지만 복잡도는 동일)
- 보통 1, 2, 3, 5, 8, 13, 21 같은 피보나치 수열을 활용
    - 숫자가 커질수록 불확실성도 커지므로 간격을 넓게 설정

### Story Point 설정 가이드

**[간단한 작업 (1~2pt)]**

- 1pt: 단순 CRUD API, 설정 값 변경, 간단한 버그 수정
- 2pt: 간단한 비즈니스 로직 추가, 단순한 유효성 검증

**[중간 작업 (3~5pt)]**

- 3pt: 회원가입 API (유효성 검증 + DB 저장), Redis 캐시 적용, 간단한 배치 작업
- 5pt: JWT 인증 시스템 구축, 복잡한 조회 쿼리 최적화 (N+1 해결), 파일 업로드 기능

**[복잡한 작업 (8~13pt)]**

- 8pt: OAuth 소셜 로그인 연동, 결제 시스템 연동, 복잡한 권한 관리
- 13pt: RAG 시스템 구축, 실시간 알림 시스템, 마이크로서비스 분리

**[너무 큰 작업 (21pt 이상)]**

- 21pt 이상이면 Epic 레벨이므로 더 작게 쪼개야 함
- 예시:
    - "회원 관리 시스템 구현" (21pt 이상)
        - → 회원가입 API (3pt)
        - → 로그인 API (3pt)
        - → 비밀번호 찾기 (5pt)
        - → OAuth 연동 (8pt)

### Story Point 추정 방법

- **Planning Poker**: 팀원들이 모여 각 이슈의 복잡도를 함께 추정
- **기준점 설정**: 가장 간단한 작업을 1pt로 정하고, 다른 작업들을 상대 비교
- **팀 합의**: 추정이 다르면 토론을 통해 최종 포인트 결정
- **불확실하면 높게**: 리스크가 있거나 경험이 없는 기술이면 포인트를 높게 설정

### 실무 활용

- 스프린트마다 완료한 Story Point 합계가 팀의 **Velocity(속도)**
- Velocity를 기반으로 다음 스프린트 계획 수립
- 예시:
    - 1차 Sprint: 13pt 완료
    - 2차 Sprint: 15pt 완료
    - 3차 Sprint: 14pt 완료
    - → 평균 Velocity: 14pt/주
    - → 다음 Sprint 계획: 13~14pt 정도로 설정

### Sprint Velocity

- 각 스프린트마다 완료한 story point 합계
- 팀의 개발 속도를 측정하는 지표
- 예
    - 1차 sprint : 13pt
    - 2차 sprint : 15pt
    - 평균 14 pt 소화 가능
    - 다음 sprint 계획시 참고

### Resolution(해결방법)

- 이슈가 완료될 때 어떻게 해결되었는지 표시하는 필드
- Done - 완료
- Won’t Do - 하지 않기로 함
- Duplicate - 중복
    - bug issue 이 같을 경우 이거 다른 issue (ticket) 이랑 중복이네 하면 Resolution 을 Duplicate 로 설정하고 닫아버림.
- Cannot Reproduce - 재현불가

### Burndown chart

- sprint 진행 중 남은 작업량을 시각화한 차트
- 이상적으로는 대각선으로 내려가야 하는데 실제 진행 상황이 이상선 보다 위에 있으면 진행이 늦다는 의미.

## 시간 관리

### Original Estimate

- 초기 예상 시간
- 작업에 걸릴 것으로 예상되는 초기 시간

### Time Tracking

- 시간 추적
- 실제 작업에 소요된 시간을 기록하는 기능

## 협업 기능

### Comment

- 이슈에 대한 의견이나 진행 상황을 공유하는 댓글
- 팀원들과 소통할 때 사용

### Watcher

- 이슈의 변경사항을 알림받고 싶은 사람.
- 담당자는 아니지만 관심있는 이슈를 팔로우 할 수 있음.

### Mention

- 코멘트에서 특정 팀원을 호출할 때 사용.
- `@준완` → 이런식으로 하면 알림이 감.

## 필터와 검색

### JQL (Jira Query Language)

- 이슈를 검색하기 위한 쿼리 언어.
- SQL 과 비슷한 구조
- `project = “aiot 공통” and status = “In Progress” and assignee = currentUser()`

### Filter

- 자주 사용하는 JQL 을 저장해둔 것.
- 내가 담당한 진행중인 이슈 같은 필터를 만들어두면 편함.

## Issue 완료 기준

### Acceptance Criteria (AC, 인수 조건)

- Story나 Task가 요구사항을 충족했는지 판단하는 기준
- DoD는 "어떻게 완료할 것인가"에 대한 기준이라면, AC는 "무엇을 완료해야 하는가"에 대한 기준
- 예시:
Story: 사용자로서 로그인할 수 있다.
    - AC:
        - 올바른 이메일/비밀번호 입력 시 JWT 토큰 발급
        - 틀린 비밀번호 입력 시 401 에러 반환
        - 존재하지 않는 이메일 입력 시 404 에러 반환
        - 5회 연속 실패 시 계정 잠금

### Definition of Done - DoD

- 이슈를 완료로 처리하기 위한 기준

```
예시:
- code 작성 완료
- 테스트 작성 및 통과
- 코드리뷰 승인
- develop branch 에 머지
- api 문서 업데이트 
```

# 구체적인 예시

## Epic : 회원 관리 기능 구현

### Story : 사용자로써 가입할 수 있다.

- sub task : 회원가입 api end point 구현
- sub task : 이메일 중복 로직 추가
- sub task : 회원가입 단위 테스트 작성

### Story : 회원으로써 로그인할 수 있다.

- sub task : jwt token 발급 로직 구현
- sub task : spring security 설정

### Task : redis session 저장소 구성

# 용어 간단 정리

- Issue : 모든 작업 항목을 통칭하는 용어
    - epic, story, task, sub task, bug 등등
- epic : 큰 기능 단위로 여러 story 와 task 를 묶은 것.
- story, task : 독립적으로 수행 가능한 작업 단위
- sub task : story 와 task 를 더 잘게 쪼갠 것.

# 스크럼 보드와 칸반 보드

## Scrum Board

> **sprint** 기반으로 작업을 관리하는 방식
> 

- 특징
    - 정해진 기간 단위로 작업 (1 - 2 주)
    - 스프린트 시작 전에 이번 스프린트에서 할 일을 미리 계획
    - 스프린트가 끝나면 회고하고 다음 스프린트를 계획
    - `속도`를 측정할 수 있음.  (sprint 마다 완료한 story point 합계)

- 작업 흐름
    
    ```
    backlog (해야할 일 목록) -> 
    sprint planning (스프린트에 포함시킬 issue 선택) -> 
    active sprint (진행중인 sprint todo -> in progress -> done) ->
    sprint complete (sprint 종료 및 회고)
    ```
    

- 사용 시점
    - 명확한 마감기한이 있을 때
    - 반복적인 개발 주기가 필요할 때
    - 팀 단위로 협업할 때
    - 계획적으로 작업량을 조절하고 싶을 때

- 예시
    - 이번주에 회원가입 api 와 로그인 api 완성하자 라고 정함.
    - 일주일 스프린트를 돌림
    - 월요일에는 sprint planning 회의애서 issue 들을 sprint 에서 넣고 금요일에 완료한 것들을 확인하고 회고

## Kanban Board

> 흐름 기반으로 작업을 관리하는 방식
> 

- 특징
    - sprint 가 없음. 지속적으로 작업이 흘러감.
    - 작업이 완료되면 바로 다음 작업을 가져옴
    - WIP (Work In Progress) 제한을 둘 수 있음.
        - 예를 들어 In progress 에는 동시에 3개까지만 제한!
    - 더 유연하고 즉각적으로 대응할 수 있다는게 장점

- 작업 흐름
    
    ```
    backlog -> todo -> in progress -> in review -> done
    ```
    
    - 각 칼럼마다 WIP 제한을 걸 수 있음
    
    ```
    backlog -> todo -> in progress (max 3) -> in review (max 2)-> done  
    ```
    

- 언제 사용?
    - 유지보수나 운영업무처럼 계속 들어오는 작업을 처리할 때
    - 작업의 우선순위가 자주 변경될 때
    - 빠른 대응이 필요한 버그 수정이 많을 때
    - 팀이 작거나 혼자 작업할 때

- 예시
    - 고객 문의나 버그가 계속 들어오는 상황에서 우선순위가 높은 것 부터 처리하고 완료되면 다음 것을 바로 가져오는 식

| 구분 | Scrum | Kanban |
| --- | --- | --- |
| **작업 단위** | 스프린트 (1~2주) | 연속적 흐름 |
| **계획** | 스프린트 시작 시 계획 | 필요할 때마다 추가 |
| **변경 유연성** | 스프린트 중간에 변경 어려움 | 언제든 우선순위 변경 가능 |
| **측정 지표** | Velocity (Story Point) | Lead Time, Cycle Time |
| **회의** | Sprint Planning, Review, Retrospective | 필요시 |
| **적합한 상황** | 명확한 목표, 팀 협업 | 유지보수, 즉각 대응 |

# Ticket 이 뭔데?

ticket 을 끊는다 라는 것은 Issue 를 생성한다는 실무 용어.

```
ticket 끊는다 == issue 를 생성한다.
```

- 예시
    - 버그 ticket 끊음 → 버그 이슈를 생성함.
    - 이 기능 ticket 으로 만들어줘 → 이 기능을 이슈로 등록해줘
    - 티켓 번호가 뭐야 ? → issue key 가 뭐야?
    - ticket 달아 → issue 에 코멘트 남겨
    - 이 ticket 처리했어 → 이 issue 를 완료했어.