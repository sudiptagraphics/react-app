import React, { useState, useEffect } from "react";
import "./UserPortfolio.css"; // Import your CSS file

interface UserPosition {
	Asset: string;
	Quantity: number;
	Price: number;
}

interface UserPortfolioProps {
	userPositionData: UserPosition[];
}

const UserPortfolio: React.FC<UserPortfolioProps> = ({ userPositionData }) => {
	// Use the userPositionData prop instead of the local state
	// Note: You may want to ensure that userPositionData is not undefined or null

	// Calculate the total value of the user's portfolio
	const calculatePortfolioValue = (): number => {
		return userPositionData.reduce((total, position) => {
			return total + position.Quantity * position.Price;
		}, 0);
	};

	return (
		<div>
			<div>
				<h2>Portfolio Summary</h2>
				<p>
					Total Portfolio Value: $
					{calculatePortfolioValue().toFixed(2)}
				</p>
			</div>

			<div>
				<h2>User Positions</h2>
				<table>
					<thead>
						<tr>
							<th>Asset</th>
							<th>Quantity</th>
							<th>Price</th>
							<th>Value</th>
						</tr>
					</thead>
					<tbody>
						{userPositionData.map((position, index) => (
							<tr key={index}>
								<td>{position.Asset}</td>
								<td>{position.Quantity}</td>
								<td>${position.Price.toFixed(2)}</td>
								<td>
									$
									{(
										position.Quantity * position.Price
									).toFixed(2)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default UserPortfolio;
