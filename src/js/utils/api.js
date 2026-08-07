define([], function () {
  'use strict';

  const DEFAULT_API_BASE_URL = 'http://localhost:8080';
  let unauthorizedHandler = null;

  function getApiBaseUrl() {
    return (window.__BANKING_API_BASE_URL__ || DEFAULT_API_BASE_URL).replace(/\/$/, '');
  }

  function ApiError(status, body) {
    this.name = 'ApiError';
    this.status = status;
    this.body = body || null;
    this.message = (body && (body.message || body.error)) || 'Request failed (' + status + ')';
    if (Error.captureStackTrace) { Error.captureStackTrace(this, ApiError); }
  }
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  async function readResponseBody(response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) { return response.json(); }
    const text = await response.text();
    return text ? { message: text } : null;
  }

  async function request(path, options, token) {
    const config = options || {};
    const headers = new Headers(config.headers || {});
    headers.set('Accept', 'application/json');
    if (config.body) { headers.set('Content-Type', 'application/json'); }
    if (token) { headers.set('Authorization', 'Bearer ' + token); }

    let response;
    try {
      response = await fetch(getApiBaseUrl() + path, Object.assign({}, config, { headers: headers }));
    } catch (error) {
      throw new ApiError(0, { message: 'Unable to reach the banking server. Check that the API Gateway is running on port 8080.' });
    }
    if (response.status === 204) { return undefined; }

    const body = await readResponseBody(response);
    if (!response.ok) {
      const apiError = new ApiError(response.status, body);
      if (response.status === 401 && token && unauthorizedHandler) { unauthorizedHandler(apiError); }
      throw apiError;
    }
    return body;
  }

  async function download(path, token) {
    let response;
    try {
      response = await fetch(getApiBaseUrl() + path, { headers: { 'Authorization': 'Bearer ' + token, 'Accept': '*/*' } });
    } catch (error) {
      throw new ApiError(0, { message: 'Unable to reach the banking server while downloading the report.' });
    }
    if (!response.ok) {
      const body = await readResponseBody(response);
      const apiError = new ApiError(response.status, body);
      if (response.status === 401 && unauthorizedHandler) { unauthorizedHandler(apiError); }
      throw apiError;
    }
    const disposition = response.headers.get('content-disposition') || '';
    const utfName = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const plainName = disposition.match(/filename="?([^";]+)"?/i);
    return { blob: await response.blob(), fileName: decodeURIComponent(utfName ? utfName[1] : plainName ? plainName[1] : 'Northstar_Report.csv') };
  }

  async function upload(path, formData, token) {
    let response;
    try {
      response = await fetch(getApiBaseUrl() + path, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, body: formData });
    } catch (error) {
      throw new ApiError(0, { message: 'Unable to reach the banking server while uploading the document.' });
    }
    const body = await readResponseBody(response);
    if (!response.ok) {
      const apiError = new ApiError(response.status, body);
      if (response.status === 401 && unauthorizedHandler) { unauthorizedHandler(apiError); }
      throw apiError;
    }
    return body;
  }

  function setUnauthorizedHandler(handler) {
    unauthorizedHandler = typeof handler === 'function' ? handler : null;
  }

  function unwrap(response) {
    return response && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response;
  }

  function createIdempotencyKey() {
    if (window.crypto && window.crypto.randomUUID) { return window.crypto.randomUUID(); }
    return 'banking-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  return {
    ApiError: ApiError,
    request: request,
    download: download,
    upload: upload,
    unwrap: unwrap,
    setUnauthorizedHandler: setUnauthorizedHandler,
    getApiBaseUrl: getApiBaseUrl,
    createIdempotencyKey: createIdempotencyKey
  };
});
