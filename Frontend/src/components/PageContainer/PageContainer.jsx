import { KeyboardAvoidingView, Platform } from 'react-native';

import { styles } from './PageContainer.styles';

export default function PageContainer({ children }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      {children}
    </KeyboardAvoidingView>
  );
}
