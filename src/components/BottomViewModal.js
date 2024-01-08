import React from 'react'
import { Modal, Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS } from '../utilities/colors'
import { normalize, screenHeight, screenWidth } from '../utilities/measurement'

// Modal Pop-up For Android
export default function BottomViewModal (props) {
  return (
    <Modal
      transparent={true}
      visible={props.visible}
      onRequestClose={props.cancelPress}>
      <View style={styles.modalBottomView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTextHeader}>{props.modalHeader}</Text>
          <View style={styles.horizontalLine} />
          <TouchableOpacity
            textStyle={[styles.deleteButtonText, { color: COLORS.crimsonRed }]}
            style={styles.modalDeleteBtn}
            title={props.title}
            onPress={props.onPress} >
            <Text style={[styles.deleteButtonText, { color: COLORS.crimsonRed }]}>{props.title}</Text>
        </TouchableOpacity>
          {props?.subTitle ? <>
            <View style={styles.horizontalLine} />
            <TouchableOpacity
              textStyle={[styles.deleteButtonText, { color: props.subTitleColor ? props.subTitleColor : COLORS.crimsonRed }]}
              style={styles.modalDeleteBtn}
              title={props.subTitle}
              onPress={props.onPressSecondary} >
              <Text style={[styles.deleteButtonText, { color: props.subTitleColor ? props.subTitleColor : COLORS.crimsonRed }]}>{props.subTitle}</Text>
          </TouchableOpacity>
          </> : null}
        </View>
        <View style={{ height: normalize(10) }}></View>
        <View style={styles.modalCancelView}>
            <TouchableOpacity
                style={styles.modalCancelText}
                onPress={props.cancelPress} >
                <Text style={[styles.cancelButtonText, { color: COLORS.black }]}>{props.cancelTitle}</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBottomView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignContent: "center",
    backgroundColor: COLORS.darkTransparent
  },
	modalView: {
    width: screenWidth * 0.93,
    alignSelf: "center",
    backgroundColor: COLORS.neutral100,
    borderRadius: normalize(12)
  },
	modalTextHeader: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.cloudBlack,
    textAlign: "center",
    marginVertical: 12
  },
	horizontalLine: {
    borderWidth: 0.3,
    backgroundColor: COLORS.lightBlack,
    opacity: 0.16
  },
	deleteButtonText: {
    fontWeight: '400',
    fontSize: 16
  },
	modalDeleteBtn: {
    width: screenWidth * 0.71,
    height: screenHeight * 0.04,
    marginVertical: 12,
    backgroundColor: COLORS.neutral100,
    alignSelf: "center",
    alignItems: 'center'
  },
	modalCancelView: {
    width: screenWidth * 0.93,
    height: screenHeight * 0.09,
    alignSelf: "center",
    borderRadius: normalize(12)
  },
	cancelButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: 'red'
  },
	modalCancelText: {
    width: screenWidth * 0.93,
    height: screenHeight * 0.08,
    backgroundColor: COLORS.white,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: 'center'
  }
})
