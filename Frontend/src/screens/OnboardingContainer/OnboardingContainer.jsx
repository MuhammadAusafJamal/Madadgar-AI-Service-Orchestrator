import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DecisionImage from '@/assets/images/OnboardingScreen/decision.png';
import HandshakeImage from '@/assets/images/OnboardingScreen/handshake.png';
import GlobeImage from '@/assets/images/OnboardingScreen/map.png';
import Verified from '@/assets/images/OnboardingScreen/user-person.png';
import Button from '@/src/components/Button';
import DotsView from '@/src/components/DotsView';
import PageContainer from '@/src/components/PageContainer';
import { PALETTE } from '@/src/theme';
import { styles } from './OnboardingContainer.styles';

const onboardingData = [
  {
    image: DecisionImage,
    subTitle: 'AI Service Orchestrator',
    description:
      'Describe what you need — plumber, AC repair, electrician — in Urdu, Roman Urdu, or English.',
  },
  {
    image: Verified,
    subTitle: 'Smart Provider Matching',
    description:
      'Our 8-agent pipeline finds the best local provider based on your location, ratings, and availability.',
  },
  {
    image: GlobeImage,
    subTitle: 'Autonomous Booking',
    description:
      'Confirm the match and we handle the booking, notifications, and follow-up automatically.',
  },
  {
    image: HandshakeImage,
    subTitle: 'You’re in Control',
    description:
      'Track bookings, save favourites, and chat with providers — all from one place.',
  },
];

export default function OnboardingContainer({ onFinish }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const skipRef = useRef(false);

  const player = useVideoPlayer(
    require('@/assets/videos/onboarding.mp4'),
    (p) => {
      p.loop = true;
      p.muted = true;
      p.play();
    }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (skipRef.current) return;
      if (activeIndex < onboardingData.length - 1) {
        setActiveIndex((prev) => prev + 1);
      } else {
        onFinish?.();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [activeIndex, onFinish]);

  const handleNext = () => {
    if (activeIndex < onboardingData.length - 1) {
      setActiveIndex((prev) => prev + 1);
    } else {
      onFinish?.();
    }
  };

  const handleSkip = () => {
    skipRef.current = true;
    onFinish?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageContainer>
        <VideoView
          player={player}
          style={styles.backgroundVideo}
          contentFit="cover"
          nativeControls={false}
          fullscreenOptions={{ enable: false }}
          allowsPictureInPicture={false}
        />
        <View style={styles.contentContainer}>
          <Image
            source={onboardingData[activeIndex].image}
            resizeMode="cover"
            style={styles.icon}
          />
          <View style={styles.buttonContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.subTitle}>
                {onboardingData[activeIndex].subTitle}
              </Text>
            </View>

            <Text style={[styles.description, { color: PALETTE.white }]}>
              {onboardingData[activeIndex].description}
            </Text>

            <View style={styles.dotsContainer}>
              <DotsView
                activeIndex={activeIndex}
                numDots={onboardingData.length}
              />
            </View>

            <Button
              title="Next"
              variant="gradient"
              onPress={handleNext}
              style={styles.nextButton}
              textStyle={styles.nextButtonText}
            />

            <Button
              title="Skip"
              variant="glassy"
              onPress={handleSkip}
              style={styles.skipButton}
            />
          </View>
        </View>
      </PageContainer>
    </SafeAreaView>
  );
}
