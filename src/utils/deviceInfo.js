import { useWindowDimensions } from 'react-native';

export const useCheckDeviceSize = () => {
  const { width } = useWindowDimensions();
  // Schwellenwert: 1024 Pixel entsprechen in der Regel der Landscape-Breite eines 10-Zoll-Tablets
  const isLargeEnough = width >= 1024;
  return isLargeEnough;
};