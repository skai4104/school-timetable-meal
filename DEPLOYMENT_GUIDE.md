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
vercel.json
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

## 404 NOT_FOUND가 뜰 때

`The page could not be found NOT_FOUND`는 Vercel이 `index.html`을 못 찾았다는 뜻일 때가 많습니다.

먼저 GitHub 저장소 첫 화면을 확인합니다. 첫 화면에 아래 파일들이 바로 보여야 합니다.

```text
index.html
app.js
styles.css
config.js
api/
assets/
vercel.json
```

만약 GitHub 첫 화면에 `new-chat-2` 같은 폴더 하나만 보이고, 그 폴더 안에 `index.html`이 있다면 둘 중 하나를 해야 합니다.

1. 파일들을 폴더 밖 저장소 첫 화면으로 옮깁니다.
2. Vercel 프로젝트의 `Settings > General > Root Directory`를 `new-chat-2`로 바꾼 뒤 다시 배포합니다.

Root Directory를 바꿨다면 반드시 `Deployments`에서 `Redeploy`를 눌러야 합니다.

## Unexpected token '<' 오류가 뜰 때

`Unexpected token '<', "<!doctype "... is not valid JSON`은 사이트가 `/api/neis`에서 JSON을 받아야 하는데 HTML 페이지를 받았다는 뜻입니다.

확인할 것:

1. GitHub 저장소에 `api/neis.js`가 올라가 있는지 확인합니다.
2. GitHub 저장소에 `vercel.json`이 올라가 있는지 확인합니다.
3. Vercel의 `Settings > General > Root Directory`가 `index.html`과 `api` 폴더가 있는 위치를 가리키는지 확인합니다.
4. 다시 배포합니다.

## 7. 수정 후 다시 배포하기

파일을 수정하면 GitHub에 다시 업로드하고 `Commit changes`를 누릅니다. Vercel이 자동으로 다시 배포합니다.

환경변수만 바꿨다면 Vercel의 `Deployments`에서 최근 배포 오른쪽 `...`를 누르고 `Redeploy`를 누릅니다.
