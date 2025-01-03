export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'your_database_connection_string',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret'
};
