"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const instance = axios_1.default.create({
    baseURL: '',
});
instance.interceptors.request.use((config) => {
    console.debug('Executing Request interceptor');
    config.headers['Content-Type'] = 'application/json';
    console.log(axios_1.default.getUri(config));
    return config;
});
instance.interceptors.response.use((response) => {
    console.debug('Executing Response interceptor');
    if (response.status &&
        (response.status.toString().startsWith('4') ||
            response.status.toString().startsWith('5'))) {
        console.error('Error with response: ', response.data);
    }
    return response;
});
exports.default = instance;
//# sourceMappingURL=axios.js.map