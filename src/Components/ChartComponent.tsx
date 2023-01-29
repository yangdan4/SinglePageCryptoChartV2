
import React, {useState, useEffect, useRef} from 'react';

import { ItemRenderer, ItemPredicate,Select2 } from "@blueprintjs/select";
import { MenuItem2 } from "@blueprintjs/popover2";
import { Button, Spinner, Switch } from "@blueprintjs/core";
import Chart from "react-apexcharts";
import "./style.css"

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";

const renderItem: ItemRenderer<String> = (str, { handleClick, handleFocus, modifiers }) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem2
            text={str}
            roleStructure="listoption"
            active={modifiers.active}
            onClick={handleClick}
            onFocus={handleFocus}
        />
    );
};

const filterItem: ItemPredicate<String> = (query, str) => {
    return str.toLowerCase().indexOf(query.toLowerCase()) >= 0;
};

export function ChartComponent() {
	const spotRates = useRef({});
	const spotRatesFiltered = useRef({});
	const spotTypes = useRef([]);
	const [selectedSpotType, setSelectedSpotType] = useState("");
	const [isLoaded, setIsLoaded] = useState(false);
	const [filtered, setFiltered] = useState(false);

	const [dataPoints, setDataPoints] = useState([]);

	const [selectedGranularity, setSelectedGranularity] = useState("");

	const options = {
		  chart: {
			type: 'candlestick',
			height: 350,
			zoom: {
				enabled: true,
				type: 'xy',  
				autoScaleYaxis: false,  
				zoomedArea: {
				  fill: {
					color: '#90CAF9',
					opacity: 0.4
				  },
				  stroke: {
					color: '#0D47A1',
					opacity: 0.4,
					width: 1
				  }
				}
			}
		  },
		  title: {
			text: selectedSpotType,
			align: 'left'
		  },
		  xaxis: {
			type: 'datetime'
		  },
		  yaxis: {
			tooltip: {
			  enabled: true
			}
		  }
		};



	  const getRateTypes = async () => {
		const response = await fetch("http://localhost:8000/spot_rate_types")
		const json = await response.json()
		spotTypes.current = json["spot_rate_types"]
	  }


	  const getRates = async () => {
		  let i=0;
		  for(i;i< spotTypes.current.length;i++){
			  const response = await fetch(`http://localhost:8000/spot_rate?spot_rate=${spotTypes.current[i]}`)
			  const json = await response.json()
			  spotRates.current[spotTypes.current[i]] = json;
		  }
	  }


	  const getRatesFiltered = async () => {
		  let i=0;
		  for(i;i< spotTypes.current.length;i++){
			  const response = await fetch(`http://localhost:8000/spot_rate_filtered?spot_rate_filtered=${spotTypes.current[i]}`)
			  const json = await response.json()
			  spotRatesFiltered.current[spotTypes.current[i]] = json;
		  }
	  }
	useEffect(() => {
		getRates()
			.then(() => getRateTypes())
			.then(() => getRates())
			.then(() => getRatesFiltered())
			.finally(() => setIsLoaded(true))
	}, []);
	useEffect(() => {
		isLoaded && selectedSpotType !== "" && setDataPoints(!filtered ? spotRates.current[selectedSpotType][selectedGranularity]
			: spotRatesFiltered.current[selectedSpotType][selectedGranularity])
	}, [selectedSpotType, selectedGranularity, filtered]);
	return (
		<div className="charts-area">
			<h1>{!isLoaded ?? <Spinner/>}</h1>
			<div className="charts-dropdowns">
				<Select2
					className="charts-dropdown"
					items={["By Day", "By Week", "By Month"]}
					onItemSelect = {(granularity) => setSelectedGranularity(granularity)}
					itemRenderer={renderItem}
					itemPredicate={filterItem}>
					<Button className = "charts-button" 
						disabled={false}>{selectedGranularity === "" ? "Select a Granularity" : selectedGranularity}</Button>
				</Select2>
				<Select2
					className="charts-dropdown"
					items={spotTypes.current}
					onItemSelect = {(spotType) => setSelectedSpotType(spotType)}
					itemRenderer={renderItem}
					itemPredicate={filterItem}>
					<Button className = "charts-button" 
						disabled={false}>{selectedSpotType === "" ? "Select a Coin" : selectedSpotType}</Button>
				</Select2>
				<Switch className = "new-switch" 
					disabled={false}
					onChange= {() => {
						setFiltered(!filtered)
					}}>Filtered</Switch>
			</div>
			{selectedSpotType !== "" && selectedGranularity !== "" && <Chart options={options} series={[{
              "data": dataPoints}]} type="candlestick" height={350} />}
		</div>
		
	)
}
