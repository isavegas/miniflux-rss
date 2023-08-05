"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryDirection = exports.EntryOrder = exports.EntryStatus = exports.Miniflux = void 0;
const https_1 = require("https");
const url_1 = require("url");
let esc = str => {
    if (str != null)
        return str.replace('"', '\\"').replace('\'', '\\\'');
    else
        return null;
};
class Miniflux {
    constructor(server_url, credentials) {
        this.get = (path) => this.request(path, null, 'GET');
        this.put = (path, data) => this.request(path, data, 'PUT');
        this.post = (path, data) => this.request(path, data, 'POST');
        this.delete = (path) => this.request(path, null, 'DELETE');
        this.discover = (url) => this.post('/v1/discover', `{"url":"${url}"}`);
        this.feeds = () => this.get('/v1/feeds');
        this.get_feed = (feed_id) => this.get(`/v1/feeds/${feed_id}`);
        this.get_feed_icon = (feed_id) => this.get(`/v1/feeds/${feed_id}/icon`);
        this.create_feed = (feed_url, category_id) => {
            let feed_settings = `{"feed_url": "${feed_url}"`;
            if (category_id !== 0) {
                feed_settings += ', "category_id": ';
                feed_settings += category_id;
            }
            feed_settings += '}';
            return this.post(`/v1/feeds`, feed_settings);
        };
        this.update_feed = (feed_id, title, category_id) => {
            title = esc(title);
            if (title == null && category_id == null)
                return new Promise((resolve, reject) => reject('No title or category specified'));
            let feed_settings = '{';
            if (title != null)
                feed_settings += `"title": "${esc(title)}"`;
            if (category_id != null) {
                if (title != null)
                    feed_settings += ',';
                feed_settings += `"category": {"id": ${category_id}}`;
            }
            feed_settings += '}';
            return this.put(`/v1/feeds/${feed_id}`, feed_settings);
        };
        this.refresh_feed = (feed_id) => this.put(`/v1/feeds/${feed_id}/refresh`);
        this.remove_feed = (feed_id) => this.delete(`/v1/feeds/${feed_id}`);
        this.get_feed_entry = (feed_id, entry_id) => this.get(`/v1/feeds/${feed_id}/entries/${entry_id}`);
        this.get_entry = (entry_id) => this.get(`/v1/entries/${entry_id}`);
        this.get_feed_entries = (feed_id, filter) => {
            let options = [];
            if (filter != null) {
                if (filter.status != null)
                    options.push(`status=${filter.status}`);
                if (filter.offset != null)
                    options.push(`offset=${filter.offset}`);
                if (filter.limit != null)
                    options.push(`limit=${filter.limit}`);
                if (filter.direction != null)
                    options.push(`direction=${filter.direction}`);
                if (filter.order != null)
                    options.push(`order=${filter.order}`);
            }
            let path = `/v1/feeds/${feed_id}/entries`;
            if (options.length > 0) {
                path += '?';
                path += options.join('&');
            }
            return this.get(path);
        };
        this.get_entries = (filter) => {
            let options = [];
            if (filter != null) {
                if (filter.status != null)
                    options.push(`status=${filter.status}`);
                if (filter.offset != null)
                    options.push(`offset=${filter.offset}`);
                if (filter.limit != null)
                    options.push(`limit=${filter.limit}`);
                if (filter.direction != null)
                    options.push(`direction=${filter.direction}`);
                if (filter.order != null)
                    options.push(`order=${filter.order}`);
            }
            let path = `/v1/entries`;
            if (options.length > 0) {
                path += '?';
                path += options.join('&');
            }
            return this.get(path);
        };
        this.update_entries = (entry_ids, status) => this.put(`/v1/entries`, `{\"entry_ids\": [${entry_ids.join(',')}], \"status\": \"${esc(status)}\"}`);
        this.toggle_bookmark = (entry_id) => this.put(`/v1/entries/${entry_id}/bookmark`);
        this.categories = () => this.get(`/v1/categories`);
        this.create_category = (title) => this.post('/v1/categories', `{\"title\": \"${esc(title)}\"}`);
        this.update_category = (category_id, title) => this.put(`/v1/categories/${category_id}`, `{\"title\": \"${esc(title)}\"}`);
        this.delete_category = (category_id) => this.delete(`/v1/categories/${category_id}`);
        this.ompl_export = () => this.get('/v1/export');
        this.create_user = (username, password, is_admin) => this.post(`/v1/users`, `{\"username\":\"${esc(username)}\", \"password:\": \"${esc(password)}\", \"is_admin\": ${is_admin}}`);
        this.update_user = (user_id, user_settings) => this.put(`/v1/users/${user_id}`, user_settings);
        this.users = () => this.get('/v1/users');
        this.get_user = (user) => this.get(`/v1/users/${user}`);
        this.delete_user = (user_id) => this.delete(`/v1/users/${user_id}`);
        this.url = new url_1.URL(server_url);
        if (credentials.token != null) {
            this.auth_method = 'token';
            this.token = credentials.token;
        }
        else if (credentials.username != null && credentials.password != null) {
            this.auth_method = 'login';
            this.token = `Basic ${Buffer.from(credentials.username + ':' + credentials.password).toString('base64')}`;
        }
    }
    request(path, data = null, method = 'GET') {
        if (typeof data == 'object')
            data = JSON.stringify(data);
        else if (data == null)
            data = '';
        let headers = {
            'Content-Type': 'application/json'
        };
        if (this.auth_method == 'token') {
            headers['X-Auth-Token'] = this.token;
        }
        else if (this.auth_method == 'login') {
            headers['Authorization'] = this.token;
        }
        return new Promise((resolve, reject) => {
            let req = (0, https_1.request)({
                hostname: this.url.hostname,
                port: this.url.port,
                path: path,
                method: method,
                headers: headers,
            }, response => {
                let body = '';
                response.on('data', chunk => body += chunk);
                response.on('end', () => {
                    if (response.statusCode == 200) {
                        if (response.headers["content-type"].startsWith('application/json'))
                            resolve(JSON.parse(body));
                        else
                            resolve(body);
                    }
                    else if (response.statusCode == 204) {
                        resolve(null);
                    }
                    else {
                        reject(JSON.parse(body));
                    }
                });
                response.on('error', reject);
            });
            req.write(data);
            req.end();
        });
    }
}
exports.Miniflux = Miniflux;
var EntryStatus;
(function (EntryStatus) {
    EntryStatus["READ"] = "read";
    EntryStatus["UNREAD"] = "unread";
    EntryStatus["REMOVED"] = "removed";
})(EntryStatus || (exports.EntryStatus = EntryStatus = {}));
var EntryOrder;
(function (EntryOrder) {
    EntryOrder["ID"] = "id";
    EntryOrder["STATUS"] = "status";
    EntryOrder["PUBLISHED_AT"] = "published_at";
    EntryOrder["CATEGORY_TITLE"] = "category_title";
    EntryOrder["CATEGORY_ID"] = "category_id";
})(EntryOrder || (exports.EntryOrder = EntryOrder = {}));
var EntryDirection;
(function (EntryDirection) {
    EntryDirection["ASCENDING"] = "asc";
    EntryDirection["DESCENDING"] = "desc";
})(EntryDirection || (exports.EntryDirection = EntryDirection = {}));
//# sourceMappingURL=module.js.map