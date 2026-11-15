
declare namespace BThemerTypes {
    type SettingDef =
        | { type: "toggle"; label?: string; default?: boolean }
        | { type: "button"; label?: string; text?: string; description?: string }
        | { type: "info"; label?: string; default?: string }
        | { type: "range"; label?: string; min?: number; max?: number; unit?: string; default?: number }
        | { type: "color"; label?: string; default?: string }
        | { type: "text"; label?: string; default?: string }
        | {
              type: "select";
              label?: string;
              options: Array<string | [value: string, label: string] | { value: string; label?: string }>;
              default?: string;
          };

    type SettingValues<D extends Record<string, SettingDef>> = {
        [K in keyof D]: D[K] extends { type: "toggle" } ? boolean : D[K] extends { type: "range" } ? number : string;
    };

    interface CssHandle {
        update(css: string): void;
        remove(): void;
    }

    interface CoreSettings {
        accent: string;
        accent2: string;
        glassTint: string;
        glassOpacity: number;
        glassBlur: number;
        radius: number;
        font: string;
        bubbles: boolean;
        hoverEffect: "glow" | "slide" | "none";
        [key: string]: unknown;
    }

    interface PluginApi<D extends Record<string, SettingDef> = Record<string, SettingDef>> {
        readonly id: string;
        readonly settings: SettingValues<D>;
        setSetting<K extends keyof D & string>(key: K, value: SettingValues<D>[K]): void;
        readonly core: CoreSettings;
        css(css?: string): CssHandle;
        observe(selector: string, callback: (el: Element) => void): () => void;
        onKey(combo: string, callback: (e: KeyboardEvent) => void): () => void;
        addMenuItem(label: string, callback: () => void): () => void;
        toast(text: string, ms?: number): void;
        readonly storage: {
            get<T = unknown>(key: string): Promise<T | undefined>;
            set(key: string, value: unknown): Promise<void>;
            delete(key: string): Promise<void>;
        };
        readonly webpack: {
            find<T = any>(filter: (candidate: any) => boolean): T | null;
            findByProps<T = any>(...props: string[]): T | null;
            findStore<T = any>(name: string): T | null;
            waitFor<T = any>(filter: (candidate: any) => boolean, cb: (module: T) => void): () => void;
            waitForStore<T = any>(name: string, cb: (store: T) => void): () => void;
        };
        readonly flux: {
            readonly dispatcher: any;
            intercept(fn: (action: { type: string; [key: string]: any }) => void | false): () => void;
            subscribe(type: string, cb: (action: any) => void): () => void;
        };
        readonly net: {
            onRequest(handler: (req: { method: string; url: string; body: any }) => void | { body: any } | { block: true; status?: number }): () => void;
        };
        contextMenu(
            navIds: string | string[],
            build: (ctx: { navId: string; menu: HTMLElement; target: Element }) =>
                | Array<{ label: string; action: () => void; danger?: boolean; disabled?: boolean; id?: string } | null | false>
                | { items?: Array<{ label: string; action: () => void; danger?: boolean; disabled?: boolean; id?: string }>; hide?: string[] }
                | null
                | void,
        ): () => void;
        settingsPage(pageId: "meow", render: (host: HTMLElement) => void): () => void;
        readonly discord: {
            store(name: string): any;
            readonly rest: {
                get(path: string): Promise<any>;
                post(path: string, body?: any): Promise<any>;
                put(path: string, body?: any): Promise<any>;
                patch(path: string, body?: any): Promise<any>;
                del(path: string): Promise<any>;
            };
            route(): { guildId: string | null; channelId: string | null; messageId: string | null };
            currentUser(): any;
            messageIdsOf(el: Element): { channelId: string; messageId: string } | null;
            getMessage(channelId: string, messageId: string): any;
            dispatch(action: { type: string; [k: string]: any }): any;
            sendMessage(channelId: string, content: string): Promise<unknown>;
        };
        copy(text: string): boolean;
        lazy: {
            shields(level: "standard" | "aggressive" | "off", force?: boolean): Promise<{ ok: true; level: string }>;
            tab(action: "switch" | "close", id: number): Promise<object>;
            open(url: string, newTab?: boolean): Promise<{ open: boolean; url?: string; title?: string; loading?: boolean; canBack?: boolean; canForward?: boolean; blocked: number }>;
            search(query: string, page?: number): Promise<{ query: string; page: number; url?: string; verifyUrl?: string; results: { url: string; title: string; desc: string; site: string; icon: string }[] }>;
            suggest(query: string): Promise<string[]>;
            summary(query: string): Promise<{ kind: "answer" | "info"; title: string; sub?: string; text: string } | null>;
            zoom(factor: number): Promise<number>;
            viewport(vp: { width: number; height: number; visible: boolean }): void;
            input(ev: Record<string, unknown>): void;
            edit(cmd: "copy" | "cut" | "paste" | "selectAll" | "undo" | "redo"): Promise<true>;
            onFrame(cb: (frame: { id: number; width: number; height: number; data: Uint8Array }) => void): () => void;
            nav(action: "back" | "forward" | "reload" | "stop" | "devtools"): Promise<object>;
            state(): Promise<object>;
            close(): Promise<true>;
            popout(url?: string): Promise<true>;
            clear(): Promise<true>;
            onEvent(cb: (data: Record<string, unknown>) => void): () => void;
        };
        kick: {
            login(): Promise<true>;
            status(): Promise<{ loggedIn: boolean; login: string }>;
            logout(): Promise<true>;
            list(kind: "following" | "top" | "search", query?: string): Promise<{ items: { slug: string; name: string; title: string; game: string; viewers: string; thumb: string; avatar: string; live: boolean; followers: number | null }[] }>;
        };
        twitch: {
            login(): Promise<{ loggedIn: boolean; login: string }>;
            status(): Promise<{ loggedIn: boolean; login: string }>;
            logout(): Promise<true>;
            list(kind: "following" | "top" | "search", query?: string): Promise<{ items: { login: string; name: string; title: string; game: string; viewers: string; thumb: string; live: boolean }[] }>;
        };
        youtube: {
            search(query: string): Promise<{ id: string; title: string; channel: string; duration: string; live: boolean }[]>;
            resolveChannel(text: string): Promise<{ id: string; name: string }>;
            channelVideos(ids: string[], includeShorts?: boolean): Promise<{ id: string; title: string; channel: string; published: string; short: boolean }[]>;
        };
        spotify: {
            login(clientId: string, port?: number): Promise<{ accessToken: string; refreshToken: string; expiresAt: number }>;
            refresh(clientId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: number }>;
            request(token: string, method: "GET" | "PUT" | "POST" | "DELETE", path: string, body?: unknown): Promise<{ status: number; data: any }>;
            cookieToken(cookie: string): Promise<{ accessToken: string; expiresAt: number }>;
            keepAlive(on: boolean): Promise<boolean>;
            launch(): Promise<"running" | "launched">;
            webLogin(): Promise<true>;
            webToken(force?: boolean): Promise<{ accessToken: string; expiresAt: number }>;
            webLogout(): Promise<true>;
            webStatus(): Promise<boolean>;
            lyrics(query: { track: string; artist: string; album?: string; duration?: number }): Promise<{ synced: string | null; plain: string | null; instrumental: boolean } | null>;
        };
        openWindow(title: string, content?: Element): HTMLElement | null;
        onDispose(fn: () => void): void;
        el<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Partial<HTMLElementTagNameMap[K]>): HTMLElementTagNameMap[K];
        log(...args: unknown[]): void;
        warn(...args: unknown[]): void;
    }

    interface PluginDefinition<D extends Record<string, SettingDef> = Record<string, SettingDef>> {
        id: string;
        name?: string;
        description?: string;
        author?: string;
        version?: string;
        enabledByDefault?: boolean;
        settings?: D;
        css?: string | ((settings: SettingValues<D>, api: PluginApi<D>) => string);
        start?(api: PluginApi<D>): void;
        stop?(api: PluginApi<D>): void;
        onSettingChange?(key: keyof D & string, value: unknown, api: PluginApi<D>): void;
        onCoreChange?(core: CoreSettings, api: PluginApi<D>): void;
    }

    interface PluginInfo {
        id: string;
        name: string;
        running: boolean;
        file: string;
        error: unknown;
    }
}

declare const BThemer: {
    readonly version: string;
    readonly settings: Record<string, unknown>;
    definePlugin<D extends Record<string, BThemerTypes.SettingDef>>(def: BThemerTypes.PluginDefinition<D>): BThemerTypes.PluginDefinition<D>;
    readonly plugins: {
        list(): BThemerTypes.PluginInfo[];
        enable(id: string): boolean;
        disable(id: string): boolean;
        toggle(id: string): boolean;
    };
    open(): void;
    toggle(): void;
    toast(text: string, ms?: number): void;
    reloadThemes(): void;
    setWallpaperFromUrl(url: string): Promise<void>;
};
