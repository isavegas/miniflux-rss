"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = require("../src/module");
const chai_1 = require("chai");
require("mocha");
const nock = require("nock");
const mock_server = 'https://miniflux.mock';
let mock = nock(mock_server);
let miniflux_server = () => new module_1.Miniflux(mock_server, { username: 'username', password: 'password' });
const json_validate = (body) => {
    if (typeof body == 'string') {
        try {
            JSON.parse(body);
        }
        catch (e) {
            throw new Error(`Invalid request JSON: ${body}`);
        }
    }
    return body;
};
describe('discover', () => {
    let miniflux = miniflux_server();
    it('should get data', () => {
        let expected = [{ url: 'https://medium.com/feed/@monkeytypewritr', title: 'RSS', type: 'rss' }];
        mock.filteringRequestBody(json_validate).post('/v1/discover').reply(200, expected);
        return miniflux.discover('https://medium.com/@monkeytypewritr')
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected))
            .catch(err => new Error('Expected 200.'));
    });
    it('should handle errors', () => {
        let expected = { error_message: 'No subscription found' };
        mock.filteringRequestBody(json_validate).post('/v1/discover').reply(404, expected);
        return miniflux.discover('https://medium.com/abc')
            .then(res => new Error('Expected 404.'))
            .catch(err => (0, chai_1.expect)(err).to.deep.equal(expected));
    });
});
describe('feeds', () => {
    let miniflux = miniflux_server();
    it('should retrieve feeds', () => {
        let expected = [{
                id: 42,
                user_id: 123,
                title: "Example Feed",
                site_url: "http://example.org",
                feed_url: "http://example.org/feed.atom",
                rewrite_rules: "",
                scraper_rules: "",
                crawler: false,
                checked_at: "2017-12-22T21:06:03.133839-05:00",
                etag_header: "KyLxEflwnTGF5ecaiqZ2G0TxBCc",
                last_modified_header: "Sat, 23 Dec 2017 01:04:21 GMT",
                parsing_error_count: 0,
                parsing_error_message: "",
                category: {
                    id: 793,
                    user_id: 123,
                    title: "Some category"
                },
                icon: {
                    feed_id: 42,
                    icon_id: 84
                }
            }];
        mock.get('/v1/feeds').reply(200, expected);
        return miniflux.feeds()
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected))
            .catch(err => new Error('Expected 200.'));
    });
});
describe('get_feed', () => {
    let miniflux = miniflux_server();
    it('should retrieve feed data', () => {
        let expected = {
            id: 42,
            user_id: 123,
            title: "Example Feed",
            site_url: "http://example.org",
            feed_url: "http://example.org/feed.atom",
            rewrite_rules: "",
            scraper_rules: "",
            crawler: false,
            checked_at: "2017-12-22T21:06:03.133839-05:00",
            etag_header: "KyLxEflwnTGF5ecaiqZ2G0TxBCc",
            last_modified_header: "Sat, 23 Dec 2017 01:04:21 GMT",
            parsing_error_count: 0,
            parsing_error_message: "",
            category: {
                id: 793,
                user_id: 123,
                title: "Some category"
            },
            icon: {
                feed_id: 42,
                icon_id: 84
            }
        };
        let feed_id = 1;
        mock.get(`/v1/feeds/${feed_id}`).reply(200, expected);
        return miniflux.get_feed(feed_id)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected))
            .catch(err => new Error('Expected 200.'));
    });
});
describe('get_feed_icon', () => {
    let miniflux = miniflux_server();
    it('should retrieve feed icon', () => {
        let expected = {
            id: 1,
            data: 'dummy_data',
            mime_type: 'image/png',
        };
        let feed_id = 1;
        mock.get(`/v1/feeds/${feed_id}/icon`).reply(200, expected);
        return miniflux.get_feed_icon(feed_id)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected))
            .catch(err => new Error('Expected 200.'));
    });
});
describe('create_feed', () => {
    let miniflux = miniflux_server();
    it('should create feed', () => {
        let expected = {
            feed_id: 42
        };
        let feed_id = 1;
        mock.filteringRequestBody(json_validate).post(`/v1/feeds`).reply(200, expected);
        return miniflux.create_feed(feed_id, 1)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected))
            .catch(err => new Error('Expected 200.'));
    });
    it('shouldn\'t require a category', () => {
        let expected = {
            feed_id: 42
        };
        let feed_id = 1;
        mock.filteringRequestBody(json_validate).post(`/v1/feeds`).reply(200, expected);
        return miniflux.create_feed(feed_id)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected))
            .catch(err => new Error('Expected 200.'));
    });
});
describe('update_feed', () => {
    let miniflux = miniflux_server();
    let dummy_feed = {
        id: 42,
        user_id: 123,
        title: "Example Feed",
        site_url: "http://example.org",
        feed_url: "http://example.org/feed.atom",
        rewrite_rules: "",
        scraper_rules: "",
        crawler: false,
        checked_at: "2017-12-22T21:06:03.133839-05:00",
        etag_header: "KyLxEflwnTGF5ecaiqZ2G0TxBCc",
        last_modified_header: "Sat, 23 Dec 2017 01:04:21 GMT",
        parsing_error_count: 0,
        parsing_error_message: "",
        category: {
            id: 1,
            user_id: 123,
            title: "Some category"
        },
        icon: {
            feed_id: 42,
            icon_id: 84
        }
    };
    it('should update feed', () => {
        let expected = dummy_feed;
        let feed_id = 1;
        mock.filteringRequestBody(json_validate).put(`/v1/feeds/${feed_id}`).reply(200, expected);
        return miniflux.update_feed(feed_id, 'Example Feed', 1)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected))
            .catch(err => new Error('Expected 200.'));
    });
    it('should accept only a new title', () => {
        let expected = dummy_feed;
        let feed_id = 1;
        mock.filteringRequestBody(json_validate).put(`/v1/feeds/${feed_id}`).reply(200, expected);
        return miniflux.update_feed(feed_id, 'New Title', null)
            .then(res => new Error('Expected error'))
            .catch(err => (0, chai_1.expect)(err).to.equal('No title or category specified'));
    });
    it('should accept only a new category', () => {
        let expected = dummy_feed;
        let feed_id = 1;
        mock.filteringRequestBody(json_validate).put(`/v1/feeds/${feed_id}`).reply(200, expected);
        return miniflux.update_feed(feed_id, null, 10)
            .then(res => new Error('Expected error'))
            .catch(err => (0, chai_1.expect)(err).to.equal('No title or category specified'));
    });
    it('should require title or category', () => {
        let feed_id = 1;
        return miniflux.update_feed(feed_id, null, null)
            .then(res => new Error('Expected error'))
            .catch(err => (0, chai_1.expect)(err).to.equal('No title or category specified'));
    });
});
describe('refresh_feed', () => {
    let miniflux = miniflux_server();
    it('should refresh the feed', () => {
        let feed_id = 1;
        mock.filteringRequestBody(json_validate).put(`/v1/feeds/${feed_id}/refresh`).reply(204);
        return miniflux.refresh_feed(feed_id)
            .then(res => (0, chai_1.expect)(res).to.equal(null));
    });
});
let dummy_entry = {
    id: 888,
    user_id: 123,
    feed_id: 42,
    title: 'Entry Title',
    url: 'http://example.org/article.html',
    comments_url: '',
    author: 'Foobar',
    content: '<p>HTML contents</p>',
    hash: '29f99e4074cdacca1766f47697d03c66070ef6a14770a1fd5a867483c207a1bb',
    published_at: '2016-12-12T16:15:19Z',
    status: 'read',
    starred: false,
    feed: {
        id: 42,
        user_id: 123,
        title: 'New Feed Title',
        site_url: 'http://example.org',
        feed_url: 'http://example.org/feed.atom',
        rewrite_rules: '',
        scraper_rules: '',
        crawler: false,
        checked_at: '2017-12-22T21:06:03.133839-05:00',
        etag_header: 'KyLxEflwnTGF5ecaiqZ2G0TxBCc',
        last_modified_header: 'Sat, 23 Dec 2017 01:04:21 GMT',
        parsing_error_count: 0,
        parsing_error_message: '',
        category: {
            id: 22,
            user_id: 123,
            title: 'Another category'
        },
        icon: {
            feed_id: 42,
            icon_id: 84
        }
    }
};
describe('get_feed_entry', () => {
    let miniflux = miniflux_server();
    it('should get the feed\'s entry', () => {
        let expected = dummy_entry;
        let feed_id = 1;
        let entry_id = 1;
        mock.get(`/v1/feeds/${feed_id}/entries/${entry_id}`).reply(200, expected);
        return miniflux.get_feed_entry(feed_id, entry_id)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
});
describe('get_entry', () => {
    let miniflux = miniflux_server();
    it('should get the entry', () => {
        let expected = dummy_entry;
        let entry_id = 1;
        mock.get(`/v1/entries/${entry_id}`).reply(200, expected);
        return miniflux.get_entry(entry_id)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
});
describe('get_feed_entries', () => {
    let miniflux = miniflux_server();
    it('should get feed entries without filter', () => {
        let expected = [dummy_entry];
        let feed_id = 1;
        mock.get(`/v1/feeds/${feed_id}/entries`).reply(200, expected);
        return miniflux.get_feed_entries(feed_id)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
    it('should get feed entries with limit', () => {
        let expected = [dummy_entry];
        let feed_id = 1;
        mock.get(`/v1/feeds/${feed_id}/entries`)
            .query({ limit: 10 })
            .reply(200, expected);
        return miniflux.get_feed_entries(feed_id, { limit: 10 })
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
    it('should get feed entries with offset', () => {
        let expected = [dummy_entry];
        let feed_id = 1;
        mock.get(`/v1/feeds/${feed_id}/entries`)
            .query({ offset: 10 })
            .reply(200, expected);
        return miniflux.get_feed_entries(feed_id, { offset: 10 })
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
    it('should get feed entries with direction', () => {
        let expected = [dummy_entry];
        let feed_id = 1;
        mock.get(`/v1/feeds/${feed_id}/entries`)
            .query({ direction: module_1.EntryDirection.DESCENDING })
            .reply(200, expected);
        return miniflux.get_feed_entries(feed_id, { direction: module_1.EntryDirection.DESCENDING })
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
    it('should get feed entries with specified status', () => {
        let expected = [dummy_entry];
        let feed_id = 1;
        mock.get(`/v1/feeds/${feed_id}/entries`)
            .query({ status: module_1.EntryStatus.UNREAD })
            .reply(200, expected);
        return miniflux.get_feed_entries(feed_id, { status: module_1.EntryStatus.UNREAD })
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
    it('should get feed entries with order', () => {
        let expected = [dummy_entry];
        let feed_id = 1;
        mock.get(`/v1/feeds/${feed_id}/entries`)
            .query({ order: module_1.EntryOrder.PUBLISHED_AT })
            .reply(200, expected);
        return miniflux.get_feed_entries(feed_id, { order: module_1.EntryOrder.PUBLISHED_AT })
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
    it('should get feed entries with all filters', () => {
        let expected = [dummy_entry];
        let feed_id = 1;
        let filter = {
            order: module_1.EntryOrder.PUBLISHED_AT,
            status: module_1.EntryStatus.UNREAD,
            direction: module_1.EntryDirection.DESCENDING,
            limit: 10,
            offset: 10,
        };
        mock.get(`/v1/feeds/${feed_id}/entries`)
            .query(filter)
            .reply(200, expected);
        return miniflux.get_feed_entries(feed_id, filter)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
});
describe('update_entries', () => {
    let miniflux = miniflux_server();
    it('should get feed entry', () => {
        let entry_ids = [1, 2, 3];
        let status = module_1.EntryStatus.UNREAD;
        mock.filteringRequestBody(json_validate).put(`/v1/entries`).reply(204);
        return miniflux.update_entries(entry_ids, status)
            .then(res => (0, chai_1.expect)(res).to.equal(null));
    });
});
describe('toggle_bookmark', () => {
    let miniflux = miniflux_server();
    it('should toggle bookmark', () => {
        let entry_id = 1;
        mock.filteringRequestBody(json_validate).put(`/v1/entries/${entry_id}/bookmark`).reply(204);
        return miniflux.toggle_bookmark(entry_id)
            .then(res => (0, chai_1.expect)(res).to.equal(null));
    });
});
describe('categories', () => {
    let miniflux = miniflux_server();
    it('should get categories', () => {
        let expected = [{
                id: 1,
                user_id: 1,
                title: 'Stuff',
            }];
        mock.filteringRequestBody(json_validate).get(`/v1/categories`).reply(200, expected);
        return miniflux.categories()
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
});
describe('create_category', () => {
    let miniflux = miniflux_server();
    it('should create category', () => {
        let expected = {
            id: 1,
            user_id: 1,
            title: 'Stuff',
        };
        mock.filteringRequestBody(json_validate).post(`/v1/categories`).reply(200, expected);
        return miniflux.create_category('Stuff')
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
});
describe('update_category', () => {
    let miniflux = miniflux_server();
    it('should update category', () => {
        let expected = {
            id: 1,
            user_id: 1,
            title: 'Stuff',
        };
        let category_id = 1;
        mock.filteringRequestBody(json_validate).put(`/v1/categories/${category_id}`).reply(200, expected);
        return miniflux.update_category(category_id, 'Stuff')
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
});
describe('delete_category', () => {
    let miniflux = miniflux_server();
    it('should delete category', () => {
        let category_id = 1;
        mock.filteringRequestBody(json_validate).delete(`/v1/categories/${category_id}`).reply(204);
        return miniflux.delete_category(category_id)
            .then(res => (0, chai_1.expect)(res).to.equal(null));
    });
});
describe('opml_export', () => {
    let miniflux = miniflux_server();
    it('should export opml', () => {
        let expected = "<xml></xml>";
        mock.filteringRequestBody(json_validate).get(`/v1/export`).reply(200, expected, {
            "Content-Type": "text/xml"
        });
        return miniflux.ompl_export()
            .then(res => (0, chai_1.expect)(res).to.equal(expected));
    });
});
describe('create_user', () => {
    let miniflux = miniflux_server();
    it('should create user', () => {
        let expected = {
            id: 1,
            username: 'username',
            language: 'en_US',
            timezone: 'UTC',
            theme: 'default',
            entry_sorting_direction: module_1.EntryDirection.ASCENDING
        };
        mock.filteringRequestBody(json_validate).post(`/v1/users`).reply(200, expected);
        miniflux.create_user('username', '****', false)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
});
describe('update_user', () => {
    let miniflux = miniflux_server();
    it('should update user', () => {
        let user_id = 1;
        let expected = {
            id: user_id,
            username: 'username',
            language: 'en_US',
            timezone: 'UTC',
            theme: 'default',
            entry_sorting_direction: module_1.EntryDirection.ASCENDING
        };
        mock.filteringRequestBody(json_validate).put(`/v1/users/${user_id}`).reply(200, expected);
        return miniflux.update_user(user_id, {
            username: 'username',
            password: '****',
            is_admin: false,
            theme: 'default',
            language: 'en_US',
            timezone: 'UTC',
        }).then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
});
describe('users', () => {
    let miniflux = miniflux_server();
    it('should retrieve users', () => {
        let expected = [{
                id: 1,
                username: 'username',
                language: 'en_US',
                timezone: 'UTC',
                theme: 'default',
                entry_sorting_direction: module_1.EntryDirection.ASCENDING
            }];
        mock.filteringRequestBody(json_validate).get(`/v1/users`).reply(200, expected);
        return miniflux.users()
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
});
describe('get_user', () => {
    let miniflux = miniflux_server();
    it('should retrieve the user', () => {
        let user_id = 1;
        let expected = {
            id: user_id,
            username: 'username',
            language: 'en_US',
            timezone: 'UTC',
            theme: 'default',
            entry_sorting_direction: module_1.EntryDirection.ASCENDING
        };
        mock.filteringRequestBody(json_validate).get(`/v1/users/${user_id}`).reply(200, expected);
        return miniflux.get_user(user_id)
            .then(res => (0, chai_1.expect)(res).to.deep.equal(expected));
    });
});
describe('delete_user', () => {
    let miniflux = miniflux_server();
    it('should delete user', () => {
        let user_id = 1;
        mock.filteringRequestBody(json_validate).delete(`/v1/users/${user_id}`).reply(204);
        return miniflux.delete_user(user_id)
            .then(res => (0, chai_1.expect)(res).to.equal(null));
    });
});
//# sourceMappingURL=module.spec.js.map