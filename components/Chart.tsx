import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit'

interface ChartProps {
    labels: string[],
    data: number[],
    setDotValue: (value: string | undefined) => void,
    setDotIndex: (value: string | undefined) => void
    getDotIndex: () => string | undefined;
}

export default function Chart({ labels, data, setDotValue, setDotIndex, getDotIndex }: ChartProps) {


    return (
        <View style={styles.container}>

            <LineChart
                data={{
                    labels,
                    datasets: [{ data, color: (opacity = 1) => `rgba(7, 139, 227, ${opacity})` },],
                }}
                width={Dimensions.get('window').width}
                height={Dimensions.get('window').width / 2}
                withHorizontalLabels={false}
                withHorizontalLines={false}
                withVerticalLines={false}

                chartConfig={{
                    backgroundGradientFrom: '#f3faff',
                    backgroundGradientTo: '#f3faff',
                    color: (opacity = 1) => `rgba(7, 139, 227, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(62,71,86,${opacity})`,
                    propsForLabels: {
                        fontSize: 12,
                        fontWeight: 'bold',
                        fontFamily: 'sans-serif, Roboto',
                    },
                    style: {
                        borderRadius: 0,
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#078be3",

                    }
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 0,
                }}
                getDotColor={(value, index) => index.toString() === getDotIndex() ? '#078be3' : '#f3faff'}
                onDataPointClick={({ value, index }) => {
                    const indexString = index.toString()
                    setDotValue(value.toFixed(2).replace(".", ","))
                    setDotIndex(indexString)

                    if (indexString === getDotIndex()) {
                        setDotValue(undefined)
                        setDotIndex(undefined)
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 28
    },

});
