import Footer from './Footer';
import Header from '../common/Header';
import Drawer from 'react-native-drawer';
import React, { Fragment, useRef } from 'react';
import DrawerContent from '../common/DrawerContent';

export default function DrawerNavigator(props) {
  let drawerRef = useRef();
  // const closeControlPanel = () => {
  //     drawerRef.current.close()
  //   };
  const openControlPanel = () => {
    // console.log('open called');
    drawerRef.current.open();
  };
  return (
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
  );
}
