import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/src/theme';
import { makeStyles } from './style';

export default function Header({
  title,
  allowBackIcon = true,
  onBackPress,
  actionIcon,
  actionText,
  onActionPress = () => {},
  customStyles = {},
  customTextStyles = {},
  iconColor,
  variant = 'default',
  profileHeaderProps = {},
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const resolvedIconColor = iconColor || colors.text;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (router.canGoBack?.()) router.back();
  };

  if (variant === 'profileHeader') {
    const {
      profileImage,
      username,
      unreadNotificationCount = 0,
      onAvatarPress = () => {},
      onBellPress = () => {},
    } = profileHeaderProps;

    return (
      <View style={[styles.headerContainerProfile, customStyles]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onAvatarPress}>
            <Image
              source={typeof profileImage === 'string' ? { uri: profileImage } : profileImage}
              resizeMode="cover"
              style={styles.avatar}
            />
          </TouchableOpacity>
          {!!username && <Text style={styles.username}>Hi, {username}!</Text>}
        </View>
        <TouchableOpacity onPress={onBellPress}>
          <Ionicons name="notifications-outline" size={24} color={resolvedIconColor} />
          {unreadNotificationCount > 0 && (
            <View style={styles.noti}>
              <Text style={styles.notiText}>{unreadNotificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.headerContainer, customStyles]}>
      <View style={styles.headerLeft}>
        {allowBackIcon && (
          <TouchableOpacity onPress={handleBack} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={resolvedIconColor} />
          </TouchableOpacity>
        )}
        {!!title && (
          <Text style={[styles.headerTitle, customTextStyles]} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      {actionText ? (
        <TouchableOpacity onPress={onActionPress} hitSlop={8}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      ) : actionIcon ? (
        <TouchableOpacity onPress={onActionPress} hitSlop={8}>
          <Ionicons name={actionIcon} size={22} color={resolvedIconColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
