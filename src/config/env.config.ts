import * as dotenv from 'dotenv';
import * as envVar from 'env-var';

dotenv.config();

export const envConfig = {
  appName: envVar.get('APP_NAME').required().asString(),
  jwtSecret: envVar.get('JWT_SECRET').required().asString(),
  expiresIn: envVar.get('JWT_DURATION').asString() ?? '1 year',
  dbUrl: envVar.get('MONGODB_URL').required().asString(),
  port: envVar.get('PORT').asInt() ?? 3000,
  environment: envVar.get('NODE_ENV').required().asString(),
};
