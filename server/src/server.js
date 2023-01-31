const express = require('express');
const cors = require('cors');
const {readData, filterData} = require('./parquet_reader/parquet_reader');


const app = express();

app.use(cors());
app.use(express.json());

readData().then((cache) => {
    let filtered_cache = filterData(cache)
    app.listen(8000, () => {
        console.log(`Server is running on port 8000.`);
    });
    app.get('/spot_rate', (req, res) => {
        res.json(cache[req.query.spot_rate]);
    });
    app.get('/spot_rate_filtered', (req, res) => {
        res.json(filtered_cache[req.query.spot_rate_filtered]);
    });
    app.get('/spot_rate_types', (_, res) => {
        res.json({"spot_rate_types": Object.keys(cache)});
    });
});