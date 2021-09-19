import { Settings } from "./settings"
const ms = require('ms')

interface Cache {
    [key: string]: {
        updateTime: number,
        data: any,
    }
}

export class IssuesCache {
    private _settings: Settings
    private _cache: Cache

    constructor(settings: Settings) {
        this._settings = settings
        this._cache = {}
    }

    addCachedIssue(key: string, issue: any) {
        this._cache[key] = {
            updateTime: Date.now(),
            data: issue,
        }
    }

    getCachedIssue(key: string) {
        if (key in this._cache && this._cache[key].updateTime + ms(this._settings.get('cacheTime')) > Date.now()) {
            return this._cache[key].data
        }
        return undefined
    }
}
