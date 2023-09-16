export const VALIDATION_MESSAGES = {
    mobileRequired: 'Phone number is required!',
    mobileNotValid: 'Phone number should contain only numbers',
    mobileMinimum: 'Phone number must be atleast 10 characters',
    mobileMaximum: 'Phone number should not exceed 13 characters',
    nameRequired: 'Name is required!',
    nameNotValid: 'Name should contains only alphabets'
  }
  export const Dashboard_CARD_TEXT ={
    lifeInsurance: 'LIFE INSURANCE',
    assets: 'ASSETS',
    personalDocs: 'PERSONAL DOCS',
    autoDocument: 'AUTO DOCUMENT',
    healthInsurance: 'HEALTH INSURANCE',
    familyMgmt: 'FAMILY MGMT'
  }

  // Regular Expression
export const REGULAR_EXPRESSIONS = {
  name: /^[aA-zZ\s]+$/,
  cleanMobile: /[^0-9]/g,
  url: /(https?:\/\/[^\s]+)/g,
  pdfUrl: /(?:^|\s)(https?:\/\/[^\s]+\.(?:pdf))(?:\s|$)/i
}
export const ALERT_POPUP = {
  header: 'Oops, try again',
  message: 'Please enter a valid verification code',
}