import { ActivityIndicator } from 'react-native';

export default function ButtonLoader({
  size = 'small',
  color = 'rgba(255, 255, 255, 1)',
  style,
}) {
  return <ActivityIndicator size={size} color={color} style={style} />;
}
