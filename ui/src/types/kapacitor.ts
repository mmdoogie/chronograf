import {QueryConfig} from './'
import {AlertTypes} from 'src/kapacitor/constants'

export enum ValidationState {
  NotStarted = 'Not Started',
  Success = 'Success',
  Error = 'Error',
  Validating = 'Validating',
}

export enum TypingStatus {
  NotStarted = 'Not Started',
  Started = 'Started',
  Done = 'Done',
}

export interface Kapacitor {
  id?: string
  url: string
  name: string
  username?: string
  password?: string
  active: boolean
  insecureSkipVerify: boolean
  links?: {
    self?: string
    proxy?: string
    ping?: string
  }
}

export enum AlertRuleType {
  Threshold = 'threshold',
  Relative = 'relative',
  Deadman = 'deadman',
}

export interface AlertRule {
  id?: string
  tickscript: TICKScript
  query?: QueryConfig
  every: string
  alertNodes: AlertNodes
  message: string
  details: string
  trigger: string
  values: TriggerValues
  name: string
  type: string
  dbrps: DBRP[]
  status: string
  executing: boolean
  error: string
  created: string
  modified: string
  queryID?: string
  'last-enabled'?: string
  'template-id'?: string
  vars?: Record<string, {type: string; value: unknown}>
}

export interface Task {
  id: string
  name: string
  status: string
  tickscript: string
  dbrps: DBRP[]
  type: string
  templateID?: string
  vars?: Record<string, {type: string; value: unknown}>
}

export type TaskStatusType = 'active' | 'inactive'
export interface FluxTask {
  readonly id: string
  /** The type of task, this can be used for filtering tasks on list actions. */
  type?: string
  /** The ID of the organization that owns this Task. */
  orgID: string
  /** The name of the organization that owns this Task. */
  org?: string
  /** The name of the task. */
  name: string
  /** An optional description of the task. */
  description?: string
  status?: TaskStatusType
  /** The ID of the authorization used when this task communicates with the query engine. */
  authorizationID?: string
  /** The Flux script to run for this task. */
  flux: string
  /** A simple task repetition schedule; parsed from Flux. */
  every?: string
  /** A task repetition schedule in the form '* * * * * *'; parsed from Flux. */
  cron?: string
  /** Duration to delay after the schedule, before executing the task; parsed from flux, if set to zero it will remove this option and use 0 as the default. */
  offset?: string
  /** Timestamp of latest scheduled, completed run, RFC3339. */
  readonly latestCompleted?: string
  readonly lastRunStatus?: 'failed' | 'success' | 'canceled'
  readonly lastRunError?: string
  readonly createdAt?: string
  readonly updatedAt?: string
  readonly links?: {
    /** URL for this check */
    self?: string
    /** URL to retrieve labels for this check */
    labels?: string
    /** URL to retrieve members for this check */
    members?: string
    /** URL to retrieve owners for this check */
    owners?: string
    /** URL to retrieve flux script for this check */
    query?: string
  }
}

type TICKScript = string

// AlertNodes defines all possible kapacitor interactions with an alert.
interface AlertNodes {
  stateChangesOnly: boolean
  useFlapping: boolean
  post: Post[]
  tcp: TCP[]
  email: Email[]
  exec: Exec[]
  log: Log[]
  victorOps: VictorOps[]
  pagerDuty: PagerDuty[]
  pagerDuty2?: PagerDuty2[]
  pushover: Pushover[]
  sensu: Sensu[]
  slack: Slack[]
  telegram: Telegram[]
  alerta: Alerta[]
  opsGenie: OpsGenie[]
  opsGenie2?: OpsGenie[]
  talk: Talk[]
  serviceNow?: ServiceNow[]
  bigPanda?: BigPanda[]
  teams?: Teams[]
  zenoss?: Zenoss[]
}

interface Headers {
  [key: string]: string
}

// Post will POST alerts to a destination URL
interface Post {
  url: string
  headers: Headers
}

// Log sends the output of the alert to a file
interface Log {
  filePath: string
}

// Alerta sends the output of the alert to an alerta service
interface Alerta {
  token: string
  resource: string
  event: string
  environment: string
  group: string
  value: string
  origin: string
  service: string[]
}

// Exec executes a shell command on an alert
interface Exec {
  command: string[]
}

// TCP sends the alert to the address
interface TCP {
  address: string
}

// Email sends the alert to a list of email addresses
interface Email {
  to: string[]
}

// VictorOps sends alerts to the victorops.com service
interface VictorOps {
  routingKey: string
}

// ServiceNow alert options
interface ServiceNow {
  node: string
  _type: string // mapped from kapacitor `type`, type property is reserved
  resource: string
  metricName: string
  messageKey: string
  source: string
}

// Zenoss alert options
interface Zenoss {
  action: string
  method: string
  _type: string // mapped from kapacitor `type`, type property is reserved
  tid: number
  device: string
  component: string
  evclasskey: string
  evclass: string
}

// BigPanda alert options
interface BigPanda {
  'app-key': string
  'primary-property': string
  'secondary-property': string
}

// Teams alert options
interface Teams {
  'channel-url': string
}

// PagerDuty sends alerts to the pagerduty.com service
interface PagerDuty {
  serviceKey: string
}

// PagerDuty2 sends alerts to the pagerduty.com service
interface PagerDuty2 {
  routingKey: string
}

// Sensu sends alerts to sensu or sensuapp.org
interface Sensu {
  source: string
  handlers: string[]
}

// Pushover sends alerts to pushover.net
interface Pushover {
  // UserKey is the User/Group key of your user (or you), viewable when logged
  // into the Pushover dashboard. Often referred to as USER_KEY
  // in the Pushover documentation.
  userKey: string

  // Device is the users device name to send message directly to that device,
  // rather than all of a user's devices (multiple device names may
  // be separated by a comma)
  device: string

  // Title is your message's title, otherwise your apps name is used
  title: string

  // URL is a supplementary URL to show with your message
  url: string

  // URLTitle is a title for your supplementary URL, otherwise just URL is shown
  urlTitle: string

  // Sound is the name of one of the sounds supported by the device clients to override
  // the user's default sound choice
  sound: string
}

// Slack sends alerts to a slack.com channel
interface Slack {
  channel: string
  username: string
  iconEmoji: string
}

// Telegram sends alerts to telegram.org
interface Telegram {
  chatId: string
  parseMode: string
  disableWebPagePreview: boolean
  disableNotification: boolean
}

// OpsGenie sends alerts to opsgenie.com
interface OpsGenie {
  teams: string[]
  recipients: string[]
}

// Talk sends alerts to Jane Talk (https://jianliao.com/site)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Talk {}

// TriggerValues specifies the alerting logic for a specific trigger type
interface TriggerValues {
  change?: string
  period?: string
  shift?: string
  operator?: string
  value?: string
  rangeValue: string
}

// DBRP represents a database and retention policy for a time series source
export interface DBRP {
  db: string
  rp: string
}

// Alert Handler used in the Alert Builder

interface HandlerBasics {
  type: AlertTypes
  enabled: boolean
}

export type Handler = HandlerBasics & {[k: string]: any}

export interface RuleMessageTemplate {
  id: RuleMessage
  name: RuleMessage
  taskName: RuleMessage
  group: RuleMessage
  tags: RuleMessage
  tag: RuleMessage
  level: RuleMessage
  fields: RuleMessage
  field: RuleMessage
  time: RuleMessage
  else: RuleMessage
  end: RuleMessage
}

export interface RuleMessage {
  label: string
  text: string
}

export interface KeyMappings {
  opsgenie: string
  opsgenie2: string
  pagerduty: string
  pagerduty2: string
  smtp: string
  victorops: string
  servicenow: string
  bigpanda: string
  teams: string
  zenoss: string
}

export interface FieldsFromConfigAlerts {
  alerta: string[]
  kafka: string[]
  opsGenie: string[]
  opsGenie2: string[]
  pagerDuty: string[]
  pagerDuty2: string[]
  pushover: string[]
  sensu: string[]
  slack: string[]
  email: string[]
  talk: string[]
  telegram: string[]
  victorOps: string[]
  serviceNow: string[]
  bigPanda: string[]
  teams: string[]
  zenoss: string[]
}

export interface FieldsFromAllAlerts extends FieldsFromConfigAlerts {
  post: string[]
  tcp: string[]
  exec: string[]
  log: string[]
}

interface PagerDutyConfigKeyMap {
  'service-key': string
}

interface PushoverConfigKeyMap {
  'user-key': string
}

interface TelegramConfigKeyMap {
  'chat-id': string
  'parse-mode': string
  'disable-web-page-preview': string
  'disable-notification': string
}

interface VictorOpsConfigKeyMap {
  'routing-key': string
}

export type ConfigKeyMaps =
  | PagerDutyConfigKeyMap
  | PushoverConfigKeyMap
  | TelegramConfigKeyMap
  | VictorOpsConfigKeyMap
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {}

export interface AlertaProperties {
  environment: string
  origin: string
  token: string
  'token-prefix': string
  url: string
  enabled: boolean
}

export interface KafkaProperties {
  id?: string
  brokers: string[]
  timeout: string
  'batch-size': number
  'batch-timeout': string
  'use-ssl': boolean
  'ssl-ca': string
  'ssl-cert': string
  'ssl-key': string
  'insecure-skip-verify': boolean
  enabled: boolean
}

export interface OpsGenieProperties {
  'api-key': string
  teams: string[]
  recipients: string[]
  enabled: boolean
  recovery_action?: 'notes' | 'close' // available in OpsGenie2
}

export interface PagerDutyProperties {
  'service-key': string
  url: string
  enabled: boolean
}

export interface PagerDuty2Properties {
  'routing-key': string
  url: string
  enabled: boolean
}

export interface PushoverProperties {
  token: string
  url: string
  'user-key': string
  enabled: boolean
}

export interface SensuProperties {
  source: string
  addr: string
  enabled: boolean
}

export interface SlackProperties {
  channel: string
  url: string
  workspace?: string
  enabled: boolean
}

export interface SMTPProperties {
  host: string
  port: string
  from: string
  to: string[]
  username: string
  password: string
  enabled: boolean
}

export interface TalkProperties {
  url: string
  author_name: string
  enabled: boolean
}

export interface TelegramProperties {
  'chat-id': string
  'disable-notification': boolean
  'disable-web-page-preview': boolean
  'parse-mode': string
  token: string
  enabled: boolean
}

export interface VictorOpsProperties {
  'api-key': string
  'routing-key': string
  url: string
  enabled: boolean
}

export interface ServiceNowProperties {
  url: string
  source: string
  username: string
  password: string
  enabled: boolean
}

export interface BigPandaProperties {
  url: string
  token: string
  'app-key': string
  'insecure-skip-verify': boolean
  enabled: boolean
}

export interface TeamsProperties {
  'channel-url': string
  enabled: boolean
}

export interface ZenossProperties {
  url: string
  username: string
  password: string
  action: string
  method: string
  type: string
  tid: number
  collector: string
  'severity-map': {
    ok: string
    info: string
    warning: string
    critical: string
  }
  enabled: boolean
}

export type ServiceProperties =
  | AlertaProperties
  | KafkaProperties
  | OpsGenieProperties
  | PagerDutyProperties
  | PagerDuty2Properties
  | PushoverProperties
  | SensuProperties
  | SlackProperties
  | SMTPProperties
  | TalkProperties
  | TelegramProperties
  | VictorOpsProperties
  | ServiceNowProperties
  | BigPandaProperties
  | TeamsProperties
  | ZenossProperties

export type SpecificConfigOptions = Partial<SlackProperties & KafkaProperties>

export interface RuleValues {
  value?: string | null
  rangeValue?: string | null
  operator?: string
}

export interface LogItem {
  key: string
  service: string
  lvl: string
  ts: string
  msg: string
  id: string
  tags: string
  method?: string
  username?: string
  host?: string
  duration?: string
  tag?: Record<string, unknown>
  field?: Record<string, unknown>
  cluster?: string
}
