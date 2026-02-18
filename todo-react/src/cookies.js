export function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Strict';
}

export function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length));
        }
    }
    return null;
}

export function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
}

export function getAuthToken() {
    return getCookie('authToken');
}

export function getUsername() {
    return getCookie('username');
}

export function saveAuthState(token, username) {
    setCookie('authToken', token, 7);
    setCookie('username', username, 7);
}

export function clearAuthState() {
    deleteCookie('authToken');
    deleteCookie('username');
}