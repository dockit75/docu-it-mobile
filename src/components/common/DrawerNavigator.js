import Footer from './Footer';
import Header from '../common/Header';
import Drawer from 'react-native-drawer';
import React, { Fragment, useRef,useEffect } from 'react';
import DrawerContent from '../common/DrawerContent';
import { TourGuideProvider ,TourGuideZoneByPosition,useTourGuideController} from 'rn-tourguide';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { COLORS } from '../../utilities/colors';
import { normalizeVertical } from '../../utilities/measurement';

export default function DrawerNavigator(props) {
  const {
    canStart, // <-- These are all keyed to the tourKey
    start, // <-- These are all keyed to the tourKey
    stop, // <-- These are all keyed to the tourKey
    eventEmitter, // <-- These are all keyed to the tourKey
    tourKey, // <-- Extract the tourKey
  } = useTourGuideController('dashboard')
  let drawerRef = useRef();
  // const closeControlPanel = () => {
  //     drawerRef.current.close()
  //   };
  const openControlPanel = () => {
    // console.log('open called');
    drawerRef.current.open();
  };

 
  return (
    <TourGuideProvider preventOutsideInteraction={true} verticalOffset={normalizeVertical(30)}  animationDuration={800}  wrapperStyle={{zIndex:1,}} labels={{
   // Set to an empty string to effectively "remove" the label
      previous: ' ',
      next: 'Next',
      skip: 'Skip',
      finish: 'Finish',
    }} >
    <Drawer
      ref={drawerRef}
      type="overlay"
      tapToClose={true}
      acceptTap={false}
      negotiatePan={true}
      openDrawerOffset={0.2}
      content={<DrawerContent drawerRef={drawerRef} />}>
        <Fragment>
          <Header screenName={props.screenName} leftAction={openControlPanel} />
          {props.children && props.children}
          <Footer screenName={props.screenName} navigation={props.navigation} />
      </Fragment>
    </Drawer>
    </TourGuideProvider>
  );
}
