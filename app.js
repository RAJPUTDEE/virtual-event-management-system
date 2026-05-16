const app = require('./src/server');

const port = Number(process.env.PORT) || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;