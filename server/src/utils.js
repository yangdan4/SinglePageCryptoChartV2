const sortDates = (data) => data.sort((a, b) => new Date(a.x) - new Date (b.x));

const computeByGranularity = (sortedData, periodMinutes) => {
    const movingAverages = [];
    for (let x = 0; x + periodMinutes - 1 < sortedData.length; x += periodMinutes) {
        let subList = sortedData.slice(x, x + periodMinutes)
        let prices = [0, 0, 0, 0]
        for(let i = 0; i < subList.length; i++){
            let subElement = subList[i];
            for(let j = 0; j < 4; j++){
                prices[j] += subElement.y[j]
            }
        }
        for(let i = 0; i < 4; i++){
            prices[i] = prices[i] / periodMinutes
        }
        movingAverages.push({"x": subList[0].x, "y": prices})
    }
    return movingAverages;
  }


  const computeMovingAverage = (sortedData, windows, winning_ind, determine_ind) => {
    const movingAveragesList = windows.map((window) => {
        const movingAverages = [];
        let prices = [0, 0, 0, 0]
        let subList = sortedData.slice(0, window)
        for(let i = 0; i < subList.length; i++){
            let subElement = subList[i];
            for(let j = 0; j < 4; j++){
                prices[j] += subElement.y[j]
            }
        }
        movingAverages.push({"x": subList[0].x, "y": prices.map((ele) => ele / window)})


        for (let x = window; x < sortedData.length; x += 1) {
            for(let j = 0; j < 4; j++){
                prices[j] -= sortedData[x - window].y[j]
                prices[j] += sortedData[x].y[j]
            }
            movingAverages.push({"x": sortedData[x].x, "y": prices.map((ele) => ele / window)})
        }
        return movingAverages;
    })

    const filteredMovingAverages = [];
    for (let x = 0; x < Math.min(...(movingAveragesList.map((movingAverages) => movingAverages.length))); x += 1) {
        if (movingAveragesList[winning_ind][x].y[determine_ind] === Math.min(...(movingAveragesList.map((movingAverages) => movingAverages[x].y[determine_ind])))) {
            filteredMovingAverages.push(sortedData[x])
        }
    }
    return filteredMovingAverages;
  }
module.exports = { sortDates, computeByGranularity, computeMovingAverage }