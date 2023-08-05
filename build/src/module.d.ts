/// <reference types="node" />
import { URL } from 'url';
export declare class Miniflux {
    url: URL;
    username: string;
    private auth_method;
    private token;
    constructor(server_url: string, credentials: any);
    request(path: string, data?: any, method?: string): Promise<any>;
    get: (path: string) => Promise<any>;
    put: (path: string, data?: any) => Promise<any>;
    post: (path: string, data: any) => Promise<any>;
    delete: (path: string) => Promise<any>;
    discover: (url: string) => Promise<FeedLink[]>;
    feeds: () => Promise<Feed[]>;
    get_feed: (feed_id: number) => Promise<Feed>;
    get_feed_icon: (feed_id: number) => Promise<Icon>;
    create_feed: (feed_url: number, category_id?: number) => Promise<CreatedFeed>;
    update_feed: (feed_id: number, title?: string, category_id?: number) => Promise<Feed>;
    refresh_feed: (feed_id: number) => Promise<void>;
    remove_feed: (feed_id: number) => Promise<void>;
    get_feed_entry: (feed_id: number, entry_id: number) => Promise<Entry>;
    get_entry: (entry_id: number) => Promise<Entry>;
    get_feed_entries: (feed_id: number, filter?: Filter) => Promise<EntryList[]>;
    get_entries: (filter?: Filter) => Promise<EntryList[]>;
    update_entries: (entry_ids: number[], status: EntryStatus) => Promise<void>;
    toggle_bookmark: (entry_id: number) => Promise<void>;
    categories: () => Promise<Category[]>;
    create_category: (title: string) => Promise<Category>;
    update_category: (category_id: number, title: string) => Promise<Category>;
    delete_category: (category_id: number) => Promise<void>;
    ompl_export: () => Promise<string>;
    create_user: (username: string, password: string, is_admin: boolean) => Promise<User>;
    update_user: (user_id: number, user_settings: UserSettings) => Promise<User>;
    users: () => Promise<User[]>;
    get_user: (user: number | string) => Promise<User>;
    delete_user: (user_id: number) => Promise<void>;
}
export interface UserSettings {
    username?: string;
    password?: string;
    is_admin?: boolean;
    theme?: string;
    language?: string;
    timezone?: string;
}
export interface User {
    id: number;
    username: string;
    language: string;
    timezone: string;
    theme: string;
    entry_sorting_direction: EntryDirection;
}
export interface Filter {
    status?: EntryStatus;
    order?: EntryOrder;
    direction?: EntryDirection;
    limit?: number;
    offset?: number;
}
export declare enum EntryStatus {
    READ = "read",
    UNREAD = "unread",
    REMOVED = "removed"
}
export declare enum EntryOrder {
    ID = "id",
    STATUS = "status",
    PUBLISHED_AT = "published_at",
    CATEGORY_TITLE = "category_title",
    CATEGORY_ID = "category_id"
}
export declare enum EntryDirection {
    ASCENDING = "asc",
    DESCENDING = "desc"
}
export interface MinifluxError {
    error_message: string;
}
export interface FeedLink {
    url: string;
    title: string;
    type: string;
}
export interface CreatedFeed {
    "feed_id": number;
}
export interface Category {
    id: number;
    user_id: number;
    title: string;
}
export interface IconReference {
    feed_id: number;
    icon_id: number;
}
export interface Feed {
    id: number;
    user_id: number;
    title: string;
    site_url: string;
    feed_url: string;
    rewrite_rules: string;
    scraper_rules: string;
    crawler: boolean;
    checked_at: string;
    etag_header: string;
    last_modified_header: string;
    parsing_error_count: number;
    parsing_error_message: string;
    category: Category;
    icon: IconReference;
}
export interface Icon {
    id: number;
    data: string;
    mime_type: string;
}
export interface Entry {
    id: number;
    user_id: number;
    feed_id: number;
    title: string;
    url: string;
    comments_url: string;
    author: string;
    content: string;
    hash: string;
    published_at: string;
    status: string;
    starred: boolean;
    feed: Feed;
}
export interface EntryList {
    total: number;
    entries: Entry[];
}
