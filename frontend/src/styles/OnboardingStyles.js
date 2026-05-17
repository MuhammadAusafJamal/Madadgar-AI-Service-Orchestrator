import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: COLORS.bgGreen,
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: '60%',
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'center',
        position: 'relative',
    },
    titleContainer: {
        marginVertical: 18,
        alignItems: 'center',
    },
    subTitle: {
        ...FONTS.h3,
        color: COLORS.red,
        textAlign: 'center',
        marginTop: 8,
    },
    description: {
        ...FONTS.body3,
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 16,
    },
    dotsContainer: {
        marginBottom: 20,
        marginTop: 8,
    },
    buttonContainer: {
        position: 'relative',
        borderTopLeftRadius: SIZES.radius,
        borderTopRightRadius: SIZES.radius,
        display: 'flex',
        alignItems: 'center',
    },
    nextButton: {
        width: SIZES.width - 44,
        marginBottom: 12,
        backgroundColor: COLORS.golden,
        borderColor: COLORS.golden,
        marginTop: 22,
        fontSize: 16,
        borderRadius: 20,
        fontWeight: 'bold',
        paddingVertical: 15,
        paddingHorizontal: 40,
    },
    receiptBtnText: {
        fontSize: 16,
        color: COLORS.white,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    skipButton: {
        width: SIZES.width - 44,
        marginBottom: 10,
        backgroundColor: 'transparent',
        borderColor: COLORS.golden,
        color: COLORS.golden,
        fontWeight: 'bold',
        borderRadius: 20,
        fontSize: 16,
    },
});

export default styles;
