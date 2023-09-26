import * as Sentry from '@sentry/react-native'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { isJwtExpired } from 'jwt-check-expiration'
import jwtDecode from 'jwt-decode'
import { clearDBTables } from '../db/deleteDb'
// import { store } from '../store/store'
// import { getUserDeviceInfo, getUserSession, removeAll, setEnableVisibleContact, setUserSession } from '../utilities/storageManager'
// import { ALERT_CANCEL_BUTTON_NAMES, ALERT_HEADER, ALERT_OK_BUTTON_NAMES } from '../utilities/strings'
// import { IS_IOS, showAlert } from '../utilities/utils'
import { BASE_API_CORE_URL } from './config'
import { retrieveUserDetail, retrieveUserSession } from '../storageManager'

// export const IS_IOS = Platform.OS === 'ios';

const axiosHeaders = (isFormData) => {
    const headers = {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        // 'Accept-Encoding': IS_IOS ? 'br' : null,
    };
    const headersInfo = { headers: { ...headers } };
    return headersInfo;
};


const axiosError = error => {
    // if (error.response.status !== 409 && error.response.status !== 403 && error.response.status !== 401 && error.response.status !== 400 && error.message !== 'Network Error') {
        // Sentry.captureException(error)
        // showAlert({
        //     cancelButtonName: ALERT_CANCEL_BUTTON_NAMES.cancel,
        //     header: ALERT_HEADER,
        //     message: error.message,
        //     okButtonName: ALERT_OK_BUTTON_NAMES.ok,
        //     cancelable: false
        // })
    // }

    console.warn(`AXIOS ERROR [${JSON.stringify(error)}]`)
    return Promise.reject(error)
}

/// Core API - No Auth
const axiosNoAuthCoreInstance = axios.create({ baseURL: BASE_API_CORE_URL })
axiosNoAuthCoreInstance.interceptors.request.use(config => {
    console.log('Url Request', config.url, config.method)
    return config
})
axiosNoAuthCoreInstance.interceptors.response.use(response => response, error => axiosError(error))

// Core API
// const axiosCoreInstance = axios.create({ baseURL: BASE_API_CORE_URL, headers: {  Authorization: `Bearer ${token}`} })
const axiosCoreInstance = axios.create({ baseURL: BASE_API_CORE_URL })
axiosRetry(axiosCoreInstance, { retries: 1, retryDelay: axiosRetry.exponentialDelay })
axiosCoreInstance.interceptors.request.use(config => axiosRequest(config))
axiosCoreInstance.interceptors.response.use(response => response, error => axiosError(error))

const axiosRequest = async request => {
    console.log('Url Request', request.url, request.method)
    let userData = await retrieveUserDetail()
    if (userData.token) {
        const decodedToken = jwtDecode((userData.token), { complete: true })
        const tokenExpiry = (decodedToken.exp * 1000 - 60 * 1000) // ( 1203243423400 )
        if ((tokenExpiry < new Date().getTime()) || isJwtExpired(userData.token)) {
            await refreshTokenPerform(request)
            userData = await retrieveUserDetail();
        }
        if (userData?.token) {
            request.headers.Authorization = `Bearer ${userData?.token}`
        }
    }
    console.log(request.headers,'request')
    return request
}
const refreshTokenPerform = async () => {
    console.log('token expire check');
    const userData = await retrieveUserDetail();
    const payload = {
        email: userData.email
    }
    const { data } = await NetworkManager.generateToken(payload)
    storeUserDetail({ ...userData, token: data.token })
    return
}

const requests = {
    post: (path, params, isFormData) => axiosNoAuthCoreInstance.post(path, params, axiosHeaders(isFormData)),
    put: (path, params, isFormData) => axiosNoAuthCoreInstance.put(path, params, axiosHeaders(isFormData)),
    get: (path, isFormData) => axiosNoAuthCoreInstance.get(path, axiosHeaders(isFormData)),

    getTokenize: async (path, isFormData) => { return await axiosCoreInstance.get(path, axiosHeaders(isFormData)) },
    postTokenize: async (path, params, isFormData) => { return await axiosCoreInstance.post(path, params, axiosHeaders(isFormData)) },
    putTokenize: async (path, params, isFormData) => { return await axiosCoreInstance.put(path, params, axiosHeaders(isFormData)) },
    deleteTokenize: async (path, params, isFormData) => { return await axiosCoreInstance.delete(path, { data: params, headers: axiosHeaders(isFormData).headers }) },


};

const path = {
    signUp: 'auth/signUp',
    verifyEmail: 'auth/verifyEmail',
    pinGeneration: 'auth/pinGeneration',
    verifyMobileOtp: 'auth/verifyMobileOtp',
    login: 'auth/login',
    emailResendOtp: 'auth/resendCode',
    forgotPin: 'auth/forgotPin',
    verifyPin: 'auth/verifyPin',
    changePin: 'auth/changePin',
    uploadDocument: 'document/uploadDocument',
    generateToken: 'auth/generateToken',
    listCategories: 'category/listCategories,'
}


const NetworkManager = {

    signUp: async (params) => {
        return await requests.post(path.signUp, params, false)
    },
    verifyEmail: async (params, verificationMethod) => {
        const verifyOTPPath = verificationMethod === 'email' ? path.verifyEmail : path.verifyMobileOtp
        return await requests.post(verifyOTPPath, params, false)
    },
    // pinGeneration: async (params,{phone,pinNumber}) => {
    //      const verifyPhonePin = `${path.pinGeneration}?phone=${phone}&pinNumber=${pinNumber}`
    //     return await requests.post(verifyPhonePin, params, false)
    // },
    pinGeneration: async (params) => {
        return await requests.post(path.pinGeneration, params, false)
    },

    // login: async ({ deviceId, password }) => {
    //     const verifyLogin = `${path.login}?deviceId=${deviceId}&password=${password}`
    //     return await requests.post(verifyLogin, false)
    // },
    login: async (params) => {
        return await requests.post(path.login, params, false)
    },
    emailResendOtp: async (email) => {
        const emailResend = `${path.emailResendOtp}?email=${email}`
        return await requests.post(emailResend, false)
    },
    forgotPin: async (phone) => {
        const forgotPin = `${path.forgotPin}?phoneNumber=${phone}`
        return requests.post(forgotPin, false);
    },
    verifyPin: async (params) => {
        return await requests.post(path.verifyPin, params, false)
    },
    changePin: async (params) => {
        return await requests.post(path.changePin, params, false)
    },
    uploadDocument: async (formData) => {
        return await requests.postTokenize(path.uploadDocument, formData, true)
    },
    generateToken: async (email) => {
        const tokenGenrate = `${path.generateToken}?email=${email}`
        return await requests.get(tokenGenrate, false)
    },
    listCategories: async () => {
        return await requests.getTokenize(path.listCategories, false)
    }

};

// const clearSessionAndRestart = async () => {
//   await removeAll()
//   clearDBTables()
//   setEnableVisibleContact(true)
//   AppNavigation.resetNavigation()
// }

export default NetworkManager;
