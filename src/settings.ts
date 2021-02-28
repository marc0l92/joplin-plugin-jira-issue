import joplin from 'api';
import { ChangeEvent } from 'api/JoplinSettings';
import { SettingItemType } from 'api/types';

enum SettingDefaults {
    Default = 'default',
    JiraHost = 'https://jira.secondlife.com',
    ApiBasePath = '/rest/api/latest/issue/',
}

export class Settings {
    private _jiraHost: string = SettingDefaults.JiraHost;
    private _apiBasePath: string = SettingDefaults.ApiBasePath;
    private _username: string;
    private _password: string;

    private _renderKey: boolean = true;
    private _renderPriority: boolean = false;
    private _renderStatus: boolean = true;
    private _renderCreator: boolean = false;
    private _renderReporter: boolean = false;
    private _renderProgress: boolean = false;
    private _renderType: boolean = false;
    private _renderTypeIcon: boolean = true;
    private _renderSummary: boolean = true;

    get jiraHost(): string { return this._jiraHost; }
    get apiBasePath(): string { return this._apiBasePath; }
    get username(): string { return this._username; }
    get password(): string { return this._password; }
    get renderKey(): boolean { return this._renderKey; }
    get renderPriority(): boolean { return this._renderPriority; }
    get renderStatus(): boolean { return this._renderStatus; }
    get renderCreator(): boolean { return this._renderCreator; }
    get renderReporter(): boolean { return this._renderReporter; }
    get renderProgress(): boolean { return this._renderProgress; }
    get renderType(): boolean { return this._renderType; }
    get renderTypeIcon(): boolean { return this._renderTypeIcon; }
    get renderSummary(): boolean { return this._renderSummary; }

    async register() {
        await joplin.settings.registerSection('jiraIssue.settings', {
            label: 'Jira Issue',
            iconName: 'fa fa-sitemap',
            description: 'JiraIssue allows you to track your jira issues from Joplin and to update their status when it is modified on Jira. In order to track an issue use the html tag `<JiraIssue key="AAA-123">` in your notes. Use the option in the tools menu in order to download the last issue status. In order to configure the api, please check the Jira documentation at https://docs.atlassian.com/jira-software/REST/latest'
        });

        await joplin.settings.registerSetting('jiraHost', {
            value: this._jiraHost,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Jira server: host',
            description: 'Hostname of your company jira server.'
        });
        await joplin.settings.registerSetting('username', {
            value: this._username,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Jira server: account username',
            description: 'Username of your jira account used to access the API using basic authentication.'
        });
        await joplin.settings.registerSetting('password', {
            value: this._password,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            secure: true,
            label: 'Jira server: account password',
            description: 'Password of your jira account used to access the API using basic authentication.'
        });

        // Render settings
        await joplin.settings.registerSetting('renderKey', {
            value: this._renderKey,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: code',
            description: 'Render the field $.key'
        });
        await joplin.settings.registerSetting('renderPriority', {
            value: this._renderPriority,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: priority',
            description: 'Render the field $.fields.priority.name'
        });
        await joplin.settings.registerSetting('renderStatus', {
            value: this._renderStatus,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: status',
            description: 'Render the field $.fields.status.name'
        });
        await joplin.settings.registerSetting('renderCreator', {
            value: this._renderCreator,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: creator',
            description: 'Render the field $.fields.creator.displayName'
        });
        await joplin.settings.registerSetting('renderReporter', {
            value: this._renderReporter,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: reporter',
            description: 'Render the field $.fields.reporter.displayName'
        });
        await joplin.settings.registerSetting('renderProgress', {
            value: this._renderProgress,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: progress',
            description: 'Render the field $.fields.aggregateprogress.percent'
        });
        await joplin.settings.registerSetting('renderType', {
            value: this._renderType,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: type',
            description: 'Render the field $.fields.issuetype.name'
        });
        await joplin.settings.registerSetting('renderTypeIcon', {
            value: this._renderTypeIcon,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: type icon',
            description: 'Render the field $.fields.issuetype.iconUrl'
        });
        await joplin.settings.registerSetting('renderSummary', {
            value: this._renderSummary,
            type: SettingItemType.Bool,
            section: 'jiraIssue.settings',
            public: true,
            advanced: false,
            label: 'Render: summary',
            description: 'Render the field $.fields.summary'
        });

        // Advanced settings
        await joplin.settings.registerSetting('apiBasePath', {
            value: this._apiBasePath,
            type: SettingItemType.String,
            section: 'jiraIssue.settings',
            public: true,
            advanced: true,
            label: 'Jira server: api service base path',
            description: 'Base path of api service. Change this path if you want to select a specific api version.'
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

    async read(event?: ChangeEvent) {
        this._jiraHost = await this.getOrDefault(event, this._jiraHost, 'jiraHost');
        this._apiBasePath = await this.getOrDefault(event, this._apiBasePath, 'apiBasePath');
        this._username = await this.getOrDefault(event, this._username, 'username');
        this._password = await this.getOrDefault(event, this._password, 'password');

        this._renderKey = await this.getOrDefault(event, this._renderKey, 'renderKey');
        this._renderPriority = await this.getOrDefault(event, this._renderPriority, 'renderPriority');
        this._renderStatus = await this.getOrDefault(event, this._renderStatus, 'renderStatus');
        this._renderCreator = await this.getOrDefault(event, this._renderCreator, 'renderCreator');
        this._renderReporter = await this.getOrDefault(event, this._renderReporter, 'renderReporter');
        this._renderProgress = await this.getOrDefault(event, this._renderProgress, 'renderProgress');
        this._renderType = await this.getOrDefault(event, this._renderType, 'renderType');
        this._renderTypeIcon = await this.getOrDefault(event, this._renderTypeIcon, 'renderTypeIcon');
        this._renderSummary = await this.getOrDefault(event, this._renderSummary, 'renderSummary');
    }
}