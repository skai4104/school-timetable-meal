# 처음부터 배포하는 방법

## 1. GitHub 저장소 만들기

1. GitHub에 로그인합니다.
2. 오른쪽 위 `+` 버튼을 누릅니다.
3. `New repository`를 누릅니다.
4. Repository name에 예를 들어 `school-timetable-meal`을 입력합니다.
5. `Public` 또는 `Private`를 선택합니다.
6. `Create repository`를 누릅니다.

## 2. 파일 올리기

저장소 화면에서 `Add file` > `Upload files`를 누르고 이 폴더의 파일과 폴더를 올립니다.

```text
api/
assets/
.gitignore
.nojekyll
DEPLOYMENT_GUIDE.md
README.md
app.js
config.js
index.html
package.json
styles.css
```

업로드한 뒤 `Commit changes`를 누릅니다.

## 3. Vercel에 연결하기

1. Vercel에 로그인합니다.
2. `Add New...` > `Project`를 누릅니다.
3. GitHub 저장소 `school-timetable-meal`을 선택합니다.
4. `Import`를 누릅니다.
5. 설정은 기본값 그대로 둡니다.
6. 아직 `Deploy`를 누르지 말고 환경변수를 먼저 넣습니다.

## 4. 나이스 API 키 숨겨 넣기

Vercel 프로젝트 화면에서 아래처럼 이동합니다.

```text
Settings > Environment Variables
```

아래 값을 추가합니다.

```text
Name: NEIS_API_KEY
Value: 발급받은 나이스 API 키
Environment: Production 체크
```

Preview도 체크하면 미리보기 배포에서도 작동합니다.

## 5. 배포하기

환경변수를 저장한 뒤 `Deploy`를 누릅니다.

배포가 끝나면 이런 주소가 생깁니다.

```text
https://프로젝트이름.vercel.app
```

이 주소는 다른 와이파이, 휴대폰 데이터, 다른 컴퓨터에서도 접속할 수 있습니다.

## 6. API 서버 확인하기

배포 주소 뒤에 아래 경로를 붙여서 열어봅니다.

```text
/api/neis?service=schoolInfo&Type=json&pIndex=1&pSize=1&SCHUL_NM=하나고등학교
```

예시:

```text
https://프로젝트이름.vercel.app/api/neis?service=schoolInfo&Type=json&pIndex=1&pSize=1&SCHUL_NM=하나고등학교
```

`schoolInfo`가 보이면 성공입니다.

## 7. 수정 후 다시 배포하기

파일을 수정하면 GitHub에 다시 업로드하고 `Commit changes`를 누릅니다. Vercel이 자동으로 다시 배포합니다.

환경변수만 바꿨다면 Vercel의 `Deployments`에서 최근 배포 오른쪽 `...`를 누르고 `Redeploy`를 누릅니다.
