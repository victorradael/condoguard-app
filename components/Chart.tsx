import { Dimensions } from 'react-native';
import { LineChart, } from 'react-native-chart-kit'

interface OnDataPointClickProps {
    value: number
}
interface ChartProps {
    labels: string[],
    data: number[],
    onDataPointClick: ({ value }: OnDataPointClickProps) => void
}

export default function Chart({ labels, data, onDataPointClick }: ChartProps) {
    return (
        <LineChart
            data={{
                labels,
                datasets: [{ data }]
            }}
            width={Dimensions.get("window").width}
            height={Dimensions.get('window').width / 2}
            withHorizontalLabels={false}
            withHorizontalLines={false}
            withVerticalLines={false}

            chartConfig={{
                backgroundGradientFrom: '#25292e',
                backgroundGradientTo: '#25292e',
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                    borderRadius: 0,
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#f1f1f1",

                }
            }}
            bezier
            style={{
                marginVertical: 8,
                borderRadius: 0,

            }}
            onDataPointClick={onDataPointClick}
        />
    );
}
