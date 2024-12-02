# Mini Canvas

간단한 드로잉 도구를 제공하는 웹 애플리케이션입니다.

## 기능

- 다양한 도형 그리기
  - 직선
  - 곡선
  - 원
  - 사각형
  - 다각형
- 선 스타일 설정
  - 색상 선택 (프리셋 + 커스텀)
  - 선 굵기 조절
- 작업 히스토리
  - 실행 취소 (Ctrl+Z)
  - 다시 실행 (Ctrl+Y)
  - 최근 작업으로 이동
  - 전체 초기화

## 기술 스택

- Next.js 14
- TypeScript
- Konva.js
- Zustand
- Tailwind CSS
- shadcn/ui

## 폴더 구조

```
src/
├── app/                              # Next.js 앱 라우팅
│   └── page.tsx                      # 메인 페이지
├── components/                       # 리액트 컴포넌트
│   ├── canvas/                       # 캔버스 관련 컴포넌트
│   │   ├── ControlPoint.tsx         # 제어점 컴포넌트
│   │   └── ElementRenderer.tsx      # 도형 렌더링 컴포넌트
│   ├── ui/                          # UI 컴포넌트 (shadcn/ui)
│   │   └── ...
│   ├── Canvas.tsx                   # 메인 캔버스 컴포넌트
│   └── Toolbar/                     # 툴바 관련 컴포넌트
│       ├── ActionButtons.tsx        # 실행 취소/다시 실행 버튼
│       ├── ColorPicker.tsx         # 색상 선택기
│       ├── ToolSelector.tsx        # 도구 선택기
│       ├── WidthControl.tsx        # 선 굵기 조절기
│       └── index.tsx               # 툴바 메인 컴포넌트
├── hooks/                          # 커스텀 훅
│   ├── useDrawing.ts              # 도형 그리기 관련 훅
│   ├── useHistory.ts              # 작업 히스토리 관리 훅
│   ├── useKeyboardShortcuts.ts    # 키보드 단축키 훅
│   ├── useToolbar.ts              # 툴바 상태 관리 훅
│   └── useWindowSize.ts           # 윈도우 크기 감지 훅
├── lib/                           # 유틸리티 함수
│   └── utils.ts                   # 공통 유틸리티 함수
└── types/                         # TypeScript 타입 정의
    └── index.ts                   # 공통 타입 정의
```

## 커스텀 훅

- `useDrawing`: 도형 그리기 상태 및 로직 관리
  - 현재 그리기 상태
  - 도형별 그리기 처리
  - 베지어 곡선 계산
- `useHistory`: 작업 히스토리 관리
  - 작업 기록 저장
  - 실행 취소/다시 실행
  - 로컬 스토리지 연동
- `useToolbar`: 도구 설정 관리
  - 선택된 도구
  - 색상
  - 선 굵기
- `useWindowSize`: 캔버스 크기 관리
  - 윈도우 크기 변경 감지
  - 반응형 캔버스 크기 조정
- `useKeyboardShortcuts`: 키보드 단축키 관리
  - 실행 취소 (Ctrl+Z)
  - 다시 실행 (Ctrl+Y)
  - ESC로 그리기 취소

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```
