import Ajax from 'axios';
import { message } from 'antd';
import _ from 'underscore';


const delayCloseTime = 5;

const prefix = '/api';

const info = function (error, text) {
  message.error(
    (error && error.response && error.response.data && error.response.data.message) || '服务器错误',
    delayCloseTime,
  );
};

const httpStatus = {
  409: (error) => {
    if (error && error.response && error.response.data) {
      const data = error.response.data;
      if (data.message) {
        info(error, data.message);
      } else if (data.fieldErrors && !_.isEmpty(data.fieldErrors)) {
        return data;
      } else {
        info(error, '服务器错误');
      }
    } else {
      info(error, '服务器错误');
    }
  },
  500: error => info(error, '服务器错误'),
  403: error => info(error, '权限错误'),
  401: (error) => {
    return error.response.data;
  },
};

function errorHandle(error) {
  const code = error && error.response && error.response.status;
  let err;
  if (code && httpStatus[code]) {
    err = httpStatus[error.response.status](error);
  } else {
    info(error, '服务器错误');
  }
  return err ? { error: err } : { error };
}

export function request(url, options) {
  let requestOptions = options;

  if ((options.method === 'GET' || !options.method) && options.data) {
    requestOptions = {
      ...options,
      data: null,
      params: options.data,
    };
  }

  if ((options.method === 'POST' || options.method === 'PUT') && !options.data && options.params) {
    requestOptions = {
      ...options,
      data: options.data,
      params: null,
    };
  }

  return Ajax({
    method: requestOptions.method || 'GET',
    url: prefix + url,
    data: requestOptions.data || {},
    params: requestOptions.params || {},
  }).then(response => ({
    data: response.data || '',
    headers: response.headers,
  }))
    .catch((error) => {
      return errorHandle(error);
    },
    );
}
