export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
  },
  oauth: {
    serverUrl: process.env.OAUTH_SERVER_URL,
    appId: process.env.VITE_APP_ID,
  },
  payment: {
    pagarmeKey: process.env.PAGARMEE_API_KEY,
    mercadoPagoKey: process.env.MERCADO_PAGO_API_KEY,
  },
  shipping: {
    melhorEnvioKey: process.env.MELHOR_ENVIO_API_KEY,
  },
  storage: {
    s3Bucket: process.env.S3_BUCKET,
    s3Region: process.env.S3_REGION,
  },
});

