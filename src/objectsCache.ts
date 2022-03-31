import { Settings } from "./settings"
import ms = require('ms')

interface Cache {
    [key: string]: {
        updateTime: number,
        data: any,
    }
}

export class ObjectsCache {
    private _settings: Settings
    private _cache: Cache

    constructor(settings: Settings) {
        this._settings = settings
        this._cache = {}
    }

    addCachedObject(key: string, object: any) {
        this._cache[key] = {
            updateTime: Date.now(),
            data: object,
        }
    }

    getCachedObject(key: string) {
        if (key in this._cache && this._cache[key].updateTime + ms(this._settings.get('cacheTime')) > Date.now()) {
            return this._cache[key].data
        }
        return undefined
    }

    clear() {
        this._cache = {}
    }
}
