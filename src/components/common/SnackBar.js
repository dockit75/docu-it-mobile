import React from 'react';
import { StyleSheet, Text } from 'react-native'
import { Snackbar } from 'react-native-paper';
import { COLORS } from '../../utilities/colors';
import { normalize } from '../../utilities/measurement';
const CustomSnackBar = ({ status, setStatus, message, styles, duration, textStyle = {}, roundness = 100 }) => {

    return (
        <Snackbar
            elevation={5}
            style={styles || commonStyle.snackBar}
            visible={status || false}
            onDismiss={() => {
                setStatus(false)
            }}
            theme={{ roundness }}
            duration={ duration || 500}
        >
            <Text style={[{ fontFamily: 'System', textAlign: 'center', color: COLORS.dodgerBlue, fontSize: normalize(12) }, textStyle]}> {message} </Text>
        </Snackbar>
    )
}

const commonStyle = StyleSheet.create({
    snackBar: {
        width: normalize(200),
        alignSelf: 'center',
        bottom: normalize(55),
        opacity: 0.85,
        alignContent: 'center',
        backgroundColor: 'white',
        zIndex: 1
    },
})

export default CustomSnackBar