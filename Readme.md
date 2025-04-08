# 패키지 설치

```
# 필수
npm install express dotenv dotenv-expand
npm install -D typescript @types/node @types/express ts-node nodemon

# windown, liunx 동시에 환경변수 사용
npm install -D cross-env

# 보안
npm install cors helmet
npm install -D @types/cors

# 토큰
npm install jsonwebtoken
npm install -D @types/jsonwebtoken

# 검증
npm install express-validator class-validator class-transformer reflect-metadata

# 패키징
npm install -D pkg

# 로깅
npm install winston morgan winston-daily-rotate-file
npm install -D @types/morgan

# 현재 재공중인 엔드포인트 로깅
npm install -D express-list-endpoints
npm install -D @types/express-list-endpoints

# 데이터베이스
npm install mysql2

# swagger
npm install express-openapi-validator swagger-ui-express
npm install -D @types/swagger-ui-express

# 기타
npm install uuid
npm install -D @types/uuid

# 출력 정렬
npm install columnify
npm install -D @types/columnify
```

# 실행

```
# 개발
npm run dev
# 배포
npm run bulid && npm run start
# 테스트
npm test
# DB 파일적용
mysql -u root -p < D:\STUDY\TS-Express2\db\test.sql
```

# Github 동기화

```
git fetch --prune origin
git reset --hard origin/main
```

# 동작중인 서버 프로세스 강제종료

```
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %a
```
