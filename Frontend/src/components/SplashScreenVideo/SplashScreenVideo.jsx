import { useEffect } from 'react';
import { View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

import { styles } from './SplashScreenVideo.styles';

export default function SplashScreenVideo({ source, onFinish, muted = false }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = muted;
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      onFinish?.();
    });
    return () => sub.remove();
  }, [player, onFinish]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
      />
    </View>
  );
}
