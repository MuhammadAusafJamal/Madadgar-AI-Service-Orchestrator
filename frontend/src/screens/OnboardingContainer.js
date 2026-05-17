import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';

import PageContainer from '../components/PageContainer';
import DotsView from '../components/DotsView';
import Button from '../components/Button';
import styles from '../styles/OnboardingStyles';
import { COLORS } from '../constants';

const onboardingData = [
    {
        subTitle: 'Choose Your Role',
        description:
            'Select whether you want to sign up as a Creator or a Brand to tailor the platform to your needs.',
    },
    {
        subTitle: 'Build Your Profile',
        description:
            'Fill out your profile with essential details. Creators can highlight their expertise by adding social media links, while brands can share their objectives and attract perfect partners.',
    },
    {
        subTitle: 'Explore Opportunities',
        description:
            'Dive into VIPLISTA’s exclusive features. Creators can browse high-end brand events, while brands can create and manage events designed to connect with influential creators.',
    },
    {
        subTitle: 'Start Collaborating',
        description:
            'Once set up, take the next step by joining events, building partnerships, and redefining your journey in luxury marketing through meaningful connections.',
    },
];

const OnboardingContainer = ({ onFinish }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const skipRef = useRef(false);

    // Expo 54: useVideoPlayer + VideoView replaces expo-av's <Video>.
    const player = useVideoPlayer(
        require('../../assets/videos/onboarding.mp4'),
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
        <SafeAreaView style={[styles.container]}>
            <PageContainer>
                <VideoView
                    player={player}
                    style={styles.backgroundVideo}
                    contentFit="cover"
                    nativeControls={false}
                    fullscreenOptions={{ enable: false }}
                />
                <View style={styles.contentContainer}>
                    <View style={[styles.buttonContainer]}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.subTitle}>
                                {onboardingData[activeIndex].subTitle}
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.description,
                                { color: COLORS.white },
                            ]}
                        >
                            {onboardingData[activeIndex].description}
                        </Text>

                        <View style={styles.dotsContainer}>
                            <DotsView
                                activeIndex={activeIndex}
                                numDots={onboardingData.length}
                            />
                        </View>

                        <LinearGradient
                            colors={['#e4b722', '#f3da87']}
                            start={{ x: 0.5, y: 0.5 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.nextButton}
                        >
                            <TouchableOpacity onPress={handleNext}>
                                <Text style={styles.receiptBtnText}>Next</Text>
                            </TouchableOpacity>
                        </LinearGradient>

                        <Button
                            title="Skip"
                            onPress={handleSkip}
                            style={styles.skipButton}
                        />
                    </View>
                </View>
            </PageContainer>
        </SafeAreaView>
    );
};

export default OnboardingContainer;
