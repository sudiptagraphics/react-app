import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import axios from "axios";
import Select from "react-select";

import DoughnutChart from "./../DoughnutChart/DoughnutChart";
import HistoricalChart from "./../HistoricalChart/HistoricalChart";
import PortfolioChart from "./../PortfolioChart/PortfolioChart";

import DatePicker from "react-datepicker"; // Import the DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import the styles for the DatePicker

import "./Dashboard.css"; // Add this line to import your CSS file

import { API_URLS } from "../../apiConfig";

interface Asset {
	id: string;
	name: string;
	type: string;
	assetClass: string;
	symbol: string;
}

const Dashboard: React.FC = () => {
	const [assets, setAssets] = useState<Asset[]>([]);
	const [assetClasses, setAssetClasses] = useState<string[]>([]);
	const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
	const [selectedAssetClasses, setSelectedAssetClasses] =
		useState<string[]>(assetClasses);
	const [priceData, setPriceData] = useState<any[]>([]); // State to hold price data

	const [historicalData, setHistoricalData] = useState<any[]>([]); // State to hold price data

	const [startDate, setStartDate] = useState<Date | null>(
		new Date("2024-01-01")
	); // State for start date
	const [endDate, setEndDate] = useState<Date | null>(new Date("2024-01-31")); // State for end date

	const [userPositionData, setUserPositionData] = useState<any[]>([]); // New state for user position data

	const [isLoading, setIsLoading] = useState(true);

	const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);

	// const dateRangePickerRef = useRef(null);

	// const openDateRangePicker = () => {
	// 	// Access the current property to get the DatePicker component instance
	// 	if (dateRangePickerRef.current) {
	// 		dateRangePickerRef.current.setOpen(true);
	// 	}
	// };

	useEffect(() => {
		const fetchAllAssets = async () => {
			try {
				const response = await axios.get<Asset[]>(API_URLS.assets);
				const data = response.data;

				setAssets(data);

				const uniqueAssetClasses = [
					...new Set<string>(data.map((asset) => asset.assetClass)),
				];
				setAssetClasses(uniqueAssetClasses);
				setSelectedAssetClasses(uniqueAssetClasses); // Set all asset classes as selected by default
			} catch (error) {
				console.error("Error fetching assets:", error);
			}
		};

		fetchAllAssets();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				let apiUrl =
					selectedAssets.length === 0 ||
						(selectedAssets.length === 1 && selectedAssets[0] === "All")
						? `${API_URLS.price}?assets=${assets
							.map((asset) => asset.symbol)
							.join(",")}`
						: `${API_URLS.price}?assets=${selectedAssets.join(
							","
						)}`;

				if (startDate && endDate) {
					// If both startDate and endDate are selected with specific assets
					apiUrl = `${apiUrl}&asOf=${endDate.toISOString()}`;
				}

				const response = await axios.get<any>(apiUrl);
				const data = response.data;
				setPriceData(data);
				setIsLoading(false);
			} catch (error) {
				console.error(
					"Error fetching prices for selected assets:",
					error
				);
			}
		};

		if (assets.length > 0) {
			fetchData();
			// fetchPriceData();
		}
	}, [assets, selectedAssets, startDate, endDate]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch historical data based on the default date range

				const apiUrl =
					selectedAssets.length === 0 ||
						(selectedAssets.length === 1 && selectedAssets[0] === "All")
						? `${API_URLS.price}?assets=${assets
							.map((asset) => asset.symbol)
							.join(
								","
							)}&from=${startDate?.toISOString()}&to=${endDate?.toISOString()}`
						: `${API_URLS.price}?assets=${selectedAssets.join(
							","
						)}&from=${startDate?.toISOString()}&to=${endDate?.toISOString()}`;

				const response = await axios.get<any>(apiUrl);
				const data = response.data;
				setHistoricalData(data);
				setIsLoading(false);
			} catch (error) {
				console.error("Error fetching historical data:", error);
			}
		};

		if (assets.length > 0) {
			fetchData();
		}
	}, [assets, selectedAssets, startDate, endDate]);

	// Use useEffect to call the userPosition API when assets are selected
	useEffect(() => {
		// Only fetch user position data when assets are selected
		if (selectedAssets.length > 0 || assets.length > 0) {
			const fetchUserPosition = async () => {
				try {
					const apiUrl =
						selectedAssets.length === 0 ||
							(selectedAssets.length === 1 &&
								selectedAssets[0] === "All")
							? `${API_URLS.userPosition}?assets=${assets
								.map((asset) => asset.symbol)
								.join(
									","
								)}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`
							: `${API_URLS.userPosition
							}?assets=${selectedAssets.join(
								","
							)}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`;

					const response = await axios.get<any>(apiUrl);
					const data = response.data;
					console.log("User Position Data:", data);

					// Store user position data in state
					setUserPositionData(data);
				} catch (error) {
					console.error("Error fetching user position data:", error);
				}
			};

			fetchUserPosition();
		}
	}, [selectedAssets, assets, startDate, endDate]);

	// Adjust handleAssetClassChange to include all selected asset classes
	const handleAssetClassChange = async (selectedOptions: any) => {
		const selectedAssetClassNames = selectedOptions.map(
			(option: any) => option.value
		);
		setSelectedAssetClasses(selectedAssetClassNames);

		// Fetch assets based on all selected asset classes
		try {
			const response = await axios.get<Asset[]>(
				`${API_URLS.assets}?assetClass=${selectedAssetClassNames.join(
					","
				)}`
			);
			const data = response.data;

			setAssets(data);

			// Reset selected asset if it's not part of the filtered assets
			if (!data.find((asset) => asset.symbol === selectedAssets[0])) {
				setSelectedAssets([]);
			}
		} catch (error) {
			console.error("Error fetching assets based on asset class:", error);
		}
	};

	const handleAssetChange = async (selectedOptions: any) => {
		const selectedAssetSymbols: string[] = selectedOptions.map(
			(option: any) => option.value
		);

		console.log(
			"selectedAssetSymbols",
			selectedAssetSymbols,
			"assets",
			assets
		);

		// Remove "All" from selected assets
		const updatedSelectedAssets = selectedAssetSymbols.filter(
			(asset: string) => asset !== "All"
		);

		// If individual assets are selected, update the selection
		setSelectedAssets(updatedSelectedAssets);

		let apiUrl = "";
		// debugger
		if (
			selectedAssetSymbols.length == 0 ||
			(selectedAssetSymbols.length == 1 &&
				selectedAssetSymbols[0] == "All")
		) {
			apiUrl = `${API_URLS.price}?assets=${assets
				.map((asset) => asset.symbol)
				.join(",")}`;
		} else {
			apiUrl = `${API_URLS.price}?assets=${selectedAssetSymbols.join(
				","
			)}`;
		}

		if (startDate && endDate) {
			// If both startDate and endDate are selected with specific assets
			apiUrl = `${apiUrl}&asOf=${endDate.toISOString()}`;
		}

		try {
			const response = await axios.get<any>(apiUrl);

			const data = response.data;
			setPriceData(data); // Update the price data state with the fetched data
			//   console.log('pricedata',priceData)
			// Handle the data as needed, for example, update the state or perform other actions
		} catch (error) {
			console.error("Error fetching prices for selected assets:", error);
		}
	};

	const handleDateRangeChange = (dates: [Date, Date]) => {
		setStartDate(dates[0]);
		setEndDate(dates[1]);

		// Call fetchPriceData with selected assets and date range
		fetchPriceData(selectedAssets, dates[0], dates[1]);
	};

	const fetchPriceData = async (
		selectedAssets: string[],
		fromDate: Date,
		toDate: Date
	) => {
		try {
			const assetQueryParam =
				selectedAssets.length === 0
					? assets.map((asset) => asset.symbol).join(",")
					: selectedAssets.join(",");

			const apiUrl = `${API_URLS.price
				}?assets=${assetQueryParam}&from=${fromDate.toISOString()}&to=${toDate.toISOString()}`;

			const response = await axios.get(apiUrl);
			const data = response.data;
			setHistoricalData(data);
			setIsLoading(false);
		} catch (error) {
			console.error(
				"Error fetching prices for selected assets and date range:",
				error
			);
		}
	};

	return (
		<div className="container">
			<h1>Financial Portfolio Dashboard</h1>

			<div className="dashboard-controls">
				{/* Date Range Selector */}
				{/* <div className="date-range-selector">
					<label htmlFor="dateRangePicker">Select Date Range:</label>
					<DatePicker
						id="dateRangePicker"
						selected={startDate}
						onChange={handleDateRangeChange}
						startDate={startDate}
						endDate={endDate}
						selectsRange
						inline
					/>
				</div> */}

				{/* Date Range Selector */}
				<div className="date-range-selector">
					<label htmlFor="dateRangePicker">Select Date Range:</label>
					<input
						id="dateRangePicker"
						value={`${startDate ? startDate.toLocaleDateString() : ""
							} - ${endDate ? endDate.toLocaleDateString() : ""}`}
						onClick={() =>
							setIsDateRangePickerOpen((prev) => !prev)
						}
						readOnly
					/>
					{isDateRangePickerOpen && (
						<DatePicker
							selected={startDate}
							onChange={handleDateRangeChange}
							startDate={startDate}
							endDate={endDate}
							selectsRange
							inline
						/>
					)}
				</div>

				<div className="dashboard-controls">
					{/* Date Range Selector */}
					<div className="date-range-selector">
						<label htmlFor="dateRangePicker">Select Date Range:</label>
						<DatePicker
							id="dateRangePicker"
							selected={startDate}
							onChange={handleDateRangeChange}
							startDate={startDate}
							endDate={endDate}
							selectsRange
							inline
						/>
					</div>

					{/* Asset Class Selector Dropdown */}
					<div className="asset-class-selector">
						<label htmlFor="assetClassSelector">
							Select Asset Classes:
						</label>
						<Select
							id="assetClassSelector"
							options={assetClasses.map((assetClass) => ({
								value: assetClass,
								label: assetClass,
							}))}
							isMulti
							value={selectedAssetClasses.map((assetClass) => ({
								value: assetClass,
								label: assetClass,
							}))}
							onChange={handleAssetClassChange}
						/>
					</div>

					{/* Asset Selector Dropdown */}
					<div className="asset-selector">
						<label htmlFor="assetSelector">Select Assets:</label>
						<Select
							id="assetSelector"
							options={[
								{ value: "All", label: "All" },
								...assets.map((asset) => ({
									value: asset.symbol,
									label: asset.name,
								})),
							]}
							isMulti
							value={
								selectedAssets.length > 0
									? selectedAssets.map((assetSymbol) => ({
										value: assetSymbol,
										label: assetSymbol,
									}))
									: [{ value: "All", label: "All" }]
							}
							onChange={handleAssetChange}
						/>
					</div>
				</div>

				{isLoading ? (
					<p>Loading...</p>
				) : (
					<div className="charts-container">
						<div className="chart">
							<DoughnutChart data={priceData} />
						</div>
						<div className="chart">
							<h1>Historical Data</h1>
							<HistoricalChart priceData={historicalData} />
						</div>
					</div>
				)}

				<PortfolioChart userPositionData={userPositionData} />
			</div>
		</div>
	);
};

export default Dashboard;
