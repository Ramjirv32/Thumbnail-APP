import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withDelay 
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface SimpleBarChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
}

export const SimpleBarChart = ({ data, title, height = 200 }: SimpleBarChartProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <View style={[styles.container, { height }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 80);
            
            return (
              <BarItem
                key={item.label}
                item={item}
                barHeight={barHeight}
                index={index}
                colors={colors}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

const BarItem = ({ item, barHeight, index, colors }: any) => {
  const animatedHeight = useSharedValue(0);
  
  React.useEffect(() => {
    animatedHeight.value = withDelay(
      index * 100,
      withTiming(barHeight, { duration: 800 })
    );
  }, [barHeight, index]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));
  
  return (
    <View style={styles.barContainer}>
      <Animated.View style={[styles.bar, animatedStyle]}>
        <LinearGradient
          colors={[item.color, item.color + '80']}
          style={styles.barGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>
      
      <Text style={[styles.barValue, { color: colors.text }]}>{item.value}</Text>
      <Text style={[styles.barLabel, { color: colors.icon }]}>{item.label}</Text>
    </View>
  );
};

interface PieChartProps {
  data: ChartData[];
  size?: number;
  title?: string;
}

export const SimplePieChart = ({ data, size = 120, title }: PieChartProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2;
  const strokeWidth = 20;
  
  let cumulativePercentage = 0;
  
  return (
    <View style={styles.pieContainer}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      
      <View style={styles.pieChartContainer}>
        <View 
          style={[
            styles.pieChart, 
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              backgroundColor: colors.surface
            }
          ]}
        >
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = cumulativePercentage * 3.6; // Convert to degrees
            cumulativePercentage += percentage;
            
            return (
              <PieSlice
                key={item.label}
                percentage={percentage}
                color={item.color}
                startAngle={startAngle}
                size={size}
                index={index}
              />
            );
          })}
          
          <View style={[styles.pieCenter, { 
            width: size - strokeWidth * 2, 
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: colors.card
          }]}>
            <Text style={[styles.pieTotal, { color: colors.text }]}>{total}</Text>
            <Text style={[styles.pieTotalLabel, { color: colors.icon }]}>Total</Text>
          </View>
        </View>
        
        <View style={styles.pieLegend}>
          {data.map((item, index) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>
                {item.label}: {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const PieSlice = ({ percentage, color, startAngle, size, index }: any) => {
  const animatedRotation = useSharedValue(0);
  
  React.useEffect(() => {
    animatedRotation.value = withDelay(
      index * 150,
      withTiming(percentage * 3.6, { duration: 1000 })
    );
  }, [percentage, index]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${startAngle}deg` },
      { rotate: `${animatedRotation.value}deg` },
    ],
  }));
  
  // Simplified pie slice representation using border
  return (
    <Animated.View
      style={[
        styles.pieSlice,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 10,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '80%',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  bar: {
    width: '80%',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 4,
  },
  barGradient: {
    flex: 1,
    borderRadius: 8,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  pieContainer: {
    alignItems: 'center',
    padding: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  pieChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieSlice: {
    position: 'absolute',
    borderWidth: 0,
  },
  pieCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  pieTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  pieTotalLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  pieLegend: {
    marginTop: 16,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
});