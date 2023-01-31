const parquet = require('../parquetjs-lite/parquet');
const fs = require('fs');
const utils = require('../utils');

const DATA_DIR = "..\\DATA"

const timeMap = {"By Week": 10080, "By Day": 1440, "By Month": 43800}

const getDirectories = source =>
    fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const readData = async () => {
    let coins_dict = {};
    for (const dir of getDirectories(DATA_DIR)) {
        var coins = []
        for (const filePath of fs.readdirSync(DATA_DIR + "\\" + dir)) {
            let records = await readParquet(DATA_DIR + "\\" + dir + "\\" + filePath)
            coins.push.apply(coins, records)
        }
        coins_dict[dir] = coins
        let grans = {}
        for (const gran of Object.keys(timeMap)) {
            grans[gran] = utils.computeByGranularity(coins_dict[dir], timeMap[gran]).filter((dataPoint) => {return !Number.isNaN(dataPoint.y[0])})
        }
        coins_dict[dir] = grans
    }
    return coins_dict
}

const filterData = (coins_dict) => {
    let filtered_coins_dict = {};
    for (const dir of Object.keys(coins_dict)) {
        filtered_coins_dict[dir] = {}
        for (const gran of Object.keys(coins_dict[dir])) {
            filtered_coins_dict[dir][gran] = utils.computeMovingAverage(coins_dict[dir][gran], [15, 2], 0, 1)
        }
    }
    return filtered_coins_dict
}
// x: date, y: open, high, low, close
const readParquet = async (filePath) => {
    let reader = await parquet.ParquetReader.openFile(filePath);

    // create a new cursor
    let cursor = reader.getCursor();

    // read all records from the file and print them
    let record = null;
    var records = []
    // eslint-disable-next-line no-cond-assign
    while (record = await cursor.next()) {
        let output_record = {};
        output_record["x"] = record["timestamp"]
        output_record["y"] = [Number(record["open"]), Number(record["high"]), Number(record["low"]), Number(record["close"])]
        records.push(output_record)
    }
    return utils.sortDates(records)
}

module.exports = { readData, filterData }