

export function intersectionOverUnion(pts1 ,pts2 ) {
  let rect1 = getRectFromPoints(pts1);
  let rect2 = getRectFromPoints(pts2);
  return rectIntersectionOverUnion(rect1, rect2);
}

function rectIntersectionOverUnion(rect1, rect2) {
  let leftColumnMax = Math.max(rect1.left, rect2.left);
  let rightColumnMin = Math.min(rect1.right,rect2.right);
  let upRowMax = Math.max(rect1.top, rect2.top);
  let downRowMin = Math.min(rect1.bottom,rect2.bottom);

  if (leftColumnMax>=rightColumnMin || downRowMin<=upRowMax){
    return 0;
  }

  let s1 = rect1.width*rect1.height;
  let s2 = rect2.width*rect2.height;
  let sCross = (downRowMin-upRowMax)*(rightColumnMin-leftColumnMax);
  return sCross/(s1+s2-sCross);
}

function getRectFromPoints(points) {
  if (points[0]) {
    let left;
    let top;
    let right;
    let bottom;
    
    left = points[0].x;
    top = points[0].y;
    right = 0;
    bottom = 0;

    points.forEach(point => {
      left = Math.min(point.x,left);
      top = Math.min(point.y,top);
      right = Math.max(point.x,right);
      bottom = Math.max(point.y,bottom);
    });

    let r = {
      left: left,
      top: top,
      right: right,
      bottom: bottom,
      width: right - left,
      height: bottom - top
    };
    
    return r;
  }else{
    throw new Error("Invalid number of points");
  }
}

export const convertPdfUrlToBase64 = (pdfUrl) => {
  return fetch(pdfUrl)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }))
    .then(dataUrl => {
      const base64String = dataUrl.split(',')[1];
      return base64String;
    });
}

 export const processAddressBookContacts = (contactsData, userDeviceInfo) => {
  const contactsParam = []
  if (contactsData.length > 0) {
    contactsData.filter((contact, index) => {
      if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        for (let index = 0; index < contact.phoneNumbers.length; index++) {
          let phoneNumber = contact.phoneNumbers[index].number
          const name = contact.givenName
          const middleName = contact?.middleName
          const lastName = contact?.familyName
          if (phoneNumber) {
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            contactsParam.push({
              id: `${phoneNumber}_${index}`,
              name: name ,
              middleName: middleName,
              firstName: name,
              lastName: lastName,
              originalPhoneNumber: contact.phoneNumbers[index].number,
              phoneNumber: phoneNumber,
            })
          }
        }
      }
    })
  }
  return contactsParam
}
