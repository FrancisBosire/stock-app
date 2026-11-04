const { createProxyMiddleware } = require('http-proxy-middleware');
const requireKey = (envName, message) => (req, res, next) => {
  if (!process.env[envName]) return res.status(500).json({ message });
  next();
};
module.exports = function setupProxy(app) {
  app.use('/api/yahoo', requireKey('YAHOO_API_KEY', 'Yahoo Finance API key is missing. Add YAHOO_API_KEY to your local .env file and restart the app.'));
  app.use(createProxyMiddleware('/api/yahoo', {
    target: 'https://yfapi.net', changeOrigin: true, pathRewrite: { '^/api/yahoo': '' }, timeout: 20000, proxyTimeout: 15000,
    onProxyReq(proxyReq) { proxyReq.setHeader('x-api-key', process.env.YAHOO_API_KEY); },
  }));
  app.use('/api/mansa', requireKey('MANSA_API_KEY', 'Mansa API key is missing. Add MANSA_API_KEY to the local .env file and restart the app.'));
  app.use(createProxyMiddleware('/api/mansa', {
    target: 'https://mansaapi.com', changeOrigin: true, pathRewrite: { '^/api/mansa': '/api/v1' }, timeout: 20000, proxyTimeout: 15000,
    onProxyReq(proxyReq) { proxyReq.setHeader('Authorization', 'Bearer ' + process.env.MANSA_API_KEY); },
  }));
};
