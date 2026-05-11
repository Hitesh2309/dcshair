require('dotenv').config();
const { defineConfig } = require('@prisma/config');

module.exports = defineConfig({
  earlyAccess: true, // Prisma 7 configuration is currently in early access/preview
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
