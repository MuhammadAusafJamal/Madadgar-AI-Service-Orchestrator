import { useVideoPlayer, VideoView } from 'expo-video';
import { SplashScreenVideoStyles } from './style'
import { StyleSheet, View } from 'react-native';
import { useEvent } from 'expo';

const SplashScreenVideo = ({ onFinish }) => {
    const player = useVideoPlayer(require('../../../assets/videos/splash.mp4'), (p) => {
        p.loop = false;
        p.play();
    });

    useEvent(player, 'playToEnd', () => {
        onFinish();
    });

    return (
        <View style={SplashScreenVideoStyles.container}>
            <VideoView
                player={player}
                style={[SplashScreenVideoStyles.video]}
                contentFit="cover"
                nativeControls={false}
                fullscreenOptions={{ enable: false }}
            />
        </View>
    );
};

export default SplashScreenVideo