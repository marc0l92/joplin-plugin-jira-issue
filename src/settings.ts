import joplin from 'api';
import { ChangeEvent } from 'api/JoplinSettings';
import { SettingItemType } from 'api/types';

enum SettingDefaults {
    Default = 'default',
    JiraHost = 'https://jira.secondlife.com',
    ApiBasePath = '/rest/api/latest',
    CacheTime = '15m',
    StatusColor = 'medium-gray',
}

export class Settings {
    private _statusColorsCache: any = {};

    private _jiraHost: string = SettingDefaults.JiraHost;
    private _username: string;
    private _password: string;

    private _cacheTime: string = SettingDefaults.CacheTime;

    private _renderKey: boolean = true;
    private _renderPriority: boolean = false;
    private _renderDueDate: boolean = false;
    private _renderStatus: boolean = true;
    private _renderCreator: boolean = false;
    private _renderAssignee: boolean = false;
    private _renderReporter: boolean = false;
    private _renderProgress: boolean = false;
    private _renderType: boolean = false;
    private _renderTypeIcon: boolean = true;
    private _renderSummary: boolean = true;

    private _searchTemplateQuery: string = 'resolution = Unresolved AND assignee = currentUser() AND status = \'In Progress\' order by priority DESC';

    get jiraHost(): string { return this._jiraHost; }
    get apiBasePath(): string { return SettingDefaults.ApiBasePath; }
    get username(): string { return this._username; }
    get password(): string { return this._password; }
    get cacheTime(): string { return this._cacheTime; }
    get renderKey(): boolean { return this._renderKey; }
    get renderPriority(): boolean { return this._renderPriority; }
    get renderDueDate(): boolean { return this._renderDueDate; }
    get renderStatus(): boolean { return this._renderStatus; }
    get renderCreator(): boolean { return this._renderCreator; }
    get renderAssignee(): boolean { return this._renderAssignee; }
    get renderReporter(): boolean { return this._renderReporter; }
    get renderProgress(): boolean { return this._renderProgress; }
    get renderType(): boolean { return this._renderType; }
    get renderTypeIcon(): boolean { return this._renderTypeIcon; }
    get renderSummary(): boolean { return this._renderSummary; }
    get searchTemplateQuery(): string { return this._searchTemplateQuery; }

    async register() {
        await joplin.settings.registerSection('jiraIssue.settings', {
            label: 'Jira Issue',
            iconName: 'fa fa-sitemap',
            description: 'JiraIssue allows you to track your jira issues from Joplin and to update their status when it is modified on Jira. In order to track an issue use the context menu in your notes and add a new template. For more info: https://github.com/marc0l92/joplin-plugin-jira-issue#readme'
        });

        await joplin.settings.registerSettings({
            // Connection
            ['jiraHost']: {
                value: this._jiraHost,
                type: SettingItemType.String,
                section: 'jiraIssue.settings',
                public: true,
                advanced: false,
                label: 'Connection: host',
                description: 'Hostname of your company jira server.'
            },
            ['username']: {
                value: this._username,
                type: SettingItemType.String,
                section: 'jiraIssue.settings',
                public: true,
                advanced: false,
                label: 'Connection: username',
                description: 'Username of your jira account used to access the API using basic authentication.'
            },
            ['password']: {
                value: this._password,
                type: SettingItemType.String,
                section: 'jiraIssue.settings',
                public: true,
                advanced: false,
                secure: true,
                label: 'Connection: password',
                description: 'Password of your jira account used to access the API using basic authentication.'
            },

            // Cache
            ['cacheTime']: {
                value: this._cacheTime,
                type: SettingItemType.String,
                section: 'jiraIssue.settings',
                public: true,
                advanced: false,
                label: 'Cache: time',
                description: 'Time before the cached issue status expires. A low value will refresh the data very often but do a lot of request to the server. E.g. "15m", "24h", "5s"'
            },

            // Render
            ['renderKey']: {
                value: this._renderKey,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: code',
                description: 'Render the field $.key'
            },
            ['renderPriority']: {
                value: this._renderPriority,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: priority',
                description: 'Render the field $.fields.priority.name'
            },
            ['renderDueDate']: {
                value: this._renderDueDate,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: due date',
                description: 'Render the field $.fields.duedate'
            },
            ['renderStatus']: {
                value: this._renderStatus,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: status',
                description: 'Render the field $.fields.status.name'
            },
            ['renderAssignee']: {
                value: this._renderAssignee,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: assignee',
                description: 'Render the field $.fields.assignee.displayName'
            },
            ['renderCreator']: {
                value: this._renderCreator,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: creator',
                description: 'Render the field $.fields.creator.displayName'
            },
            ['renderReporter']: {
                value: this._renderReporter,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: reporter',
                description: 'Render the field $.fields.reporter.displayName'
            },
            ['renderProgress']: {
                value: this._renderProgress,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: progress',
                description: 'Render the field $.fields.aggregateprogress.percent'
            },
            ['renderType']: {
                value: this._renderType,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: type',
                description: 'Render the field $.fields.issuetype.name'
            },
            ['renderTypeIcon']: {
                value: this._renderTypeIcon,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: type icon',
                description: 'Render the field $.fields.issuetype.iconUrl'
            },
            ['renderSummary']: {
                value: this._renderSummary,
                type: SettingItemType.Bool,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Render: summary',
                description: 'Render the field $.fields.summary'
            },

            // Template
            ['searchTemplateQuery']: {
                value: this._searchTemplateQuery,
                type: SettingItemType.String,
                section: 'jiraIssue.settings',
                public: true,
                advanced: true,
                label: 'Template: JiraSearch template default query',
                description: 'Default query to use when a new JiraSearch is created using the template option'
            }
        });

        // initially read settings
        await this.read();
    }

    private async getOrDefault(event: ChangeEvent, localVar: any, setting: string): Promise<any> {
        if (!event || event.keys.includes(setting)) {
            return await joplin.settings.value(setting)
        }
        return localVar;
    }

    private checkHost(host: string) {
        const fixedHost = host.replace(/\/$/, '')
        joplin.settings.setValue('jiraHost', fixedHost)
        return fixedHost
    }

    async read(event?: ChangeEvent) {
        this._statusColorsCache = {} // Reset status color cache
        // Connection
        this._jiraHost = this.checkHost(await this.getOrDefault(event, this._jiraHost, 'jiraHost'))
        this._username = await this.getOrDefault(event, this._username, 'username')
        this._password = await this.getOrDefault(event, this._password, 'password')
        // AutoRefresh
        this._cacheTime = await this.getOrDefault(event, this._cacheTime, 'cacheTime')
        // Render
        this._renderKey = await this.getOrDefault(event, this._renderKey, 'renderKey')
        this._renderPriority = await this.getOrDefault(event, this._renderPriority, 'renderPriority')
        this._renderDueDate = await this.getOrDefault(event, this._renderDueDate, 'renderDueDate')
        this._renderStatus = await this.getOrDefault(event, this._renderStatus, 'renderStatus')
        this._renderCreator = await this.getOrDefault(event, this._renderCreator, 'renderCreator')
        this._renderAssignee = await this.getOrDefault(event, this._renderAssignee, 'renderAssignee')
        this._renderReporter = await this.getOrDefault(event, this._renderReporter, 'renderReporter')
        this._renderProgress = await this.getOrDefault(event, this._renderProgress, 'renderProgress')
        this._renderType = await this.getOrDefault(event, this._renderType, 'renderType')
        this._renderTypeIcon = await this.getOrDefault(event, this._renderTypeIcon, 'renderTypeIcon')
        this._renderSummary = await this.getOrDefault(event, this._renderSummary, 'renderSummary')
        // Template
        this._searchTemplateQuery = await this.getOrDefault(event, this._searchTemplateQuery, 'searchTemplateQuery')
    }

    addStatusColor(status: string, jiraColor: string): void {
        this._statusColorsCache[status] = jiraColor;
    }

    isStatusColorCached(status: string): boolean {
        return status in this._statusColorsCache;
    }

    getStatusColor(status: string): string {
        if (status in this._statusColorsCache) {
            return this._statusColorsCache[status];
        }
        return SettingDefaults.StatusColor;
    }
}
