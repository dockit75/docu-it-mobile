import { Dimensions, PixelRatio } from 'react-native';

export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

function normalizeDimension(size, actualDimension, referenceDimension) {
    const scaledSize = (size * actualDimension) / referenceDimension;
    return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
}

export const normalize = size =>
    normalizeDimension(size, Dimensions.get('window').width, 375);

export const normalizeVertical = size =>
    normalizeDimension(size, Dimensions.get('window').height, 812);
