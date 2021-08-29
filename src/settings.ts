import joplin from 'api';
import { ChangeEvent } from 'api/JoplinSettings';
import { SettingItemType } from 'api/types';

enum SettingDefaults {
    Default = 'default',
    JiraHost = 'https://jira.secondlife.com',
    ApiBasePath = '/rest/api/latest',
}

const JiraToBadgeColorsMap: any = {
    'default': 'lightgrey',
    'blue-gray': 'blue',
    'yellow': 'yellow',
    'green': 'green',
    'medium-gray': 'lightgrey',
};

export class Settings {
    private _statusColorsCache: any = {};

    private _jiraHost: string = SettingDefaults.JiraHost;
    private _apiBasePath: string = SettingDefaults.ApiBasePath;
    private _username: string;
    private _password: string;

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

    private _issueRenderingMode: string = 'BADGE';
    private _searchRenderingMode: string = 'TABLE';
    private _searchTemplateQuery: string = 'resolution = Unresolved AND assignee = currentUser() AND status = \'In Progress\' order by priority DESC';

    get jiraHost(): string { return this._jiraHost; }
    get apiBasePath(): string { return this._apiBasePath; }
    get username(): string { return this._username; }
    get password(): string { return this._password; }
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
    get issueRenderingMode(): string { return this._issueRenderingMode; }
    get searchRenderingMode(): string { return this._searchRenderingMode; }
    get searchTemplateQuery(): string { return this._searchTemplateQuery; }

    async register() {
        await joplin.settings.registerSection('jiraIssue.settings', {
            label: 'Jira Issue',
            iconName: 'fa fa-sitemap',
            description: 'JiraIssue allows you to track your jira issues from Joplin and to update their status when it is modified on Jira. In order to track an issue use the context menu in your notes and add a new template. For more info: https://github.com/marc0l92/joplin-plugin-jira-issue#readme'
        });

        await joplin.settings.registerSettings({
            ['jiraHost']: {
            value: this._jiraHost,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Jira server: host',
            description: 'Hostname of your company jira server.'
        },
        ['username']: {
            value: this._username,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Jira server: account username',
            description: 'Username of your jira account used to access the API using basic authentication.'
        },
        ['password']: {
            value: this._password,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            secure: true,
            label: 'Jira server: account password',
            description: 'Password of your jira account used to access the API using basic authentication.'
        },
        ['renderKey']: {
            value: this._renderKey,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: code',
            description: 'Render the field $.key'
        },
        ['renderPriority']: {
            value: this._renderPriority,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: priority',
            description: 'Render the field $.fields.priority.name'
        },
        ['renderDueDate']: {
            value: this._renderDueDate,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: due date',
            description: 'Render the field $.fields.duedate'
        },
        ['renderStatus']: {
            value: this._renderStatus,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: status',
            description: 'Render the field $.fields.status.name'
        },
        ['renderAssignee']: {
            value: this._renderAssignee,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: assignee',
            description: 'Render the field $.fields.assignee.displayName'
        },
        ['renderCreator']: {
            value: this._renderCreator,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: creator',
            description: 'Render the field $.fields.creator.displayName'
        },
        ['renderReporter']: {
            value: this._renderReporter,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: reporter',
            description: 'Render the field $.fields.reporter.displayName'
        },
        ['renderProgress']: {
            value: this._renderProgress,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: progress',
            description: 'Render the field $.fields.aggregateprogress.percent'
        },
        ['renderType']: {
            value: this._renderType,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: type',
            description: 'Render the field $.fields.issuetype.name'
        },
        ['renderTypeIcon']: {
            value: this._renderTypeIcon,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: type icon',
            description: 'Render the field $.fields.issuetype.iconUrl'
        },
        ['renderSummary']: {
            value: this._renderSummary,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: summary',
            description: 'Render the field $.fields.summary'
        },

        ['issueRenderingMode']: {
            value: this._issueRenderingMode,
            type: SettingItemType.String,
            isEnum: true,
            options: { TEXT: "Text", BADGES: "Badges" },
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'JiraIssues rendering mode',
            description: 'Rendering method of JiraIssues'
        },
        ['searchRenderingMode']: {
            value: this._searchRenderingMode,
            type: SettingItemType.String,
            isEnum: true,
            options: { TEXT: "Text", BADGES: "Badges", TABLE: "Table" },
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'JiraSearch rendering mode',
            description: 'Rendering method of JiraSearch'
        },

        // Templates
        ['searchTemplateQuery']: {
            value: this._searchTemplateQuery,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'JiraSearch template default query',
            description: 'Default query to use when a new JiraSearch is created using the template option'
        }
        });

        // initially read settings
        await this.read();
    }

    private async getOrDefault(event: ChangeEvent, localVar: any, setting: string): Promise<any> {
        if (!event || event.keys.includes(setting)) {
            return await joplin.settings.value(setting);
        }
        return localVar;
    }

    private fixUriEnd(uri: string) {
        if (uri.charAt(uri.length - 1) === '/') {
            return uri.slice(0, uri.length - 1);
        }
        return uri;
    }

    async read(event?: ChangeEvent) {
        this._statusColorsCache = {}; // Reset status color cache
        this._jiraHost = await this.getOrDefault(event, this._jiraHost, 'jiraHost');
        this._jiraHost = this.fixUriEnd(this._jiraHost);
        // this._apiBasePath = await this.getOrDefault(event, this._apiBasePath, 'apiBasePath');
        // this._apiBasePath = this.fixUriEnd(this._apiBasePath);
        this._username = await this.getOrDefault(event, this._username, 'username');
        this._password = await this.getOrDefault(event, this._password, 'password');

        this._renderKey = await this.getOrDefault(event, this._renderKey, 'renderKey');
        this._renderPriority = await this.getOrDefault(event, this._renderPriority, 'renderPriority');
        this._renderDueDate = await this.getOrDefault(event, this._renderDueDate, 'renderDueDate');
        this._renderStatus = await this.getOrDefault(event, this._renderStatus, 'renderStatus');
        this._renderCreator = await this.getOrDefault(event, this._renderCreator, 'renderCreator');
        this._renderAssignee = await this.getOrDefault(event, this._renderAssignee, 'renderAssignee');
        this._renderReporter = await this.getOrDefault(event, this._renderReporter, 'renderReporter');
        this._renderProgress = await this.getOrDefault(event, this._renderProgress, 'renderProgress');
        this._renderType = await this.getOrDefault(event, this._renderType, 'renderType');
        this._renderTypeIcon = await this.getOrDefault(event, this._renderTypeIcon, 'renderTypeIcon');
        this._renderSummary = await this.getOrDefault(event, this._renderSummary, 'renderSummary');

        this._issueRenderingMode = await this.getOrDefault(event, this._issueRenderingMode, 'issueRenderingMode');
        this._searchRenderingMode = await this.getOrDefault(event, this._searchRenderingMode, 'searchRenderingMode');
        this._searchTemplateQuery = await this.getOrDefault(event, this._searchTemplateQuery, 'searchTemplateQuery');
    }

    addStatusColor(status: string, jiraColor: string): void {
        this._statusColorsCache[status] = jiraColor;
    }

    isStatusColorCached(status: string): boolean {
        return status in this._statusColorsCache;
    }

    getStatusColor(status: string): string {
        if (status in this._statusColorsCache) {
            return JiraToBadgeColorsMap[this._statusColorsCache[status]];
        }
        return JiraToBadgeColorsMap['default'];
    }
}
