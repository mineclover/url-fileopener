# Windows 심볼릭 링크 테스트 가이드

## 전제 조건
Windows에서 심볼릭 링크를 생성하려면:
- **관리자 권한**이 필요 (일반 사용자는 안됨)
- 또는 Windows 10 빌드 14972+ 에서 개발자 모드 활성화

## 테스트 시나리오

### 시나리오 1: 프로젝트 내부 심볼릭 링크 (안전)
```cmd
# 프로젝트 내부 파일을 가리키는 심볼릭 링크
mklink test-symlink.txt README.md

# 테스트
fileopener://test-project/test-symlink.txt
```
**예상 결과**: ✅ README.md가 열림 (프로젝트 내부이므로 안전)

### 시나리오 2: 프로젝트 외부 심볼릭 링크 (위험)
```cmd
# 관리자 권한 CMD에서:
cd C:\woo-work\workflow\url-fileopener
echo "outside content" > C:\outside-file.txt
mklink test-link-outside.txt C:\outside-file.txt

# 테스트
fileopener://test-project/test-link-outside.txt
```
**예상 결과**: 
- 현재 구현: 파일이 프로젝트 디렉토리 내에 있으면 열림 
- 개선 필요: 심볼릭 링크 해석 후 실제 경로 검증 필요

### 시나리오 3: 디렉토리 심볼릭 링크
```cmd
# 관리자 권한 CMD에서:
mklink /D linked-dir C:\Windows\System32

# 테스트
fileopener://test-project/linked-dir/notepad.exe
```
**예상 결과**: ❌ 차단되어야 함 (프로젝트 외부)

## 실제 테스트 명령어

### 준비
```bash
# 1. 테스트 파일 생성
echo "outside content" > C:\test-outside.txt
echo "inside content" > C:\woo-work\workflow\url-fileopener\test-inside.txt

# 2. 관리자 권한 CMD 또는 PowerShell 실행
# 시작 메뉴 > cmd 우클릭 > "관리자 권한으로 실행"
```

### 테스트 실행 (관리자 권한 필요)
```cmd
cd C:\woo-work\workflow\url-fileopener

:: 테스트 1: 내부 파일 심볼릭 링크
mklink link-to-readme.md README.md
node dist\bin\fopen-handler-simple.cjs "fileopener://test-project/link-to-readme.md"

:: 테스트 2: 외부 파일 심볼릭 링크
mklink link-to-outside.txt C:\test-outside.txt
node dist\bin\fopen-handler-simple.cjs "fileopener://test-project/link-to-outside.txt"

:: 테스트 3: 디렉토리 심볼릭 링크
mklink /D link-to-system C:\Windows\System32
node dist\bin\fopen-handler-simple.cjs "fileopener://test-project/link-to-system/calc.exe"
```

## 개발자 모드로 심볼릭 링크 생성 (관리자 권한 불필요)

### Windows 10/11 개발자 모드 활성화
1. 설정 > 업데이트 및 보안 > 개발자용
2. "개발자 모드" 켜기
3. 재부팅

### PowerShell에서 생성
```powershell
# 일반 사용자 권한으로 가능
New-Item -ItemType SymbolicLink -Path "link-name.txt" -Target "C:\target-file.txt"
```

## 보안 체크 포인트

현재 핸들러 코드의 보안 레이어:
1. ✅ `..` 포함 경로 차단
2. ✅ `~` 포함 경로 차단  
3. ✅ 절대 경로 차단
4. ✅ path.normalize() 후 재검증
5. ⚠️ **path.resolve() + startsWith()** - 심볼릭 링크는 해석됨

### 잠재적 보안 이슈
```javascript
// 현재 코드 (src/bin/fopen-handler-simple.js:176)
const fullPath = path.resolve(path.join(projectPath, normalizedPath));
```

`path.resolve()`는 심볼릭 링크를 실제 경로로 해석하지 **않습니다**.
심볼릭 링크가 프로젝트 외부를 가리켜도 차단되지 않을 수 있음.

### 개선 방안
```javascript
// 심볼릭 링크 실제 경로 검증
const fs = require('fs');
const realPath = fs.realpathSync(fullPath);

if (!realPath.startsWith(normalizedProjectPath)) {
  log('SECURITY VIOLATION: Symlink points outside project directory');
  return;
}
```
