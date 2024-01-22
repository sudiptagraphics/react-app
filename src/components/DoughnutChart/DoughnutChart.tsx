import React, { useEffect } from "react";
import { create } from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { PieChart, PieSeries, Legend } from "@amcharts/amcharts4/charts";

interface PortfolioChartProps {
	data: any; // Replace with actual data structure
	// options: any; // Replace with actual options structure
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
	console.log("portfolio chart", data);
	useEffect(() => {
		// Chart data and options can be customized based on your requirements
		const chart = create("chartdivPort", PieChart);
		chart.data = data;

		const series = chart.series.push(new PieSeries());
		series.dataFields.value = "price";
		series.dataFields.category = "asset";

		chart.legend = new Legend();

		// Apply amCharts theme
		chart.colors.step = 2;
		chart.fontSize = 12;

		// Apply animated theme
		am4themes_animated(chart);

		return () => {
			chart.dispose();
		};
	}, [data]);

	return (
		<div>
			<h2>Portfolio Balance</h2>
			<div
				id="chartdivPort"
				style={{ width: "100%", height: "300px" }}
			></div>
		</div>
	);
};

export default PortfolioChart;
