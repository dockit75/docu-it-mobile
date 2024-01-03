export const APP_NAME = 'Dock.IT'

export const Dashboard_CARD_TEXT ={
  lifeInsurance: 'LIFE INSURANCE',
  assets: 'ASSETS',
  personalDocs: 'PERSONAL DOCS',
  autoDocument: 'AUTO DOCUMENT',
  healthInsurance: 'HEALTH INSURANCE',
  familyMgmt: 'FAMILY MGMT'
}

export const HEADER = {
  profileStatusTitle: 'Profile Ranking',
  profileStatusDescriptionText: 'Profile status calculation based on below information:',
  profileStatusDescriptionList: ['Life Insurance - 20%', 'Health Insurance - 20%', 'Asset - 20%', 'Finance Accounts - 20%', 'Referral/Invite - 20%']
}

export const LOGIN = {
  termsAndCondtion: ['I accept Dock.IT`s', ' Terms of Use', ' and', ' Privacy Policy'],
  alreadyHaveAccount: 'Already have an account?',
  signIn: ' SIGN IN',
  title: 'Registration',
  genderOptions: ['Male', 'Female', 'Other', 'Unspecified'] 
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
  update: 'Update',
  submit: 'SUBMIT',
  done: 'Done',
  start: 'Start'
}

export const FAMILY_LIST_EMPTY = {
  familyEmpty: 'No families added.',
  memberEmpty: 'No family members added.',
  contactEmpty: 'No contacts...',
  pendingEmpty: 'No recent invites'
}

export const TOUR_GUIDE = {
  cameraTour: 'Click here to scan and upload your personal documents',
  familyTour: 'Click here to add family members with whom you can share/receive documents',
  documentTour: 'Click here to view all your uploaded documents',
  notificationTour: 'Click here to see family invite request notifications',
  menuTour:'Click here to view/edit your profile and read T&C',
  tourModalTitle: 'Introducing ',
  tourModal: [
    'Your secure, shareable vault for managing and safeguarding important documents. Say goodbye to paper clutter, categorize your files, and enjoy peace of mind with encrypted protection.',
    'Say goodbye to paper clutter, categorize your files, and enjoy peace of mind with encrypted protection.',
    ' to enhance your family document collaboration.',
    `That's it! You're ready to dive into the world of `,
    'Enjoy using ',
    ' and share documents with your family! ',

  ],
  
}