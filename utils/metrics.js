const prometheus = require('prom-client');

// Create a Registry
const register = new prometheus.Registry();

// Add a default label to all metrics
register.setDefaultLabels({
  app: 'kwanza-manipulus'
});

// Enable the collection of default metrics
prometheus.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const databaseConnections = new prometheus.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

const activeUsers = new prometheus.Gauge({
  name: 'active_users_current',
  help: 'Number of currently active users'
});

const uploadSize = new prometheus.Histogram({
  name: 'upload_size_bytes',
  help: 'Size of uploaded files in bytes',
  labelNames: ['file_type'],
  buckets: [1024, 10240, 102400, 1048576, 10485760, 52428800]
});

// Register the custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(databaseConnections);
register.registerMetric(activeUsers);
register.registerMetric(uploadSize);

// Middleware to track HTTP requests
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    
    httpRequestDuration
      .labels(method, route, statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(method, route, statusCode)
      .inc();
  });
  
  next();
};

// Export metrics endpoint
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
};

module.exports = {
  register,
  metricsMiddleware,
  metricsEndpoint,
  databaseConnections,
  activeUsers,
  uploadSize
};
