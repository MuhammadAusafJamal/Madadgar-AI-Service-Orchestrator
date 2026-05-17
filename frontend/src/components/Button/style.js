import { Dimensions, StyleSheet } from "react-native";
import { SIZES } from "../../constants";
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    btn: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.padding,
        borderWidth: 1,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        overflow: 'hidden', // ✅ ensures gradient doesn’t overflow rounded corners
        width: width,
    },
    text: {
        fontSize: 18,
        fontFamily: 'semiBold',
        textAlign: 'center',
        color: 'rgb(255, 255, 255)',
    },
    loader: {
        color: 'rgb(255, 255, 255)',
    },

    // Gradient Varient 
    gradientRoot: {
        position: 'absolute',
        width: width,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientBtnRoot: {
        paddingHorizontal: `0 !important`,
        paddingVertical: `0 !important`,
        width: width,
        borderColor: 'transparent'
    },

    //Glassy Variant
    glassyRoot: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 15,
        paddingHorizontal: 80,
        borderRadius: 20,
        marginBottom: 16,
        alignItems: 'center',
        marginBottom: 36,
        borderColor:'transparent'
    },
    glassyBtnText: {
        color: 'rgb(255, 255, 255)',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
    },
});

export default styles;