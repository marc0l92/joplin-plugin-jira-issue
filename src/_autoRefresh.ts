import { Settings } from "./settings"
const ms = require('ms')


export class AutoRefresh {
    private _settings: Settings
    private _notesUpdateTime: { [key: string]: number }

    constructor(settings: Settings) {
        this._settings = settings
        this._notesUpdateTime = {}
    }

    hasToBeUpdated(noteId: string): boolean {
        if (this._settings.autoRefreshEnabled) {
            if (noteId in this._notesUpdateTime) {
                if (this._notesUpdateTime[noteId] + ms(this._settings.autoRefreshTime) < Date.now()) {
                    return true
                }
            } else {
                this._notesUpdateTime[noteId] = Date.now()
                return true
            }
        }
        return false
    }

}
