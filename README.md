# 학교 시간표와 급식표

학교 이름을 검색해 시간표와 급식표를 조회하는 Vercel 배포용 웹사이트입니다.

## 핵심 구조

- `index.html`: 화면 구조
- `styles.css`: 디자인
- `app.js`: 학교 검색, 시간표, 급식표 표시
- `config.js`: 브라우저가 사용할 API 서버 주소
- `api/neis.js`: Vercel에서 실행되는 API 서버

브라우저는 나이스 API에 직접 접속하지 않고 `/api/neis`에 요청합니다. `/api/neis`는 Vercel 환경변수 `NEIS_API_KEY`를 사용해 나이스 API에 요청합니다.

## Vercel 환경변수

Vercel 프로젝트 설정에서 아래 환경변수를 추가해야 합니다.

```text
Name: NEIS_API_KEY
Value: 발급받은 나이스 API 키
```

환경변수를 추가하거나 바꾼 뒤에는 반드시 다시 배포해야 합니다.

## 배포 후 확인 주소

아래 주소에서 JSON이 보이면 API 서버가 정상입니다.

```text
https://내프로젝트.vercel.app/api/neis?service=schoolInfo&Type=json&pIndex=1&pSize=1&SCHUL_NM=하나고등학교
```

## 404 NOT_FOUND 또는 HTML JSON 오류가 뜰 때

Vercel 주소에서 `The page could not be found`가 뜨면 보통 `index.html`이 Vercel 프로젝트의 루트에 없다는 뜻입니다.

GitHub 저장소 첫 화면에 `index.html`, `app.js`, `styles.css`, `config.js`, `api` 폴더가 바로 보여야 합니다. `new-chat-2/index.html`처럼 폴더 안에 들어가 있으면 Vercel의 Root Directory를 그 폴더로 바꾸거나, 파일을 저장소 루트로 옮겨야 합니다.

`Unexpected token '<', "<!doctype "... is not valid JSON`이 뜨면 `/api/neis`가 API 응답 대신 `index.html`을 반환하고 있다는 뜻입니다. `api/neis.js`와 `vercel.json`을 다시 올리고 재배포해야 합니다.
