const mongoose = require('mongoose');

const connectDatabase = () => {
    try{
        mongoose.connect(process.env.DB_URI).then(con => {
            console.log(`MongoDB is Connectedto the host: ${con.connection.host}`);
        })
    }catch(error){
        console.log('Connextion Error:', error.message);
        process.exit(1);
    }

}

module.exports = connectDatabase;