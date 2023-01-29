const sortDates = (data) => data.sort((a, b) => new Date(a.x) - new Date (b.x));

// .reduce((acc, val) => acc + val .y, 0) / data.length;

const computeGranularity = (sortedData, periodMinutes) => {
    const movingAverages = [];
  
    // if the period is greater than the length of the dataset
    // then return the average of the whole dataset
    for (let x = 0; x + periodMinutes - 1 < sortedData.length; x += periodMinutes) {
        let subList = sortedData.slice(x, x + periodMinutes)
        let tmp_array = [0, 0, 0, 0]
        for(let i = 0; i < subList.length; i++){
            let subElement = subList[i];
            for(let j = 0; j < 4; j++){
                tmp_array[j] += subElement.y[j]
            }
        }
        for(let i = 0; i < 4; i++){
            tmp_array[i] = tmp_array[i] / periodMinutes
        }
        movingAverages.push({"x": subList[0].x, "y": tmp_array})
    }
    return movingAverages;
  }


  const computeMovingAverage = (sortedData) => {
    const movingAverages_2 = [];
    const movingAverages_15 = [];
  
    // if the period is greater than the length of the dataset
    // then return the average of the whole dataset
    let tmp_array_2 = [0, 0, 0, 0]
    let subList_2 = sortedData.slice(0, 0 + 2)
    for(let i = 0; i < subList_2.length; i++){
        let subElement = subList_2[i];
        for(let j = 0; j < 4; j++){
            tmp_array_2[j] += subElement.y[j]
        }
    }
    movingAverages_2.push({"x": subList_2[0].x, "y": tmp_array_2.map((ele) => ele / 2)})

    
    let tmp_array_15 = [0, 0, 0, 0]
    let subList_15 = sortedData.slice(0, 0 + 15)
    for(let i = 0; i < subList_15.length; i++){
        let subElement = subList_15[i];
        for(let j = 0; j < 4; j++){
            tmp_array_15[j] += subElement.y[j]
        }
    }
    movingAverages_15.push({"x": subList_15[0].x, "y": tmp_array_15.map((ele) => ele / 15)})


    for (let x = 2; x < sortedData.length; x += 1) {
        for(let j = 0; j < 4; j++){
            tmp_array_2[j] -= sortedData[x - 2].y[j]
            tmp_array_2[j] += sortedData[x].y[j]
        }
        movingAverages_2.push({"x": sortedData[x].x, "y": tmp_array_2.map((ele) => ele / 2)})
    }

    for (let x = 15; x < sortedData.length; x += 1) {
        for(let j = 0; j < 4; j++){
            tmp_array_15[j] -= sortedData[x - 15].y[j]
            tmp_array_15[j] += sortedData[x].y[j]
        }
        movingAverages_15.push({"x": sortedData[x].x, "y": tmp_array_15.map((ele) => ele / 15)})
    }

    const movingAverages = [];
    for (let x = 0; x < Math.min(movingAverages_15.length, movingAverages_2.length); x += 1) {
        if (movingAverages_15[x].y[1] > movingAverages_2[x].y[1]) {
            movingAverages.push(sortedData[x])
        }
    }
    return movingAverages;
  }
module.exports = { sortDates, computeGranularity, computeMovingAverage }