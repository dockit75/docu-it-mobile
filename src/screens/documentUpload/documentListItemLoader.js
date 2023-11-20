import React from 'react'
import { View } from 'react-native'
import { Skeleton } from '@rneui/themed';
import { Card } from 'react-native-paper';
import { COLORS } from '../../utilities/colors'
import { normalize, screenWidth } from '../../utilities/measurement'

export const DocumentListItemLoader = (props) => (
  <View style={{ height: normalize(200), width: screenWidth * 0.42, margin: 15, borderRadius: 5, backgroundColor: 'lightgray', justifyContent: 'space-between' }}>
    <View style={{ height: normalize(160), backgroundColor: COLORS.white, padding: 10, borderRadius: 5 }}>
        <Skeleton animation={'wave'} skeletonStyle={{ width: '100%', height: '100%' }} height={normalize(140)} />
    </View>
    <View style={{ padding: 10, justifyContent: 'center', zIndex: 1, elevation: 5, height: normalize(30) }}>
        <Skeleton animation={'wave'} style={{ width: '75%', marginBottom: 8 }} height={normalize(12)} />
    </View>
  </View>
)
