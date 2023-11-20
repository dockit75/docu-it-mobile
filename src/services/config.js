const env = {
    dev: 'dev', stg: 'stg', prod: 'prod',
};

const API_URL = {
    dev: 'http://13.234.66.106:8081/dockitservice',     
    stg: '',
    prod: '',
};

const currentEnv = env.dev;

export const BASE_API_CORE_URL = API_URL[currentEnv];

export const maxFileSizeLimit = 5242880

