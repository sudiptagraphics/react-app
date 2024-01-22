// HistoricalChart.tsx

import React, { useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

interface HistoricalChartProps {
	priceData: any[];
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ priceData }) => {
	useEffect(() => {
		// Apply the animated theme
		am4core.useTheme(am4themes_animated);

		// Sort the priceData in ascending order based on the "date" property
		const sortedData = priceData
			.slice()
			.sort(
				(a, b) => (new Date(a.date) as any) - (new Date(b.date) as any)
			);

		console.log("sortedData", sortedData);

		// Create chart instance
		const chart = am4core.create("historicalChart", am4charts.XYChart);

		// Add data
		chart.data = sortedData;

		// Create category axis
		const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = "date";
		categoryAxis.renderer.grid.template.location = 0;

		// Create value axis
		const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

		// Create series dynamically based on unique assets
		const uniqueAssets = [...new Set(sortedData.map((item) => item.asset))];

		console.log("uniqueAssets", uniqueAssets);

		uniqueAssets.forEach((asset) => {
			const series = chart.series.push(new am4charts.LineSeries());
			series.dataFields.valueY = "price";
			series.dataFields.categoryX = "date";
			series.name = asset;

			// Filter data for the current asset
			const assetData = sortedData.filter((item) => item.asset === asset);
			series.data = assetData;

			// Add bullets if needed
			const bullet = series.bullets.push(new am4charts.CircleBullet());
			bullet.circle.stroke = am4core.color("#fff");
			bullet.circle.strokeWidth = 2;
		});

		// Add legend
		chart.legend = new am4charts.Legend();

		// Clean up when the component is unmounted
		return () => {
			chart.dispose();
		};
	}, [priceData]);

	return (
		<div id="historicalChart" style={{ width: "100%", height: "500px" }} />
	);
};

export default HistoricalChart;
