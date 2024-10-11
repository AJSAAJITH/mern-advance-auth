const app = require('./app');
const connectDatabase = require('./config/databse');
const PORT = process.env.PORT || 5000;

connectDatabase();
const server = app.listen(PORT, () => {
    console.log(`Server Strat Successfull with port: ${PORT} in ${process.env.NODE_ENV}`);
});