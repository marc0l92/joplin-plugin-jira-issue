import joplin from 'api'
import { ChangeEvent } from 'api/JoplinSettings'
import { SettingItem, SettingItemType } from 'api/types'
const ms = require('ms')

enum SettingDefaults {
    Default = 'default',
    JiraHost = 'https://jira.secondlife.com',
    ApiBasePath = '/rest/api/latest',
    CacheTime = '15m',
    StatusColor = 'medium-gray',
    MaxSearchResults = 10,
    // IssueTemplate = 'tk-us;pcra%',
    // IssueInlineTemplate = 'tks;upcra%',
    SearchTemplate = 'kut<>rapsd',
    TemplateLegend = `
 'k': $.key |
 'u': $.fields.summary |
 't': $.fields.issuetype |
 '<': $.fields.created |
 '>': $.fields.updated |
 'd': $.fields.duedate |
 'c': $.fields.creator |
 'r': $.fields.reporter |
 'a': $.fields.assignee |
 'p': $.fields.priority |
 's': $.fields.status |
 'e': $.fields.resolution |
 '%': $.fields.aggregateprogress
`
}

interface SettingsConfig {
    [key: string]: SettingItem,
}

export class Settings {
    private _statusColorsCache: any = {}

    // Settings definitions
    private _config: SettingsConfig = {
        jiraHost: {
            value: SettingDefaults.JiraHost,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Connection: host',
            description: 'Hostname of your company jira server.',
        },
        username: {
            value: '',
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Connection: username',
            description: 'Username of your jira account used to access the API using basic authentication.',
        },
        password: {
            value: '',
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            secure: true,
            label: 'Connection: password',
            description: 'Password of your jira account used to access the API using basic authentication.',
        },
        cacheTime: {
            value: SettingDefaults.CacheTime,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Cache: time',
            description: 'Time before the cached issue status expires. A low value will refresh the data very often but do a lot of request to the server. E.g. "15m", "24h", "5s"',
        },
        maxSearchResults: {
            value: SettingDefaults.MaxSearchResults,
            type: SettingItemType.Int,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Search: max reults count',
            description: 'Maximum number of issues retrieved during a jira-search.',
        },
        // issueBlockTemplate: {
        //     value: SettingDefaults.IssueTemplate,
        //     type: SettingItemType.String,
        //     section: 'jiraIssue.settings',
        //     public: true,
        //     advanced: true,
        //     label: 'Rendering: Block issue display template',
        //     description: 'Data to display in the jira-issue block item.\n' + SettingDefaults.TemplateLegend + '\n Default value: ' + SettingDefaults.IssueTemplate,
        // },
        // issueInlineTemplate: {
        //     value: SettingDefaults.IssueInlineTemplate,
        //     type: SettingItemType.String,
        //     section: 'jiraIssue.settings',
        //     public: true,
        //     advanced: true,
        //     label: 'Rendering: Inline issue display template',
        //     description: 'Data to display in the jira-issue inline item.\n' + SettingDefaults.TemplateLegend + '\n Default value: ' + SettingDefaults.IssueInlineTemplate,
        // },
        searchTemplate: {
            value: SettingDefaults.SearchTemplate,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: true,
            label: 'Rendering: Search display template',
            description: 'Column to display in the jira-search table.\n' + SettingDefaults.TemplateLegend + '\n Default value: ' + SettingDefaults.SearchTemplate,
        },
    }

    // Checks on the settings
    private _checks = {
        jiraHost(host: string) {
            return host.replace(/\/$/, '')
        },
        cacheTime(time: string) {
            try {
                if (ms(time) > 0) {
                    return time
                }
            } catch (ex) {
            }
            return '15m'
        }
    }

    // Getters
    get apiBasePath(): string { return SettingDefaults.ApiBasePath; }
    get(key: string): any {
        if (key in this._config) {
            return this._config[key].value
        }
        throw 'Setting not found: ' + key
    }
    toObject(): any {
        return Object.keys(this._config).reduce((result, key) => {
            result[key] = this._config[key].value
            return result
        }, {})
    }

    // Register settings
    async register() {
        await joplin.settings.registerSection('jiraIssue.settings', {
            label: 'Jira Issue',
            iconName: 'fa fa-sitemap',
            description: 'JiraIssue allows you to track your jira issues from Joplin and to update their status when it is modified on Jira. For more info on the plugin: https://github.com/marc0l92/joplin-plugin-jira-issue#readme'
        })

        await joplin.settings.registerSettings(this._config)

        // initially read settings
        await this.read();
    }

    // Get setting on change
    private async getOrDefault(event: ChangeEvent, localVar: any, setting: string): Promise<any> {
        if (!event || event.keys.includes(setting)) {
            return await joplin.settings.value(setting)
        }
        return localVar;
    }

    // Store settings on change
    async read(event?: ChangeEvent) {
        this._statusColorsCache = {} // Reset status color cache

        for (let key in this._config) {
            this._config[key].value = await this.getOrDefault(event, this._config[key].value, key)
            if (key in this._checks) {
                this._config[key].value = this._checks[key](this._config[key].value)
                await joplin.settings.setValue(key, this._config[key].value)
            }
        }
    }

    addStatusColor(status: string, jiraColor: string): void {
        this._statusColorsCache[status] = jiraColor
    }

    isStatusColorCached(status: string): boolean {
        return status in this._statusColorsCache
    }

    getStatusColor(status: string): string {
        if (this.isStatusColorCached(status)) {
            return this._statusColorsCache[status]
        }
        return SettingDefaults.StatusColor
    }
}
