import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';

import { fetchExpenses } from '@/api/requests';
import Chart from '@/components/Chart';
import DropDownModal from '@/components/DropDownModal';

interface Bill {
	id: string,
	description: string,
	amount: number,
	date: string,
	resident: number,
	shopOwner: number
}

export default function Index() {
	const [bills, setBills] = useState<Bill[]>([]);
	const [filteredBills, setFilteredBills] = useState<Bill[]>([]);

	const [years, setYears] = useState<number[]>();
	const [selectedYear, setSelectedYear] = useState<number | string>();
	const [descriptions, setDescriptions] = useState<string[]>();
	const [selectedDescription, setSelectedDescription] = useState<string | number>();
	const [chartValues, setChartValues] = useState<number[]>();
	const [chartLabels, setChartLabels] = useState<string[]>();
	const [dotValue, setDotValue] = useState<string>();
	const [dotIndex, setDotIndex] = useState<string>();



	const monthNames = [
		"Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
		"Jul", "Ago", "Set", "Out", "Nov", "Dez"
	];


	useEffect(() => {
		async function fetchMyApi() {
			const expenses = await fetchExpenses();

			setBills(prevBills => JSON.stringify(prevBills) !== JSON.stringify(expenses) ? expenses : prevBills);

			const allYears: number[] = Array.from(new Set(expenses.map((bill: Bill) => new Date(bill.date).getFullYear())));
			setYears(allYears);

			const allDescriptions: string[] = Array.from(new Set(expenses.map((bill: Bill) => bill.description)));
			setDescriptions(allDescriptions);

			// Selecionar o ano mais recente corretamente
			if (allYears.length > 0) {
				setSelectedYear(Math.max(...allYears));
			}
		}
		fetchMyApi();
	}, []); // 🔥 Executa apenas na montagem do componente

	useEffect(() => {
		if (bills.length === 0 || selectedYear === undefined) return;

		const groupedExpensesByMonth = bills.reduce((acc, expense) => {
			const date = new Date(expense.date);
			const monthIndex = date.getMonth();
			const year = date.getFullYear();

			const matchesYear = year === selectedYear;
			const matchesDescription = selectedDescription === undefined || expense.description.toLowerCase().includes(selectedDescription.toString().toLowerCase());

			if (matchesYear && matchesDescription) {
				acc[monthIndex] = (acc[monthIndex] || 0) + expense.amount;
			}

			return acc;
		}, {} as Record<number, number>);

		const labels = Object.keys(groupedExpensesByMonth)
			.map((monthIndex) => monthNames[Number(monthIndex)]);

		const data = Object.keys(groupedExpensesByMonth)
			.map((monthIndex) => groupedExpensesByMonth[Number(monthIndex)]);

		setChartLabels(labels);
		setChartValues(data);
	}, [bills, selectedYear, selectedDescription]);  // 🔥 Só executa quando `bills` ou `selectedYear` mudam

	useEffect(() => {
		if (!bills.length || selectedYear === undefined) {
			setFilteredBills([]);
			return;
		}

		const newFilteredBills = bills.filter((bill) => {
			const billDate = new Date(bill.date);
			const billMonth = billDate.getMonth();
			const billYear = billDate.getFullYear();

			const matchesYear = billYear === selectedYear;
			const matchesMonth = dotIndex === undefined || billMonth === Number(dotIndex);
			const matchesDescription = selectedDescription === undefined || bill.description.toLowerCase().includes(selectedDescription.toString().toLowerCase());

			return matchesYear && matchesMonth && matchesDescription;
		});


		setFilteredBills(newFilteredBills);
	}, [bills, selectedYear, dotIndex, selectedDescription]);

	const returnDotIndex = () => dotIndex;
	const returnDotValue = () => dotValue;
	const returnSelectedDescription = () => selectedDescription;
	const returnSelectedYear = () => selectedYear;

	return (
		<GestureHandlerRootView style={styles.screen}>

			{years && selectedYear && <DropDownModal options={years} getSelectedOption={returnSelectedYear} setSelectedOption={setSelectedYear} resetState={[setDotValue, setDotIndex, setSelectedDescription]} />}

			{chartLabels && chartValues && <Chart labels={chartLabels} data={chartValues} setDotValue={setDotValue} setDotIndex={setDotIndex} getDotIndex={returnDotIndex} />}
			<View style={styles.amountContainer}>
				{returnDotValue() && <Text style={styles.value}>R$ {dotValue}</Text>}
			</View>

			{descriptions && <DropDownModal options={descriptions} getSelectedOption={returnSelectedDescription} setSelectedOption={setSelectedDescription} resetState={[setDotIndex, setDotValue]} isOptionalFilter={true} />}


			{bills.length > 0 &&
				<View style={styles.container}>
					<ScrollView>
						{filteredBills.map(bill =>
							<View style={styles.billContainer} key={bill.id}>
								<Text style={styles.bill}>{bill.description}</Text>
								<Text style={styles.bill}>R$ {bill.amount.toFixed(2).replace('.', ',')}</Text>
							</View>
						)}
					</ScrollView>
				</View>}
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#f3faff',
		alignItems: 'center'
	},
	container: {
		width: '80%',
		alignContent: 'center',
		justifyContent: 'center',
		borderTopWidth: 2,
		borderColor: '#3e4756',
		flex: 1,
	},
	bill: {
		color: '#3e4756',
		fontSize: 16,
	},
	billContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 8,
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderColor: '#3e4756'
	},
	value: {
		color: '#3e4756',
		fontSize: 16,
		fontWeight: 'bold',
		fontFamily: 'sans-serif, Roboto'
	},
	amountContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: 30,
		padding: 8,
		borderRadius: 8,
		marginTop: 8
	}
});
