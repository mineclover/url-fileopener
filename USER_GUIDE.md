# File Opener 사용자 가이드

## 📖 소개

File Opener는 웹 브라우저나 문서에서 클릭 한 번으로 로컬 파일을 여는 도구입니다.
`fileopener://` 프로토콜을 사용하여 프로젝트의 파일들을 빠르게 열 수 있습니다.

## 🚀 빠른 시작

### 1. 설치 및 등록

```bash
# npm으로 전역 설치
npm install -g @context-action/fopen-cli

# 프로토콜 등록 (한 번만 실행)
fopen install
```

### 2. 프로젝트 추가

```bash
# 현재 디렉토리를 프로젝트로 추가
fopen add my-project

# 또는 특정 경로 지정
fopen add my-project "C:\Users\username\projects\my-project"
```

### 3. 파일 열기

이제 다음과 같은 URL로 파일을 열 수 있습니다:

```
fileopener://my-project/README.md
fileopener://my-project/src/index.js
fileopener://my-project/docs/guide.md
```

## 📝 URL 작성 방법

### 기본 형식

```
fileopener://프로젝트명/파일경로
```

### 실제 예시

```
fileopener://my-project/package.json
fileopener://my-project/src/components/Header.tsx
fileopener://my-project/docs/api/reference.md
```

### 공백이 포함된 파일명

공백은 `%20`으로 인코딩합니다:

```
fileopener://my-project/my%20file.txt
fileopener://my-project/documents/meeting%20notes.md
```

### 레거시 형식 (하위 호환)

쿼리 파라미터 방식도 지원합니다:

```
fileopener://my-project?path=README.md
fileopener://my-project?path=src/index.js
```

## 🔗 실제 사용 예시

### 마크다운 문서에서 사용

```markdown
프로젝트의 [설정 파일](fileopener://my-project/config.json)을 확인하세요.

자세한 내용은 [API 문서](fileopener://my-project/docs/api.md)를 참조하세요.
```

### HTML에서 사용

```html
<a href="fileopener://my-project/README.md">README 열기</a>
<a href="fileopener://my-project/src/app.js">소스 코드 보기</a>
```

### 브라우저 주소창에서 직접 입력

```
fileopener://my-project/package.json
```

엔터를 누르면 해당 파일이 기본 에디터에서 열립니다.

## 🛠️ 주요 명령어

### 프로젝트 관리

```bash
# 프로젝트 추가
fopen add project-name "C:\path\to\project"

# 프로젝트 목록 보기
fopen list

# 프로젝트 삭제
fopen remove project-name

# 설정 파일 열기
fopen config
```

### 로그 관리

```bash
# 로그 파일 정리 (디스크 공간 확보)
fopen clean-logs
```

### 프로토콜 관리

```bash
# 프로토콜 재등록
fopen install

# 프로토콜 제거
fopen uninstall
```

## 🔒 보안 기능

File Opener는 다음과 같은 보안 기능을 제공합니다:

### ✅ 안전한 접근만 허용

- 등록된 프로젝트 디렉토리 내부의 파일만 접근 가능
- 상위 디렉토리 접근 시도 차단 (`../` 등)
- 절대 경로 접근 차단 (`C:\`, `/etc/` 등)
- 시스템 파일 보호

### ❌ 차단되는 위험한 접근

```bash
# 이런 시도들은 모두 차단됩니다
fileopener://my-project/../../../Windows/System32/calc.exe
fileopener://my-project?path=C:\Windows\System32\notepad.exe
fileopener://my-project/~/Documents/private.txt
```

모든 보안 위반은 로그에 기록되어 추적 가능합니다.

## 💡 고급 기능: 심볼릭 링크

### 심볼릭 링크란?

심볼릭 링크는 다른 파일이나 폴더를 가리키는 "바로가기"입니다.
프로젝트 내에서 자주 사용하는 파일에 짧은 이름으로 접근할 수 있습니다.

### Windows에서 심볼릭 링크 생성

#### 방법 1: 관리자 권한 사용

```cmd
# 1. Windows 키 + X 누르기
# 2. "터미널(관리자)" 또는 "명령 프롬프트(관리자)" 선택
# 3. 프로젝트 디렉토리로 이동
cd C:\path\to\your\project

# 4. 심볼릭 링크 생성
mklink shortcut.md docs/long/path/document.md
```

#### 방법 2: 개발자 모드 활성화 (권장)

개발자 모드를 활성화하면 관리자 권한 없이 심볼릭 링크를 생성할 수 있습니다:

```
1. 설정 앱 열기 (Windows 키 + I)
2. "개발자용" 검색
3. "개발자 모드" 토글 켜기
4. 재부팅
```

재부팅 후:

```powershell
# PowerShell에서 일반 권한으로 실행
cd C:\path\to\your\project
New-Item -ItemType SymbolicLink -Path "shortcut.md" -Target "docs\long\path\document.md"
```

### 심볼릭 링크 사용 예시

```bash
# 심볼릭 링크 생성 후
mklink api-doc.md docs/api/reference/detailed-api.md

# 짧은 URL로 접근 가능
fileopener://my-project/api-doc.md
```

### 안전한 심볼릭 링크 사용

✅ **안전**: 프로젝트 내부 파일을 가리키는 링크
```cmd
mklink quick-readme.md README.md
mklink main-config.json config/production/main.config.json
```

⚠️ **위험**: 프로젝트 외부를 가리키는 링크는 사용하지 마세요
```cmd
# 이렇게 하지 마세요!
mklink outside.txt C:\other-project\file.txt
```

## 🖥️ 플랫폼별 파일 열기 동작

### Windows
- 명령어: `cmd /c start ""`
- 기본 연결 프로그램으로 파일이 열립니다
- 텍스트 파일 → VS Code, Notepad 등
- 이미지 파일 → 사진 앱
- PDF 파일 → PDF 뷰어

### macOS
- 명령어: `open`
- 기본 연결 프로그램으로 파일이 열립니다

### Linux
- 명령어: `xdg-open`
- 기본 연결 프로그램으로 파일이 열립니다

## 🔧 문제 해결

### 파일이 열리지 않을 때

#### 1. 프로젝트가 등록되어 있는지 확인

```bash
fopen list
```

프로젝트가 목록에 없다면:
```bash
fopen add my-project "C:\path\to\project"
```

#### 2. 파일 경로 확인

```bash
# 파일이 실제로 존재하는지 확인 (Windows)
dir C:\path\to\project\your-file.txt

# 또는 PowerShell
Test-Path "C:\path\to\project\your-file.txt"
```

#### 3. URL 형식 확인

```
✅ 올바른 형식: fileopener://my-project/README.md
❌ 잘못된 형식: fopen://my-project/README.md
```

#### 4. 공백 처리 확인

```
✅ 올바른 형식: fileopener://my-project/my%20file.txt
❌ 잘못된 형식: fileopener://my-project/my file.txt
```

### 프로토콜이 인식되지 않을 때

```bash
# 프로토콜 재등록
fopen uninstall
fopen install

# Windows에서 재부팅 필요할 수 있음
```

### 권한 오류가 발생할 때

- 프로젝트 디렉토리 읽기 권한 확인
- 안티바이러스 소프트웨어 예외 추가 검토
- Windows Defender 실시간 보호 일시 비활성화 후 테스트

## 📊 로그 확인

문제 해결을 위해 로그를 확인할 수 있습니다:

### Windows
```powershell
notepad %USERPROFILE%\.fopen-cli\handler.log
```

### macOS/Linux
```bash
cat ~/.fopen-cli/handler.log
```

로그에는 다음 정보가 포함됩니다:
- 파일 열기 시도
- 보안 위반 감지
- 오류 메시지
- 성공/실패 결과

## 💡 활용 팁

### 1. 문서에 파일 링크 포함

프로젝트 README.md에 소스 코드 링크를 포함:

```markdown
## 프로젝트 구조

- [메인 앱](fileopener://my-project/src/app.js)
- [설정 파일](fileopener://my-project/config.json)
- [테스트 코드](fileopener://my-project/tests/app.test.js)
```

### 2. 이슈 트래커에서 사용

GitHub 이슈나 JIRA에서 파일 참조:

```markdown
버그가 발생하는 파일: fileopener://my-project/src/components/Button.tsx

관련 테스트: fileopener://my-project/tests/Button.test.tsx
```

### 3. 코드 리뷰 시 활용

PR 설명에 변경된 파일 링크 포함:

```markdown
### 주요 변경 사항

- [API 핸들러 수정](fileopener://my-project/src/api/handler.js)
- [타입 정의 업데이트](fileopener://my-project/types/api.d.ts)
```

### 4. 팀 온보딩 가이드

신규 팀원을 위한 가이드:

```markdown
## 시작하기

1. [환경 설정 가이드](fileopener://team-project/docs/setup.md)
2. [코딩 컨벤션](fileopener://team-project/docs/conventions.md)
3. [예제 코드](fileopener://team-project/examples/hello-world.js)
```

## 🌐 웹 통합 (고급)

웹 서버와 통합하여 HTTP URL을 자동으로 `fileopener://` 프로토콜로 리다이렉트할 수 있습니다.

자세한 내용은 [fileopener-redirect-worker](https://github.com/mineclover/fileopener-redirect-worker) 프로젝트를 참조하세요.

## 📞 도움말

더 많은 정보는 다음을 참조하세요:

- [GitHub 저장소](https://github.com/mineclover/url-fileopener)
- [npm 패키지](https://www.npmjs.com/package/@context-action/fopen-cli)
- [이슈 리포트](https://github.com/mineclover/url-fileopener/issues)

---

**즐거운 코딩 되세요! 🎉**
