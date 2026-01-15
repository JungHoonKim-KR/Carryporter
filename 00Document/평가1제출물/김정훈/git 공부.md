# 프로젝트 브랜치 전략

## 1. 브랜치 구조 요약

| **구분** | **브랜치명** | **설명** |
| --- | --- | --- |
| **최종 기록** | `master` | **전체 아카이브.** 코드 + 개발 문서 + 기획서 등 모든 산출물의 최종본 (배포용 아님) |
| **실서비스** | `release` | **사용자 서비스 최종판.** 실제 배포가 이루어지는 브랜치 |
| **통합 개발** | `develop` | **개발 최종판.** 모든 파트(AI, BE, FE)의 기능이 합쳐진 공간 |
| **개발 공장(?)** | `feature` | **파트별 조립 및 테스트 구역.** (예: `feature/Backend`) |
| **기능 개발** | `feature/[Part]/[Task]` | **세부 기능 구현.** (예: `feature/Backend/Auth`) |
| **핫픽스** | `hotfixes` | 개발은 완료했지만 **배포 과정에서 발생한 에러를 해결** |

---

## 2. 상세 브랜치 역할

### 🏛 master

- 프로젝트의 **가장 완벽한 형태의 기록**입니다.
- `develop`의 코드뿐만 아니라, **기획서, 설계도, API 명세서 등 모든 문서**를 포함합니다.
- 실서비스 배포용이 아닌, 프로젝트 전체를 아우르는 최종 저장소 역할을 합니다.

### 🌐 release(유저용 서버)

- **사용자가 만나는 실제 배포 브랜치**입니다.
- `develop`에서 검증이 끝난 코드가 이곳으로 합쳐지며, 합쳐지는 즉시 실서버에 반영됩니다.

### 🧪 develop(개발용 서버)

- 실제 배포(release) 전 테스트 브랜치
- 파트별 'feature'에서 검토가 완료된 기능들만 이쪽으로 들어올 수 있습니다.
- 파트별 'feature'에서 만들어진 새로운 기능이 병합되는 장소
- release 이전에 파트별로 서로 충돌이 없는지 확인

### 🎡 feature

- 기능 추가 브랜치 (ai, backend, frontend 등)
- 예시 feature/frontend/login-page

---

## 3. 작업 흐름

기능 하나가 개발되어 배포되기까지의 과정입니다. (예: 백엔드 로그인 기능)

1. **브랜치 생성:** `develop`을 바탕으로 본인이 개발할 `feature`브랜치 생성
    - git checkout -b feature/backend/login
2. **기능 구현:** 해당 브랜치에서 코드를 작성하고 커밋 및 푸시합니다.
3. **MR:** `feature/backend/login`→`develop`으로 MR을 보냅니다.
    - 다른 파트(AI, FE)와의 연동 테스트를 거칩니다.
    - 백엔드 팀원들의 코드 리뷰를 거쳐 **Approve**를 받으면 조립(Merge) 완료!
4. **리뷰:** MR요청을 리뷰어가 리뷰한다
    - 리뷰 후 문제 발견 시 comment : 이 코드는 왜 썼나요??
    - 리뷰 후 문제 미발견 시 comment : 굿
5. **최종 확인(Approve) & Merge** 
6. **배포 및 기록:**
    - `develop` → `release` (실제 배포 발생)
    - `develop` → `master` (문서 업데이트 및 최종 아카이빙)

---

## 4. 협업 규칙 (Ground Rules)

- **실수 방지:** 절대 `develop`이나 `release` 브랜치에 직접 Push하지 않습니다. 반드시 파트별 연습장(`feature/Part`)을 거쳐 MR로 합류합니다.
- **리뷰 우선:** 모든 MR은 파트원에게 검토를 받아야 합니다.
    - 리뷰어는 파트별로 맡아서 정합니다.
- **MR 양식: ..**
- **문서화:** 기능이 변경되거나 추가될 경우, `master` 브랜치에 반영할 문서(API, 명세 등)도 반드시 함께 업데이트합니다.
- 기타 추가 사항들…

---

## 5. 팁

- 브랜치에서 `feature/branch/login`은 feature 내부에 새로운 브랜치가 생기는 것이 아니라 feature 브랜치의 일부를 상세히 기술한 것일 뿐이다
    - 즉 feature 하위(?)의 모든 push는 feature에 적용되는 것이다
- MR과 PR는 같은 것이다
    - GItlab : Merge Request
    - Github : Pull Request

---

## 6. 정리

### 브랜치

- master
    - develop + 기타 문서
- release
    - 배포 환경
- develop
    - 개발 환경
    - MR : `develop`→ `release`
- feature
    - 개발 테스트
    - MR : `feature`→ `develop`
- hotfix
    - 긴급 버그 픽스
    - MR : `hotfix`→ `release`/ `hotfix`→ `release`

## 논의할 부분

1. release 뺄까?
    - develop은 개발, release는 배포용으로 구분하는 건 굉장히 이상적이지만 우리 프로젝트 규모에 맞지 않음