import React from 'react'
import { View } from 'react-native'
import { Skeleton } from '@rneui/themed';
import { Card } from 'react-native-paper';
import { COLORS } from '../../utilities/colors'
import { normalize, screenWidth } from '../../utilities/measurement'

export const CategoryItemLoader = (props) => (
  <View style={{ height: normalize(80), width: screenWidth * 0.42, margin: 15, borderRadius: 15, backgroundColor: COLORS.grayLight, justifyContent: 'center', alignItems: 'center' }}>
    <Skeleton animation={'wave'} style={{ borderRadius: 10 }} width={60} height={60} />
    <Skeleton animation={'wave'} style={{ width: '75%', marginVertical: 10 }} height={12} />
  </View>
)
