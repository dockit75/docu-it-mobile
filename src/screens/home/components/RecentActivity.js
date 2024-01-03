import React, { cloneElement, Fragment, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList
} from 'react-native';
import { normalize, normalizeVertical, screenHeight, screenWidth } from '../../../utilities/measurement';
import { COLORS } from '../../../utilities/colors';
import { Images } from '../../../assets/images/images';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { retrieveUserDetail } from '../../../storageManager';
import NetworkManager from '../../../services/NetworkManager';
import moment from 'moment';
import Pdf from 'react-native-pdf';
import { useDispatch } from 'react-redux';

const RecentActivity = ({ }) => {
  const [activityData, setactivityData] = useState([]);


  useEffect(() => {
    console.log('useEffect called')
      fetchRecentActivity();
      
  }, []);

  const fetchRecentActivity = async () => {
    console.log('fetchRecentActivity called')
    let userDetails = await retrieveUserDetail();
    try {
      const res = await NetworkManager.getUserLastDocumentActivity(userDetails.id);
      console.log('response',res)
      if (res.data?.status === 'SUCCESS' && res.data?.code === 200) {
        setactivityData(res.data.response);
      }
    } catch (error) {
      console.error('Error fetching unique id:', error.response, userDetails.id);
    }
  }

  const bytesToSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

 
  const renderItems = ({ item }) => (
    <View
      style={styles.recentActivity}>
      <View style={{ margin: 5, flex: 0.25, height: 68, width: 80, marginRight: 0 }}>
        {item.documentType === 'application/pdf' ?
          <Pdf
            page={1}
            source={{ uri: decodeURIComponent(item?.url) }}
            onLoadComplete={(numberOfPages, filePath) => {
              // console.log(`Number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              // console.log(`Current page: ${page}`);
            }}
            onError={(error) => {
              // console.log(error);
            }}
            onPressLink={(uri) => {
              // console.log(`Link pressed: ${uri}`);
            }}
            singlePage
            trustAllCerts={false}
            style={{ width: '100%', height: '100%' }}
          />
          :
          <Image resizeMode={'center'} source={{ uri: item.url }} style={{ height: '90%', width: '100%' }} />
        }
      </View>
      <View style={{ flex: 0.75, paddingLeft: 5 }}>
        <Text numberOfLines={2} style={{ color: 'black', fontSize: 16, paddingRight: 10, fontWeight: '500' }}>{item.documentName}</Text>
        <Text style={{ color: COLORS.coolText, paddingRight: 10, marginTop: 7, fontSize: 12 }}>{moment(item.updatedAt).format('MMM Do YYYY, h:mm:ss a')}</Text>
        <Text style={{ color: COLORS.coolText, paddingRight: 10, fontSize: 12 }}>{'Size: ' + bytesToSize(item.documentSize)}</Text>
      </View>
    </View>
  )

 

  return (
    <SafeAreaView style={{flex:1,width:'90%'}} >
        <View>
      <FlatList
        style={{ backgroundColor: 'rgb(240, 240, 240)', marginBottom: 10, borderRadius: 10,}}
        data={activityData}
        contentContainerStyle={!activityData.length ? { justifyContent: 'center', alignItems: 'center', height: '100%' } : {}}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'black', fontSize: 20 }}>No recent activity.</Text>
          </View>)
        }
        ListHeaderComponent={() => (activityData?.length ? <View style={{ marginBottom: 10, justifyContent: 'center' }}>
          <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', marginHorizontal: 10, padding: 5 }}>Recent Activity</Text>
        </View> : null)
        }
        ItemSeparatorComponent={<View style={{ height: 10 }} />}
        renderItem={renderItems}
      />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  
  recentActivity: {
    borderColor:COLORS.avatarBackground,
    borderWidth: 1,
    flexDirection: 'row',
    margin: 5,
    maxHeight: normalizeVertical(100),
    marginHorizontal: 15,
    borderRadius: 4,
    paddingTop: 3
  },
});

export default RecentActivity
