  export const Dashboard_CARD_TEXT ={
    lifeInsurance: 'LIFE INSURANCE',
    assets: 'ASSETS',
    personalDocs: 'PERSONAL DOCS',
    autoDocument: 'AUTO DOCUMENT',
    healthInsurance: 'HEALTH INSURANCE',
    familyMgmt: 'FAMILY MGMT'
  }

  export const UPLOAD_PREVIEW = {
    
  }

  export const UPLOAD_DOCUMENT = {
    listItemAction: [
      {itemKey: 'editDocument', icon: 'square-edit-outline', path: '', label: 'Edit Document', disable: true},
      {itemKey: 'moveDocument', icon: 'file-move-outline', path: '', label: 'Move Document', disable: false},
      {itemKey: 'shareDocument', icon: 'share-circle', path: '', label: 'Share Document', disable: false},
      {itemKey: 'viewDocument', icon: 'eye-outline', path: '', label: 'View Document', disable: false},
      {itemKey: 'downloadDocument', icon: 'download', path: '', label: 'Download Document', disable: false},
      {itemKey: 'deleteDocument', icon: 'trash-can-outline', path: '', label: 'Delete Document', disable: false},
    ],
    addNewPageText: ['Tap ', ' to add new page'],
    back: 'Back',
    categoryTitle: 'Category',
    changeDocumentTitle: 'Document Name',
    pageNumberAppendText: 'Page No: ',
    documentNameError: 'Please enter the document name',
    categorySelectError: 'Please select any one category'
  }

  export const PROFILE_SCREEN = {
    fields: [
      {id: 'name', type: 'text', placeHolder: 'enter the name', itemKeyName: 'name', isEdit: true},
      {id: 'gender', type: 'text', placeHolder: 'enter the gender', itemKeyName: 'gender', isEdit: true},
      {id: 'email', type: 'text', placeHolder: 'enter the email', itemKeyName: 'email', isEdit: false},
      {id: 'phone', type: 'text', placeHolder: 'enter the phone', itemKeyName: 'phone', isEdit: false},
    ]
  }
  
  export const APP_BUTTON_NAMES = {
    next: 'Next',
    save: 'Save',
    update: 'Update'
  }

  export const FAMILY_LIST_EMPTY = {
    familyEmpty: 'No more families added.',
    memberEmpty: 'No more family members added.',
    contactEmpty: 'No Contacts...',
    pendingEmpty: 'No recent Invites'
  }